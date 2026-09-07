import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

import { useAuth } from '../hooks/useAuth';

import type { LoginRequest } from '../types/auth.types';

const { Title } = Typography;

export default function LoginForm() {
  const { login, isLoading } = useAuth();

  const onFinish = (values: LoginRequest) => {
    login(values);
  };

  return (
    <Card
      style={{
        width: 420,
        borderRadius: 12,
      }}
    >
      <Title
        level={3}
        style={{
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        QR Event Check-in
      </Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please enter your email',
            },
            {
              type: 'email',
              message: 'Invalid email',
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="admin@gmail.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please enter your password',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="********"
            size="large"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
        >
          Login
        </Button>
      </Form>
    </Card>
  );
}