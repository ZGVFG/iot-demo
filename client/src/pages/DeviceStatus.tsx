import { useState, useEffect } from 'react'
import { Row, Col, Card, Tag, Select } from 'antd'
import { Line } from '@ant-design/charts'

const { Option } = Select

const stations = [
  {
    id: 'station-1',
    name: '泵站一',
    devices: [
      { id: 'dev-1', type: '潜水贯流泵', status: '运行中', runtime: '5h', normal: true, current: 45, voltage: 380, flow: 1200 },
      { id: 'dev-2', type: '立式混流泵（滚动轴承）', status: '运行中', runtime: '2h', normal: true, current: 38, voltage: 380, flow: 1100 },
      { id: 'dev-3', type: '通风机', status: '已停止', runtime: '0h', normal: false, current: 0, voltage: 0, flow: 0 },
      { id: 'dev-4', type: '立式混流泵（滑动轴承）', status: '运行中', runtime: '1h', normal: true, current: 42, voltage: 380, flow: 950 }
    ]
  },
  {
    id: 'station-2',
    name: '泵站二',
    devices: [
      { id: 'dev-5', type: '潜水贯流泵', status: '运行中', runtime: '3h', normal: true, current: 40, voltage: 380, flow: 1300 },
      { id: 'dev-6', type: '立式混流泵（滚动轴承）', status: '运行中', runtime: '1.5h', normal: true, current: 36, voltage: 380, flow: 1000 },
      { id: 'dev-7', type: '通风机', status: '已停止', runtime: '0h', normal: false, current: 0, voltage: 0, flow: 0 },
      { id: 'dev-8', type: '立式混流泵（滑动轴承）', status: '运行中', runtime: '0.5h', normal: true, current: 39, voltage: 380, flow: 900 }
    ]
  }
]

interface ChartData {
  time: string
  current: number
  voltage: number
  flow: number
  type: string
  stationId: string
  deviceId: string
}

export default function DeviceStatus() {
  const [selectedStationId, setSelectedStationId] = useState('station-1')
  const [devices, setDevices] = useState(stations[0].devices)
  const [chartType, setChartType] = useState<'current' | 'voltage' | 'flow'>('current')
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const ws = new WebSocket('wss://iot-demo-server.onrender.com');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'deviceStatus') {
        const payload = data.payload

        const station = stations.find(s => s.devices.some(d => d.id === payload.deviceId))
        if (!station || station.id !== selectedStationId) return

        const newCurrent = Math.max(0, payload.current + (Math.random() - 0.5) * 5)
        const newVoltage = Math.max(0, payload.voltage + (Math.random() - 0.5) * 5)
        const newFlow = Math.max(0, payload.flow + (Math.random() - 0.5) * 30)

        setDevices(prev => prev.map(device =>
          device.id === payload.deviceId
            ? { ...device, current: newCurrent, voltage: newVoltage, flow: newFlow, status: payload.status }
            : device
        ))

        const time = new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        })

        setChartData(prev => [
          ...prev.slice(-50),
          {
            time,
            current: newCurrent,
            voltage: newVoltage,
            flow: newFlow,
            type: payload.deviceType,
            stationId: station.id,
            deviceId: payload.deviceId
          }
        ])
      }
    }

    return () => ws.close()
  }, [selectedStationId])

  const handleStationChange = (value: string) => {
    setSelectedStationId(value)
    const station = stations.find(s => s.id === value)
    if (station) setDevices(station.devices)
  }

  const getDeviceChart = (deviceId: string, type: string) => {
    const data = chartData
      .filter(item => item.deviceId === deviceId)
      .map(item => ({
        time: item.time,
        value: item[chartType],
        type
      }))

    return {
      data,
      height: 240,
      xField: 'time',
      yField: 'value',
      seriesField: 'type',
      smooth: true,
      color: ['#1890ff'],
      tooltip: { showMarkers: false },
      point: {
        shape: 'circle',
        size: 4,
        style: { fill: '#fff', stroke: '#1890ff', lineWidth: 1 },
      },
      area: { style: { fillOpacity: 0.15 } },
      lineStyle: { lineWidth: 2 },
      legend: { position: 'top' },
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 12 }}>泵站选择：</h3>
      <Select
        value={selectedStationId}
        onChange={handleStationChange}
        style={{ width: 220, marginBottom: 24 }}
      >
        {stations.map(s => (
          <Option key={s.id} value={s.id}>
            {s.name}
          </Option>
        ))}
      </Select>

      <h3 style={{ marginBottom: 12 }}>图表数据类型：</h3>
      <Select
        value={chartType}
        onChange={val => setChartType(val)}
        style={{ width: 220, marginBottom: 32 }}
        options={[
          { label: '电流（A）', value: 'current' },
          { label: '电压（V）', value: 'voltage' },
          { label: '水流量（m³/h）', value: 'flow' },
        ]}
      />

      <Row gutter={[16, 16]}>
        {devices.map(device => (
          <Col span={12} key={device.id}>
            <Card title={device.type}>
              <p>
                状态：<Tag color={device.status === '运行中' ? 'green' : 'red'}>{device.status}</Tag>
              </p>
              <Line {...getDeviceChart(device.id, device.type)} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
