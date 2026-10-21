import { Button, Card, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

import {
  useNgười tham gia,
} from '../hooks/useNgười tham gia';

import {
  exportAttendance,
} from '../api/attendance.api';

import Người tham giaTable from '../components/Người tham giaTable';

const { Title } = Typography;

export default function Người tham giaPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
  } = useNgười tham gia(id ?? '');

  const handleExport = async () => {
    if (!id) return;

    const blob =
      await exportAttendance(id);

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download = 'danh-sach-diem-danh.xlsx';

    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <Title level={3}>
          Người tham gia
        </Title>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Xuất Excel
        </Button>
      </Space>

      <Người tham giaTable
        data={data ?? []}
        loading={isLoading}
      />
    </Card>
  );
}