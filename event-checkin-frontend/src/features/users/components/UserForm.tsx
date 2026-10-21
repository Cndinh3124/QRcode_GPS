import { useEffect } from 'react';

import {
  Button,
  Form,
  Input,
  Select,
} from 'antd';

import type {
  CreateUserDto,
  Role,
  UpdateUserDto,
  User,
} from '../types/user.types';

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User;
  roles: Role[];
  loading: boolean;
  onSubmit: (
    values: CreateUserDto | UpdateUserDto,
  ) => Promise<void>;
}

export default function UserForm({
  mode,
  user,
  roles,
  loading,
  onSubmit,
}: UserFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (mode === 'edit' && user) {
      form.setFieldsValue({
        studentCode: user.studentCode,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
      });
    } else {
      form.resetFields();
    }
  }, [form, mode, user]);

  const handleFinish = async (
    values: CreateUserDto | UpdateUserDto,
  ) => {
    const payload = { ...values };

    if (
      mode === 'edit' &&
      !payload.password
    ) {
      delete payload.password;
    }

    await onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item
        label="Mã sinh viên"
        name="studentCode"
        rules={[
          {
            required: true,
            message:
              'Vui lòng nhập mã sinh viên.',
          },
          {
            max: 50,
            message:
              'Ma sinh vien khong duoc vuot qua 50 ky tu.',
          },
        ]}
      >
        <Input maxLength={50} />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="fullName"
        rules={[
          {
            required: true,
            message:
              'Vui lòng nhập họ và tên.',
          },
          {
            max: 100,
            message: 'Ho va ten khong duoc vuot qua 100 ky tu.',
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            type: 'email',
            message:
              'Vui lòng nhập email hợp lệ.',
          },
          {
            max: 100,
            message: 'Email khong duoc vuot qua 100 ky tu.',
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={
          mode === 'create'
            ? [
                {
                  required: true,
                  min: 6,
                  max: 255,
                  message:
                    'Mat khau phai tu 6 den 255 ky tu.',
                },
              ]
            : []
        }
      >
        <Input.Password
          placeholder={
            mode === 'edit'
              ? 'Để trống nếu không muốn đổi mật khẩu'
              : 'Nhập mật khẩu'
          }
        />
      </Form.Item>

      <Form.Item
        label="Vai trò"
        name="role"
        rules={[
          {
            required: true,
            message:
              'Vui lòng chọn vai trò.',
          },
        ]}
      >
        <Select
          placeholder="Chọn vai trò"
          options={roles.map((role) => ({
            label: role.name,
            value: role.name,
          }))}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          disabled={loading}
        >
          {mode === 'create'
            ? 'Tạo người dùng'
            : 'Cập nhật người dùng'}
        </Button>
      </Form.Item>
    </Form>
  );
}