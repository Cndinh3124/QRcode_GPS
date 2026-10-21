import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import BrandLogo from '../../../components/brand/BrandLogo';
import { BRAND } from '../../../constants/brand';

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
        width: 'min(420px, calc(100vw - 32px))',
        borderRadius: 20,
        boxShadow: '0 18px 54px rgba(28, 78, 130, 0.12)',
      }}
    >
      <div className="login-brand">
        <BrandLogo size={64} className="login-brand-logo" />
        <Title level={2} className="login-brand-title">
          {BRAND.name}
        </Title>
        <div className="login-brand-description">{BRAND.description}</div>
        <div className="login-brand-caption">Đăng nhập để tiếp tục</div>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email quản trị"
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
          Đăng nhập
        </Button>
      </Form>
    </Card>
  );
}