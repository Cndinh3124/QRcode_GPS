import {
  Card,
  Col,
  Row,
  Statistic,
} from 'antd';

import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import type {
  ReportSummary as ReportSummaryType,
} from '../types/reports.types';

interface Props {
  data: ReportSummaryType;
}

export default function ReportSummary({
  data,
}: Props) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Người dùng"
            value={data.totalUsers}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Sự kiện"
            value={data.totalEvents}
            prefix={<CalendarOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Tổng lượt điểm danh"
            value={data.totalAttendance}
            prefix={
              <CheckCircleOutlined />
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Có mặt"
            value={
              data.attendanceByStatus
                .present
            }
            prefix={
              <CheckCircleOutlined />
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Đi muộn"
            value={
              data.attendanceByStatus
                .late
            }
            prefix={
              <ClockCircleOutlined />
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Bị từ chối"
            value={
              data.attendanceByStatus
                .rejected
            }
            prefix={
              <CloseCircleOutlined />
            }
          />
        </Card>
      </Col>
    </Row>
  );
}