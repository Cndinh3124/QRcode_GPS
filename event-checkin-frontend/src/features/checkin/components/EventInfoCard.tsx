import {
  Card,
  Descriptions,
  Tag,
  Typography,
} from 'antd';

import dayjs from 'dayjs';

import type {
  EventInfo,
} from '../types/event-info.types';

import {
  STATUS_COLOR,
  STATUS_LABEL,
} from '../../events/constants/eventStatus';

const {
  Title,
  Text,
} = Typography;

interface EventInfoCardProps {
  event: EventInfo;
}

export default function EventInfoCard({
  event,
}: EventInfoCardProps) {
  return (
    <Card
      style={{
        marginBottom: 20,
      }}
    >
      <Title
        level={3}
        style={{
          marginBottom: 8,
        }}
      >
        {event.title}
      </Title>

      {event.description && (
        <Text
          type="secondary"
          style={{
            display: 'block',
            marginBottom: 20,
          }}
        >
          {event.description}
        </Text>
      )}

      <Descriptions
        column={1}
        size="small"
        bordered
      >
        <Descriptions.Item label="Địa điểm">
          📍 {event.locationName}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian bắt đầu">
          {dayjs(
            event.startTime,
          ).format(
            'DD/MM/YYYY HH:mm',
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian kết thúc">
          {dayjs(
            event.endTime,
          ).format(
            'DD/MM/YYYY HH:mm',
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Bán kính điểm danh">
          {Number(event.radius).toFixed(0)} m
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag
            color={
              STATUS_COLOR[event.status]
            }
          >
            {
              STATUS_LABEL[
                event.status
              ]
            }
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}