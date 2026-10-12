/**
 * SPWN Apps 2.0
 * Portfolio / Evidence API
 * GAS-only.
 */

import { apiClient } from './apiClient';

export interface MemberEvidenceRecord {
  id: string;
  evidence_id?: string;
  member_id: string;
  skk_code: string;
  evidence_type: string;
  title: string;
  description?: string;
  url?: string;
  file_url?: string;
  drive_file_id?: string;
  platform?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REVISION_REQUIRED' | 'REJECTED' | string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddMemberEvidencePayload {
  member_id: string;
  skk_code: string;
  evidence_type?: string;
  title: string;
  description?: string;
  url?: string;
  file_data_url?: string;
  file_name?: string;
  platform?: string;
}

const unwrap = <T,>(response: any): T => {
  return (
    response?.data?.data ??
    response?.data ??
    response
  ) as T;
};

export const portfolioApi = {
  async list(memberId: string): Promise<MemberEvidenceRecord[]> {
    const response = await apiClient.get<any>(
      'member.evidence.list',
      {
        member_id: memberId,
      }
    );

    const data = unwrap<any>(response);

    return Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];
  },

  async add(payload: AddMemberEvidencePayload): Promise<MemberEvidenceRecord> {
    const response = await apiClient.post<any>(
      'member.evidence.add',
      payload
    );

    return unwrap<MemberEvidenceRecord>(response);
  },
};
