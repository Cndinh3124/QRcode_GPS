import { useState } from 'react';

import {
  Alert,
  Button,
  Card,
  DatePicker,
  message,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';

import {
  DownloadOutlined,
} from '@ant-design/icons';

import type { Dayjs } from 'dayjs';

import ReportSummary from '../components/ReportSummary';
import AttendanceByEvent from '../components/AttendanceByEvent';
import AttendanceByDay from '../components/AttendanceByDay';
import EventDetail from '../components/EventDetail';

import {
  useReportSummary,
  useAttendanceByEvent,
  useAttendanceByDay,
  useEventReport,
} from '../hooks/useReports';

import { useEvents } from '../../events/hooks/useEvents';

import { exportReport } from '../api/reports.api';

const {
  Title,
  Text,
} = Typography;

const {
  RangePicker,
} = DatePicker;

export default function Reports() {
  const summary =
    useReportSummary();

  const attendanceByEvent =
    useAttendanceByEvent();

  const { events } =
    useEvents();

  const [
    dateRange,
    setDateRange,
  ] = useState<
    [Dayjs, Dayjs] | null
  >(null);

  const [
    selectedEventId,
    setSelectedEventId,
  ] = useState<string>();

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const from =
    dateRange?.[0]
      ? dateRange[0].format(
          'YYYY-MM-DD',
        )
      : undefined;

  const to =
    dateRange?.[1]
      ? dateRange[1].format(
          'YYYY-MM-DD',
        )
      : undefined;

  const attendanceByDay =
    useAttendanceByDay(
      from,
      to,
      selectedEventId,
    );

  const eventReport =
    useEventReport(
      selectedEventId,
    );

  async function handleExport() {
    try {
      setExporting(true);

      const blob =
        await exportReport(
          selectedEventId,
          from,
          to,
        );

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        'attendance-report.xlsx';

      document.body.appendChild(
        link,
      );

      link.click();

      document.body.removeChild(
        link,
      );

      window.URL.revokeObjectURL(
        url,
      );

      message.success(
        'Report exported successfully.',
      );
    } catch (error) {
      console.error(
        'Export report failed:',
        error,
      );

      message.error(
        'Unable to export report.',
      );
    } finally {
      setExporting(false);
    }
  }

  if (
    summary.isLoading ||
    attendanceByEvent.isLoading
  ) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          justifyContent:
            'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (
    summary.isError ||
    attendanceByEvent.isError
  ) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load reports"
        description="Please check the backend Reports API."
      />
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <Title
          level={3}
          style={{
            marginBottom: 4,
          }}
        >
          Reports
        </Title>

        <Text type="secondary">
          Attendance and event statistics
        </Text>
      </div>

      {summary.data && (
        <ReportSummary
          data={summary.data}
        />
      )}

      <Card
        title="Report Filters"
        style={{
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Space wrap>
            <Select
              allowClear
              placeholder="Select Event"
              style={{
                width: 280,
              }}
              value={
                selectedEventId
              }
              onChange={
                setSelectedEventId
              }
              loading={
                events.isLoading
              }
              options={
                events.data?.map(
                  (event) => ({
                    label:
                      event.title,
                    value:
                      event.id,
                  }),
                ) ?? []
              }
            />

            <RangePicker
              value={dateRange}
              allowClear
              format="DD/MM/YYYY"
              onChange={(
                values,
              ) => {
                if (
                  values?.[0] &&
                  values?.[1]
                ) {
                  setDateRange([
                    values[0],
                    values[1],
                  ]);
                } else {
                  setDateRange(
                    null,
                  );
                }
              }}
            />
          </Space>

          <Button
            type="primary"
            icon={
              <DownloadOutlined />
            }
            loading={exporting}
            onClick={
              handleExport
            }
          >
            Export Excel
          </Button>
        </div>
      </Card>

      <AttendanceByDay
        data={
          attendanceByDay.data ??
          []
        }
        loading={
          attendanceByDay.isLoading
        }
      />

      <AttendanceByEvent
        data={
          attendanceByEvent.data ??
          []
        }
        loading={
          attendanceByEvent.isFetching
        }
      />

      {selectedEventId && (
        <EventDetail
          data={
            eventReport.data
          }
          loading={
            eventReport.isLoading
          }
        />
      )}
    </div>
  );
}