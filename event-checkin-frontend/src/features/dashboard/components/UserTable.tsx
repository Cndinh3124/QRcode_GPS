import {
  Avatar,
  Button,
  Space,
  Table,
  Tag,
} from 'antd';

import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type { User } from '../types';

interface Props {
  data: User[];
}

export default function UserTable({
  data,
}: Props) {
  const columns = [
    {
      title: 'Avatar',
      key: 'avatar',
      render: () => (
        <Avatar icon={<UserOutlined />} />
      ),
    },

    {
      title: 'Mã sinh viên',
      dataIndex: 'studentCode',
    },

    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
    },

    {
      title: 'Email',
      dataIndex: 'email',
    },

    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role: string) => (
        <Tag
          color={
            role === 'ADMIN'
              ? 'red'
              : 'blue'
          }
        >
          {role}
        </Tag>
      ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'ACTIVE'
              ? 'green'
              : 'default'
          }
        >
          {status}
        </Tag>
      ),
    },

    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
          />

          <Button
            icon={<DeleteOutlined />}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={{
        pageSize: 10,
      }}
    />
  );
}