const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8081 })

console.log('机组监测 WebSocket 服务已启动，监听端口 8081')

const deviceKeys = ['motor-rear', 'motor-front', 'bearing-front', 'bearing-rear']

wss.on('connection', (ws) => {
  console.log('有客户端连接到机组监测 WebSocket')

  const interval = setInterval(() => {
    const deviceKey = deviceKeys[Math.floor(Math.random() * deviceKeys.length)]
    const value = Math.floor(Math.random() * 80) + 20 // 假设温度

    ws.send(JSON.stringify({
      deviceKey,
      value
    }))
  }, 5000)

  ws.on('close', () => {
    console.log('机组监测客户端断开连接')
    clearInterval(interval)
  })
})
