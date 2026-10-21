import {
  Table,
  Tag,
  Typography,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import type {
  RecentAttendance,
} from '../../features/dashboard/types/dashboard.types';

const { Text } = Typography;

interface Props {
  data: RecentAttendance[];
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'PRESENT':
      return {
        color: 'success',
        label: 'Present',
      };

    case 'LATE':
      return {
        color: 'warning',
        label: 'Late',
      };

    case 'REJECTED':
      return {
        color: 'error',
        label: 'Rejected',
      };

    default:
      return {
        color: 'default',
        label: status || '-',
      };
  }
}

function formatDateTime(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function RecentAttendanceTable({
  data,
}: Props) {
  const columns: ColumnsType<RecentAttendance> = [
    {
      title: 'Student',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      render: (value: string) => (
        <Text strong>
          {value || '-'}
        </Text>
      ),
    },

    {
      title: 'Student Code',
      dataIndex: 'participantCode',
      key: 'participantCode',
      width: 130,
      render: (value: string) => (
        <Text>
          {value || '-'}
        </Text>
      ),
    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (value?: string) => (
        <Text type="secondary">
          {value || '-'}
        </Text>
      ),
    },

    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      width: 220,
      ellipsis: true,
      render: (value: string) => (
        <Text>
          {value || '-'}
        </Text>
      ),
    },

    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      width: 120,
      align: 'right',
      render: (value: number) => {
        const distance = Number(value);

        if (Number.isNaN(distance)) {
          return '-';
        }

        return (
          <Text>
            {distance.toFixed(2)} m
          </Text>
        );
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (value: string) => {
        const config =
          getStatusConfig(value);

        return (
          <Tag
            color={config.color}
            style={{
              minWidth: 72,
              textAlign: 'center',
              borderRadius: 6,
              marginInlineEnd: 0,
            }}
          >
            {config.label}
          </Tag>
        );
      },
    },

    {
      title: 'Thời gian điểm danh',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 190,
      render: (value: string) => (
        <Text type="secondary">
          {formatDateTime(value)}
        </Text>
      ),
    },
  ];

  return (
    <Table<RecentAttendance>
      rowKey={(_, index) =>
        `${data[index ?? 0]?.participantCode ?? 'attendance'}-${
          data[index ?? 0]?.checkInTime ?? index
        }`
      }
      columns={columns}
      dataSource={data}
      pagination={false}
      size="middle"
      scroll={{
        x: 1150,
      }}
      locale={{
        emptyText:
          'Chưa có lượt điểm danh gần đây',
      }}
      rowClassName={() =>
        'recent-attendance-row'
      }
    />
  );
}