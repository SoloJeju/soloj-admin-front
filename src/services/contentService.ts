import { mockContents } from './mockData';

export interface ContentReportSummary {
  id: string;
  type: string;
  title: string;
  author: string;
  status: string;
  reportCount: number;
  createdAt: string;
  content: string;
}

export interface ContentListResponse {
  contents: ContentReportSummary[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

// 신고된 콘텐츠 목록 조회 (더미 데이터 사용)
export const getContentReports = async (filters: ContentFilters = {}): Promise<ContentListResponse> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 400)); // 로딩 시뮬레이션
  
  let filteredContents = [...mockContents];
  
  // 타입 필터링
  if (filters.type && filters.type !== 'all') {
    filteredContents = filteredContents.filter(content => content.type === filters.type);
  }
  
  // 상태 필터링
  if (filters.status && filters.status !== 'all') {
    filteredContents = filteredContents.filter(content => content.status === filters.status);
  }
  
  // 검색 필터링
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredContents = filteredContents.filter(content => 
      content.title.toLowerCase().includes(searchTerm) ||
      content.author.toLowerCase().includes(searchTerm) ||
      content.content.toLowerCase().includes(searchTerm)
    );
  }
  
  // 페이지네이션
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedContents = filteredContents.slice(startIndex, endIndex);
  
  return {
    contents: paginatedContents,
    pagination: {
      totalPages: Math.ceil(filteredContents.length / limit),
      totalItems: filteredContents.length,
      currentPage: page,
      limit
    }
  };
};

// 콘텐츠 상태 업데이트 (더미 데이터 사용)
export const updateContentStatus = async (contentId: string, newStatus: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const contentIndex = mockContents.findIndex(content => content.id === contentId);
  if (contentIndex !== -1) {
    mockContents[contentIndex].status = newStatus;
    return true;
  }
  
  return false;
};
