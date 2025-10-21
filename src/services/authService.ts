import { apiPost } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

// 관리자 로그인
export const adminLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiPost('/admin/auth/login', credentials);
};

// 로그아웃 (필요시)
export const adminLogout = async (): Promise<void> => {
  // 서버에 로그아웃 요청이 필요한 경우
  // return apiPost('/admin/auth/logout');
  
  // 현재는 클라이언트에서만 처리
  return Promise.resolve();
};
