import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isTokenExpired } from '../utils/jwtUtils';

interface AdminInfo {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  adminInfo: AdminInfo | null;
  login: (token: string) => void;
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

  useEffect(() => {
    // 페이지 로드 시 토큰 확인
    const checkAuth = () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedAdminInfo = localStorage.getItem('adminInfo');

      console.log('🔍 AuthContext - checkAuth 실행:', { storedToken: !!storedToken, storedAdminInfo: !!storedAdminInfo });

      if (storedToken && storedAdminInfo) {
        try {
          // 토큰 만료 확인
          if (isTokenExpired(storedToken)) {
            console.log('❌ AuthContext - 토큰 만료됨, 자동 로그아웃');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            setToken(null);
            setAdminInfo(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          const parsedAdminInfo = JSON.parse(storedAdminInfo);
          setToken(storedToken);
          setAdminInfo(parsedAdminInfo);
          setIsAuthenticated(true);
          console.log('✅ AuthContext - 인증 상태 설정됨:', { isAuthenticated: true, token: storedToken, adminInfo: parsedAdminInfo });
        } catch (error) {
          console.error('❌ AuthContext - admin info 파싱 실패:', error);
          // 잘못된 데이터가 있으면 제거
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
        }
      } else {
        console.log('❌ AuthContext - 저장된 토큰/정보 없음');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string) => {
    console.log('🔐 AuthContext - login 함수 호출됨:', { newToken: !!newToken });
    
    setToken(newToken);
    setIsAuthenticated(true);
    
    // adminInfo는 이미 localStorage에 저장되어 있음
    const storedAdminInfo = localStorage.getItem('adminInfo');
    if (storedAdminInfo) {
      try {
        const parsedAdminInfo = JSON.parse(storedAdminInfo);
        setAdminInfo(parsedAdminInfo);
        console.log('✅ AuthContext - 로그인 성공, 상태 업데이트됨:', { 
          isAuthenticated: true, 
          token: newToken, 
          adminInfo: parsedAdminInfo 
        });
      } catch (error) {
        console.error('❌ AuthContext - admin info 파싱 실패:', error);
      }
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext - logout 함수 호출됨');
    
    setToken(null);
    setAdminInfo(null);
    setIsAuthenticated(false);
    
    // localStorage에서 토큰과 관리자 정보 제거
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  };

  // 상태 변화 추적
  useEffect(() => {
    console.log('🔄 AuthContext - 상태 변화:', { isAuthenticated, token: !!token, adminInfo: !!adminInfo, loading });
  }, [isAuthenticated, token, adminInfo, loading]);

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
