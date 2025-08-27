import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { adminInfo, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout();
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <Logo>🍊</Logo>
          <Title>혼자옵서예</Title>
        </LogoSection>
        
        <UserSection>
          <UserInfo>
            <UserName>{adminInfo?.name || '관리자'}</UserName>
            <UserRole>{adminInfo?.role === 'super_admin' ? '최고 관리자' : '일반 관리자'}</UserRole>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: #fff;
  border-bottom: 2px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Logo = styled.div`
  font-size: 2rem;
`;

const Title = styled.h1`
  color: #ff6b35;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2d3436;
  font-size: 1rem;
`;

const UserRole = styled.div`
  color: #636e72;
  font-size: 0.8rem;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default Header;
