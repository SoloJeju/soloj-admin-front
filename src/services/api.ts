// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 공통 헤더
const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 토큰 만료 시 자동 로그아웃
const handleTokenExpiry = () => {
  console.log('🚨 토큰 만료로 인한 자동 로그아웃 실행');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
  // window.location.reload() 제거 - React 상태로 처리
};

// 공통 API 호출 함수
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  // API_BASE_URL에 /api가 없으면 자동으로 추가
  let baseUrl = API_BASE_URL;
  if (!baseUrl.includes('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  
  const url = `${baseUrl}${endpoint}`;
  
  // 디버깅용 로그
  console.log('API Call URL:', url);
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('baseUrl (수정됨):', baseUrl);
  console.log('endpoint:', endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 로그인 요청 시에는 401 에러를 무시 (토큰이 없어서 발생하는 정상적인 상황)
      if (response.status === 401 && endpoint === '/auth/login') {
        console.log('🔐 로그인 요청에서 401 에러 발생 (정상적인 상황)');
        throw new Error(errorData.message || `로그인 실패: ${response.status}`);
      }
      
      // 토큰 만료 시 자동 로그아웃 (로그인 요청이 아닌 경우에만)
      if (response.status === 401) {
        console.log('🚨 토큰 만료로 인한 401 에러, 자동 로그아웃 실행');
        handleTokenExpiry();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// GET 요청
export const apiGet = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return apiCall(url.pathname + url.search);
};

// POST 요청
export const apiPost = (endpoint: string, data?: any) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT 요청
export const apiPut = (endpoint: string, data?: any) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// PATCH 요청
export const apiPatch = (endpoint: string, data?: any) => {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// DELETE 요청
export const apiDelete = (endpoint: string) => {
  return apiCall(endpoint, {
    method: 'DELETE',
  });
};
