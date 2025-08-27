import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DashboardStats from './DashboardStats';
import UserReportList from './UserReportList';
import ContentReportList from './ContentReportList';
import ReportReview from './ReportReview';
import InquiryList from './InquiryList';
import SystemStatus from './SystemStatus';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // URL에서 탭 정보를 읽어오기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['dashboard', 'user-management', 'content-management', 'report-list', 'inquiry-management', 'system-status'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({ tab }, '', url.toString());
  };

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        // URL에서 탭 정보 읽기
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl && ['dashboard', 'user-management', 'content-management', 'report-list', 'inquiry-management', 'system-status'].includes(tabFromUrl)) {
          setActiveTab(tabFromUrl);
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats onTabChange={handleTabChange} />;
      case 'user-management':
        return <UserReportList />;
      case 'content-management':
        return <ContentReportList />;
      case 'report-list':
        return <ReportReview />;
      case 'inquiry-management':
        return <InquiryList />;
      case 'system-status':
        return <SystemStatus />;
      default:
        return <DashboardStats onTabChange={handleTabChange} />;
    }
  };

  return (
    <DashboardContainer>
      <Header id="dashboard-header">
        <LogoSection>
          <LogoIcon>🍊</LogoIcon>
          <LogoText>
            <ServiceName>혼자옵서예</ServiceName>
            <ServiceSubtitle>제주 동행 여행 관리자 대시보드</ServiceSubtitle>
          </LogoText>
        </LogoSection>
      </Header>

      <TabContainer>
        <TabButton 
          $active={activeTab === 'dashboard'} 
          onClick={() => handleTabChange('dashboard')}
        >
          <TabIcon>📊</TabIcon>
          <TabLabel>대시보드</TabLabel>
        </TabButton>
        
        <TabButton 
          $active={activeTab === 'user-management'} 
          onClick={() => handleTabChange('user-management')}
        >
          <TabIcon>👥</TabIcon>
          <TabLabel>신고된 사용자 관리</TabLabel>
        </TabButton>
        
        <TabButton 
          $active={activeTab === 'content-management'} 
          onClick={() => handleTabChange('content-management')}
        >
          <TabIcon>📝</TabIcon>
          <TabLabel>신고된 콘텐츠 관리</TabLabel>
        </TabButton>
        
        <TabButton 
          $active={activeTab === 'report-list'} 
          onClick={() => handleTabChange('report-list')}
        >
          <TabIcon>🚨</TabIcon>
          <TabLabel>신고 목록 관리</TabLabel>
        </TabButton>

        <TabButton 
          $active={activeTab === 'inquiry-management'} 
          onClick={() => handleTabChange('inquiry-management')}
        >
          <TabIcon>📝</TabIcon>
          <TabLabel>1:1 문의 관리</TabLabel>
        </TabButton>
        
        <TabButton 
          $active={activeTab === 'system-status'} 
          onClick={() => handleTabChange('system-status')}
        >
          <TabIcon>⚙️</TabIcon>
          <TabLabel>시스템 상태</TabLabel>
        </TabButton>
      </TabContainer>

      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  padding: 30px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    padding: 20px 20px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    padding: 15px 15px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  z-index: 1;
  text-align: center;
`;

const LogoIcon = styled.div`
  font-size: 3.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  animation: gentleBounce 3s ease-in-out infinite;
  
  @keyframes gentleBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ServiceName = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const ServiceSubtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  padding: 20px 20px 0;
  gap: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
  overflow-y: hidden;
  justify-content: center; /* PC에서 중앙 정렬 */
  
  /* 부드러운 스크롤 */
  scroll-behavior: smooth;
  
  /* 터치 스크롤 개선 */
  -webkit-overflow-scrolling: touch;
  
  /* 모바일에서 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  /* 모바일에서 줄바꿈 방지 */
  flex-wrap: nowrap;
  
  @media (max-width: 768px) {
    padding: 15px 15px 0;
    gap: 15px;
    justify-content: flex-start; /* 모바일에서는 왼쪽 정렬 */
    scroll-snap-type: x mandatory; /* 스크롤 스냅 추가 */
    flex-wrap: nowrap; /* 줄바꿈 방지 */
    min-width: 100%; /* 최소 너비 설정 */
  }
  
  @media (max-width: 480px) {
    padding: 12px 12px 0;
    gap: 12px;
    justify-content: flex-start; /* 모바일에서는 왼쪽 정렬 */
    scroll-snap-type: x mandatory; /* 스크롤 스냅 추가 */
    flex-wrap: nowrap; /* 줄바꿈 방지 */
    min-width: 100%; /* 최소 너비 설정 */
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 20px;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  border-radius: 20px 20px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 100px;
  flex-shrink: 0;
  
  /* PC에서 더 크게 */
  @media (min-width: 769px) {
    padding: 25px 30px;
    min-width: 140px;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    padding: 20px 20px;
    min-width: 120px;
    gap: 10px;
    flex: 0 0 auto; /* 줄바꿈 방지, 고정 크기 */
    scroll-snap-align: start; /* 스크롤 스냅 정렬 */
  }
  
  @media (max-width: 480px) {
    padding: 18px 16px;
    min-width: 100px;
    gap: 8px;
    flex: 0 0 auto; /* 줄바꿈 방지, 고정 크기 */
    scroll-snap-align: start; /* 스크롤 스냅 정렬 */
  }

  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #e55a2b 0%, #e0851a 100%)' 
      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    };
    transform: translateY(-2px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$active ? 'white' : 'transparent'};
    border-radius: 2px;
  }
`;

const TabIcon = styled.span<{ color?: string }>`
  font-size: 1.5rem;
  filter: ${props => props.color === 'white' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'};
  
  /* PC에서 더 크게 */
  @media (min-width: 769px) {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const TabLabel = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
  
  /* PC에서 더 크게 */
  @media (min-width: 769px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    line-height: 1.3;
  }
`;

const ContentContainer = styled.div`
  padding: 40px;
  min-height: calc(100vh - 200px);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

export default AdminDashboard;
