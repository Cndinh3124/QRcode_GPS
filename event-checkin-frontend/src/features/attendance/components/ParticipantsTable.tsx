import {
  Table,
  Tag,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import type { Attendance } from '../types/attendance.types';

import { formatDate } from '../../../utils/date';

import {
  ATTENDANCE_STATUS,
} from '../constants/attendanceStatus';

interface ParticipantsTableProps {
  data: Attendance[];
  loading: boolean;
}

function getStatusConfig(
  status: string,
) {
  const statusKey =
    status as keyof typeof ATTENDANCE_STATUS;

  return (
    ATTENDANCE_STATUS[statusKey] ?? {
      color: 'default',
      label: status,
    }
  );
}

export default function ParticipantsTable({
  data,
  loading,
}: ParticipantsTableProps) {
  const columns: ColumnsType<Attendance> = [
    {
      title: 'Participant Code',
      dataIndex: 'participantCode',
      key: 'participantCode',
      width: 160,
    },

    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 240,
      render: (
        email: string | undefined,
      ) => email ?? '-',
    },

    {
      title: 'Thời gian điểm danh',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 180,
      render: (value: string) =>
        formatDate(value),
    },

    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      width: 120,
      align: 'center',
      render: (value: number) =>
        `${value.toFixed(2)} m`,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config =
          getStatusConfig(status);

        return (
          <Tag color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <Table<Attendance>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{
        x: 900,
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: [
          '10',
          '20',
          '50',
        ],
        showTotal: (total) =>
          `Tổng cộng ${total} người tham gia`,
      }}
    />
  );
}