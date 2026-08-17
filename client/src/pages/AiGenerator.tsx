import React, { useState } from 'react'
import { Layout, Input, Button, Card, message, Spin, Empty } from 'antd'
import { MainLayout } from '../components/Layout/MainLayout'
import { Send, FileInput, Sparkles, RefreshCw } from 'lucide-react'
import apiClient from '../utils/apiClient'
import { useNavigate } from 'react-router-dom'

const { TextArea } = Input

export default function AiGenerator() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [aiTitle, setAiTitle] = useState('')
  const [aiContent, setAiContent] = useState('') // 保存 AI 生成的 HTML 富文本内容
  const [loading, setLoading] = useState(false)

  // 触发 AI 生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请先输入您的 AI 写作创意提示词')
      return
    }

    setLoading(true)
    setAiContent('')
    setAiTitle('AI正在创作中...')

    const eventSource = new EventSource(`http://localhost:3000/ai/generate-stream?prompt=${encodeURIComponent(prompt)}`)

    eventSource.onmessage = (event) => {
      const text = event.data
      setAiContent((prev) => prev + text)
    }

    eventSource.onerror = () => {
      console.log('流式传输结束或遇到重置')
      eventSource.close()
      setLoading(false)
      setAiTitle(prompt.substring(0, 15) + '...')
    }
  }

  // 一键创建文档并跳转
  const handleImportToDocument = async () => {
    try {
      const res = await apiClient.post('/document', { title: aiTitle, content: aiContent })
      if (res.data.id) {
        message.success('文档生成成功，正在开启多人协作空间...')
        navigate(`/document/${res.data.id}`)
      }
    } catch {
      message.error('导入文档失败')
    }
  }

  return (
    <MainLayout username="飞书体验官">
      <div style={{ display: 'flex', gap: '24px', minHeight: '80vh', padding: '12px' }}>
        {/* 左侧：输入 Prompt 的控制面板 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3370FF' }}>
              <Sparkles size={16} />
              <span>AI 灵感创作舱</span>
            </div>
          }
          style={{ width: '350px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(31, 35, 41, 0.05)', border: '1px solid #DEE0E3' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: '#646A73' }}>输入你的文档创作需求（如周报、算法设计说明书大纲、会议纪要等），AI 将为你瞬间一键起草。</div>

            <TextArea
              rows={6}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="请输入详细的提示词，例如：&#10;帮我写一份多人协同实时编辑器的数据库及 Web Socket 系统设计大纲..."
              style={{ borderRadius: '6px', fontSize: '13px' }}
            />

            <Button
              type="primary"
              onClick={handleGenerate}
              loading={loading}
              icon={<Send size={14} />}
              style={{
                height: '38px',
                backgroundColor: '#3370FF',
                borderColor: '#3370FF',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
              开始 AI 创作
            </Button>
          </div>
        </Card>

        {/* 右侧：AI 实时展示与一键导入区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DEE0E3', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#1F2329' }}>生成内容预览</span>
              {aiTitle && <div style={{ fontSize: '13px', color: '#8F959E', marginTop: '4px' }}>拟定标题: {aiTitle}</div>}
            </div>

            <Button
              type="primary"
              onClick={handleImportToDocument}
              disabled={!aiContent}
              icon={<FileInput size={14} />}
              style={{
                borderRadius: '6px',
                height: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
              一键导入并开启协同
            </Button>
          </div>

          {/* 富文本预览框 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              border: '1px solid #DEE0E3',
              borderRadius: '8px',
              padding: '24px 32px',
              minHeight: '450px',
              boxShadow: 'inset 0 1px 4px rgba(31, 35, 41, 0.02)',
              overflowY: 'auto'
            }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', minHeight: '300px' }}>
                <Spin size="large" />
                <span style={{ color: '#8F959E', fontSize: '13px' }}>AI 正在努力撰写中，请稍后...</span>
              </div>
            ) : aiContent ? (
              <div
                className="tiptap-preview"
                dangerouslySetInnerHTML={{ __html: aiContent }}
                style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#1F2329'
                }}
              />
            ) : (
              <div style={{ padding: '80px 0' }}>
                <Empty description="暂无生成内容，请在左侧输入配置开始 AI 创作" />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
