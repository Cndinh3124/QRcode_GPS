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
  onDelete: (id: string) => void;
}

export default function UserTable({
  data,
  loading,
  onEdit,
  onDelete,
}: UserTableProps) {
  const columns: ColumnsType<User> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã sinh viên',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 150,
    },
    {
      title: 'Họ và tên',
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
      title: 'Vai trò',
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
      title: 'Trạng thái',
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
            ? 'Đang hoạt động'
            : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
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
            Sửa
          </Button>

          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc muốn xóa người dùng này không?"
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() =>
              onDelete(record.id)
            }
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
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
          `Tổng cộng ${total} người dùng`,
      }}
    />
  );
}