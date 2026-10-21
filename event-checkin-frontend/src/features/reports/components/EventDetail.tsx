import {
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Tag,
  Typography,
} from 'antd';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';

import type {
  EventReport,
} from '../types/reports.types';

const {
  Title,
  Text,
} = Typography;

interface Props {
  data?: EventReport;
  loading?: boolean;
}

export default function EventDetail({
  data,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <Card
        style={{
          marginTop: 20,
        }}
        loading
      />
    );
  }

  if (!data) {
    return (
      <Card
        style={{
          marginTop: 20,
        }}
      >
        <Empty description="No event selected" />
      </Card>
    );
  }

  const {
    event,
    totalAttendance,
    attendanceByStatus,
  } = data;

  const present =
    attendanceByStatus.present;

  const attendanceRate =
    totalAttendance > 0
      ? (present /
          totalAttendance) *
        100
      : 0;

  return (
    <Card
      title="Event Detail"
      style={{
        marginTop: 20,
      }}
    >
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <Title
          level={4}
          style={{
            marginBottom: 8,
          }}
        >
          {event.title}
        </Title>

        {event.description && (
          <Text type="secondary">
            {event.description}
          </Text>
        )}
      </div>

      <Row
        gutter={[
          16,
          16,
        ]}
      >
        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Tổng lượt điểm danh"
              value={
                totalAttendance
              }
              prefix={
                <UserOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Present"
              value={present}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Late"
              value={
                attendanceByStatus.late
              }
              prefix={
                <ClockCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Rejected"
              value={
                attendanceByStatus.rejected
              }
              prefix={
                <CloseCircleOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          marginTop: 20,
        }}
      >
        <Row
          gutter={[
            24,
            16,
          ]}
        >
          <Col
            xs={24}
            md={12}
          >
            <Text strong>
              Location
            </Text>

            <br />

            <Text>
              📍 {event.locationName}
            </Text>
          </Col>

          <Col
            xs={24}
            md={12}
          >
            <Text strong>
              Status
            </Text>

            <br />

            <Tag
              color={
                event.status ===
                'PUBLISHED'
                  ? 'green'
                  : event.status ===
                    'CHECKING_IN'
                  ? 'blue'
                  : event.status ===
                    'FINISHED'
                  ? 'default'
                  : event.status ===
                    'CANCELLED'
                  ? 'red'
                  : 'orange'
              }
            >
              {event.status}
            </Tag>
          </Col>

          <Col
            xs={24}
            md={12}
          >
            <Text strong>
              Start Time
            </Text>

            <br />

            <Text>
              {dayjs(
                event.startTime,
              ).format(
                'DD/MM/YYYY HH:mm',
              )}
            </Text>
          </Col>

          <Col
            xs={24}
            md={12}
          >
            <Text strong>
              End Time
            </Text>

            <br />

            <Text>
              {dayjs(
                event.endTime,
              ).format(
                'DD/MM/YYYY HH:mm',
              )}
            </Text>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          marginTop: 20,
        }}
      >
        <Statistic
          title="Tỷ lệ điểm danh"
          value={
            attendanceRate
          }
          precision={2}
          suffix="%"
        />
      </Card>
    </Card>
  );
}