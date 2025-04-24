import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Modal,
  Input,
  Select,
  DatePicker,
  Form
} from 'antd'
import { Line } from '@ant-design/plots'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface AlertItem {
  key: string
  deviceName: string
  component: string
  signalType: string
  alertLevel: 'warning' | 'danger'
  value: number
  unit: string
  time: string
}

export default function IntelligentAlert() {
  const [allAlerts, setAllAlerts] = useState<AlertItem[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<AlertItem[]>([])
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showDiagModal, setShowDiagModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResults, setPreviewResults] = useState<AlertItem[]>([])
  const diagRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const ws = new WebSocket('wss://iot-demo-server.onrender.com');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('收到报警推送：', data);
        if (data.type === 'alert') {
          const newAlerts: AlertItem[] = (Array.isArray(data.payload) ? data.payload : [data.payload])
            //.filter((item: AlertItem) => item.alertLevel !== 'normal')
            .map((item: AlertItem) => ({
              ...item,
              key: `${Date.now()}-${Math.random()}`
            }))
          setAllAlerts((prev) => {
            const updated = [...newAlerts, ...prev].slice(0, 100)
            setFilteredAlerts(updated)
            return updated
          })
        }
      } catch (err) {
        console.error('[WebSocket] JSON parse error:', err)
      }
    }

    return () => ws.close()
  }, [])

  const handleChart = (record: AlertItem) => {
    setSelectedAlert(record)
    setShowChartModal(true)
  }

  const handleDiag = (record: AlertItem) => {
    setSelectedAlert(record)
    setShowDiagModal(true)
  }

  const handleExport = async () => {
    if (diagRef.current) {
      const canvas = await html2canvas(diagRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      const filename = `诊断报告-${selectedAlert?.deviceName || '未知设备'}.pdf`
      pdf.save(filename)
    }
  }

  const chartConfig = {
    data: Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      value: selectedAlert ? selectedAlert.value + Math.round((Math.random() - 0.5) * 10) : 0
    })),
    xField: 'time',
    yField: 'value',
    smooth: true,
    height: 300,
    autoFit: true
  }

  const handleFilter = () => {
    const { component, signalType, alertLevel, timeRange, keyword } = form.getFieldsValue()

    const filtered = allAlerts.filter((item) => {
      const matchComponent = component ? item.component.includes(component) : true
      const matchSignalType = signalType ? item.signalType === signalType : true
      const matchLevel = alertLevel ? item.alertLevel === alertLevel : true
      const matchTime = timeRange
        ? dayjs(item.time).isAfter(timeRange[0]) && dayjs(item.time).isBefore(timeRange[1])
        : true
      const matchKeyword = keyword
        ? Object.values(item).some((val) => typeof val === 'string' && val.includes(keyword))
        : true

      return matchComponent && matchSignalType && matchLevel && matchTime && matchKeyword
    })

    setPreviewResults(filtered)
    setShowPreviewModal(true)
  }

  const applyFilter = () => {
    setFilteredAlerts(previewResults)
    setShowPreviewModal(false)
  }

  const columns = [
    { title: '设备', dataIndex: 'deviceName', key: 'deviceName' },
    { title: '测点位置', dataIndex: 'component', key: 'component' },
    { title: '信号类型', dataIndex: 'signalType', key: 'signalType' },
    {
      title: '报警值',
      dataIndex: 'value',
      key: 'value',
      render: (v: number, row: AlertItem) => `${v} ${row.unit}`
    },
    {
      title: '报警等级',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      render: (level: AlertItem['alertLevel']) => (
        <Tag color={level === 'danger' ? 'red' : 'orange'}>
          {level === 'danger' ? '危险' : '报警'}
        </Tag>
      )
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => {
        const parsed = dayjs(time);
        return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '无效时间';
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: AlertItem) => (
        <Space>
          <Button type="link" onClick={() => handleChart(record)}>图谱分析</Button>
          <Button type="link" onClick={() => handleDiag(record)}>诊断</Button>
        </Space>
      )
    }
  ]
  
  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3}>智能报警系统</Title></Col>
      </Row>

      <Card title="筛选条件" style={{ marginBottom: 24 }}>
        <Form layout="inline" form={form}>
          <Form.Item label="测点位置" name="component">
            <Input placeholder="如：轴承箱" />
          </Form.Item>
          <Form.Item label="信号类型" name="signalType">
            <Select style={{ width: 120 }} allowClear>
              <Option value="温度">温度</Option>
              <Option value="电流">电流</Option>
              <Option value="电压">电压</Option>
            </Select>
          </Form.Item>
          <Form.Item label="报警等级" name="alertLevel">
            <Select style={{ width: 100 }} allowClear>
              <Option value="warning">报警</Option>
              <Option value="danger">危险</Option>
            </Select>
          </Form.Item>
          <Form.Item label="时间范围" name="timeRange">
            <RangePicker showTime />
          </Form.Item>
          <Form.Item label="关键字" name="keyword">
            <Input placeholder="设备名/测点/信号" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleFilter}>筛选</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => {
              form.resetFields()
              setFilteredAlerts(allAlerts)
            }}>重置</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="实时报警信息">
        <Table
          dataSource={filteredAlerts}
          columns={columns}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          bordered
        />
      </Card>

      <Modal
        title="图谱分析"
        open={showChartModal}
        onCancel={() => setShowChartModal(false)}
        footer={null}
        width={700}
      >
        <Line {...chartConfig} />
      </Modal>

      <Modal
        title="诊断结果"
        open={showDiagModal}
        onCancel={() => setShowDiagModal(false)}
        footer={[
          <Button key="export" type="primary" onClick={handleExport}>
            导出报告
          </Button>
        ]}
      >
        <div ref={diagRef}>
          <p>设备：{selectedAlert?.deviceName}</p>
          <p>部位：{selectedAlert?.component}</p>
          <p>信号类型：{selectedAlert?.signalType}</p>
          <p>当前值：{selectedAlert?.value} {selectedAlert?.unit}</p>
          <p>诊断结论：{selectedAlert?.alertLevel === 'danger'
            ? '设备存在严重异常，请立即处理。'
            : '设备存在异常趋势，请关注运行状态。'}
          </p>
        </div>
      </Modal>

      <Modal
        title="匹配结果确认"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        onOk={applyFilter}
        okText="应用筛选"
        cancelText="取消"
        width={800}
      >
        <Table
          dataSource={previewResults}
          columns={columns}
          pagination={{ pageSize: 5 }}
          rowKey="key"
          size="small"
        />
      </Modal>
    </div>
  )
}
