import { apiGet, apiPatch, apiPost } from './api';

export interface Report {
  id: string;
  contentType: 'post' | 'comment';
  contentId?: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  reporterName: string;
  reason: 'spam' | 'abuse' | 'inappropriate' | 'other';
  status: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'REJECTED';
  createdAt: string;
  contentTitle?: string | null;
  detailReason?: string;
  imageUrl?: string | null;
  imageName?: string | null;
}

export interface ReportListResponse {
  reports: Report[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'REJECTED' | 'all';
  reason?: 'spam' | 'abuse' | 'inappropriate' | 'other' | 'all';
  type?: 'post' | 'comment' | 'all';
  search?: string;
}

// 신고 목록 조회
export const getReports = async (filters: ReportFilters = {}): Promise<ReportListResponse> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.reason && filters.reason !== 'all') params.reason = filters.reason;
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/reports', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.reports) {
    return response;
  } else {
    return {
      reports: [],
      pagination: {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        limit: filters.limit || 20
      }
    };
  }
};

// 신고 상세 조회
export const getReportDetail = async (reportId: string) => {
  const response = await apiGet(`/admin/reports/${reportId}`);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.report) {
    return response;
  } else {
    return { report: null };
  }
};

// 신고 처리 (승인/반려)
export const processReport = async (reportId: string, processData: {
  action: 'approve' | 'reject';
  reason: string;
}): Promise<boolean> => {
  const response = await apiPost(`/admin/reports/${reportId}/process`, processData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 신고 상태 업데이트
export const updateReportStatus = async (reportId: string, newStatus: string): Promise<boolean> => {
  const response = await apiPatch(`/admin/reports/${reportId}/status`, {
    status: newStatus
  });
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};
