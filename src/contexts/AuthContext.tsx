import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { isTokenExpired } from '../utils/jwtUtils';
import { jwtDecode } from 'jwt-decode';

interface AdminInfo {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  adminInfo: AdminInfo | null;
  login: (token: string, adminInfo: AdminInfo) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 확인
  const checkAuth = useCallback(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdminInfo = localStorage.getItem('adminInfo');

    if (storedToken && storedAdminInfo) {
      try {
        // JWT 토큰 만료 확인
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          // 토큰 만료됨
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          setIsAuthenticated(false);
          setToken(null);
          setAdminInfo(null);
          return;
        }

        // 유효한 토큰이 있음
        setIsAuthenticated(true);
        setToken(storedToken);
        
        try {
          const parsedAdminInfo = JSON.parse(storedAdminInfo);
          setAdminInfo(parsedAdminInfo);
        } catch (parseError) {
          // JSON 파싱 실패 시 기본값 설정
          setAdminInfo({
            id: '',
            name: '관리자',
            role: 'ADMIN'
          });
        }
      } catch (error) {
        // JWT 디코딩 실패 시 로그아웃
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        setIsAuthenticated(false);
        setToken(null);
        setAdminInfo(null);
      }
    } else {
      // 저장된 토큰/정보 없음
      setIsAuthenticated(false);
      setToken(null);
      setAdminInfo(null);
    }
  }, []);

  // 로그인
  const login = useCallback(async (newToken: string, newAdminInfo: AdminInfo) => {
    try {
      // 토큰과 관리자 정보 저장
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminInfo', JSON.stringify(newAdminInfo));
      
      // 상태 업데이트
      setToken(newToken);
      setAdminInfo(newAdminInfo);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    setToken(null);
    setAdminInfo(null);
  }, []);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
    setLoading(false);
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    token,
    adminInfo,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
