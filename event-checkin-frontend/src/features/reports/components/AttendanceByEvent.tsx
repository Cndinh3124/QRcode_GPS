import {
  Card,
  Table,
  Tag,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import dayjs from 'dayjs';

import type {
  AttendanceByEvent as AttendanceByEventType,
} from '../types/reports.types';

interface Props {
  data: AttendanceByEventType[];
  loading?: boolean;
}

export default function AttendanceByEvent({
  data,
  loading = false,
}: Props) {
  const columns: ColumnsType<AttendanceByEventType> = [
    {
      title: 'Event',
      dataIndex: 'eventTitle',
      key: 'eventTitle',
      ellipsis: true,
    },

    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 170,
      render: (value: string) =>
        dayjs(value).format(
          'DD/MM/YYYY HH:mm',
        ),
    },

    {
      title: 'Tổng lượt',
      dataIndex: 'totalAttendance',
      key: 'totalAttendance',
      width: 90,
      align: 'center',
    },

    {
      title: 'Có mặt',
      dataIndex: 'present',
      key: 'present',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <Tag color="green">
          {value}
        </Tag>
      ),
    },

    {
      title: 'Đi muộn',
      dataIndex: 'late',
      key: 'late',
      width: 90,
      align: 'center',
      render: (value: number) => (
        <Tag color="orange">
          {value}
        </Tag>
      ),
    },

    {
      title: 'Bị từ chối',
      dataIndex: 'rejected',
      key: 'rejected',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <Tag color="red">
          {value}
        </Tag>
      ),
    },

    {
      title: 'Tỷ lệ điểm danh',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 150,
      align: 'center',
      render: (value: number) => (
        <Tag
          color={
            value >= 80
              ? 'green'
              : value >= 50
                ? 'orange'
                : 'red'
          }
        >
          {value.toFixed(2)}%
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title="Điểm danh theo sự kiện"
      style={{
        marginTop: 20,
      }}
    >
      <Table<AttendanceByEventType>
        rowKey="eventId"
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
            `Tổng cộng ${total} sự kiện`,
        }}
      />
    </Card>
  );
}