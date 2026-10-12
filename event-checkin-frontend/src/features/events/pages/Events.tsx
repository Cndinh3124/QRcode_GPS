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

import { useSự kiện } from '../hooks/useSự kiện';

import Sự kiệnTable from '../components/Sự kiệnTable';
import Sự kiệnModal from '../components/Sự kiệnModal';

import QrModal from '../../qr/components/QrModal';

import type { Sự kiện } from '../types/events.types';

const { Title } = Typography;

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export default function Sự kiện() {
  const {
    events,
    deleteSự kiện,
  } = useSự kiện();

  const [open, setOpen] =
    useState(false);

  const [mode, setMode] =
    useState<'create' | 'edit'>(
      'create',
    );

  const [
    selectedSự kiện,
    setSelectedSự kiện,
  ] = useState<Sự kiện | undefined>(
    undefined,
  );

  const [qrOpen, setQrOpen] =
    useState(false);

  const [
    selectedSự kiệnId,
    setSelectedSự kiệnId,
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
    setSelectedSự kiện(undefined);
    setOpen(true);
  }

  // =========================================================
  // EDIT
  // =========================================================

  function handleEdit(event: Sự kiện) {
    setMode('edit');
    setSelectedSự kiện(event);
    setOpen(true);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteSự kiện.mutateAsync(id);

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

  function handleCloseSự kiệnModal() {
    setOpen(false);
    setSelectedSự kiện(undefined);
    setMode('create');
  }

  // =========================================================
  // QR
  // =========================================================

  function handleOpenQr(id: string) {
    setSelectedSự kiệnId(id);
    setQrOpen(true);
  }

  function handleCloseQr() {
    setQrOpen(false);
    setSelectedSự kiệnId(undefined);
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
          message="Không thể tải danh sách sự kiện."
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
              Sự kiện Quản lý
            </Title>

            <Typography.Text
              type="secondary"
            >
              Manage events and check-in
              activities.
            </Typography.Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            disabled={!isAdmin}
          >
            Thêm sự kiện
          </Button>
        </div>

        <Sự kiệnTable
          data={events.data ?? []}
          loading={
            events.isLoading ||
            events.isFetching ||
            deleteSự kiện.isPending
          }
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenQr={handleOpenQr}
        />
      </Card>

      <Sự kiệnModal
        open={open}
        mode={mode}
        event={selectedSự kiện}
        onClose={
          handleCloseSự kiệnModal
        }
      />

      <QrModal
        open={qrOpen}
        eventId={selectedSự kiệnId}
        onClose={handleCloseQr}
      />
    </>
  );
}