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
      title: 'No.',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },

    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      width: 220,
      ellipsis: true,
    },

    {
      title: 'Location',
      key: 'locationName',
      dataIndex: 'locationName',
      width: 220,
      ellipsis: true,
    },

    {
      title: 'Start Time',
      key: 'startTime',
      dataIndex: 'startTime',
      width: 170,
      render: (value: string) =>
        dayjs(value).format(
          'DD/MM/YYYY HH:mm',
        ),
    },

    {
      title: 'End Time',
      key: 'endTime',
      dataIndex: 'endTime',
      width: 170,
      render: (value: string) =>
        dayjs(value).format(
          'DD/MM/YYYY HH:mm',
        ),
    },

    {
      title: 'Status',
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
      title: 'Actions',
      key: 'actions',
      width: 300,
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
            Participants
          </Button>

          <Button
            type="link"
            icon={<EditOutlined />}
            disabled={!isAdmin}
            onClick={() =>
              onEdit(record)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete Event"
            description="Are you sure you want to delete this event?"
            okText="Delete"
            cancelText="Cancel"
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
              Delete
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
          `Total ${total} events`,
      }}
    />
  );
}