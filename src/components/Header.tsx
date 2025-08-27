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

  const handleTitleClick = () => {
    // 대시보드 탭으로 이동
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'dashboard');
    window.history.pushState({ tab: 'dashboard' }, '', url.toString());
    
    // 대시보드 헤더 섹션으로 스크롤
    const dashboardHeader = document.getElementById('dashboard-header');
    if (dashboardHeader) {
      dashboardHeader.scrollIntoView({ behavior: 'smooth' });
    }
    
    // AdminDashboard의 탭 변경을 트리거하기 위해 popstate 이벤트 발생
    window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'dashboard' } }));
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <Logo onClick={handleTitleClick}>🍊</Logo>
          <Title onClick={handleTitleClick}>혼자옵서예</Title>
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
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1);
  }
`;

const Title = styled.h1`
  color: #ff6b35;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    color: #e55a2b;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1);
  }
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
