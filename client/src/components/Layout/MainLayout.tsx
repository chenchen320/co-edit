import React from 'react'
import { Button,Layout, Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { LogOut, FileText, Folder, Compass, Settings, MessageSquare, Leaf } from 'lucide-react'

const { Header, Content, Sider } = Layout

interface MainLayoutProps {
  children: React.ReactNode;
  username?: string;
  onLogout?: () =>  void;
}
export const MainLayout = ({children,username = '用户',onLogout}: MainLayoutProps) => {
  
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

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


      {/* 右侧主工作区 (Layout 宽度: 剩余宽度自适应) */}
     {/* ================= 右侧顶部导航 + 主内容区 ================= */}
      <Layout style={{ marginLeft: 56, backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <Header style={{ background: '#FFFFFF', padding: '0 27px', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAEBEF' }}>
          {/* 左侧标题（暂时留空，让页面自己去决定显示什么标题） */}
          <div style={{ fontWeight: 600, color: '#1F2329', fontSize: '14px',paddingLeft:'20px' }}>CoEdit</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* 用户操作菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Button size="small" style={{ borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               {username}
              </Button>
            </Dropdown>
          </div>
        </Header>

        {/* 主体内容区 */}
        <Content style={{ padding: '40px 24px', backgroundColor: '#FFFFFF' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout


