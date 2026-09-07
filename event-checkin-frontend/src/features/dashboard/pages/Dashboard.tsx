import {
  Row,
  Col,
  Card,
  Spin,
  Alert,
  Typography,
} from 'antd';

import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import StatisticCard from '../../../components/dashboard/StatisticCard';

import CheckInByDayChart from '../../../components/charts/CheckInByDayChart';

import CheckInByEventChart from '../../../components/charts/CheckInByEventChart';

import RecentAttendanceTable from '../../../components/tables/RecentAttendanceTable';

import { useDashboard } from '../hooks/useDashboard';

const { Title, Text } = Typography;

export default function Dashboard() {
  const {
    summary,
    byDay,
    byEvent,
    recentAttendance,
  } = useDashboard();

  const isLoading =
    summary.isLoading ||
    byDay.isLoading ||
    byEvent.isLoading ||
    recentAttendance.isLoading;

  const hasError =
    summary.isError ||
    byDay.isError ||
    byEvent.isError ||
    recentAttendance.isError;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load dashboard"
        description="Some dashboard data could not be loaded. Please try again."
      />
    );
  }

  const data = summary.data;

  return (
    <div>
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div
        style={{
          marginBottom: 28,
        }}
      >
        <Title
          level={2}
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Dashboard
        </Title>

        <Text
          type="secondary"
          style={{
            fontSize: 15,
          }}
        >
          Overview of your event check-in
          system.
        </Text>
      </div>

      {/* ======================================
          SYSTEM OVERVIEW
      ====================================== */}

      <Row gutter={[20, 20]}>
        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Users"
            value={
              data?.totalUsers ?? 0
            }
            icon={<UserOutlined />}
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Events"
            value={
              data?.totalEvents ?? 0
            }
            icon={<CalendarOutlined />}
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Attendance"
            value={
              data?.totalAttendance ?? 0
            }
            icon={
              <CheckCircleOutlined />
            }
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Today Check-in"
            value={
              data?.todayAttendance ?? 0
            }
            icon={
              <ClockCircleOutlined />
            }
          />
        </Col>
      </Row>

      {/* ======================================
          ATTENDANCE STATUS
      ====================================== */}

      <Row
        gutter={[20, 20]}
        style={{
          marginTop: 20,
        }}
      >
        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Present"
            value={
              data?.presentCount ?? 0
            }
            icon={
              <CheckCircleOutlined />
            }
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Late"
            value={
              data?.lateCount ?? 0
            }
            icon={<WarningOutlined />}
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Checking In"
            value={
              data?.checkingInEvents ?? 0
            }
            icon={
              <PlayCircleOutlined />
            }
          />
        </Col>

        <Col
          xs={24}
          sm={12}
          xl={6}
        >
          <StatisticCard
            title="Published"
            value={
              data?.publishedEvents ?? 0
            }
            icon={
              <FileDoneOutlined />
            }
          />
        </Col>
      </Row>

      {/* ======================================
          ANALYTICS
      ====================================== */}

      <Row
        gutter={[20, 20]}
        style={{
          marginTop: 28,
        }}
      >
        <Col
          xs={24}
          xl={12}
        >
          <Card
            title="Check-in by Day"
            styles={{
              body: {
                padding: '20px 16px',
              },
            }}
          >
            <CheckInByDayChart
              data={
                byDay.data ?? []
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          xl={12}
        >
          <Card
            title="Check-in by Event"
            styles={{
              body: {
                padding: '20px 16px',
              },
            }}
          >
            <CheckInByEventChart
              data={
                byEvent.data ?? []
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ======================================
          RECENT ATTENDANCE
      ====================================== */}

      <Row
        style={{
          marginTop: 28,
        }}
      >
        <Col span={24}>
          <Card
            title="Recent Attendance"
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            <RecentAttendanceTable
              data={
                recentAttendance.data ??
                []
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}