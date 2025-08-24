import React, { useState } from 'react';
import styled from 'styled-components';
import { adminLogin, LoginRequest } from '../services/authService';
import { decodeJWT, getTokenInfo } from '../utils/jwtUtils';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Login - 폼 제출 시작:', { email, password: '***' });
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Login - API 호출 시작');
      
      // API 서비스 사용
      const data = await adminLogin({ email, password });
      
      // 응답 데이터 구조 확인 및 안전한 처리
      console.log('✅ Login - API 응답 받음:', data); // 디버깅용
      
      if (!data || !data.isSuccess || !data.result?.accessToken) {
        throw new Error(data?.message || '로그인 응답이 올바르지 않습니다.');
      }
      
      console.log('🔑 Login - JWT 토큰 파싱 시작');
      
      // JWT 토큰에서 사용자 정보 추출
      const tokenInfo = getTokenInfo(data.result.accessToken);
      if (!tokenInfo) {
        throw new Error('토큰 정보를 읽을 수 없습니다.');
      }
      
      console.log('👤 Login - 토큰 정보 추출됨:', tokenInfo);
      
      // 관리자 정보 구성
      const adminInfo = {
        id: tokenInfo.userId.toString(),
        name: `관리자 ${tokenInfo.userId}`,
        role: tokenInfo.role.toLowerCase()
      };
      
      console.log('💾 Login - localStorage에 저장 시작');
      
      // 토큰들을 localStorage에 저장
      localStorage.setItem('adminToken', data.result.accessToken);
      localStorage.setItem('refreshToken', data.result.refreshToken);
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
      
      console.log('✅ Login - localStorage 저장 완료');
      console.log('🎯 Login - onLoginSuccess 콜백 호출 시작');

      // 로그인 성공 콜백 호출
      onLoginSuccess(data.result.accessToken);
      
      console.log('🎉 Login - 로그인 프로세스 완료');
      
    } catch (err) {
      console.error('❌ Login - 에러 발생:', err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 개발용 임시 로그인 (실제 배포 시 제거)
  const handleDevLogin = () => {
    const mockToken = 'dev-token-' + Date.now();
    localStorage.setItem('adminToken', mockToken);
    localStorage.setItem('adminInfo', JSON.stringify({
      id: 'admin1',
      name: '개발자',
      role: 'super_admin'
    }));
    onLoginSuccess(mockToken);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoSection>
          <Logo>🍊</Logo>
          <Title>혼자옵서예</Title>
          <Subtitle>관리자 신고관리시스템</Subtitle>
        </LogoSection>

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>이메일</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="관리자 이메일을 입력하세요"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>비밀번호</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
            />
          </FormGroup>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          <LoginButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </LoginForm>

        <DevLoginSection>
          <DevLoginButton type="button" onClick={handleDevLogin}>
            🚀 개발자 모드 (임시 로그인)
          </DevLoginButton>
          <DevNote>
            * 개발 중인 기능입니다. 실제 배포 시 제거하세요.
          </DevNote>
        </DevLoginSection>

        <Footer>
          <FooterText>
            © 2024 혼자옵서예. 관리자 전용입니다.
          </FooterText>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const LogoSection = styled.div`
  margin-bottom: 40px;
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #2d3436;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 10px 0;
`;

const Subtitle = styled.p`
  color: #636e72;
  font-size: 1rem;
  margin: 0;
`;

const LoginForm = styled.form`
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const FormLabel = styled.label`
  display: block;
  color: #2d3436;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fdf2f2;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #e74c3c;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #e55a2b;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DevLoginSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px dashed #ff6b35;
`;

const DevLoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    background: #138496;
    transform: translateY(-2px);
  }
`;

const DevNote = styled.p`
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  font-style: italic;
`;

const Footer = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
`;

const FooterText = styled.p`
  color: #95a5a6;
  font-size: 0.8rem;
  margin: 0;
`;

export default Login;
