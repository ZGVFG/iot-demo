import { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Progress, Button } from 'antd'
import { Link } from 'react-router-dom'

// 模拟泵站数据
const stations = [
  {
    id: 'station-1',
    name: '一号泵站',
    devices: [
      { id: 'dev-1', name: '潜水贯流泵', status: '运行中', current: 45, voltage: 380, flow: 1200, health: 80, alarm: '无' },
      { id: 'dev-2', name: '立式混流泵', status: '已停止', current: 0, voltage: 0, flow: 0, health: 60, alarm: '报警中' },
      { id: 'dev-3', name: '通风机', status: '运行中', current: 38, voltage: 380, flow: 1100, health: 90, alarm: '无' },
      { id: 'dev-4', name: '立式混流泵', status: '运行中', current: 42, voltage: 380, flow: 950, health: 75, alarm: '无' }
    ]
  },
  {
    id: 'station-2',
    name: '二号泵站',
    devices: [
      { id: 'dev-5', name: '潜水贯流泵', status: '已停止', current: 0, voltage: 0, flow: 0, health: 50, alarm: '故障' },
      { id: 'dev-6', name: '立式混流泵', status: '运行中', current: 30, voltage: 380, flow: 950, health: 85, alarm: '无' }
    ]
  }
]

export default function DeviceOverview() {
  const [devices, setDevices] = useState(stations)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8090')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('接收到数据:', data)

      // 更新设备数据
      setDevices((prevStations) => {
        return prevStations.map((station) => {
          return {
            ...station,
            devices: station.devices.map((device) => {
              if (device.id === data.deviceId) {
                return {
                  ...device,
                  status: data.status,
                  current: data.current,
                  voltage: data.voltage,
                  flow: data.flow,
                  alarm: data.alarm
                }
              }
              return device
            })
          }
        })
      })
    }

    ws.onopen = () => {
      console.log('WebSocket 连接已建立')
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>设备总览</h2>

      {devices.map((station) => (
        <div key={station.id}>
          <h3>{station.name}</h3>
          <Row gutter={[16, 16]}>
            {station.devices.map((device) => (
              <Col span={6} key={device.id}>
                <Card title={device.name} bordered={false} style={{ width: 300 }}>
                  <p>状态: <Tag color={device.status === '运行中' ? 'green' : 'red'}>{device.status}</Tag></p>
                  <p>电流: {device.current} A</p>
                  <p>电压: {device.voltage} V</p>
                  <p>流量: {device.flow} m³/h</p>

                  <p>健康评分:</p>
                  <Progress percent={device.health} size="small" status="active" />

                  <p>告警状态: {device.alarm}</p>

                  <Button type="primary">
                    <Link to={`/device-detail/${device.id}`}>查看详情</Link>
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  )
}
