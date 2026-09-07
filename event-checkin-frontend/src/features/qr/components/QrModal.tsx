import {
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
        'Link copied successfully.',
      );
    } catch {
      message.error(
        'Unable to copy link.',
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

  function handleRegenerate() {
    regenerate();
  }

  function renderContent() {
    if (isLoading) {
      return (
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
      );
    }

    if (isError) {
      return (
        <Empty
          description="Unable to load event QR code."
        />
      );
    }

    if (!data) {
      return (
        <Empty
          description="QR code not found."
        />
      );
    }

    return (
      <>
        <Title
          level={4}
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {data.title}
        </Title>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Image
            src={data.qrImage}
            alt={`QR code for ${data.title}`}
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
          Check-in URL
        </Text>

        <Input
          readOnly
          value={data.checkInUrl}
        />

        <Space
          wrap
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
          <Button
            icon={
              <CopyOutlined />
            }
            onClick={
              handleCopyLink
            }
          >
            Copy Link
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
            Download QR
          </Button>

          <Popconfirm
            title="Regenerate QR code?"
            description={
              'The current QR code will become invalid.'
            }
            okText="Regenerate"
            cancelText="Cancel"
            onConfirm={
              handleRegenerate
            }
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
              Regenerate QR
            </Button>
          </Popconfirm>
        </Space>
      </>
    );
  }

  return (
    <Modal
      open={open}
      title="Event QR Code"
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