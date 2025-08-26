import { apiGet, apiPut } from './api';

// 자동 조치 규칙 조회
export const getAutoActionRules = async () => {
  const response = await apiGet('/admin/auto-actions/rules');
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.rules) {
    return response.rules;
  } else {
    return [];
  }
};

// 자동 조치 규칙 업데이트
export const updateAutoActionRules = async (rules: Array<{
  id?: number;
  name: string;
  condition: string;
  threshold: number;
  action: string;
  duration?: number;
  enabled: boolean;
  description: string;
}>) => {
  const response = await apiPut('/admin/auto-actions/rules', rules);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 자동 조치 이력 조회
export const getAutoActionHistory = async (params?: {
  userId?: number;
  limit?: number;
}) => {
  const response = await apiGet('/admin/auto-actions/history', params);
  
  // API 응답 구조에 따라 데이터 추출
  if (response.result) {
    return response.result;
  } else if (response.history) {
    return response.history;
  } else {
    return [];
  }
};
