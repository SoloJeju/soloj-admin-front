import { apiGet, apiPatch, apiPost } from './api';

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

// 신고된 콘텐츠 목록 조회
export const getContentReports = async (filters: ContentFilters = {}): Promise<ContentListResponse> => {
  const params: Record<string, any> = {};
  
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.search) params.search = filters.search;
  
  const response = await apiGet('/admin/content/reported', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.contents) {
    return response;
  } else {
    return {
      contents: [],
      pagination: {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        limit: filters.limit || 20
      }
    };
  }
};

// 콘텐츠 상태 업데이트
export const updateContentStatus = async (contentId: string, contentType: string, newStatus: string, reason?: string): Promise<boolean> => {
  const response = await apiPatch(`/admin/content/${contentType}/${contentId}/status`, {
    status: newStatus,
    reason: reason || '관리자에 의한 상태 변경'
  });
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 신고된 콘텐츠 조회 (getReportedContent의 별칭)
export const getReportedContent = getContentReports;

// 콘텐츠 액션 적용
export const applyContentAction = async (contentId: string, contentType: string, actionData: {
  actionType: 'hide' | 'show' | 'delete' | 'restore';
  reason: string;
}): Promise<boolean> => {
  const response = await apiPost(`/admin/content/${contentType}/${contentId}/actions`, actionData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 관리자용 게시글 상세 조회 (숨김/삭제된 콘텐츠도 조회 가능)
export const getPostDetail = async (postId: string) => {
  console.log('getPostDetail 호출됨, postId:', postId); // 디버깅용
  const response = await apiGet(`/admin/community/posts/${postId}`);
  console.log('getPostDetail API 응답:', response); // 디버깅용
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.post) {
    return response.post;
  } else {
    return null;
  }
};

// 관리자용 댓글 상세 조회 (댓글 정보와 게시글 맥락 포함)
export const getCommentDetail = async (commentId: string) => {
  console.log('getCommentDetail 호출됨, commentId:', commentId); // 디버깅용
  const response = await apiGet(`/admin/community/comments/${commentId}`);
  console.log('getCommentDetail API 응답:', response); // 디버깅용
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.comment) {
    return response.comment;
  } else {
    return null;
  }
};
