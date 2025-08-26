import { apiGet, apiPatch, apiPost } from './api';

export interface UserReportSummary {
  id: string;
  username: string;
  email: string;
  status: string;
  reportCount: number;
  lastActive: string;
  joinDate: string;
}

export interface UserListResponse {
  users: UserReportSummary[];
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
export const getUserReports = async (filters: UserFilters = {}): Promise<UserListResponse> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/users/reported', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result && Array.isArray(response.result)) {
    // API 응답이 배열 형태로 오는 경우
    return {
      users: response.result.map((user: any) => ({
        id: user.userId?.toString() || '',
        username: user.userName || '',
        email: '', // API에서 제공하지 않음
        status: user.currentStatus || 'normal',
        reportCount: user.totalReports || 0,
        lastActive: '', // API에서 제공하지 않음
        joinDate: '' // API에서 제공하지 않음
      })),
      pagination: {
        totalPages: 1,
        totalItems: response.result.length,
        currentPage: filters.page || 1,
        limit: filters.limit || 20
      }
    };
  } else if (response.users) {
    return response;
  } else {
    return {
      users: [],
      pagination: {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        limit: filters.limit || 20
      }
    };
  }
};

// 사용자 상태 업데이트
export const updateUserStatus = async (userId: string, newStatus: string, reason?: string): Promise<boolean> => {
  const response = await apiPatch(`/admin/users/${userId}/status`, {
    status: newStatus,
    reason: reason || '관리자에 의한 상태 변경'
  });
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 신고된 사용자 조회 (getReportedUsers의 별칭)
export const getReportedUsers = getUserReports;

// 사용자 액션 적용
export const applyUserAction = async (userId: string, actionData: {
  actionType: 'ban' | 'warn';
  duration?: number;
  reason: string;
  adminId: number;
}): Promise<boolean> => {
  const response = await apiPost(`/admin/users/${userId}/actions`, actionData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};
