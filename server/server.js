const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8090 })

console.log('🌐 WebSocket 服务启动：ws://localhost:8090')

const deviceKeys = ['motor-rear', 'motor-front', 'bearing-front', 'bearing-rear']

const devices = [
  { id: 'dev-1', type: '潜水贯流泵', station: 'station-1' },
  { id: 'dev-2', type: '立式混流泵（滚动轴承）', station: 'station-1' },
  { id: 'dev-3', type: '通风机', station: 'station-1' },
  { id: 'dev-4', type: '立式混流泵（滑动轴承）', station: 'station-1' },
  { id: 'dev-5', type: '潜水贯流泵', station: 'station-2' },
  { id: 'dev-6', type: '立式混流泵（滚动轴承）', station: 'station-2' },
  { id: 'dev-7', type: '通风机', station: 'station-2' },
  { id: 'dev-8', type: '立式混流泵（滑动轴承）', station: 'station-2' }
]

// ⏱ 工具函数
const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// 🧠 报警判断逻辑
function generateAlertData() {
  const alertSources = [
    {
      deviceName: '通风机1',
      component: '电机前端',
      signalType: '电流',
      unit: 'A',
      value: getRandomValue(20, 80)
    },
    {
      deviceName: '潜水泵2',
      component: '轴承箱后端',
      signalType: '温度',
      unit: '°C',
      value: getRandomValue(40, 120)
    },
    {
      deviceName: '混流泵3',
      component: '电机后端',
      signalType: '电压',
      unit: 'V',
      value: getRandomValue(300, 450)
    }
  ]

  return alertSources.map((item) => {
    let alertLevel = 'normal'
    if (
      (item.signalType === '电流' && item.value > 60) ||
      (item.signalType === '温度' && item.value > 90) ||
      (item.signalType === '电压' && (item.value > 420 || item.value < 340))
    ) {
      alertLevel = item.value > 100 ? 'danger' : 'warning'
    }

    return {
      ...item,
      alertLevel,
      time: new Date().toISOString() // 已经是 ISO 格式，其实可以保留
    }
  })
}

wss.on('connection', (ws) => {
  console.log('💡 有客户端连接')

  const interval = setInterval(() => {
    // 🚰 推送：设备状态 & 总览
    devices.forEach(device => {
      const data = {
        type: 'deviceStatus',
        payload: {
          deviceId: device.id,
          deviceType: device.type,
          station: device.station,
          current: getRandomValue(30, 90),
          voltage: getRandomValue(360, 380),
          flow: getRandomValue(800, 2800),
          status: Math.random() > 0.2 ? '运行中' : '已停止'
        }
      }
      ws.send(JSON.stringify(data))
    })

    // ⚙️ 推送：机组监测趋势
    const key = deviceKeys[Math.floor(Math.random() * deviceKeys.length)]
    const metricType = ['temperature', 'voltage', 'current'][Math.floor(Math.random() * 3)]
    const machineTrend = {
      type: 'machineTrend',
      payload: {
        deviceKey: key,
        metric: metricType,
        value: getRandomValue(20, 80)
      }
    }
    ws.send(JSON.stringify(machineTrend))

    // 🚨 推送：智能报警
    const alertData = {
      type: 'alert',
      payload: generateAlertData()
    }
    ws.send(JSON.stringify(alertData))

  }, 5000)

  ws.on('close', () => {
    console.log('❌ 客户端断开')
    clearInterval(interval)
  })
})
