import {
  Button,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';

import type { User } from '../types/user.types';

interface UserTableProps {
  data: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({
  data,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  const columns: ColumnsType<User> = [
    {
      title: 'No.',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Student Code',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 150,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 220,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Role',
      key: 'role',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">
          {record.role.name}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag
          color={
            record.isActive
              ? 'green'
              : 'red'
          }
        >
          {record.isActive
            ? 'ACTIVE'
            : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            okText="Yes"
            cancelText="No"
            onConfirm={() =>
              onDelete(record.id)
            }
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<User>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) =>
          `Total ${total} users`,
      }}
    />
  );
}