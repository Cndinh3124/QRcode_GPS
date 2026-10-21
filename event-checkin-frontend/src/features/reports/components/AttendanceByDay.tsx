import {
  Card,
  Empty,
} from 'antd';

import dayjs from 'dayjs';

import type {
  AttendanceByDay as AttendanceByDayType,
} from '../types/reports.types';

interface Props {
  data: AttendanceByDayType[];
  loading?: boolean;
}

export default function AttendanceByDay({
  data,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <Card
        title="Điểm danh theo ngày"
        style={{
          marginTop: 20,
        }}
        loading
      />
    );
  }

  if (!data.length) {
    return (
      <Card
        title="Điểm danh theo ngày"
        style={{
          marginTop: 20,
        }}
      >
        <Empty description="Chưa có dữ liệu điểm danh" />
      </Card>
    );
  }

  const maxValue = Math.max(
    ...data.map(
      (item) => item.totalAttendance,
    ),
    1,
  );

  return (
    <Card
      title="Điểm danh theo ngày"
      style={{
        marginTop: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
          minHeight: 280,
          overflowX: 'auto',
          padding: '20px 10px 10px',
        }}
      >
        {data.map((item) => {
          const height =
            (item.totalAttendance /
              maxValue) *
            200;

          return (
            <div
              key={item.date}
              style={{
                minWidth: 70,
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent:
                  'flex-end',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {item.totalAttendance}
              </div>

              <div
                title={`${item.totalAttendance} lượt điểm danh`}
                style={{
                  width: 42,
                  height: Math.max(
                    height,
                    4,
                  ),
                  borderRadius:
                    '6px 6px 0 0',
                  background:
                    '#1677ff',
                  transition:
                    'height 0.3s',
                }}
              />

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: '#666',
                  whiteSpace:
                    'nowrap',
                }}
              >
                {dayjs(
                  item.date,
                ).format(
                  'DD/MM',
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}