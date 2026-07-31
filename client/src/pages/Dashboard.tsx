import React, { useState } from 'react'
import { Table, Input, Button, Layout, Avatar, Dropdown, Space, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { Search, Plus, LogOut, FileText, Trash2, User, Folder, Compass, Settings, PanelLeftClose, RefreshCw, MoreHorizontal, MessageSquare } from 'lucide-react'

const { Header, Content, Sider } = Layout

export interface DocumentItem {
  id: string | number
  title: string
  createdAt: string
  updatedAt?: string
}

export interface DashboardProps {
  documents?: DocumentItem[]
  username?: string
  onSearchChange?: (value: string) => void
  onCreateDocument?: () => void
  onDeleteDocument?: (id: string | number) => void
  onLogout?: () => void
  onSelectDocument?: (id: string | number) => void
}

const DEFAULT_MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 1, title: 'DocFlow', createdAt: '2026-07-30 10:00' },
  { id: 2, title: 'Moment', createdAt: '2026-07-29 14:35' }
]

export const Dashboard: React.FC<DashboardProps> = ({
  documents = DEFAULT_MOCK_DOCUMENTS,
  username = 'Developer',
  onSearchChange,
  onCreateDocument,
  onDeleteDocument,
  onLogout,
  onSelectDocument
}) => {
  const [searchText, setSearchText] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string | number>(1)
  const [aiPrompt, setAiPrompt] = useState('公司年会活动策划')

  // 获取当前选中的文档标题
  const currentDoc = documents.find(doc => doc.id === selectedDocId) || documents[0]
  const currentTitle = currentDoc ? currentDoc.title : '未命名文档'

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchText(val)
    if (onSearchChange) {
      onSearchChange(val)
    }
  }

  // 过滤后的列表展示（纯前端静态搜索）
  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(searchText.toLowerCase()))

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: '退出登录',
      onClick: onLogout
    }
  ]

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: DocumentItem) => (
        <Space style={{ cursor: 'pointer', fontWeight: 500, color: '#1F2329' }} onClick={() => {
          setSelectedDocId(record.id)
          if (onSelectDocument) onSelectDocument(record.id)
        }}>
          <FileText size={16} style={{ color: '#3370FF' }} />
          <span style={{ color: selectedDocId === record.id ? '#3370FF' : '#1F2329' }}>
            {text}
          </span>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: '80px',
      align: 'center' as const,
      render: (_: any, record: DocumentItem) => (
        <Tooltip title="删除文档">
          <Button
            type="text"
            danger
            icon={<Trash2 size={14} />}
            onClick={e => {
              e.stopPropagation()
              if (onDeleteDocument) {
                onDeleteDocument(record.id)
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          />
        </Tooltip>
      )
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      
      {/* 1. 极简左侧应用导航边栏 (Sider 宽度: 56px) */}
      <Sider
        width={56}
        theme="light"
        style={{
          borderRight: '1px solid #EAEBEF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '16px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
          {/* Logo */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#3370FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer'
          }}>
            D
          </div>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#F0F1F5' }} />
          
          {/* 全局导航按钮组 */}
          <Tooltip title="云文档" placement="right">
            <Button type="text" icon={<Folder size={20} style={{ color: '#3370FF' }} />} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </Tooltip>
          <Tooltip title="探索" placement="right">
            <Button type="text" icon={<Compass size={20} style={{ color: '#646A73' }} />} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </Tooltip>
          <Tooltip title="模板" placement="right">
            <Button type="text" icon={<FileText size={20} style={{ color: '#646A73' }} />} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </Tooltip>
          <Tooltip title="Moment" placement="right">
            <Button type="text" icon={<MessageSquare size={20} style={{ color: '#646A73' }} />} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </Tooltip>
          <Tooltip title="设置" placement="right">
            <Button type="text" icon={<Settings size={20} style={{ color: '#646A73' }} />} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          </Tooltip>
        </div>
      </Sider>

      {/* 2. 文档目录导航副栏 (Sider 宽度: 220px) */}
      <Sider
        width={220}
        theme="light"
        style={{
          borderRight: '1px solid #EAEBEF',
          backgroundColor: '#F8F9FA',
          height: '100vh',
          position: 'fixed',
          left: 56,
          top: 0,
          zIndex: 90,
          padding: '16px 12px'
        }}
      >
        {/* 顶部工具条 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: '#646A73' }}>
          <PanelLeftClose size={16} style={{ cursor: 'pointer' }} />
          <Folder size={16} style={{ cursor: 'pointer' }} />
          <RefreshCw size={16} style={{ cursor: 'pointer' }} />
          <Settings size={16} style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ fontWeight: 600, fontSize: '12px', color: '#8F959E', marginBottom: '8px', paddingLeft: '8px' }}>
          个人文档 ({documents.length})
        </div>

        {/* 树状目录列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDocId(doc.id)
                if (onSelectDocument) onSelectDocument(doc.id)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedDocId === doc.id ? '#E8F0FF' : 'transparent',
                color: selectedDocId === doc.id ? '#3370FF' : '#1F2329',
                fontWeight: selectedDocId === doc.id ? 500 : 400,
                fontSize: '13px',
                transition: 'all 0.15s'
              }}
            >
              <FileText size={14} style={{ marginRight: '8px', color: selectedDocId === doc.id ? '#3370FF' : '#8F959E' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{doc.title}</span>
            </div>
          ))}
        </div>
      </Sider>

      {/* 3. 右侧主工作区 (Layout 宽度: 剩余宽度自适应) */}
      <Layout style={{ marginLeft: 276, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        
        {/* 顶部导航条 (Header 高度: 56px) */}
        <Header
          style={{
            background: '#FFFFFF',
            padding: '0 24px',
            height: '56px',
            lineHeight: '56px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #EAEBEF',
            position: 'sticky',
            top: 0,
            zIndex: 80
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} style={{ color: '#3370FF' }} />
            <span style={{ fontWeight: 600, color: '#1F2329', fontSize: '14px' }}>
              {currentTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 协同状态：显示在线人数气泡 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#E8FFEA',
              border: '1px solid #B7F5C4',
              borderRadius: '20px',
              padding: '4px 12px',
              height: '28px',
              gap: '6px'
            }}>
              <Avatar size={18} icon={<User size={10} />} style={{ backgroundColor: '#52C41A' }} />
              <span style={{ color: '#237804', fontSize: '12px', fontWeight: 500 }}>1位用户在线</span>
            </div>

            {/* 用户操作菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button size="small" style={{ borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MoreHorizontal size={14} /> 操作
              </Button>
            </Dropdown>
          </div>
        </Header>

        {/* 主体内容区 (Content 最大宽度: 800px 居中) */}
        <Content style={{ padding: '40px 24px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            
            {/* 工作空间文件列表 */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 600, color: '#1F2329', fontSize: '16px' }}>工作空间内所有文件</span>
                <Button type="primary" size="large" onClick={onCreateDocument} icon={<Plus size={16} />} style={{ display: 'flex', alignItems: 'center', borderRadius: '6px', height: '40px', backgroundColor: '#3370FF', borderColor: '#3370FF' }}>
                  新建文件
                </Button>
              </div>
              <Table
                dataSource={filteredDocs}
                columns={columns}
                rowKey="id"
                pagination={false}
                showHeader={false}
                size="large"
                style={{ 
                  border: '1px solid #EAEBEF',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              />
            </div>

          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard


