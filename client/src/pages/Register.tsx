import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()

  const onFinish = (values: { username: string, password: string, confirm: string }) => {
    // 简单模拟注册
    if (values.password !== values.confirm) {
      message.error('密码不一致')
      return
    }

    // 模拟注册成功
    message.success('注册成功')
    // 跳转到登录页面
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Card title="注册" style={{ width: 300 }}>
        <Form name="register" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item name="confirm" dependencies={['password']} rules={[
            {
              required: true,
              message: '请确认密码',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入密码不一致'))
              },
            }),
          ]}>
            <Input.Password placeholder="确认密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
          </Form.Item>
          <Form.Item>
            <a onClick={() => navigate('/login')}>已有账号？去登录</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
