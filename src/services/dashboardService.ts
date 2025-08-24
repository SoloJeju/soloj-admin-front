import { mockDashboardStats, mockRecentActivities } from './mockData';

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

// 대시보드 통계 조회 (더미 데이터 사용)
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
  return mockDashboardStats;
};

// 최근 활동 조회 (더미 데이터 사용)
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  return mockRecentActivities.slice(0, limit);
};

// 대시보드 전체 데이터 조회 (더미 데이터 사용)
export const getDashboardData = async () => {
  try {
    const [stats, activities] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(10)
    ]);

    return {
      stats,
      activities
    };
  } catch (error) {
    throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
  }
};
