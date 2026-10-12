import {
  Button,
  Form,
  Input,
} from 'antd';
import {
  IdcardOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';

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
  const [form] = Form.useForm<CheckInFormValues>();

  async function handleFinish(values: CheckInFormValues) {
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
      requiredMark="optional"
      className="soft-tech-enter"
    >
      <Form.Item
        label="MSSV / Mã nhân viên / Mã đăng ký"
        name="participantCode"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'Vui lòng nhập mã tham gia của bạn.',
          },
          {
            max: 50,
            message: 'Mã tham gia không được vượt quá 50 ký tự.',
          },
        ]}
      >
        <Input
          prefix={<IdcardOutlined style={{ color: '#079AC7' }} />}
          placeholder="Ví dụ: SV001234"
          maxLength={50}
          autoComplete="off"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="fullName"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'Vui lòng nhập họ và tên.',
          },
          {
            max: 100,
            message: 'Họ và tên không được vượt quá 100 ký tự.',
          },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#079AC7' }} />}
          placeholder="Nhập đầy đủ họ và tên"
          maxLength={100}
          autoComplete="name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            type: 'email',
            message: 'Vui lòng nhập địa chỉ email hợp lệ.',
          },
          {
            max: 100,
            message: 'Email không được vượt quá 100 ký tự.',
          },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: '#079AC7' }} />}
          placeholder="Email (không bắt buộc)"
          maxLength={100}
          autoComplete="email"
          size="large"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={loading}
        size="large"
      >
        {loading ? 'Đang xác minh...' : 'Tiếp tục check-in'}
      </Button>
    </Form>
  );
}