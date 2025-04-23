import { Layout, Menu } from 'antd'
import {
  DesktopOutlined,
  AppstoreAddOutlined,
  LineChartOutlined,
  AlertOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'

import DeviceStatus from '../pages/DeviceStatus'
import MachineMonitoring from '../pages/MachineMonitoring'
import DeviceOverview from '../pages/DeviceOverview'
import IntelligentAlert from '../pages/IntelligentAlert'
import DataStatistics from '../pages/DataStatistics'
import DeviceDetail from '../pages/DeviceDetail'
import AlertDetail from '../pages/AlertDetail'

const { Sider, Content, Header } = Layout

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const routeTitleMap: Record<string, string> = {
    '/device-status': '设备状态',
    '/machine-monitoring': '机组监测',
    '/device-overview': '设备总览',
    '/intelligent-alert': '智能报警',
    '/data-statistics': '数据统计'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧菜单栏 */}
      <Sider
        width={220}
        style={{ backgroundColor: '#1f1f1f' }}
        breakpoint="lg"
        collapsedWidth="80"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            borderBottom: '1px solid #333'
          }}
        >
          设备健康状况监控系统
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0 }}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: '/device-status',
              icon: <DesktopOutlined />,
              label: '设备状态'
            },
            {
              key: '/machine-monitoring',
              icon: <AppstoreAddOutlined />,
              label: '机组监测'
            },
            {
              key: '/device-overview',
              icon: <LineChartOutlined />,
              label: '设备总览'
            },
            {
              key: '/intelligent-alert',
              icon: <AlertOutlined />,
              label: '智能报警'
            },
            {
              key: '/data-statistics',
              icon: <BarChartOutlined />,
              label: '数据统计'
            }
          ]}
        />
      </Sider>

      {/* 页面内容区 */}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            fontSize: 20,
            fontWeight: 'bold',
            borderBottom: '1px solid #e8e8e8'
          }}
        >
          {routeTitleMap[location.pathname] || ''}
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Routes>
            <Route path="/device-status" element={<DeviceStatus />} />
            <Route path="/machine-monitoring" element={<MachineMonitoring />} />
            <Route path="/device-overview" element={<DeviceOverview />} />
            <Route path="/intelligent-alert" element={<IntelligentAlert />} />
            <Route path="/data-statistics" element={<DataStatistics />} />
            <Route path="/device-detail/:deviceId" element={<DeviceDetail />} />
            <Route path="/alert-detail/:deviceId" element={<AlertDetail />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}