import React, { useState } from 'react';
import styled from 'styled-components';
import { adminLogin } from '../services/authService';

interface LoginProps {
  onLoginSuccess: (token: string, adminInfo: any) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await adminLogin({ username: email, password });
      
      if (data && data.result && data.result.accessToken) {
        // JWT 토큰에서 정보 추출
        const token = data.result.accessToken;
        const pureToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;

        // ✅ 토큰 형식 확인 추가
        const parts = pureToken.split('.');
        if (parts.length !== 3) {
          setError('서버로부터 잘못된 토큰 형식이 반환되었습니다.');
          return;
        }

        // ✅ JWT 파싱
        const tokenInfo = JSON.parse(atob(parts[1]));
                // 관리자 정보 구성
        const adminInfo = {
          id: tokenInfo.userId?.toString() || '',
          username: email,
          name: tokenInfo.role === 'ADMIN' ? '관리자' : '사용자'
        };
        
        // AuthContext를 통해 로그인 처리
        const loginSuccess = await onLoginSuccess(token, adminInfo);
        
        if (loginSuccess) {
          // 로그인 성공 시 대시보드로 이동
          window.location.href = '/admin';
        } else {
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      } else {
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
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
