import { apiGet, apiPost, apiPut, apiPatch } from './api';

// 시스템 설정 관련
export const getSystemSettings = async () => {
  const response = await apiGet('/admin/settings/system');
  return response.result || response;
};

export const updateSystemSettings = async (settings: any) => {
  const response = await apiPut('/admin/settings/system', settings);
  return response.success || response.result?.success || true;
};

// 신고 사유 카테고리 관련
export const getReportReasons = async () => {
  const response = await apiGet('/admin/settings/report-reasons');
  return response.result || response;
};

export const updateReportReasons = async (reasons: any) => {
  const response = await apiPut('/admin/settings/report-reasons', reasons);
  return response.success || response.result?.success || true;
};

// 콘텐츠 유형 설정 관련
export const getContentTypes = async () => {
  const response = await apiGet('/admin/settings/content-types');
  return response.result || response;
};

export const updateContentTypes = async (types: any) => {
  const response = await apiPut('/admin/settings/content-types', types);
  return response.success || response.result?.success || true;
};

// 검색 관련
export const searchAdmin = async (query: string) => {
  const response = await apiGet('/admin/search', { q: query });
  return response.result || response;
};

export const advancedSearch = async (searchParams: any) => {
  const response = await apiPost('/admin/search/advanced', searchParams);
  return response.result || response;
};

// 통계 관련
export const getUserStatistics = async () => {
  const response = await apiGet('/admin/statistics/users');
  return response.result || response;
};

export const getReportStatistics = async () => {
  const response = await apiGet('/admin/statistics/reports');
  return response.result || response;
};

export const getContentStatistics = async () => {
  const response = await apiGet('/admin/statistics/content');
  return response.result || response;
};

// 권한 관련
export const getAdminPermissions = async () => {
  const response = await apiGet('/admin/auth/permissions');
  return response.result || response;
};

export const getAdminActivityLogs = async () => {
  const response = await apiGet('/admin/auth/activity-logs');
  return response.result || response;
};

// 자동 조치 관련
export const getAutoActionRules = async () => {
  const response = await apiGet('/admin/auto-actions/rules');
  return response.result || response;
};

export const updateAutoActionRules = async (rules: any) => {
  const response = await apiPut('/admin/auto-actions/rules', rules);
  return response.success || response.result?.success || true;
};

export const getAutoActionHistory = async () => {
  const response = await apiGet('/admin/auto-actions/history');
  return response.result || response;
};

// 알림 관련
export const sendReportResultNotification = async (notificationData: any) => {
  const response = await apiPost('/admin/notifications/send-report-result', notificationData);
  return response.success || response.result?.success || true;
};

export const sendUserActionNotification = async (notificationData: any) => {
  const response = await apiPost('/admin/notifications/send-user-action', notificationData);
  return response.success || response.result?.success || true;
};
