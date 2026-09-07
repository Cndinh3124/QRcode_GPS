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
        {/* Current Password */}

        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[
            {
              required: true,
              message:
                'Please enter your current password.',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </Form.Item>

        {/* New Password */}

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            {
              required: true,
              message:
                'Please enter your new password.',
            },
            {
              min: 6,
              message:
                'Password must be at least 6 characters.',
            },
            {
              max: 100,
              message:
                'Password cannot exceed 100 characters.',
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </Form.Item>

        {/* Confirm Password */}

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            {
              required: true,
              message:
                'Please confirm your new password.',
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
                    'The two passwords do not match.',
                  ),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
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