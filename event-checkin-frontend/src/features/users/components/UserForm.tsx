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
        roleId: user.role.id,
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

    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item
        label="Student Code"
        name="studentCode"
        rules={[
          {
            required: true,
            message:
              'Please enter student code',
          },
          {
            max: 20,
            message:
              'Student code cannot exceed 20 characters',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[
          {
            required: true,
            message:
              'Please enter full name',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            type: 'email',
            message:
              'Please enter a valid email',
          },
        ]}
      >
        <Input />
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
                  message:
                    'Password must be at least 6 characters',
                },
              ]
            : []
        }
      >
        <Input.Password
          placeholder={
            mode === 'edit'
              ? 'Leave blank to keep current password'
              : 'Enter password'
          }
        />
      </Form.Item>

      <Form.Item
        label="Role"
        name="roleId"
        rules={[
          {
            required: true,
            message:
              'Please select a role',
          },
        ]}
      >
        <Select
          placeholder="Select role"
          options={roles.map((role) => ({
            label: role.name,
            value: role.id,
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
            ? 'Create User'
            : 'Update User'}
        </Button>
      </Form.Item>
    </Form>
  );
}