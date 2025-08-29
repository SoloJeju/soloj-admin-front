import { apiGet, apiPut } from './api';

export interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  content: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  adminReplyAt?: string;
  adminId?: string;
  adminName?: string;
  attachments?: string[];
  imageUrl?: string | null;
  imageName?: string | null;
}

export interface InquirySummary {
  id: string;
  title: string;
  category: string;
  categoryName?: string;
  status: string;
  statusName?: string;
  priority: string;
  priorityName?: string;
  userId?: number;
  userName: string;
  userEmail?: string;
  assignedAdminId?: number;
  assignedAdminName?: string;
  createdDate: string;
  repliedAt?: string;
  hasAttachments?: boolean;
  closed?: boolean;
  replied?: boolean;
  // 기존 호환성을 위한 필드들
  author?: string;
  createdAt?: string;
  content?: string;
  replyCount?: number;
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

// 1:1 문의 목록 조회
export const getInquiries = async (filters: InquiryFilters = {}): Promise<InquiryListResponse> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.size = filters.limit; // API 명세에 따라 size로 변경
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/inquiries', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result && response.result.inquiries) {
    // API 명세에 맞는 응답 구조
    return {
      inquiries: response.result.inquiries,
      pagination: {
        totalPages: response.result.pagination?.totalPages || 1,
        totalItems: response.result.pagination?.totalElements || 0,
        currentPage: response.result.pagination?.currentPage || 1,
        limit: response.result.pagination?.size || filters.limit || 20
      }
    };
  } else if (response.inquiries) {
    return response;
  } else {
    return {
      inquiries: [],
      pagination: {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        limit: filters.limit || 20
      }
    };
  }
};

// 1:1 문의 상세 조회
export const getInquiryDetail = async (inquiryId: string) => {
  const response = await apiGet(`/admin/inquiries/${inquiryId}`);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.inquiry) {
    return response.inquiry;
  } else {
    return null;
  }
};

// 1:1 문의 답변
export const replyToInquiry = async (inquiryId: string, replyData: { 
  reply: string; 
  closeInquiry?: boolean;
}): Promise<boolean> => {
  const response = await apiPut(`/admin/inquiries/${inquiryId}/reply`, replyData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 1:1 문의 상태 업데이트
export const updateInquiryStatus = async (inquiryId: string, statusData: {
  status: string;
  reason?: string;
}): Promise<boolean> => {
  const response = await apiPut(`/admin/inquiries/${inquiryId}/status`, statusData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 1:1 문의 우선순위 업데이트
export const updateInquiryPriority = async (inquiryId: string, priorityData: {
  priority: string;
  reason?: string;
}): Promise<boolean> => {
  const response = await apiPut(`/admin/inquiries/${inquiryId}/priority`, priorityData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 1:1 문의 할당
export const assignInquiry = async (inquiryId: string, assignData: {
  adminId: number;
  note?: string;
}): Promise<boolean> => {
  const response = await apiPut(`/admin/inquiries/${inquiryId}/assign`, assignData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 1:1 문의 통계
export const getInquiryStats = async () => {
  const response = await apiGet('/admin/inquiries/stats');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.stats) {
    return response.stats;
  } else {
    return {
      totalInquiries: 0,
      pendingInquiries: 0,
      inProgressInquiries: 0,
      answeredInquiries: 0,
      closedInquiries: 0
    };
  }
};

// 문의 상태 목록 조회
export const getInquiryStatuses = async () => {
  const response = await apiGet('/admin/inquiries/statuses');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.statuses) {
    return response.statuses;
  } else {
    return [];
  }
};

// 문의 우선순위 목록 조회
export const getInquiryPriorities = async () => {
  const response = await apiGet('/admin/inquiries/priorities');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.priorities) {
    return response.priorities;
  } else {
    return [];
  }
};

// 문의 카테고리 목록 조회
export const getInquiryCategories = async () => {
  const response = await apiGet('/admin/inquiries/categories');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.categories) {
    return response.categories;
  } else {
    return [];
  }
};
