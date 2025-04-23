import { Card, Col, Row, Statistic, DatePicker, Button, Select, message } from 'antd'
import { Line, Pie, Column } from '@ant-design/plots'
import { useEffect, useState, useCallback } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker
const { Option } = Select

interface TrendItem {
  month: number
  count: number
}

interface TypeItem {
  type: string
  value: number
}

interface LevelItem {
  level: string
  count: number
}

export default function DataStatistics() {
  const [allTrendData, setAllTrendData] = useState<TrendItem[]>([])
  const [trendData, setTrendData] = useState<TrendItem[]>([])
  const [typeData, setTypeData] = useState<TypeItem[]>([])
  const [levelData, setLevelData] = useState<LevelItem[]>([])
  const [selectedRange, setSelectedRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('year'),
    dayjs()
  ])
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [selectedDevice, setSelectedDevice] = useState<string>('全部设备')
  const [summary, setSummary] = useState({ total: 0, monthly: 0, onlineDevices: 18 })

  const devices = ['全部设备', '潜水泵001', '风机A区', '混流泵007']

  const generateMockData = useCallback(() => {
    const base = selectedDevice === '全部设备' ? 1 : 0.5
    const multiplier = 1 + Math.random() * 0.5

    const mockTrend: TrendItem[] = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: Math.max(0, Math.floor(Math.random() * 100 * base * multiplier))
    }))

    const mockType: TypeItem[] = [
      { type: '电流报警', value: Math.max(0, Math.floor(30 * base * multiplier)) },
      { type: '温度报警', value: Math.max(0, Math.floor(25 * base * multiplier)) },
      { type: '电压报警', value: Math.max(0, Math.floor(35 * base * multiplier)) }
    ]

    const mockLevel: LevelItem[] = [
      { level: '正常', count: Math.max(0, Math.floor(100 * base * multiplier)) },
      { level: '报警', count: Math.max(0, Math.floor(40 * base * multiplier)) },
      { level: '危险', count: Math.max(0, Math.floor(20 * base * multiplier)) }
    ]

    setAllTrendData(mockTrend)
    setTypeData(mockType)
    setLevelData(mockLevel)
  }, [selectedDevice])

  useEffect(() => {
    generateMockData()
  }, [generateMockData, selectedYear])

  useEffect(() => {
    const [start, end] = selectedRange
    const startMonth = start.month() + 1
    const endMonth = end.month() + 1
    const filtered = allTrendData.filter(
      (item) => item.month >= startMonth && item.month <= endMonth && item.count != null
    )
    setTrendData(filtered)
  }, [allTrendData, selectedRange])

  useEffect(() => {
    const total = trendData.reduce((sum, item) => sum + item.count, 0)
    const currentMonth = dayjs().month() + 1
    const monthly = trendData.find(item => item.month === currentMonth)?.count || 0
    setSummary(prev => ({ ...prev, total, monthly }))
  }, [trendData])

  useEffect(() => {
    const start = dayjs().year(selectedYear).startOf('year')
    const end = dayjs().year(selectedYear).endOf('year')
    setSelectedRange([start, end])
  }, [selectedYear, selectedDevice])

  const exportCSV = () => {
    let csv = '【报警趋势图】\n月份,报警次数\n'
    trendData.forEach((item) => {
      csv += `${item.month}月,${item.count}\n`
    })

    csv += '\n【报警类型分布】\n类型,数量\n'
    typeData.forEach((item) => {
      csv += `${item.type},${item.value}\n`
    })

    csv += '\n【报警等级统计】\n等级,数量\n'
    levelData.forEach((item) => {
      csv += `${item.level},${item.count}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report-${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('报表导出成功')
  }

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 16 }} gutter={16}>
        <Col>
          <Row gutter={16}>
            <Col>
              <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
                {[2025, 2024, 2023].map((year) => (
                  <Option key={year} value={year}>
                    {year}年
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select value={selectedDevice} onChange={setSelectedDevice} style={{ width: 150 }}>
                {devices.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
        <Col>
          <Button icon={<DownloadOutlined />} type="primary" onClick={exportCSV}>
            导出报表
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {[{ title: '总报警次数', value: summary.total }, { title: '本月报警次数', value: summary.monthly }, { title: '当前在线设备', value: summary.onlineDevices }].map((item, index) => (
          <Col span={8} key={index}>
            <Card hoverable bordered={false} style={{ borderRadius: 12, height: 100 }}>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}

        <Col span={24}>
          <Card
            title="报警趋势图"
            extra={
              <RangePicker
                picker="month"
                allowClear={false}
                value={selectedRange}
                onChange={(range) => range && setSelectedRange(range as [Dayjs, Dayjs])}
              />
            }
            style={{ borderRadius: 12 }}
          >
            <Line
              data={trendData}
              xField="month"
              yField="count"
              xAxis={{ label: { formatter: (val: string) => `${val}月` } }}
              point={{ size: 5, shape: 'diamond' }}
              smooth
              height={300}
              animation={true}
              color="#5B8FF9"
              tooltip={{
                fields: ['month', 'count'],
                formatter: (datum:TrendItem) => ({
                  name: '报警次数',
                  value: datum.count
                })
              }}
              area={{
                style: {
                  fill: 'l(90) 0:#5B8FF9 1:#ffffff'
                }
              }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="报警类型分布" style={{ borderRadius: 12 }}>
            <Pie
              data={typeData.filter(item => item.value != null)}
              angleField="value"
              colorField="type"
              radius={0.9}
              innerRadius={0.4}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
                style: { fontWeight: 500 }
              }}
              legend={{ position: 'bottom' }}
              tooltip={{
                fields: ['type', 'value'],
                formatter: (datum: TypeItem) => ({
                  name: datum.type,
                  value: datum.value
                })
              }}
              height={300}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="报警等级统计" style={{ borderRadius: 12 }}>
            <Column
              data={levelData.filter(item => item.count != null)}
              xField="level"
              yField="count"
              color={(item: LevelItem) =>
                item.level === '危险' ? '#ff4d4f' : item.level === '报警' ? '#faad14' : '#52c41a'
              }
              columnStyle={{ radius: [8, 8, 0, 0] }}
              height={300}
              label={{ position: 'middle', style: { fill: '#fff' } }}
              tooltip={{
                fields: ['level', 'count'],
                formatter: (datum: LevelItem) => ({
                  name: datum.level,
                  value: datum.count
                })
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
