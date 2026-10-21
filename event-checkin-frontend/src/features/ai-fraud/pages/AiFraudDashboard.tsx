import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { aiFraudApi, type RiskAssessment } from '../api/ai-fraud.api';

const { Paragraph, Text, Title } = Typography;
const riskColor: Record<string, string> = { HIGH: 'red', MEDIUM: 'orange', LOW: 'green' };
const reviewLabels: Record<string, string> = {
  LEGITIMATE: 'Hợp lệ', CONFIRMED_FRAUD: 'Xác nhận gian lận', NEEDS_FOLLOW_UP: 'Cần xác minh thêm',
};

export default function AiFraudDashboard() {
  const [rows, setRows] = useState<RiskAssessment[]>([]);
  const [modelReady, setModelReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [selected, setSelected] = useState<RiskAssessment | null>(null);
  const [decision, setDecision] = useState<RiskAssessment['reviewDecision']>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [list, status] = await Promise.all([aiFraudApi.list(), aiFraudApi.modelStatus()]);
      setRows(list.items);
      setModelReady(status.model_ready);
    } catch {
      message.error('Không tải được dữ liệu phát hiện rủi ro.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  async function train() {
    setTraining(true);
    try {
      const result = await aiFraudApi.train();
      message.success(`Đã huấn luyện baseline từ ${result.training_rows} lượt điểm danh.`);
      await refresh();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Huấn luyện thất bại.');
    } finally { setTraining(false); }
  }
  async function saveReview() {
    if (!selected || !decision) return;
    setSaving(true);
    try {
      await aiFraudApi.review(selected.id, decision, note);
      message.success('Đã lưu kết quả xác minh.');
      setSelected(null); setDecision(null); setNote('');
      await refresh();
    } catch { message.error('Không lưu được kết quả xác minh.'); }
    finally { setSaving(false); }
  }

  const columns: ColumnsType<RiskAssessment> = [
    { title: 'Người tham gia', key: 'person', render: (_, r) => <><Text strong>{r.attendance?.fullName || '—'}</Text><br/><Text type="secondary">{r.attendance?.participantCode}</Text></> },
    { title: 'Sự kiện', dataIndex: ['attendance', 'eventTitle'], key: 'event', render: (v) => v || '—' },
    { title: 'Thời điểm', key: 'time', render: (_, r) => r.attendance?.checkInTime ? new Date(r.attendance.checkInTime).toLocaleString('vi-VN') : '—' },
    { title: 'Rủi ro', key: 'risk', render: (_, r) => r.analysisStatus === 'SCORED' ? <Tag color={riskColor[r.riskLevel || 'LOW']}>{r.riskLevel} · {r.anomalyScore == null ? '—' : `${(r.anomalyScore * 100).toFixed(1)}%`}</Tag> : <Tag>{r.analysisStatus}</Tag> },
    { title: 'Tín hiệu', key: 'reasons', render: (_, r) => r.reasonCodes?.length ? r.reasonCodes.map((reason) => <Tag key={reason}>{reason}</Tag>) : <Text type="secondary">Chưa có</Text> },
    { title: 'Xác minh', key: 'review', render: (_, r) => r.reviewDecision ? <Tag color="blue">{reviewLabels[r.reviewDecision]}</Tag> : r.analysisStatus === 'SCORED' && r.riskLevel !== 'LOW' ? <Button size="small" onClick={() => { setSelected(r); setDecision(null); setNote(''); }}>Xác minh</Button> : '—' },
  ];

  return <Space direction="vertical" size="large" style={{ display: 'flex' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><Title level={2}><SafetyOutlined /> Phát hiện rủi ro điểm danh</Title><Paragraph type="secondary">AI chỉ đưa ra tín hiệu để quản trị viên xem xét; không tự động kết luận hoặc thay đổi trạng thái điểm danh.</Paragraph></div>
      <Space><Button icon={<ReloadOutlined />} onClick={() => void refresh()}>Làm mới</Button><Button type="primary" loading={training} onClick={() => Modal.confirm({ title: 'Huấn luyện baseline?', content: 'Dùng tối đa 2.000 lượt điểm danh hiện có để tạo baseline phát hiện bất thường. Điểm số là mức bất thường tương đối, không phải xác suất gian lận.', okText: 'Huấn luyện', cancelText: 'Hủy', onOk: train })}>Huấn luyện baseline</Button></Space>
    </div>
    {!modelReady && <Alert type="warning" showIcon message="Mô hình chưa sẵn sàng" description="Các lượt điểm danh vẫn được ghi nhận. Hãy có ít nhất 30 lượt dữ liệu rồi huấn luyện baseline; các bản ghi đang chờ sẽ được xử lý sau." />}
    <Card><Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} /></Card>
    <Modal open={!!selected} title="Xác minh cảnh báo" onCancel={() => setSelected(null)} onOk={() => void saveReview()} confirmLoading={saving} okButtonProps={{ disabled: !decision }} okText="Lưu kết quả" cancelText="Đóng">
      {selected && <><Descriptions size="small" column={1} items={[{ key: 'features', label: 'Tín hiệu', children: Object.entries(selected.featureSnapshot || {}).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'Chưa có dữ liệu' }]} /><Paragraph>Chọn kết quả kiểm tra:</Paragraph><Space wrap>{(['LEGITIMATE', 'CONFIRMED_FRAUD', 'NEEDS_FOLLOW_UP'] as const).map((value) => <Button type={decision === value ? 'primary' : 'default'} key={value} onClick={() => setDecision(value)}>{reviewLabels[value]}</Button>)}</Space><Input.TextArea style={{ marginTop: 16 }} maxLength={1000} showCount rows={3} placeholder="Ghi chú xác minh (không bắt buộc)" value={note} onChange={(e) => setNote(e.target.value)} /></>}
    </Modal>
  </Space>;
}
