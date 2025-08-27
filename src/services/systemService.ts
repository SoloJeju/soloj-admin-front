import { apiGet } from './api';

export interface SystemInfo {
  springBootVersion: string;
  javaVersion: string;
  serverVersion: string;
}

export interface ServerStatus {
  icon: string;
  status: string;
  description: string;
}

export interface DatabaseStatus {
  icon: string;
  status: string;
  description: string;
}

export interface ApiResponseTime {
  time: string;
  description: string;
  icon: string;
}

export interface PerformanceMetrics {
  diskUsage: string;
  memoryUsage: string;
}

export interface SystemLoad {
  cpu: string;
  icon: string;
  description: string;
}

export interface ReportStatus {
  total: number;
  description: string;
  pending: number;
  icon: string;
}

export interface ActiveUsers {
  icon: string;
  description: string;
  count: number;
}

export interface SystemSettings {
  systemInfo: SystemInfo;
  serverStatus: ServerStatus;
  maxReportsPerUser: number;
  databaseStatus: DatabaseStatus;
  apiResponseTime: ApiResponseTime;
  autoActionEnabled: boolean;
  performanceMetrics: PerformanceMetrics;
  systemLoad: SystemLoad;
  reportStatus: ReportStatus;
  activeUsers: ActiveUsers;
  reportCooldownHours: number;
}

export interface SystemSettingsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: SystemSettings;
}

export const systemService = {
  // 시스템 설정 조회
  getSystemSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await apiGet('/admin/settings/system');
      return response.result;
    } catch (error) {
      console.error('시스템 설정 조회 실패:', error);
      throw new Error('시스템 설정을 불러올 수 없습니다.');
    }
  },

  // API 응답 시간을 밀리초로 변환
  parseResponseTime: (timeString: string): number => {
    const match = timeString.match(/(\d+)ms/);
    return match ? parseInt(match[1]) : 0;
  },

  // 퍼센트 값을 숫자로 변환
  parsePercentage: (percentageString: string): number => {
    const match = percentageString.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
};
