import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Tag } from 'antd'

const { Title, Paragraph } = Typography

interface AlertItem {
  key: string
  deviceName: string
  component: string
  signalType: string
  alertLevel: 'normal' | 'warning' | 'danger'
  value: number
  unit: string
  time: string
}

export default function AlertDetail() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const alert = state as AlertItem

  if (!alert) {
    return <Paragraph>无报警详情数据，请从报警页面进入。</Paragraph>
  }

  const colorMap: Record<AlertItem['alertLevel'], string> = {
    normal: 'green',
    warning: 'orange',
    danger: 'red'
  }

  const levelText: Record<AlertItem['alertLevel'], string> = {
    normal: '设备运行正常。',
    warning: '设备存在异常趋势，请关注运行状态。',
    danger: '设备存在严重异常，请立即处理。'
  }

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)}>返回</Button>
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>报警详情</Title>
        <Paragraph><strong>设备 ID：</strong>{deviceId}</Paragraph>
        <Paragraph><strong>设备名称：</strong>{alert.deviceName}</Paragraph>
        <Paragraph><strong>部位：</strong>{alert.component}</Paragraph>
        <Paragraph><strong>信号类型：</strong>{alert.signalType}</Paragraph>
        <Paragraph><strong>报警值：</strong>{alert.value} {alert.unit}</Paragraph>
        <Paragraph>
          <strong>报警等级：</strong>
          <Tag color={colorMap[alert.alertLevel]}>{alert.alertLevel.toUpperCase()}</Tag>
        </Paragraph>
        <Paragraph><strong>时间：</strong>{alert.time}</Paragraph>
        <Paragraph><strong>诊断结论：</strong>{levelText[alert.alertLevel]}</Paragraph>
      </Card>
    </div>
  )
}
