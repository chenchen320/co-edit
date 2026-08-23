import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button, Layout, Space, message, Avatar, Tooltip, Modal, Drawer, Input } from 'antd'
import { encoding } from 'lib0'
import { ChevronLeft, CloudCheck, CloudLightning, Share2, User, Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Code, Image as ImageIcon, History } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { writeSyncStep1 } from 'y-protocols/sync.js'
import apiClient from '../utils/apiClient'
import useDebounce from '../utils/useDebounce'
import Collaboration from '@tiptap/extension-collaboration'
import { io } from 'socket.io-client'
import * as Y from 'yjs'
import Image from '@tiptap/extension-image'

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
// 💡 二进制安全转化工具：兼容 Socket.io 的各种 ArrayBuffer / Buffer 格式
const toUint8Array = (data: any): Uint8Array => {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (data?.data && Array.isArray(data.data)) return new Uint8Array(data.data)
  if (data?.buffer) return new Uint8Array(data.buffer)
  return new Uint8Array(data)
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ id: _id, title: initialTitle = '未命名文档', saveStatus: _saveStatus = 'saved', onBack, editorContainer }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState(initialTitle)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [searchParams] = useSearchParams()
  const shareToken = searchParams.get('shareToken') || undefined
  const [editorMode, setEditorMode] = useState<'edit' | 'view'>('edit')

  // 历史版本
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [versionList, setVersionList] = useState<any[]>([])
  const [newVersionName, setNewVersionName] = useState('')

  // 预览Modal的开启和加载
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [previewVersionName, setPreviewVersionName] = useState('')
  const [_activeVersionId, setActiveVersionId] = useState<string | null>(null)

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
      await apiClient.patch(`/document/${id}`, { content: htmlContent })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  const debounceSave = useDebounce(saveContentToDatabase, 1500)

  // 3. 配置 Tiptap 编辑器内核（绑定 Yjs 的 ydoc）
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
        field: 'codewrite'
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'tiptap-responsive-image'
        }
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      debounceSave(editor.getHTML())
    }
  })

  // 💡 大厂级安全分享链接生成方法
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleShareLink = () => {
    setIsShareModalOpen(true)
  }

  const generateAndCopyLink = async (targetRole: 'edit' | 'view') => {
    try {
      const res = await apiClient.post(`/document/${id}/share`, { role: targetRole })
      const shareUrl = res.data.shareUrl

      await navigator.clipboard.writeText(shareUrl)
      message.success(`成功生成 ${targetRole === 'edit' ? '【可编辑】' : '【只读】'} 协同邀请链接并复制到剪贴板！`)
      setIsShareModalOpen(false)
    } catch (err: any) {
      console.error(err)
      // 如果后端判定当前用户是 Viewer 且申请 edit，会触发 403 抛错
      const errMsg = err?.response?.data?.message || '您没有权限分享此文档'
      message.error(errMsg)
    }
  }

  // 返回上一页 handlers
  const handleBackToDashboard = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/dashboard')
    }
  }

  // 插入图片手写方法
  const handleInsertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const selectedFile = target.files?.[0]
      if (!selectedFile) return

      const formData = new FormData()
      formData.append('file', selectedFile)

      try {
        const res = await apiClient.post('/document/upload', formData)
        if (editor) {
          editor.chain().focus().setImage({ src: res.data.url }).run()
        }
      } catch (error) {
        console.error('图片上传失败', error)
        message.error('图片上传失败，请检查网络')
      } finally {
        input.value = ''
      }
    }
    input.click()
  }

  const saveTitle = async (newTitle: string) => {
    setSaveStatus('saving')
    try {
      await apiClient.patch(`/document/${id}`, { title: newTitle })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  const debounceSaveTitle = useDebounce(saveTitle, 1000)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debounceSaveTitle(newTitle)
  }

  // 保存为历史版本
  const handleSaveVersion = async () => {
    if (!newVersionName) {
      message.warning('请输入当前版本的描述名称')
      return
    }
    try {
      await apiClient.post(`/document/${id}/version`, { versionName: newVersionName })
      message.success('历史版本快照保存成功')
      setNewVersionName('')
      fetchVersion()
    } catch {
      message.error('保存版本失败')
    }
  }

  // 拉取当前文档的所有历史版本
  const fetchVersion = async () => {
    try {
      const res = await apiClient.get(`/document/${id}/version`)
      setVersionList(res.data)
    } catch {
      message.error('获取版本列表失败')
    }
  }

  useEffect(() => {
    if (isDrawerOpen) {
      fetchVersion()
    }
  }, [isDrawerOpen])

  // 预览框
  const handleVersionPreview = async (ver: any) => {
    setPreviewVersionName(ver.versionName)
    setActiveVersionId(ver.id)

    try {
      const res = await apiClient.get(`/document/${id}/version/${ver.id}`)

      const snapshotData = res.data.snapshot // 得到后端传来的二进制数据
      const snapshotBytes = toUint8Array(snapshotData)
      const tempYdoc = new Y.Doc()

      Y.applyUpdate(tempYdoc, snapshotBytes)
      const historicalHtml = tempYdoc.getText('codewrite').toString()
      setPreviewContent(historicalHtml)
      setIsPreviewOpen(true)
    } catch (err) {
      console.error(err)
      message.error('加载历史版本快照失败')
    }
  }

  // 回滚函数占位版本
  const handleRollbackVersion = async () => {
    message.info('准备执行版本回滚，后端接口正在对接中...')
  }
  // 4. 处理 WebSocket 二进制协同同步
  useEffect(() => {
    if (!id || !editor) return
    const token = localStorage.getItem('access_token')
    const socket = io('http://localhost:3000', {
      auth: { token }
    })

    socket.on('connect', () => {
      socket.emit('join-document', { documentId: id, shareToken }, (response: any) => {
        if (response && response.resolvedMode) {
          const resolved = response.resolvedMode
          setEditorMode(resolved)
          if (resolved === 'view' && editor) {
            editor.setEditable(false)
          }
        }
      })

      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, 0)
      writeSyncStep1(encoder, ydoc)
      const stepMessage = encoding.toUint8Array(encoder)

      socket.emit('sync', stepMessage)
    })

    socket.on('sync', (buffer: any) => {
      try {
        const bytes = toUint8Array(buffer)
        if (bytes.length > 0) {
          Y.applyUpdate(ydoc, bytes)
        }
      } catch (e) {
        console.warn('忽略无效的 sync 字节包', e)
      }
    })

    socket.on('document-updated', (data: any) => {
      try {
        const bytes = toUint8Array(data.content)
        if (bytes.length > 0) {
          Y.applyUpdate(ydoc, bytes)
        }
      } catch (e) {
        console.warn('忽略无效的 update 字节包', e)
      }
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
        const isYDocEmpty = ydoc.getXmlFragment('codewrite').length ===0
        if (res.data.content && editor && editor.isEmpty && isYDocEmpty)  {
          editor.commands.setContent(res.data.content,false)
          // setContent对只读状态进行冲洗，所以需要重新设置只读或编辑状态
          editor.setEditable(editorMode === 'edit')
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

  // 💡 声明式监听：一旦 editorMode 发生变化，立刻强行同步给 Tiptap 编辑器！
  useEffect(() => {
    if (editor) {
      console.log('Tiptap 只读锁定更新:', editorMode)
      editor.setEditable(editorMode === 'edit')
    }
  }, [editorMode, editor])

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
          <Space size={6} style={{ color: '#8F959E', fontSize: '13px', marginRight: '8px' }}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </Space>

          <Button
            type="default"
            icon={<History size={14} />}
            onClick={() => setIsDrawerOpen(true)}
            style={{
              borderRadius: '4px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              borderColor: '#DEE0E3',
              color: '#646A73'
            }}>
            历史版本
          </Button>

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
            }}>
            分享协同
          </Button>

          <Tooltip title="当前用户在线">
            <Avatar size={32} icon={<User size={18} />} style={{ backgroundColor: '#E8F0FF', color: '#3370FF', cursor: 'pointer' }} />
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
          {/* 飞书风 Tiptap 富文本格式工具栏 Toolbar (含图片按钮) */}
          {editor && editorMode === 'edit' && (
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
              }}>
              <Tooltip title="加粗 (Ctrl+B)">
                <Button size="small" type={editor.isActive('bold') ? 'primary' : 'text'} icon={<Bold size={15} />} onClick={() => editor.chain().focus().toggleBold().run()} />
              </Tooltip>
              <Tooltip title="斜体 (Ctrl+I)">
                <Button size="small" type={editor.isActive('italic') ? 'primary' : 'text'} icon={<Italic size={15} />} onClick={() => editor.chain().focus().toggleItalic().run()} />
              </Tooltip>
              <Tooltip title="删除线">
                <Button size="small" type={editor.isActive('strike') ? 'primary' : 'text'} icon={<Strikethrough size={15} />} onClick={() => editor.chain().focus().toggleStrike().run()} />
              </Tooltip>

              <div style={{ width: '1px', backgroundColor: '#DEE0E3', margin: '0 4px' }} />

              <Tooltip title="一级标题">
                <Button size="small" type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'text'} icon={<Heading1 size={15} />} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
              </Tooltip>
              <Tooltip title="二级标题">
                <Button size="small" type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'text'} icon={<Heading2 size={15} />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
              </Tooltip>

              <div style={{ width: '1px', backgroundColor: '#DEE0E3', margin: '0 4px' }} />

              <Tooltip title="无序列表">
                <Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'text'} icon={<List size={15} />} onClick={() => editor.chain().focus().toggleBulletList().run()} />
              </Tooltip>
              <Tooltip title="有序列表">
                <Button size="small" type={editor.isActive('orderedList') ? 'primary' : 'text'} icon={<ListOrdered size={15} />} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
              </Tooltip>
              <Tooltip title="代码块">
                <Button size="small" type={editor.isActive('codeBlock') ? 'primary' : 'text'} icon={<Code size={15} />} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
              </Tooltip>

              <div style={{ width: '1px', backgroundColor: '#DEE0E3', margin: '0 4px' }} />

              {/* 💡 插入图片按钮 */}
              <Tooltip title="插入图片">
                <Button size="small" type="text" icon={<ImageIcon size={15} />} onClick={handleInsertImage} />
              </Tooltip>
            </div>
          )}

          {/* 纸张内部编辑区域 */}
          <div style={{ padding: '36px 50px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 文档静态标题区域 */}
            <input
              disabled={editorMode === 'view'}
              value={title}
              onChange={handleTitleChange}
              placeholder="未命名文档"
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1F2329',
                border: 'none',
                outline: 'none',
                width: '100%',
                backgroundColor: 'transparent',
                borderBottom: '1px solid #E4E5E7',
                paddingBottom: '14px',
                marginBottom: '20px'
              }}
            />

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

      {/* 💡 飞书质感安全分享配置弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1F2329', fontSize: '16px', fontWeight: 600 }}>
            <Share2 size={16} style={{ color: '#3370FF' }} />
            <span>分享协同设置</span>
          </div>
        }
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={null}
        width={420}
        destroyOnHidden
        style={{ borderRadius: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
          <div style={{ fontSize: '13px', color: '#646A73', lineHeight: '1.5' }}>选择您想要派发的协同权限。链接一经生成，拷贝并发送即可邀请其他人加入。</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 协同编辑通道 */}
            <div
              style={{
                border: '1px solid #DEE0E3',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F9FAFB'
              }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1F2329', fontSize: '13px' }}>可编辑协同链接</div>
                <div style={{ fontSize: '11px', color: '#8F959E', marginTop: '2px' }}>允许协作者任意修改文档及上传图片</div>
              </div>
              <Button type="primary" size="small" onClick={() => generateAndCopyLink('edit')} style={{ backgroundColor: '#3370FF', borderColor: '#3370FF', borderRadius: '4px', fontSize: '12px' }}>
                生成并复制
              </Button>
            </div>

            {/* 只读围观通道 */}
            <div
              style={{
                border: '1px solid #DEE0E3',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F9FAFB'
              }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1F2329', fontSize: '13px' }}>只读游览链接</div>
                <div style={{ fontSize: '11px', color: '#8F959E', marginTop: '2px' }}>仅允许协作者阅读，禁止任何修改动作</div>
              </div>
              <Button type="default" size="small" onClick={() => generateAndCopyLink('view')} style={{ borderRadius: '4px', fontSize: '12px' }}>
                生成并复制
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 💡 飞书级历史版本抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1F2329', fontSize: '15px', fontWeight: 600 }}>
            <History size={16} style={{ color: '#3370FF' }} />
            <span>文档历史版本时光机</span>
          </div>
        }
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        size={360}
        style={{ borderRadius: '8px 0 0 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 保存新版本控制区 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #F0F1F5', paddingBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2329' }}>创建当前版本快照</span>
            <Input placeholder="例如：下午三点会议修改大纲" value={newVersionName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVersionName(e.target.value)} style={{ borderRadius: '4px', fontSize: '13px' }} />
            <Button type="primary" onClick={handleSaveVersion} style={{ width: '100%', borderRadius: '4px', backgroundColor: '#3370FF', borderColor: '#3370FF', height: '34px', fontSize: '13px' }}>
              保存快照
            </Button>
          </div>

          {/* 历史版本列表展示区 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2329' }}>历史版本记录</span>
            {versionList.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#8F959E', fontSize: '13px' }}>暂无任何快照记录，快去上面创建一个吧！</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto' }}>
                {versionList.map(ver => (
                  <div
                    key={ver.id}
                    onClick={() => handleVersionPreview(ver)}
                    style={{
                      border: '1px solid #DEE0E3',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      cursor: 'pointer',
                      backgroundColor: '#FAFAFB',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#3370FF')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#DEE0E3')}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#1F2329' }}>{ver.versionName}</span>
                    <span style={{ fontSize: '11px', color: '#8F959E' }}>{new Date(ver.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* 💡 影子历史版本只读预览弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
              <History size={16} style={{ color: '#3370FF' }} />
              <span>版本预览: {previewVersionName}</span>
            </div>
            
            {/* 💡 恢复该历史版本的动作按钮 */}
            {editorMode === 'edit' && (
              <Button
                type="primary"
                onClick={handleRollbackVersion}
                style={{
                  backgroundColor: '#3370FF',
                  borderColor: '#3370FF',
                  borderRadius: '4px',
                  height: '28px',
                  fontSize: '12px',
                  lineHeight: '28px',
                  padding: '0 12px'
                }}
              >
                恢复此版本
              </Button>
            )}
          </div>
        }
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={800}
        style={{ top: 60 }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '24px 32px' } }}
      >
        {/* 💡 只读影子编辑器容器 */}
        <div 
          className="tiptap-preview"
          dangerouslySetInnerHTML={{ __html: previewContent || '<p style="color:#8F959E">此版本内容为空</p>' }}
          style={{ 
            fontSize: '15px', 
            lineHeight: '1.7', 
            color: '#1F2329',
            border: '1px solid #DEE0E3',
            borderRadius: '6px',
            padding: '24px',
            backgroundColor: '#FAFAFB',
            minHeight: '350px'
          }}
        />
      </Modal>
    </Layout>
  )
}

export default DocumentEditor
