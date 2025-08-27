import { apiGet } from './api';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  bannedUsers: number;
  restrictedUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
  repliedInquiries: number;
}

export interface RecentActivity {
  id: string;
  adminId: number;
  action: string;
  timestamp: string;
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
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      bannedUsers: 0,
      restrictedUsers: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      repliedInquiries: 0
    };
  }
};

// 최근 활동 조회 - 활동 로그 API 사용
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const response = await apiGet('/admin/auth/activity-logs', { limit });
    
    // API 응답 구조에 따라 데이터 추출
    if (response.result) {
      return response.result;
    } else if (response.activities) {
      return response.activities;
    } else {
      return [];
    }
  } catch (error) {
    console.error('활동 로그 API 호출 오류:', error);
    throw error;
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
    console.error('대시보드 데이터 로드 오류:', error);
    throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
  }
};
