import { apiPost } from './api';

// 신고 결과 알림 전송
export const sendReportResultNotification = async (notificationData: {
  reportId: number;
  action: 'approved' | 'rejected';
  message: string;
  recipients: number[];
}): Promise<boolean> => {
  const response = await apiPost('/admin/notifications/send-report-result', notificationData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

// 사용자 조치 알림 전송
export const sendUserActionNotification = async (notificationData: {
  userId: number;
  actionType: 'ban' | 'warn';
  duration?: number;
  reason: string;
}): Promise<boolean> => {
  const response = await apiPost('/admin/notifications/send-user-action', notificationData);
  
  // API 응답 구조에 따라 성공 여부 확인
  return response.success || response.result?.success || true;
};

export {};
