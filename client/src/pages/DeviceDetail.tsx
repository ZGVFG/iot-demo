import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'

// 定义设备详情的数据类型
interface DevicePart {
  part: string
  position: string
  signalType: string
  value: string
  speed: string
  time: string
  dcOffset: string
  action: string
}

interface DeviceDetails {
  [key: string]: DevicePart[] // 设备ID与设备部件数组的映射
}

// 模拟设备详情数据
const deviceDetails: DeviceDetails = {
  'dev-1': [
    { part: '启停', position: '本体部件', signalType: '数字', value: '开启', speed: '无', time: '2025-04-08 08:00', dcOffset: '无', action: '无' },
    { part: '转速', position: '本体部件', signalType: '模拟', value: '1500 RPM', speed: '1500 RPM', time: '2025-04-08 08:00', dcOffset: '无', action: '无' },
    { part: '电机前端-2H', position: '电机前端', signalType: '模拟', value: '45°C', speed: '无', time: '2025-04-08 08:00', dcOffset: '无', action: '无' },
    { part: '电机前端-2T', position: '电机前端', signalType: '模拟', value: '3.2 A', speed: '无', time: '2025-04-08 08:00', dcOffset: '无', action: '无' },
    // 更多部件...
  ],
  'dev-2': [
    { part: '电机后端-1T', position: '电机后端', signalType: '模拟', value: '45°C', speed: '无', time: '2025-04-08 08:05', dcOffset: '无', action: '无' },
    // 更多部件...
  ],
  // 更多设备...
}

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>() // 确保 deviceId 类型为 string
  const navigate = useNavigate()  // 获取导航功能
  const [details, setDetails] = useState<DevicePart[]>([])

  useEffect(() => {
    if (deviceId && deviceDetails[deviceId]) {
      setDetails(deviceDetails[deviceId])
    }
  }, [deviceId])

  const columns = [
    { title: '部件', dataIndex: 'part', key: 'part' },
    { title: '位置', dataIndex: 'position', key: 'position' },
    { title: '信号类型', dataIndex: 'signalType', key: 'signalType' },
    { title: '监测值', dataIndex: 'value', key: 'value' },
    { title: '转速', dataIndex: 'speed', key: 'speed' },
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: '直流偏置', dataIndex: 'dcOffset', key: 'dcOffset' },
    { title: '可操作', dataIndex: 'action', key: 'action' },
  ]

    // 返回设备总览页面的函数
    const goToDeviceOverview = () => {
        navigate('/device-overview')  // 跳转到设备总览页面
      }

  return (
    <div style={{ padding: 24 }}>
      <h2>设备详情 - {deviceId}</h2>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="设备实时数据">
            <Table columns={columns} dataSource={details} rowKey="part" pagination={false} />
          </Card>
        </Col>
      </Row>

      <Button style={{ marginTop: 20 }} type="primary" onClick={goToDeviceOverview}>
        返回设备总览
      </Button>
    </div>
  )
}
