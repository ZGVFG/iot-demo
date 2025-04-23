import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const onFinish = (values: { username: string, password: string }) => {
    // 模拟用户数据验证
    if (values.username === 'test' && values.password === 'password') {
      // 登录成功
      message.success('登录成功')
      // 跳转到首页
      navigate('/home/device-status')
    } else {
      // 登录失败
      message.error('用户名或密码错误')
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Card title="登录" style={{ width: 300 }}>
        <Form name="login" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
          <Form.Item>
            <a onClick={() => navigate('/register')}>没有账号？去注册</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
