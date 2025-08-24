// JWT 토큰 디코딩 유틸리티

export interface DecodedToken {
  sub: string;
  userId: number;
  role: string;
  exp: number;
}

export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    // JWT 토큰의 payload 부분만 추출 (두 번째 부분)
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // base64 디코딩
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded) return true;
  
  // exp는 초 단위, Date.now()는 밀리초 단위
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getTokenInfo = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    userId: decoded.userId,
    role: decoded.role,
    expiresAt: new Date(decoded.exp * 1000)
  };
};
