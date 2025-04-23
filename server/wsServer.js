const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const devices = [
  { id: 'dev-1', type: '潜水贯流泵' },
  { id: 'dev-2', type: '立式混流泵（滚动轴承）' },
  { id: 'dev-3', type: '通风机' },
  { id: 'dev-4', type: '立式混流泵（滑动轴承）' }
];

wss.on('connection', (ws) => {
  console.log('客户端已连接');

  const interval = setInterval(() => {
    devices.forEach(device => {
      const data = {
        deviceId: device.id,
        deviceType: device.type,
        current: Math.floor(Math.random() * 60) + 30,
        voltage: Math.floor(Math.random() * 20) + 360,
        flow: Math.floor(Math.random() * 2000) + 800,
        status: Math.random() > 0.2 ? '运行中' : '已停止' // 多数时间运行中
      };

      ws.send(JSON.stringify(data));
    });
  }, 5000); // ✅ 每5秒所有设备都推送一次

  ws.on('close', () => {
    clearInterval(interval);
    console.log('客户端断开连接');
  });
});

console.log('✅ WebSocket服务运行中：ws://localhost:8080');
