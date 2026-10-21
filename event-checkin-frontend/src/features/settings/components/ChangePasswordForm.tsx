import {
  Button,
  Card,
  Form,
  Input,
  Typography,
} from 'antd';

import {
  LockOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  loading?: boolean;
  onSubmit: (
    values: ChangePasswordFormValues,
  ) => void | Promise<boolean>;
}

export default function ChangePasswordForm({
  loading = false,
  onSubmit,
}: ChangePasswordFormProps) {
  const [form] =
    Form.useForm<ChangePasswordFormValues>();

  async function handleFinish(
    values: ChangePasswordFormValues,
  ) {
    const success =
      await onSubmit(values);

    if (success) {
      form.resetFields();
    }
  }

  return (
    <Card>
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={4}
          style={{
            marginBottom: 4,
          }}
        >
          Change Password
        </Title>

        <Text type="secondary">
          Update your account password
          to keep your account secure.
        </Text>
      </div>

      <Form<ChangePasswordFormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={loading}
        autoComplete="off"
      >
        {/* Mật khẩu hiện tại */}

        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            {
              required: true,
              message:
                'Vui lòng nhập mật khẩu hiện tại.',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
          />
        </Form.Item>

        {/* Mật khẩu mới */}

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            {
              required: true,
              message:
                'Vui lòng nhập mật khẩu mới.',
            },
            {
              min: 6,
              message:
                'Mật khẩu phải có ít nhất 6 ký tự.',
            },
            {
              max: 100,
              message:
                'Mật khẩu không được vượt quá 100 ký tự.',
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
          />
        </Form.Item>

        {/* Confirm Password */}

        <Form.Item
          label="Confirm Mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            {
              required: true,
              message:
                'Vui lòng xác nhận mật khẩu mới.',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  getFieldValue(
                    'newPassword',
                  ) === value
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error(
                    'Hai mật khẩu không khớp.',
                  ),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu mới"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          style={{
            marginBottom: 0,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LockOutlined />}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}