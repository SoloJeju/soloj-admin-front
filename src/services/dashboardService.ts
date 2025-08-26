import { apiGet } from './api';

export interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  totalContents: number;
  totalInquiries: number;
  pendingReports: number;
  pendingInquiries: number;
  resolvedReports: number;
  answeredInquiries: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  target: string;
  timestamp: string;
  user: string;
}

// 대시보드 통계 조회
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiGet('/admin/dashboard/stats');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.stats) {
    return response.stats;
  } else {
    return {
      totalUsers: 0,
      totalReports: 0,
      totalContents: 0,
      totalInquiries: 0,
      pendingReports: 0,
      pendingInquiries: 0,
      resolvedReports: 0,
      answeredInquiries: 0
    };
  }
};

// 최근 활동 조회
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await apiGet('/admin/dashboard/recent-activities', { limit });
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.activities) {
    return response.activities;
  } else {
    return [];
  }
};

// 대시보드 전체 데이터 조회
export const getDashboardData = async () => {
  try {
    const [stats, activities] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(10)
    ]);

    return {
      stats,
      recentActivities: activities
    };
  } catch (error) {
    throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
  }
};
