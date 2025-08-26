import { apiGet } from './api';

// 신고 통계 조회
export const getReportStatistics = async (params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await apiGet('/admin/statistics/reports', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.statistics) {
    return response.statistics;
  } else {
    return {};
  }
};

// 사용자별 신고 통계 조회
export const getUserStatistics = async (params?: {
  userId?: number;
  period?: string;
}) => {
  const response = await apiGet('/admin/statistics/users', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.statistics) {
    return response.statistics;
  } else {
    return {};
  }
};

// 콘텐츠 신고 통계 조회
export const getContentStatistics = async (params?: {
  contentType?: string;
  period?: string;
}) => {
  const response = await apiGet('/admin/statistics/content', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.statistics) {
    return response.statistics;
  } else {
    return {};
  }
};
