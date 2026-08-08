import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button, Layout, Space, message, Avatar, Tooltip } from 'antd'
import { encoding } from 'lib0'
import { 
  ChevronLeft, CloudCheck, CloudLightning, Share2, User,
  Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Code
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { writeSyncStep1 } from 'y-protocols/sync.js'
import apiClient from '../utils/apiClient'
import useDebounce from '../utils/useDebounce'
import Collaboration from '@tiptap/extension-collaboration'
import { io } from 'socket.io-client'
import * as Y from 'yjs'

const { Header, Content } = Layout

export interface DocumentEditorProps {
  id?: string | number
  title?: string
  saveStatus?: 'saved' | 'saving' | 'error'
  onBack?: () => void
  editorContainer?: React.ReactNode
}

/**
 * CoEdit 飞书纯享极简编辑页 (含 Toolbar 与实时协同)
 */
export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  id: _id, 
  title: initialTitle = '未命名文档', 
  saveStatus: _saveStatus = 'saved', 
  onBack, 
  editorContainer 
}) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState(initialTitle)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // 1. 初始化 Yjs 文档和共享字段
  const [ydoc] = useState(() => new Y.Doc())

  // 状态点样式与描述
  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          status: 'processing' as const,
          color: '#3370FF',
          text: '保存中...',
          icon: <CloudLightning size={14} style={{ color: '#3370FF' }} />
        }
      case 'error':
        return {
          status: 'error' as const,
          color: '#FF4D4F',
          text: '保存失败',
          icon: <CloudLightning size={14} style={{ color: '#FF4D4F' }} />
        }
      case 'saved':
      default:
        return {
          status: 'success' as const,
          color: '#52C41A',
          text: '已保存到云端',
          icon: <CloudCheck size={14} style={{ color: '#52C41A' }} />
        }
    }
  }

  // 2. 数据库落库自动保存（作为离线和最终数据库持久化的兜底）
  const saveContentToDatabase = async (htmlContent: string) => {
    setSaveStatus('saving')
    try {
      await apiClient.patch(`document/${id}`, { content: htmlContent })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  const debounceSave = useDebounce(saveContentToDatabase, 1500)

  // 3. 配置 Tiptap 编辑器内核（绑定 Yjs 的 ydoc）
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false // 💡 关闭自带历史，使用 Yjs 历史记录
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'codewrite'
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      debounceSave(editor.getHTML())
    }
  })

  // 复制链接方法（用户手写实现点）
  const handleShareLink = () => {
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl).then(() => {
      message.success('协同邀请链接已复制到剪贴板，快去发给同伴吧！')
    })
  }

  // 返回上一页 handlers
  const handleBackToDashboard = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/dashboard')
    }
  }

  // 4. 处理 WebSocket 二进制协同同步
  useEffect(() => {
    if (!id || !editor) return

    const socket = io('http://localhost:3000')

    socket.on('connect', () => {
      socket.emit('join-document', { documentId: id })

      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, 0)
      writeSyncStep1(encoder, ydoc)
      const stepMessage = encoding.toUint8Array(encoder)

      socket.emit('sync', stepMessage)
    })

    socket.on('sync', (buffer: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(buffer))
    })

    socket.on('document-updated', (data: { content: ArrayBuffer }) => {
      Y.applyUpdate(ydoc, new Uint8Array(data.content))
    })

    const handleYDocUpdate = (update: Uint8Array) => {
      socket.emit('document-update', {
        documentId: id,
        content: update
      })
    }

    ydoc.on('update', handleYDocUpdate)

    const loadInitialDoc = async () => {
      try {
        const res = await apiClient.get(`/document/${id}`)
        setTitle(res.data.title)
        if (res.data.content && ydoc.getText('codewrite').length === 0) {
          ydoc.transact(() => {
            const ytext = ydoc.getText('codewrite')
            ytext.insert(0, res.data.content)
          })
        }
      } catch (err) {
        console.error('加载文档数据失败', err)
      }
    }
    loadInitialDoc()

    return () => {
      ydoc.off('update', handleYDocUpdate)
      socket.disconnect()
    }
  }, [id, editor, ydoc])

  const statusConfig = getStatusConfig()

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F5F6F7' }}>
      {/* 顶部 Header 栏 */}
      <Header
        style={{
          background: '#FFFFFF',
          padding: '0 20px',
          height: '56px',
          lineHeight: '56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #DEE0E3'
        }}>
        <Space size={16}>
          <Button
            type="text"
            icon={<ChevronLeft size={18} />}
            onClick={handleBackToDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              color: '#646A73'
            }}
          />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#1F2329' }}>{title}</span>
        </Space>

        <Space size={16} style={{ display: 'flex', alignItems: 'center' }}>
          {/* 保存状态 */}
          <Space size={6} style={{ color: '#8F959E', fontSize: '13px', marginRight: '8px' }}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </Space>

          {/* 分享链接按钮 */}
          <Button 
            type="primary" 
            icon={<Share2 size={14} />} 
            onClick={handleShareLink}
            style={{ 
              backgroundColor: '#3370FF', 
              borderColor: '#3370FF',
              borderRadius: '4px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            分享协同
          </Button>

          {/* 当前用户头像 */}
          <Tooltip title="当前用户在线">
            <Avatar 
              size={32} 
              icon={<User size={18} />} 
              style={{ backgroundColor: '#E8F0FF', color: '#3370FF', cursor: 'pointer' }} 
            />
          </Tooltip>
        </Space>
      </Header>

      {/* 主体编辑器容器 */}
      <Content
        style={{
          padding: '24px 20px',
          display: 'flex',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
        <div
          style={{
            width: '100%',
            maxWidth: '850px',
            backgroundColor: '#FFFFFF',
            minHeight: '82vh',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(31, 35, 41, 0.05)',
            border: '1px solid #DEE0E3',
            display: 'flex',
            flexDirection: 'column'
          }}>

          {/* 飞书风 Tiptap 富文本格式工具栏 Toolbar */}
          {editor && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '10px 20px',
                borderBottom: '1px solid #E4E5E7',
                backgroundColor: '#FAFAFB',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px'
              }}
            >
              <Tooltip title="加粗 (Ctrl+B)">
                <Button
                  size="small"
                  type={editor.isActive('bold') ? 'primary' : 'text'}
                  icon={<Bold size={15} />}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                />
              </Tooltip>
              <Tooltip title="斜体 (Ctrl+I)">
                <Button
                  size="small"
                  type={editor.isActive('italic') ? 'primary' : 'text'}
                  icon={<Italic size={15} />}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                />
              </Tooltip>
              <Tooltip title="删除线">
                <Button
                  size="small"
                  type={editor.isActive('strike') ? 'primary' : 'text'}
                  icon={<Strikethrough size={15} />}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                />
              </Tooltip>
              
              <div style={{ width: '1px', backgroundColor: '#DEE0E3', margin: '0 4px' }} />

              <Tooltip title="一级标题">
                <Button
                  size="small"
                  type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'text'}
                  icon={<Heading1 size={15} />}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                />
              </Tooltip>
              <Tooltip title="二级标题">
                <Button
                  size="small"
                  type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'text'}
                  icon={<Heading2 size={15} />}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                />
              </Tooltip>

              <div style={{ width: '1px', backgroundColor: '#DEE0E3', margin: '0 4px' }} />

              <Tooltip title="无序列表">
                <Button
                  size="small"
                  type={editor.isActive('bulletList') ? 'primary' : 'text'}
                  icon={<List size={15} />}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
              </Tooltip>
              <Tooltip title="有序列表">
                <Button
                  size="small"
                  type={editor.isActive('orderedList') ? 'primary' : 'text'}
                  icon={<ListOrdered size={15} />}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
              </Tooltip>
              <Tooltip title="代码块">
                <Button
                  size="small"
                  type={editor.isActive('codeBlock') ? 'primary' : 'text'}
                  icon={<Code size={15} />}
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                />
              </Tooltip>
            </div>
          )}

          {/* 纸张内部编辑区域 */}
          <div style={{ padding: '36px 50px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 文档静态标题区域 */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1F2329',
                borderBottom: '1px solid #E4E5E7',
                paddingBottom: '14px',
                marginBottom: '20px',
                outline: 'none'
              }}>
              {title}
            </div>

            {/* 编辑器内容容器 */}
            <div style={{ flex: 1, minHeight: '350px' }}>
              {editorContainer ? (
                editorContainer
              ) : (
                <EditorContent 
                  editor={editor} 
                  style={{
                    outline: 'none',
                    minHeight: '350px',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#1F2329'
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default DocumentEditor

