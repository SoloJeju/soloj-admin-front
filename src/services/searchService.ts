import { apiGet, apiPost } from './api';

// 통합 검색
export const searchAdmin = async (params: {
  query: string;
  type?: string;
  limit?: number;
}) => {
  const response = await apiGet('/admin/search', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.searchResults) {
    return response.searchResults;
  } else {
    return [];
  }
};

// 고급 검색
export const advancedSearch = async (searchParams: {
  filters: {
    dateRange?: { start: string; end: string };
    status?: string[];
    reason?: string[];
    contentType?: string[];
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await apiPost('/admin/search/advanced', searchParams);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.searchResults) {
    return response.searchResults;
  } else {
    return [];
  }
};
