import { useState } from 'react';

import {
  Alert,
  Button,
  Card,
  message,
  Spin,
  Typography,
} from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import type { AxiosError } from 'axios';

import { getUser } from '../../auth/utils/auth.storage';

import { useEvents } from '../hooks/useEvents';

import EventTable from '../components/EventTable';
import EventModal from '../components/EventModal';

import QrModal from '../../qr/components/QrModal';

import type { Event } from '../types/events.types';

const { Title } = Typography;

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export default function Events() {
  const {
    events,
    deleteEvent,
  } = useEvents();

  const [open, setOpen] =
    useState(false);

  const [mode, setMode] =
    useState<'create' | 'edit'>(
      'create',
    );

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState<Event | undefined>(
    undefined,
  );

  const [qrOpen, setQrOpen] =
    useState(false);

  const [
    selectedEventId,
    setSelectedEventId,
  ] = useState<string | undefined>(
    undefined,
  );

  const user = getUser();

  const isAdmin =
    user?.role === 'ADMIN';

  // =========================================================
  // CREATE
  // =========================================================

  function handleCreate() {
    setMode('create');
    setSelectedEvent(undefined);
    setOpen(true);
  }

  // =========================================================
  // EDIT
  // =========================================================

  function handleEdit(event: Event) {
    setMode('edit');
    setSelectedEvent(event);
    setOpen(true);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteEvent.mutateAsync(id);

      message.success(
        'Đã xóa sự kiện.',
      );
    } catch (error) {
      const axiosError =
        error as AxiosError<ApiErrorResponse>;

      const response =
        axiosError.response?.data;

      let errorMessage =
        'Không thể xóa sự kiện.';

      if (
        Array.isArray(
          response?.message,
        )
      ) {
        errorMessage =
          response.message.join(', ');
      } else if (
        typeof response?.message ===
        'string'
      ) {
        errorMessage =
          response.message;
      }

      message.error({
        content: errorMessage,
        duration: 5,
      });
    }
  }

  // =========================================================
  // EVENT MODAL
  // =========================================================

  function handleCloseEventModal() {
    setOpen(false);
    setSelectedEvent(undefined);
    setMode('create');
  }

  // =========================================================
  // QR
  // =========================================================

  function handleOpenQr(id: string) {
    setSelectedEventId(id);
    setQrOpen(true);
  }

  function handleCloseQr() {
    setQrOpen(false);
    setSelectedEventId(undefined);
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (events.isLoading) {
    return (
      <Card>
        <div
          style={{
            minHeight: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (events.isError) {
    return (
      <Card>
        <Alert
          type="error"
          showIcon
          message="Cannot load events"
          description="Không thể tải dữ liệu sự kiện. Vui lòng thử lại."
        />
      </Card>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              Quản lý sự kiện
            </Title>

            <Typography.Text
              type="secondary"
            >
              Quản lý sự kiện và hoạt động điểm danh.
            </Typography.Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            disabled={!isAdmin}
          >
            Add Event
          </Button>
        </div>

        <EventTable
          data={events.data ?? []}
          loading={
            events.isLoading ||
            events.isFetching ||
            deleteEvent.isPending
          }
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenQr={handleOpenQr}
        />
      </Card>

      <EventModal
        open={open}
        mode={mode}
        event={selectedEvent}
        onClose={
          handleCloseEventModal
        }
      />

      <QrModal
        open={qrOpen}
        eventId={selectedEventId}
        onClose={handleCloseQr}
      />
    </>
  );
}