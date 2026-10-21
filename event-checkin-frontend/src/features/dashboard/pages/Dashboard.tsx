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
        message="Không thể tải bảng điều khiển"
        description="Một số dữ liệu chưa tải được. Vui lòng thử lại."
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
          Tổng quan
        </Title>

        <Text
          type="secondary"
          style={{
            fontSize: 15,
          }}
        >
          Tổng quan hệ thống điểm danh sự kiện.
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
            title="Người dùng"
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
            title="Sự kiện"
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
            title="Lượt điểm danh"
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
            title="Điểm danh hôm nay"
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
            title="Có mặt"
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
            title="Đi muộn"
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
            title="Đang mở điểm danh"
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
            title="Đã công bố"
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
            title="Điểm danh theo ngày"
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
            title="Điểm danh theo sự kiện"
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
            title="Điểm danh gần đây"
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