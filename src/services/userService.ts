import { apiGet, apiPost, apiPatch } from './api';
import { UserReportSummary, AdminAction } from '../types/report';

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UserListResponse {
  users: UserReportSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserActionRequest {
  actionType: AdminAction['type'];
  duration?: number;
  reason: string;
  adminId: string;
}

// 신고된 사용자 목록 조회
export const getReportedUsers = async (filters: UserFilters = {}): Promise<UserListResponse> => {
  const defaultFilters = {
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
    ...filters
  };
  
  return apiGet('/admin/users/reported', defaultFilters);
};

// 사용자 조치 적용
export const applyUserAction = async (
  userId: string, 
  action: UserActionRequest
): Promise<void> => {
  return apiPost(`/admin/users/${userId}/actions`, action);
};

// 사용자 상태 변경
export const updateUserStatus = async (
  userId: string, 
  status: string, 
  reason: string
): Promise<void> => {
  return apiPatch(`/admin/users/${userId}/status`, {
    status,
    reason
  });
};

// 사용자 복구
export const restoreUser = async (
  userId: string, 
  reason: string
): Promise<void> => {
  return apiPost(`/admin/users/${userId}/restore`, {
    reason,
    restoredAt: new Date().toISOString()
  });
};

// 사용자 상세 정보 조회
export const getUserDetail = async (userId: string): Promise<UserReportSummary> => {
  return apiGet(`/admin/users/${userId}`);
};
