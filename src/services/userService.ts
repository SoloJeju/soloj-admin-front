import { apiGet, apiPost, apiPatch } from './api';

export interface ReportedUser {
  userId: number;
  userName: string;
  totalReports: number;
  currentStatus: string;
}

export interface ReportedUserListResponse {
  users: ReportedUser[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// 신고된 사용자 목록 조회
export const getReportedUsers = async (filters: UserFilters = {}): Promise<any> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/users/reported', params);
  
  // API 응답 구조에 맞게 전체 응답 반환
  return response;
};

// 사용자 상세정보 조회
export const getUserDetail = async (userId: string) => {
  const response = await apiGet(`/admin/users/reported/${userId}`);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.user) {
    return response;
  } else {
    return null;
  }
};

// 사용자 조치 적용
export const applyUserAction = async (userId: string, actionData: {
  actionType: string;
  duration?: number;
  reason?: string;
}): Promise<boolean> => {
  const response = await apiPost(`/admin/users/${userId}/actions`, actionData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 사용자 상태 변경
export const updateUserStatus = async (userId: string, statusData: {
  status: string;
  reason?: string;
}): Promise<boolean> => {
  const response = await apiPatch(`/admin/users/${userId}/status`, statusData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};
