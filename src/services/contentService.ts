import { apiGet, apiPost, apiPatch } from './api';
import { ContentReportSummary } from '../types/report';

export interface ContentFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export interface ContentListResponse {
  contents: ContentReportSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ContentActionRequest {
  actionType: 'restore' | 'delete' | 'temporaryBlock';
  reason: string;
  adminId: string;
}

// 신고된 콘텐츠 목록 조회
export const getReportedContent = async (filters: ContentFilters = {}): Promise<ContentListResponse> => {
  const defaultFilters = {
    page: 1,
    limit: 20,
    type: 'all',
    status: 'all',
    search: '',
    ...filters
  };
  
  return apiGet('/admin/content/reported', defaultFilters);
};

// 콘텐츠 조치 적용
export const applyContentAction = async (
  contentId: string, 
  action: ContentActionRequest
): Promise<void> => {
  return apiPost(`/admin/content/${contentId}/actions`, action);
};

// 콘텐츠 상태 변경
export const updateContentStatus = async (
  contentId: string, 
  status: string, 
  reason: string
): Promise<void> => {
  return apiPatch(`/admin/content/${contentId}/status`, {
    status,
    reason
  });
};

// 콘텐츠 복구
export const restoreContent = async (
  contentId: string, 
  reason: string
): Promise<void> => {
  return apiPost(`/admin/content/${contentId}/restore`, {
    reason,
    restoredAt: new Date().toISOString()
  });
};

// 콘텐츠 상세 정보 조회
export const getContentDetail = async (contentId: string): Promise<ContentReportSummary> => {
  return apiGet(`/admin/content/${contentId}`);
};
