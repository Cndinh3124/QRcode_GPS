import api from '../../../api/axios';

export type RiskAssessment = {
  id: string;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'SCORED' | 'RETRY' | 'FAILED';
  anomalyScore: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  reasonCodes: string[];
  featureSnapshot: Record<string, number> | null;
  reviewDecision: 'LEGITIMATE' | 'CONFIRMED_FRAUD' | 'NEEDS_FOLLOW_UP' | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  attendance: {
    participantCode: string;
    fullName: string;
    eventTitle?: string;
    checkInTime: string;
    distance: number;
    status: string;
  } | null;
};

export const aiFraudApi = {
  async list(): Promise<{ items: RiskAssessment[]; total: number }> {
    const { data } = await api.get('/ai-fraud/assessments', {
      params: { page: 1, limit: 100 },
    });
    return data;
  },
  async modelStatus(): Promise<{ status: string; model_ready: boolean }> {
    const { data } = await api.get('/ai-fraud/model-status');
    return data;
  },
  async train() {
    const { data } = await api.post('/ai-fraud/train');
    return data as { model_version: string; training_rows: number };
  },
  async review(id: string, decision: RiskAssessment['reviewDecision'], note: string) {
    const { data } = await api.post(`/ai-fraud/assessments/${id}/review`, {
      decision,
      note: note || undefined,
    });
    return data;
  },
};
