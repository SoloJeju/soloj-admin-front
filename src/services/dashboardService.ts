import { apiGet } from './api';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  bannedUsers: number;
  restrictedUsers: number;
  todayReports: number;
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'content';
  action: string;
  target: string;
  adminId: string;
  adminName: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

// 대시보드 통계 조회
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiGet('/admin/dashboard/stats');
};

// 최근 활동 내역 조회
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  return apiGet('/admin/dashboard/recent-activities', { limit });
};

// 전체 대시보드 데이터 조회
export const getDashboardData = async (): Promise<DashboardData> => {
  const [stats, recentActivities] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(10)
  ]);
  
  return { stats, recentActivities };
};
