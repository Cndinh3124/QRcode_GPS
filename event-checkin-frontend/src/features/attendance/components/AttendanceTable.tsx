import {
  Descriptions,
  Drawer,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';

import type { ColumnsType } from 'antd/es/table';

import {
  useState,
} from 'react';

import type { Attendance } from '../types/attendance.types';

import { formatDate } from '../../../utils/date';

import {
  ATTENDANCE_STATUS,
} from '../constants/attendanceStatus';

const { Text, Title } =
  Typography;

interface AttendanceTableProps {
  data: Attendance[];

  loading?: boolean;

  currentPage: number;

  pageSize: number;

  total: number;

  onPageChange: (
    page: number,
    pageSize: number,
  ) => void;
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

export default function AttendanceTable({
  data,
  loading = false,
  currentPage,
  pageSize,
  total,
  onPageChange,
}: AttendanceTableProps) {
  const [
    selectedAttendance,
    setSelectedAttendance,
  ] =
    useState<Attendance | null>(
      null,
    );

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  // =========================================================
  // OPEN DETAIL
  // =========================================================

  const handleRowClick = (
    record: Attendance,
  ) => {
    setSelectedAttendance(
      record,
    );

    setDrawerOpen(true);
  };

  // =========================================================
  // CLOSE DETAIL
  // =========================================================

  const handleCloseDrawer =
    () => {
      setDrawerOpen(false);
    };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns: ColumnsType<Attendance> =
    [
      {
        title:
          'Participant Code',
        dataIndex:
          'participantCode',
        key:
          'participantCode',
        width: 150,
      },

      {
        title: 'Full Name',
        dataIndex:
          'fullName',
        key:
          'fullName',
      },

      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',

        render: (
          email:
            | string
            | undefined,
        ) =>
          email ?? '-',
      },

      {
        title: 'Event',
        key: 'event',

        render: (
          _,
          record,
        ) =>
          record.event?.title ??
          '-',
      },

      {
        title:
          'Check-in Time',
        dataIndex:
          'checkInTime',
        key:
          'checkInTime',

        render: (
          value: string,
        ) =>
          formatDate(value),
      },

      {
        title: 'Distance',
        dataIndex:
          'distance',
        key:
          'distance',
        align: 'center',

        render: (
          value:
            | number
            | string,
        ) => {
          const distance =
            Number(value);

          if (
            !Number.isFinite(
              distance,
            )
          ) {
            return '-';
          }

          return `${distance.toFixed(
            2,
          )} m`;
        },
      },

      {
        title: 'Status',
        dataIndex:
          'status',
        key:
          'status',
        align: 'center',

        render: (
          status: string,
        ) => {
          const config =
            getStatusConfig(
              status,
            );

          return (
            <Tag
              color={
                config.color
              }
            >
              {
                config.label
              }
            </Tag>
          );
        },
      },
    ];

  // =========================================================
  // STATUS FOR DETAIL
  // =========================================================

  const selectedStatus =
    selectedAttendance
      ? getStatusConfig(
          selectedAttendance.status,
        )
      : null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Table<Attendance>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}

        onRow={(
          record,
        ) => ({
          onClick: () =>
            handleRowClick(
              record,
            ),

          style: {
            cursor: 'pointer',
          },
        })}

        pagination={{
          current:
            currentPage,

          pageSize,

          total,

          showSizeChanger:
            true,

          pageSizeOptions: [
            '10',
            '20',
            '50',
          ],

          showTotal: (
            total,
            range,
          ) =>
            `${range[0]}-${range[1]} of ${total} records`,

          onChange: (
            page,
            newPageSize,
          ) => {
            onPageChange(
              page,
              newPageSize,
            );
          },
        }}
      />

      {/* =====================================================
          ATTENDANCE DETAIL DRAWER
      ===================================================== */}

      <Drawer
        title="Attendance Detail"
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={
          handleCloseDrawer
        }
      >
        {selectedAttendance && (
          <Space
            direction="vertical"
            size="large"
            style={{
              width: '100%',
            }}
          >
            {/* =================================================
                PARTICIPANT
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                Participant
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Participant Code"
                >
                  {
                    selectedAttendance.participantCode
                  }
                </Descriptions.Item>

                <Descriptions.Item
                  label="Full Name"
                >
                  {
                    selectedAttendance.fullName
                  }
                </Descriptions.Item>

                <Descriptions.Item
                  label="Email"
                >
                  {
                    selectedAttendance.email ??
                    '-'
                  }
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* =================================================
                EVENT
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                Event
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Event"
                >
                  {
                    selectedAttendance
                      .event
                      ?.title ??
                    '-'
                  }
                </Descriptions.Item>

                <Descriptions.Item
                  label="Location"
                >
                  {
                    selectedAttendance
                      .event
                      ?.locationName ??
                    '-'
                  }
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* =================================================
                CHECK-IN
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                Check-in
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Status"
                >
                  {selectedStatus && (
                    <Tag
                      color={
                        selectedStatus.color
                      }
                    >
                      {
                        selectedStatus.label
                      }
                    </Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Check-in Time"
                >
                  {formatDate(
                    selectedAttendance.checkInTime,
                  )}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Distance"
                >
                  {Number(
                    selectedAttendance.distance,
                  ).toFixed(2)}{' '}
                  m
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* =================================================
                GPS
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                GPS Information
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Latitude"
                >
                  {Number(
                    selectedAttendance.latitude,
                  ).toFixed(7)}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Longitude"
                >
                  {Number(
                    selectedAttendance.longitude,
                  ).toFixed(7)}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Distance"
                >
                  {Number(
                    selectedAttendance.distance,
                  ).toFixed(2)}{' '}
                  m
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* =================================================
                DEVICE
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                Device Information
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Device"
                >
                  {
                    selectedAttendance.device ??
                    '-'
                  }
                </Descriptions.Item>

                <Descriptions.Item
                  label="IP Address"
                >
                  {
                    selectedAttendance.ipAddress ??
                    '-'
                  }
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* =================================================
                RECORD
            ================================================= */}

            <div>
              <Title
                level={5}
                style={{
                  marginTop: 0,
                }}
              >
                Record Information
              </Title>

              <Descriptions
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item
                  label="Attendance ID"
                >
                  <Text copyable>
                    {
                      selectedAttendance.id
                    }
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label="Created At"
                >
                  {
                    selectedAttendance.createdAt
                      ? formatDate(
                          selectedAttendance.createdAt,
                        )
                      : '-'
                  }
                </Descriptions.Item>

                <Descriptions.Item
                  label="Updated At"
                >
                  {
                    selectedAttendance.updatedAt
                      ? formatDate(
                          selectedAttendance.updatedAt,
                        )
                      : '-'
                  }
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Space>
        )}
      </Drawer>
    </>
  );
}