import { useState } from 'react';

import { useParams } from 'react-router-dom';

import {
  Alert,
  Button,
  Card,
  Result,
  Spin,
  Tag,
  Typography,
} from 'antd';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';

import EventInfoCard from '../components/EventInfoCard';
import LocationAlert from '../components/LocationAlert';
import CheckInForm, {
  type CheckInFormValues,
} from '../components/CheckInForm';

import { useCheckIn } from '../hooks/useCheckIn';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useEventInfo } from '../hooks/useEventInfo';

import { CHECKIN_MESSAGES } from '../constants/checkin.messages';

import { getDeviceInfo } from '../../../utils/browser';

import type { CheckInResponse } from '../types/checkin.types';
import type { EventInfo } from '../types/event-info.types';

const { Text } = Typography;

export default function CheckIn() {
  const { qrToken } = useParams<{
    qrToken: string;
  }>();

  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventInfo(qrToken);

  const checkIn = useCheckIn();

  const {
    getCurrentLocation,
    loading: loadingLocation,
  } = useCurrentLocation();

  const [checkInResult, setCheckInResult] =
    useState<CheckInResponse | null>(null);

  async function handleSubmit(
    values: CheckInFormValues,
  ): Promise<boolean> {
    if (!qrToken) {
      return false;
    }

    try {
      const position = await getCurrentLocation();

      const response = await checkIn.mutateAsync({
        qrToken,

        participantCode:
          values.participantCode.trim(),

        fullName:
          values.fullName.trim(),

        email:
          values.email?.trim() || undefined,

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude,

        device: getDeviceInfo(),
      });

      setCheckInResult(response);

      return true;
    } catch {
      return false;
    }
  }

  function handleCheckAgain() {
    setCheckInResult(null);
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--color-page)',
          padding: 20,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--color-page)',
          padding: 20,
        }}
      >
        <Card
          style={{
            width: 450,
            maxWidth: '100%',
          }}
        >
          <Alert
            type="error"
            showIcon
            message={
              CHECKIN_MESSAGES.INVALID_QR
            }
            description={
              CHECKIN_MESSAGES.INVALID_QR_DESCRIPTION
            }
            action={
              <Button
                size="small"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (checkInResult) {
    return (
      <CheckInSuccess
        response={checkInResult}
        event={event}
        onCheckAgain={handleCheckAgain}
      />
    );
  }

  const isCheckingIn =
    event.status === 'CHECKING_IN';

  const submitting =
    loadingLocation ||
    checkIn.isPending;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--color-page)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 500,
          maxWidth: '100%',
        }}
      >
        <EventInfoCard event={event} />

        {!isCheckingIn && (
          <Alert
            type={
              event.status === 'FINISHED'
                ? 'warning'
                : event.status === 'CANCELLED'
                  ? 'error'
                  : 'info'
            }
            showIcon
            message={getEventStatusMessage(
              event.status,
            )}
            style={{
              marginBottom: 20,
            }}
          />
        )}

        {isCheckingIn && <LocationAlert />}

        <Card>
          <CheckInForm
            loading={
              submitting || !isCheckingIn
            }
            onSubmit={handleSubmit}
          />
        </Card>
      </div>
    </div>
  );
}

interface CheckInSuccessProps {
  response: CheckInResponse;
  event: EventInfo;
  onCheckAgain: () => void;
}

function CheckInSuccess({
  response,
  event,
  onCheckAgain,
}: CheckInSuccessProps) {
  const data = response.data;

  const isLate = data.status === 'LATE';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--color-page)',
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 500,
          maxWidth: '100%',
        }}
      >
        <Result
          status="success"
          icon={
            <CheckCircleOutlined
              style={{
                color: '#21865B',
              }}
            />
          }
          title="Điểm danh thành công"
          subTitle={
            isLate
              ? 'Bạn đã điểm danh thành công nhưng được ghi nhận là đi muộn.'
              : 'Thông tin điểm danh của bạn đã được ghi nhận.'
          }
        />

        <Card
          type="inner"
          style={{
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <Text type="secondary">Sự kiện</Text>

              <div>
                <Text strong>
                  {event.title}
                </Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Người tham gia</Text>

              <div>
                <Text strong>
                  {data.fullName}
                </Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Mã tham gia</Text>

              <div>
                <Text strong>
                  {data.participantCode}
                </Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Thời gian điểm danh</Text>

              <div>
                <ClockCircleOutlined
                  style={{
                    marginRight: 8,
                  }}
                />

                <Text>
                  {dayjs(
                    data.checkInTime,
                  ).format(
                    'HH:mm:ss · DD/MM/YYYY',
                  )}
                </Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Khoảng cách</Text>

              <div>
                <EnvironmentOutlined
                  style={{
                    marginRight: 8,
                  }}
                />

                <Text>
                  {Number(
                    data.distance,
                  ).toFixed(2)}{' '}
                  m
                </Text>
              </div>
            </div>

            <div>
              <Text type="secondary">Trạng thái</Text>

              <div
                style={{
                  marginTop: 4,
                }}
              >
                <Tag
                  color={
                    isLate
                      ? 'orange'
                      : 'green'
                  }
                >
                  {isLate
                    ? 'Đi muộn'
                    : 'Có mặt'}
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="primary"
          block
          size="large"
          style={{
            marginTop: 20,
          }}
          onClick={onCheckAgain}
        >
          Done
        </Button>
      </Card>
    </div>
  );
}

function getEventStatusMessage(
  status: EventInfo['status'],
) {
  switch (status) {
    case 'DRAFT':
      return 'Sự kiện hiện chưa mở điểm danh.';

    case 'PUBLISHED':
      return 'Sự kiện chưa đến thời gian điểm danh.';

    case 'FINISHED':
      return 'Sự kiện đã kết thúc thời gian điểm danh.';

    case 'CANCELLED':
      return 'Sự kiện này đã bị hủy.';

    default:
      return 'Hiện chưa thể điểm danh cho sự kiện này.';
  }
}