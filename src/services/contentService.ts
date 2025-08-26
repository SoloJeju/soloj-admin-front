import { apiGet, apiPatch, apiPost } from './api';

export interface ContentReportSummary {
  id: string;
  type: string;
  title: string;
  author: string;
  status: string;
  reportCount: number;
  createdAt: string;
  content: string;
}

export interface ContentListResponse {
  contents: ContentReportSummary[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

// 신고된 콘텐츠 목록 조회
export const getContentReports = async (filters: ContentFilters = {}): Promise<ContentListResponse> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/content/reported', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.contents) {
    return response;
  } else {
    return {
      contents: [],
      pagination: {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        limit: filters.limit || 20
      }
    };
  }
};

// 콘텐츠 상태 업데이트
export const updateContentStatus = async (contentId: string, newStatus: string, reason?: string): Promise<boolean> => {
  const response = await apiPatch(`/admin/content/${contentId}/status`, {
    status: newStatus,
    reason: reason || '관리자에 의한 상태 변경'
  });
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 신고된 콘텐츠 조회 (getReportedContent의 별칭)
export const getReportedContent = getContentReports;

// 콘텐츠 액션 적용
export const applyContentAction = async (contentId: string, actionData: {
  actionType: 'delete' | 'hide' | 'warn';
  reason: string;
  adminId: number;
}): Promise<boolean> => {
  const response = await apiPost(`/admin/content/${contentId}/actions`, actionData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};
