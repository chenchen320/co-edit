import { Button } from 'antd'
import { FileText, Folder, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentTable } from '../components/DocumentTable'
import { MainLayout } from '../components/Layout/MainLayout'
import type { DocumentItem } from '../type'
import apiClient from '../utils/apiClient'

export interface DashboardProps {
  initialDocuments?: DocumentItem[]
  username?: string
  onLogout?: () => void
  onCreateDocument?: () => void
}

const DEFAULT_MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 1, title: 'DocFlow', createdAt: '2026-07-30 10:00' },
  { id: 2, title: 'Moment', createdAt: '2026-07-29 14:35' }
]

export default function Dashboard({ initialDocuments = DEFAULT_MOCK_DOCUMENTS, username = '飞书体验官', onLogout, onCreateDocument }: DashboardProps) {
  const navigate = useNavigate()
  const [documents, setDocument] = useState<DocumentItem[]>(initialDocuments)
  const [selectedDocId, setSelectedDocId] = useState<string | number>(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await apiClient.get('/document')
      setDocument(res.data)
    }
    fetchDocs()
  }, [])

  // 事件处理器
  const handleCreateDocument = async () => {
    const res = await apiClient.post('/document', { title: '无标题文档' })
    navigate(`/document/${res.data.id}`)
    if (onCreateDocument) {
      onCreateDocument()
      return
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
      return
    }
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const handleDeleteDocument = async (id: string | number) => {
    try {
      await apiClient.delete(`/document/${id}`)
      setDocument(prev => prev.filter(p => p.id != id))
      alert(`触发删除文档 ID: ${id}`)
    } catch {
      alert('删除文档失败')
    }
  }

  const handleSelectDocument = (id: string | number) => {
    navigate(`/document/${id}`)
  }

  return (
    <MainLayout username={username} onLogout={handleLogout}>
      {/* 自定义的文档目录侧边栏 */}
      <div
        style={{
          position: 'fixed',
          left: 56,
          top: 0,
          bottom: 0,
          width: isSidebarOpen ? '220px' : '0px',
          opacity: isSidebarOpen ? 1 : 0,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-220px)',
          backgroundColor: '#F8F9FA',
          borderRight: '1px solid #EAEBEF',
          padding: '16px 12px',
          zIndex: 90
        }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: '#646A73' }}>
          <PanelLeftClose size={16} style={{ cursor: 'pointer' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Folder size={16} style={{ cursor: 'pointer' }} />
          <RefreshCw size={16} style={{ cursor: 'pointer' }} />
          <Settings size={16} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ fontWeight: 600, fontSize: '12px', color: '#8F959E', marginBottom: '8px', paddingLeft: '8px' }}>个人文档 ({documents.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedDocId === doc.id ? '#E8F0FF' : 'transparent',
                color: selectedDocId === doc.id ? '#3370FF' : '#1F2329',
                fontWeight: selectedDocId === doc.id ? 500 : 400,
                fontSize: '13px'
              }}>
              <FileText size={14} style={{ marginRight: '8px', color: selectedDocId === doc.id ? '#3370FF' : '#8F959E' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{doc.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 工作空间主体外层包裹容器：左边留出侧边栏宽度 */}
      <div
        style={{
          marginLeft: '220px',
          padding: '0 24px',
          boxSizing: 'border-box',
        }}>
        {/* 💡 当侧边栏收起时，在工作空间顶部显示一个打开按钮 */}
        {!isSidebarOpen && (
          <Button
            type="text"
            icon={<PanelLeftOpen size={18} />}
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: 'fixed',
              left: '70px',
              top: '13px',
              zIndex: 100
            }}
          />
        )}
        {/* 限制最大宽度的实际内容区域，并在剩余空间中居中 */}
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
            <span style={{ fontWeight: 600, color: '#1F2329', fontSize: '16px', whiteSpace: 'nowrap' }}>工作空间内所有文件</span>
            <Button type="primary" size="large" onClick={handleCreateDocument} icon={<Plus size={16} />} style={{ display: 'flex', alignItems: 'center', borderRadius: '6px', height: '40px', backgroundColor: '#3370FF', borderColor: '#3370FF' }}>
              新建文件
            </Button>
          </div>

          {/* 将表格组件塞入主体 */}
          <DocumentTable data={documents} selectedId={selectedDocId} onSelectDocument={handleSelectDocument} onDeleteDocument={handleDeleteDocument} />
        </div>
      </div>
    </MainLayout>
  )
}
