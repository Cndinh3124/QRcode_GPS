import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

import { useAuth } from '../hooks/useAuth';

import type { Đăng nhậpRequest } from '../types/auth.types';

const { Title } = Typography;

export default function Đăng nhậpForm() {
  const { login, isLoading } = useAuth();

  const onFinish = (values: Đăng nhậpRequest) => {
    login(values);
  };

  return (
    <Card
      style={{
        width: 'min(420px, calc(100vw - 32px))',
        borderRadius: 20,
        boxShadow: '0 18px 54px rgba(28, 78, 130, 0.12)',
      }}
    >
      <Title
        level={3}
        style={{
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        QR Sự kiện Check-in
      </Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập email.',
            },
            {
              type: 'email',
              message: 'Email không hợp lệ.',
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
          label="Mật khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu.',
            },
          ]}
        >
          <Input.Mật khẩu
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
          Đăng nhập
        </Button>
      </Form>
    </Card>
  );
}