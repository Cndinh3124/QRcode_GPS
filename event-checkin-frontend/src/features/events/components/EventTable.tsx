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
  QrcodeOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import type { ColumnsType } from 'antd/es/table';

import dayjs from 'dayjs';

import type { Event } from '../types/events.types';

import {
  STATUS_COLOR,
  STATUS_LABEL,
} from '../constants/eventStatus';

interface EventTableProps {
  data: Event[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onOpenQr: (id: string) => void;
}

export default function EventTable({
  data,
  loading,
  isAdmin,
  onEdit,
  onDelete,
  onOpenQr,
}: EventTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<Event> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },

    {
      title: 'Tên sự kiện',
      key: 'title',
      dataIndex: 'title',
      width: 220,
      ellipsis: true,
    },

    {
      title: 'Địa điểm',
      key: 'locationName',
      dataIndex: 'locationName',
      width: 220,
      ellipsis: true,
    },

    {
      title: 'Bắt đầu',
      key: 'startTime',
      dataIndex: 'startTime',
      width: 170,
      render: (value: string) =>
        dayjs(value).format(
          'DD/MM/YYYY HH:mm',
        ),
    },

    {
      title: 'Kết thúc',
      key: 'endTime',
      dataIndex: 'endTime',
      width: 170,
      render: (value: string) =>
        dayjs(value).format(
          'DD/MM/YYYY HH:mm',
        ),
    },

    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Tag
          color={
            STATUS_COLOR[record.status]
          }
        >
          {STATUS_LABEL[record.status]}
        </Tag>
      ),
    },

    {
      title: 'Thao tác',
      key: 'actions',
      width: 300,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() =>
              onOpenQr(record.id)
            }
          >
            QR
          </Button>

          <Button
            type="link"
            icon={<TeamOutlined />}
            onClick={() =>
              navigate(
                `/events/${record.id}/participants`,
              )
            }
          >
            Người tham gia
          </Button>

          <Button
            type="link"
            icon={<EditOutlined />}
            disabled={!isAdmin}
            onClick={() =>
              onEdit(record)
            }
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa sự kiện"
            description="Bạn có chắc muốn xóa sự kiện này không?"
            okText="Xóa"
            cancelText="Hủy"
            disabled={!isAdmin}
            onConfirm={() =>
              onDelete(record.id)
            }
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!isAdmin}
            >
              Xoa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<Event>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1250 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: [
          '10',
          '20',
          '50',
        ],
        showTotal: (total) =>
          `Tổng cộng ${total} su kien`,
      }}
    />
  );
}
