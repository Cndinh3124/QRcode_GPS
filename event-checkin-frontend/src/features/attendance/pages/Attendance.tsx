import { useState } from 'react';

import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Typography,
} from 'antd';

import {
  ReloadOutlined,
} from '@ant-design/icons';

import { useEvents } from '../../events/hooks/useEvents';

import { useAttendance } from '../hooks/useAttendance';

import AttendanceTable from '../components/AttendanceTable';

import {
  ATTENDANCE_STATUS,
} from '../constants/attendanceStatus';

const { Title } = Typography;

export default function Attendance() {
  const [search, setSearch] =
    useState('');

  const [eventId, setEventId] =
    useState<string>();

  const [status, setStatus] =
    useState<string>();

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(10);

  const { events } = useEvents();

  const attendance =
    useAttendance({
      page,
      limit,
      search: search || undefined,
      eventId,
      status,
    });

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  const statusOptions =
    Object.entries(
      ATTENDANCE_STATUS,
    ).map(
      ([value, config]) => ({
        label: config.label,
        value,
      }),
    );

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (
    value: string,
  ) => {
    setSearch(value.trim());

    // Reset về trang đầu
    // khi thay đổi search
    setPage(1);
  };

  // =========================================================
  // EVENT FILTER
  // =========================================================

  const handleEventChange = (
    value: string | undefined,
  ) => {
    setEventId(value);

    // Reset về trang đầu
    // khi thay đổi event
    setPage(1);
  };

  // =========================================================
  // STATUS FILTER
  // =========================================================

  const handleStatusChange = (
    value: string | undefined,
  ) => {
    setStatus(value);

    // Reset về trang đầu
    // khi thay đổi status
    setPage(1);
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const handlePageChange = (
    newPage: number,
    newPageSize: number,
  ) => {
    // Nếu thay đổi page size
    // thì quay về trang 1
    if (
      newPageSize !== limit
    ) {
      setLimit(newPageSize);
      setPage(1);

      return;
    }

    setPage(newPage);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Card>
      <Title
        level={3}
        style={{
          marginBottom: 20,
        }}
      >
        Attendance Management
      </Title>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Space
        wrap
        style={{
          marginBottom: 20,
        }}
      >
        {/* Search */}

        <Input.Search
          placeholder="Search participant..."
          allowClear
          style={{
            width: 250,
          }}
          onSearch={
            handleSearch
          }
        />

        {/* Event */}

        <Select
          allowClear
          placeholder="Event"
          style={{
            width: 220,
          }}
          value={eventId}
          onChange={
            handleEventChange
          }
          loading={
            events.isLoading
          }
          options={
            events.data?.map(
              (event) => ({
                label: event.title,
                value: event.id,
              }),
            ) ?? []
          }
        />

        {/* Status */}

        <Select
          allowClear
          placeholder="Status"
          style={{
            width: 180,
          }}
          value={status}
          onChange={
            handleStatusChange
          }
          options={
            statusOptions
          }
        />

        {/* Refresh */}

        <Button
          icon={
            <ReloadOutlined />
          }
          onClick={() =>
            attendance.refetch()
          }
          loading={
            attendance.isFetching
          }
        >
          Refresh
        </Button>
      </Space>

      {/* =====================================================
          ATTENDANCE TABLE
      ===================================================== */}

      {attendance.isError ? (
        <Empty
          description="Unable to load attendance data"
        />
      ) : (
        <AttendanceTable
          data={
            attendance.data
              ?.items ?? []
          }
          loading={
            attendance.isLoading ||
            attendance.isFetching
          }
          currentPage={
            page
          }
          pageSize={
            limit
          }
          total={
            attendance.data
              ?.total ?? 0
          }
          onPageChange={
            handlePageChange
          }
        />
      )}

      {/* =====================================================
          TOTAL
      ===================================================== */}

      {!attendance.isError &&
        attendance.data && (
          <div
            style={{
              display: 'flex',
              justifyContent:
                'flex-end',
              marginTop: 16,
            }}
          >
            <Typography.Text
              type="secondary"
            >
              Total:{' '}
              {
                attendance.data
                  .total
              }{' '}
              records
            </Typography.Text>
          </div>
        )}
    </Card>
  );
}