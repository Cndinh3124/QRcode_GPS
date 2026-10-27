import {
  Alert,
  Button,
  Empty,
  Image,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';

import {
  CopyOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import { useEventQr } from '../hooks/useEventQr';

const { Title, Text } =
  Typography;

interface QrModalProps {
  open: boolean;
  eventId?: string;
  onClose: () => void;
}

export default function QrModal({
  open,
  eventId,
  onClose,
}: QrModalProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    regenerate,
    isRegenerating,
  } = useEventQr(eventId);

  async function handleCopyLink() {
    if (!data?.checkInUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        data.checkInUrl,
      );

      message.success(
        'Đã sao chép đường dẫn check-in.',
      );
    } catch {
      message.error(
        'Không thể sao chép đường dẫn.',
      );
    }
  }

  function handleDownloadQr() {
    if (!data?.qrImage) {
      return;
    }

    const link =
      document.createElement(
        'a',
      );

    link.href =
      data.qrImage;

    link.download =
      `${data.title}-QR.png`;

    document.body.appendChild(
      link,
    );

    link.click();

    document.body.removeChild(
      link,
    );
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div
          className="qr-modal-loading"
        >
          <Spin size="large" />
          <Text type="secondary">
            Đang tải mã QR...
          </Text>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert
          type="error"
          showIcon
          message="Không tải được mã QR"
          description="Kiểm tra backend đang chạy và tài khoản của bạn còn đăng nhập, sau đó thử lại."
          action={
            <Button
              size="small"
              onClick={() => refetch()}
            >
              Thử lại
            </Button>
          }
        />
      );
    }

    if (!data) {
      return (
        <Empty
          description="Sự kiện này chưa có dữ liệu mã QR."
        />
      );
    }

    return (
      <>
        <Title
          level={4}
          style={{
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {data.title}
        </Title>

        <div
          className="qr-modal-image"
        >
          <Image
            src={data.qrImage}
            alt={`Mã QR check-in cho ${data.title}`}
            width={250}
            preview
          />
        </div>

        <Text
          type="secondary"
          style={{
            display: 'block',
            marginBottom: 8,
          }}
        >
          Đường dẫn check-in
        </Text>

        <Input
          readOnly
          value={data.checkInUrl}
        />

        <Space
          wrap
          className="qr-modal-actions"
        >
          <Button
            icon={
              <CopyOutlined />
            }
            onClick={
              handleCopyLink
            }
          >
            Sao chép đường dẫn
          </Button>

          <Button
            type="primary"
            icon={
              <DownloadOutlined />
            }
            onClick={
              handleDownloadQr
            }
          >
            Tải mã QR
          </Button>

          <Popconfirm
            title="Tạo lại mã QR?"
            description="Mã QR hiện tại sẽ không còn sử dụng được."
            okText="Tạo lại"
            cancelText="Hủy"
            onConfirm={() => {
              regenerate();
            }}
            okButtonProps={{
              loading:
                isRegenerating,
            }}
          >
            <Button
              danger
              icon={
                <ReloadOutlined />
              }
              loading={
                isRegenerating
              }
            >
              Tạo lại mã QR
            </Button>
          </Popconfirm>
        </Space>
      </>
    );
  }

  return (
    <Modal
      open={open}
      title="Mã QR sự kiện"
      footer={null}
      centered
      width={520}
      destroyOnHidden
      onCancel={onClose}
      maskClosable={false}
    >
      {renderContent()}
    </Modal>
  );
}
