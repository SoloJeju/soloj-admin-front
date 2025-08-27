import { apiGet } from './api';

export interface ActivityLog {
  id: string;
  adminId: number;
  timestamp: string;
  action: string;
}

export interface ActivityLogResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: ActivityLog[];
}

export const activityLogService = {
  // 관리자 활동 로그 조회
  getActivityLogs: async (params?: { adminId?: number; limit?: number }): Promise<ActivityLogResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.adminId) {
      queryParams.append('adminId', params.adminId.toString());
    }
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const endpoint = `/admin/auth/activity-logs?${queryParams.toString()}`;
    return await apiGet(endpoint);
  }
};
