import { mockReports } from './mockData';

export interface Report {
  id: string;
  contentType: string;
  reportedUserName: string;
  reporterName: string;
  reason: string;
  status: string;
  createdAt: string;
  contentTitle?: string | null;
  detailReason?: string;
}

export interface ReportListResponse {
  reports: Report[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  type?: string;
  search?: string;
}

// 신고 목록 조회 (더미 데이터 사용)
export const getReports = async (filters: ReportFilters = {}): Promise<ReportListResponse> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 400)); // 로딩 시뮬레이션
  
  let filteredReports = [...mockReports];
  
  // 상태 필터링
  if (filters.status && filters.status !== 'all') {
    filteredReports = filteredReports.filter(report => report.status === filters.status);
  }
  
  // 사유 필터링
  if (filters.reason && filters.reason !== 'all') {
    filteredReports = filteredReports.filter(report => report.reason === filters.reason);
  }
  
  // 타입 필터링
  if (filters.type && filters.type !== 'all') {
    filteredReports = filteredReports.filter(report => report.contentType === filters.type);
  }
  
  // 검색 필터링
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredReports = filteredReports.filter(report => 
      report.reportedUserName.toLowerCase().includes(searchTerm) ||
      report.reporterName.toLowerCase().includes(searchTerm) ||
      (report.contentTitle && report.contentTitle.toLowerCase().includes(searchTerm))
    );
  }
  
  // 페이지네이션
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);
  
  return {
    reports: paginatedReports,
    pagination: {
      totalPages: Math.ceil(filteredReports.length / limit),
      totalItems: filteredReports.length,
      currentPage: page,
      limit
    }
  };
};

// 신고 상태 업데이트 (더미 데이터 사용)
export const updateReportStatus = async (reportId: string, newStatus: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const reportIndex = mockReports.findIndex(report => report.id === reportId);
  if (reportIndex !== -1) {
    mockReports[reportIndex].status = newStatus;
    return true;
  }
  
  return false;
};
