import { mockInquiries } from './mockData';

export interface InquirySummary {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  author: string;
  createdAt: string;
  content: string;
  replyCount: number;
}

export interface InquiryListResponse {
  inquiries: InquirySummary[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface InquiryFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

// 1:1 문의 목록 조회 (더미 데이터 사용)
export const getInquiries = async (filters: InquiryFilters = {}): Promise<InquiryListResponse> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 400)); // 로딩 시뮬레이션
  
  let filteredInquiries = [...mockInquiries];
  
  // 상태 필터링
  if (filters.status && filters.status !== 'all') {
    filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === filters.status);
  }
  
  // 카테고리 필터링
  if (filters.category && filters.category !== 'all') {
    filteredInquiries = filteredInquiries.filter(inquiry => inquiry.category === filters.category);
  }
  
  // 우선순위 필터링
  if (filters.priority && filters.priority !== 'all') {
    filteredInquiries = filteredInquiries.filter(inquiry => inquiry.priority === filters.priority);
  }
  
  // 검색 필터링
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredInquiries = filteredInquiries.filter(inquiry => 
      inquiry.title.toLowerCase().includes(searchTerm) ||
      inquiry.author.toLowerCase().includes(searchTerm) ||
      inquiry.content.toLowerCase().includes(searchTerm)
    );
  }
  
  // 페이지네이션
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);
  
  return {
    inquiries: paginatedInquiries,
    pagination: {
      totalPages: Math.ceil(filteredInquiries.length / limit),
      totalItems: filteredInquiries.length,
      currentPage: page,
      limit
    }
  };
};

// 1:1 문의 상세 조회 (더미 데이터 사용)
export const getInquiryDetail = async (inquiryId: string) => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const inquiry = mockInquiries.find(inq => inq.id === inquiryId);
  if (!inquiry) {
    throw new Error('문의를 찾을 수 없습니다.');
  }
  
  return {
    inquiry: {
      ...inquiry,
      replies: [
        {
          id: '1',
          content: '문의해주신 내용을 확인했습니다. 빠른 시일 내에 처리하겠습니다.',
          author: '관리자',
          createdAt: '2024-01-15T11:00:00Z'
        }
      ]
    }
  };
};

// 1:1 문의 답변 (더미 데이터 사용)
export const replyToInquiry = async (inquiryId: string, replyData: { adminReply: string; status: string }): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const inquiryIndex = mockInquiries.findIndex(inq => inq.id === inquiryId);
  if (inquiryIndex !== -1) {
    mockInquiries[inquiryIndex].status = replyData.status;
    mockInquiries[inquiryIndex].replyCount += 1;
    return true;
  }
  
  return false;
};

// 1:1 문의 상태 업데이트 (더미 데이터 사용)
export const updateInquiryStatus = async (inquiryId: string, newStatus: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const inquiryIndex = mockInquiries.findIndex(inq => inq.id === inquiryId);
  if (inquiryIndex !== -1) {
    mockInquiries[inquiryIndex].status = newStatus;
    return true;
  }
  
  return false;
};

// 1:1 문의 우선순위 업데이트 (더미 데이터 사용)
export const updateInquiryPriority = async (inquiryId: string, newPriority: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const inquiryIndex = mockInquiries.findIndex(inq => inq.id === inquiryId);
  if (inquiryIndex !== -1) {
    mockInquiries[inquiryIndex].priority = newPriority;
    return true;
  }
  
  return false;
};

// 1:1 문의 할당 (더미 데이터 사용)
export const assignInquiry = async (inquiryId: string, adminId: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const inquiryIndex = mockInquiries.findIndex(inq => inq.id === inquiryId);
  if (inquiryIndex !== -1) {
    // 할당 로직 구현
    return true;
  }
  
  return false;
};

// 1:1 문의 통계 (더미 데이터 사용)
export const getInquiryStats = async () => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 200)); // 로딩 시뮬레이션
  
  const total = mockInquiries.length;
  const pending = mockInquiries.filter(inq => inq.status === 'pending').length;
  const inProgress = mockInquiries.filter(inq => inq.status === 'in_progress').length;
  const answered = mockInquiries.filter(inq => inq.status === 'answered').length;
  
  return {
    total,
    pending,
    inProgress,
    answered
  };
};
