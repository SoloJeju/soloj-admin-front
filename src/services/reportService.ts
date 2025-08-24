import { apiGet, apiPost, apiPatch } from './api';
import { Report } from '../types/report';

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  type?: string;
  search?: string;
}

export interface ReportListResponse {
  reports: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 신고 목록 조회
export const getReports = async (filters: ReportFilters = {}): Promise<ReportListResponse> => {
  const defaultFilters = {
    page: 1,
    limit: 20,
    status: 'all',
    reason: 'all',
    type: 'all',
    search: '',
    ...filters
  };
  
  return apiGet('/admin/reports', defaultFilters);
};

// 신고 상세 정보 조회
export const getReportDetail = async (reportId: string): Promise<Report> => {
  return apiGet(`/admin/reports/${reportId}`);
};

// 신고 상태 변경
export const updateReportStatus = async (
  reportId: string, 
  status: string, 
  reason?: string
): Promise<void> => {
  return apiPatch(`/admin/reports/${reportId}/status`, {
    status,
    reason
  });
};

// 신고 처리 완료
export const completeReport = async (
  reportId: string, 
  action: string, 
  details: any
): Promise<void> => {
  return apiPost(`/admin/reports/${reportId}/complete`, {
    action,
    details,
    completedAt: new Date().toISOString()
  });
};
