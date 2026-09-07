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
            title="Users"
            value={data.totalUsers}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Events"
            value={data.totalEvents}
            prefix={<CalendarOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Total Check-ins"
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
            title="Present"
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
            title="Late"
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
            title="Rejected"
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