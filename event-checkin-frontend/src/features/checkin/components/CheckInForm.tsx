import {
  Button,
  Form,
  Input,
} from 'antd';

export interface CheckInFormValues {
  participantCode: string;

  fullName: string;

  email?: string;
}

interface CheckInFormProps {
  loading: boolean;

  onSubmit: (
    values: CheckInFormValues,
  ) => void | boolean | Promise<void | boolean>;
}

export default function CheckInForm({
  loading,
  onSubmit,
}: CheckInFormProps) {
  const [form] =
    Form.useForm<CheckInFormValues>();

  async function handleFinish(
    values: CheckInFormValues,
  ) {
    const success = await onSubmit(values);

    if (success !== false) {
      form.resetFields();
    }
  }

  return (
    <Form<CheckInFormValues>
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
    >
      <Form.Item
        label="Participant Code"
        name="participantCode"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Please enter participant code.',
          },
          {
            max: 50,
            message:
              'Participant code cannot exceed 50 characters.',
          },
        ]}
      >
        <Input
          placeholder="Enter participant code"
          maxLength={50}
          autoComplete="off"
        />
      </Form.Item>

      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Please enter full name.',
          },
          {
            max: 100,
            message:
              'Full name cannot exceed 100 characters.',
          },
        ]}
      >
        <Input
          placeholder="Enter full name"
          maxLength={100}
          autoComplete="name"
        />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            type: 'email',
            message:
              'Please enter a valid email address.',
          },
          {
            max: 100,
            message:
              'Email cannot exceed 100 characters.',
          },
        ]}
      >
        <Input
          placeholder="Enter email (optional)"
          maxLength={100}
          autoComplete="email"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={loading}
        size="large"
      >
        Check In
      </Button>
    </Form>
  );
}