import { useState, useEffect } from 'react'
import { Select, Card, Row, Col, Tag } from 'antd'
import { Line } from '@ant-design/charts'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

interface ChartData {
  time: string
  device: string
  metric: string
  value: number
}

export default function MachineMonitoring() {
  const [metric, setMetric] = useState<'temperature' | 'voltage' | 'current'>('temperature')
  const [selectedDevice, setSelectedDevice] = useState('电机后端')
  const [chartData, setChartData] = useState<ChartData[]>([])

  const [runTime, setRunTime] = useState(0)
  const [totalTime, setTotalTime] = useState(3600 * 10)

  const [current, setCurrent] = useState(45)
  const [voltage, setVoltage] = useState(380)
  const [flow, setFlow] = useState(1200)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs().format('HH:mm:ss')
      const randomValue = {
        temperature: Math.random() * 10 + 45,
        voltage: Math.random() * 10 + 370,
        current: Math.random() * 10 + 40,
      }[metric]

      setChartData(prev => {
        const updated = [...prev, {
          time: now,
          device: selectedDevice,
          metric,
          value: randomValue,
        }]
        return updated.length > 30 ? updated.slice(updated.length - 30) : updated
      })

      setCurrent(Math.random() * 10 + 40)
      setVoltage(Math.random() * 10 + 370)
      setFlow(Math.random() * 1500 + 800)
    }, 1000)

    return () => clearInterval(timer)
  }, [metric, selectedDevice])

  useEffect(() => {
    const interval = setInterval(() => {
      setRunTime(prev => prev + 1)
      setTotalTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  const chartConfig = {
    data: chartData.filter(item => item.device === selectedDevice && item.metric === metric),
    height: 320,
    xField: 'time',
    yField: 'value',
    smooth: true,
    animation: { appear: { animation: 'path-in', duration: 1000 } },
    color: '#1890ff',
    area: {
      style: {
        fill: 'l(270) 0:#e6f7ff 1:#ffffff',
        fillOpacity: 0.4,
      },
    },
    lineStyle: {
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 4,
      shadowOffsetY: 4,
    },
    xAxis: {
      title: null,
      label: {
        style: { fill: '#666', fontSize: 12 }
      },
    },
    yAxis: {
      label: {
        style: { fill: '#666', fontSize: 12 }
      },
    },
    tooltip: {
      showMarkers: true,
      shared: true
    },
    padding: [30, 40, 50, 60],
    background: { fill: '#fafafa' },
  }

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  }

  const titleStyle = {
    fontSize: 16,
    fontWeight: 600,
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title={<span style={titleStyle}>选择设备</span>} style={cardStyle}>
            <Select
              value={selectedDevice}
              onChange={setSelectedDevice}
              style={{ width: 200 }}
            >
              <Option value="电机后端">电机后端</Option>
              <Option value="电机前端">电机前端</Option>
              <Option value="轴承箱前端">轴承箱前端</Option>
              <Option value="轴承箱后端">轴承箱后端</Option>
            </Select>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<span style={titleStyle}>选择指标</span>} style={cardStyle}>
            <Select
              value={metric}
              onChange={setMetric}
              style={{ width: 160 }}
            >
              <Option value="temperature">温度</Option>
              <Option value="voltage">电压</Option>
              <Option value="current">电流</Option>
            </Select>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title={<span style={titleStyle}>设备运行趋势</span>} style={cardStyle}>
            <Line {...chartConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title={<span style={titleStyle}>设备结构图</span>} style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <Link to="/device-monitoring">
                <img
                  src="client/src/public/structure.png"
                  alt="设备结构图"
                  style={{ width: '80%', borderRadius: 8 }}
                />
              </Link>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title={<span style={titleStyle}>实时监测信息</span>} style={cardStyle}>
            <p><strong>本次运行时长：</strong>{formatSeconds(runTime)}</p>
            <p><strong>累计运行时长：</strong>{formatSeconds(totalTime)}</p>
            <p><strong>当前电流：</strong>{Math.floor(current)} A</p>
            <p><strong>当前电压：</strong>{Math.floor(voltage)} V</p>
            <p><strong>当前水流量：</strong>{Math.floor(flow)} m³/h</p>
            <p><strong>设备状态：</strong>
              <Tag color="green">运行中</Tag>
              <Tag color="blue">正常</Tag>
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
