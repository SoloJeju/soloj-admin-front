import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { getDashboardData } from '../services/dashboardService';

interface DashboardStatsData {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  bannedUsers: number;
  restrictedUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
  repliedInquiries: number;
}

interface DashboardStatsProps {
  onTabChange?: (tab: string) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ onTabChange }) => {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    bannedUsers: 0,
    restrictedUsers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    repliedInquiries: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API 호출 상태 추적
  const isFetchingRef = useRef(false);
  


  const fetchDashboardData = useCallback(async () => {
    // 이미 API 호출 중이면 중단
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const data = await getDashboardData();
      
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
      console.error('대시보드 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // 이미 데이터를 가져왔거나 가져오는 중이면 중단
    if (isFetchingRef.current) {
      return;
    }
    
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = useCallback((action: string) => {
    if (onTabChange) {
      switch (action) {
        case 'report-list':
          onTabChange('report-list');
          break;
        case 'user-management':
          onTabChange('user-management');
          break;
        case 'content-management':
          onTabChange('content-management');
          break;
        case 'inquiry-management':
          onTabChange('inquiry-management');
          break;
        default:
          break;
      }
    }
  }, [onTabChange]);

  if (loading) {
    return (
      <StatsContainer>
        <LoadingMessage>
          <LoadingIcon>🍊</LoadingIcon>
          데이터를 불러오는 중...
        </LoadingMessage>
      </StatsContainer>
    );
  }

  if (error) {
    return (
      <StatsContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={() => window.location.reload()}>
          다시 시도
        </RetryButton>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <WelcomeSection>
        <WelcomeIcon>🏝️</WelcomeIcon>
        <WelcomeText>
          <WelcomeTitle>제주 동행 여행을 안전하게!</WelcomeTitle>
          <WelcomeSubtitle>혼자옵서예 신고 시스템 현황을 한눈에 확인하세요</WelcomeSubtitle>
        </WelcomeText>
      </WelcomeSection>
      
      <StatsGrid>
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatNumber>{stats.totalReports}</StatNumber>
          <StatLabel>총 신고 건수</StatLabel>
          <StatDescription>전체 접수된 신고</StatDescription>
        </StatCard>
        
        <StatCard $warning>
          <StatIcon>⏳</StatIcon>
          <StatNumber>{stats.pendingReports}</StatNumber>
          <StatLabel>대기 중인 신고</StatLabel>
          <StatDescription>검토 대기 중</StatDescription>
        </StatCard>
        
        <StatCard $success>
          <StatIcon>✅</StatIcon>
          <StatNumber>{stats.resolvedReports}</StatNumber>
          <StatLabel>처리 완료</StatLabel>
          <StatDescription>검토 완료됨</StatDescription>
        </StatCard>
        
        <StatCard $danger>
          <StatIcon>🚫</StatIcon>
          <StatNumber>{stats.bannedUsers}</StatNumber>
          <StatLabel>정지된 사용자</StatLabel>
          <StatDescription>계정 정지</StatDescription>
        </StatCard>
        
        <StatCard $info>
          <StatIcon>⚠️</StatIcon>
          <StatNumber>{stats.restrictedUsers}</StatNumber>
          <StatLabel>제한된 사용자</StatLabel>
          <StatDescription>일부 기능 제한</StatDescription>
        </StatCard>
        
        <StatCard $primary>
          <StatIcon>📧</StatIcon>
          <StatNumber>{stats.totalInquiries}</StatNumber>
          <StatLabel>총 문의 건수</StatLabel>
          <StatDescription>전체 접수된 문의</StatDescription>
        </StatCard>
        
        <StatCard $secondary>
          <StatIcon>⏳</StatIcon>
          <StatNumber>{stats.pendingInquiries}</StatNumber>
          <StatLabel>대기 중인 문의</StatLabel>
          <StatDescription>답변 대기 중</StatDescription>
        </StatCard>
        
        <StatCard $success>
          <StatIcon>✅</StatIcon>
          <StatNumber>{stats.repliedInquiries}</StatNumber>
          <StatLabel>답변 완료</StatLabel>
          <StatDescription>답변 완료됨</StatDescription>
        </StatCard>
      </StatsGrid>

      <QuickActionsSection>
        <SectionTitle>
          <SectionIcon>⚡</SectionIcon>
          빠른 작업
        </SectionTitle>
        <ActionGrid>
          <ActionCard onClick={() => handleQuickAction('report-list')}>
            <ActionIcon>🔍</ActionIcon>
            <ActionTitle>신고 목록 관리</ActionTitle>
            <ActionDescription>접수된 신고들을 확인하고 처리하세요</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={() => handleQuickAction('user-management')}>
            <ActionIcon>👥</ActionIcon>
            <ActionTitle>사용자 관리</ActionTitle>
            <ActionDescription>신고된 사용자들의 상태를 관리하세요</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={() => handleQuickAction('content-management')}>
            <ActionIcon>📝</ActionIcon>
            <ActionTitle>콘텐츠 관리</ActionTitle>
            <ActionDescription>신고된 게시글과 댓글을 관리하세요</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={() => handleQuickAction('inquiry-management')}>
            <ActionIcon>📧</ActionIcon>
            <ActionTitle>문의 관리</ActionTitle>
            <ActionDescription>1:1 문의를 확인하고 답변하세요</ActionDescription>
          </ActionCard>
        </ActionGrid>
      </QuickActionsSection>

      <SystemNotificationsSection>
        <SectionTitle>
          <SectionIcon>🔔</SectionIcon>
          시스템 알림
        </SectionTitle>
        <NotificationList>
          <NotificationItem $type="info">
            <NotificationIcon>ℹ️</NotificationIcon>
            <NotificationContent>
              <NotificationText>
                <strong>시스템 정상 운영 중</strong>
              </NotificationText>
              <NotificationTime>
                모든 서비스가 정상적으로 작동하고 있습니다
              </NotificationTime>
            </NotificationContent>
          </NotificationItem>
          
          <NotificationItem $type="warning">
            <NotificationIcon>⚠️</NotificationIcon>
            <NotificationContent>
              <NotificationText>
                <strong>신고 대기 건수 알림</strong>
              </NotificationText>
              <NotificationTime>
                {stats.pendingReports}건의 신고가 검토 대기 중입니다
              </NotificationTime>
            </NotificationContent>
          </NotificationItem>
          
          <NotificationItem $type="success">
            <NotificationIcon>✅</NotificationIcon>
            <NotificationContent>
              <NotificationText>
                <strong>데이터베이스 연결 상태</strong>
              </NotificationText>
              <NotificationTime>
                안정적으로 연결되어 있습니다
              </NotificationTime>
            </NotificationContent>
          </NotificationItem>
        </NotificationList>
      </SystemNotificationsSection>
    </StatsContainer>
  );
};

const StatsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
  border-radius: 25px;
  padding: 40px;
  margin-bottom: 40px;
  text-align: center;
  border: 2px solid #ff6b35;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    margin-bottom: 30px;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 20px;
    margin-bottom: 25px;
    border-radius: 18px;
  }
  
  @media (max-width: 360px) {
    padding: 20px 15px;
    margin-bottom: 20px;
    border-radius: 15px;
  }
`;

const WelcomeIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const WelcomeText = styled.div``;

const WelcomeTitle = styled.h1`
  color: #ff6b35;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(255, 107, 53, 0.2);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 360px) {
    font-size: 1.3rem;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const StatCard = styled.div<{ $warning?: boolean; $success?: boolean; $danger?: boolean; $info?: boolean; $highlight?: boolean; $primary?: boolean; $secondary?: boolean }>`
  background: white;
  border-radius: 25px;
  padding: 35px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 20px;
    border-radius: 18px;
  }

  ${props => {
    if (props.$warning) return `
      border-color: #ffc107;
      background: linear-gradient(135deg, #fffbf0 0%, #fff3cd 100%);
    `;
    if (props.$success) return `
      border-color: #28a745;
      background: linear-gradient(135deg, #f0fff4 0%, #d4edda 100%);
    `;
    if (props.$danger) return `
      border-color: #dc3545;
      background: linear-gradient(135deg, #fff5f5 0%, #f8d7da 100%);
    `;
    if (props.$info) return `
      border-color: #17a2b8;
      background: linear-gradient(135deg, #f0f9ff 0%, #d1ecf1 100%);
    `;
    if (props.$highlight) return `
      border-color: #ff6b35;
      background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
    `;
    if (props.$primary) return `
      border-color: #007bff;
      background: linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%);
    `;
    if (props.$secondary) return `
      border-color: #6c757d;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    `;
    return `
      border-color: #e9ecef;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    `;
  }}

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      if (props.$warning) return '#ffc107';
      if (props.$success) return '#28a745';
      if (props.$danger) return '#dc3545';
      if (props.$info) return '#17a2b8';
      if (props.$highlight) return '#ff6b35';
      if (props.$primary) return '#007bff';
      if (props.$secondary) return '#6c757d';
      return '#e9ecef';
    }};
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15));
  animation: gentleFloat 3s ease-in-out infinite;
  
  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-5px) rotate(2deg); }
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.2rem;
    margin-bottom: 12px;
  }
`;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  color: #2d3436;
  margin-bottom: 12px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 8px;
  }
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8px;
`;

const StatDescription = styled.div`
  font-size: 0.9rem;
  color: #636e72;
  font-weight: 500;
`;

const QuickActionsSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #2d3436;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 25px 0;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 25px;
  padding: 35px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 3px solid #e9ecef;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #ff6b35;
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 20px;
    border-radius: 18px;
  }
`;

const ActionIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 25px;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15));
  animation: gentlePulse 2s ease-in-out infinite;
  
  @keyframes gentlePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
`;

const ActionTitle = styled.h3`
  color: #2d3436;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 15px 0;
`;

const ActionDescription = styled.p`
  color: #636e72;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
`;

const SystemNotificationsSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificationItem = styled.div<{ $type: 'info' | 'warning' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: ${props => {
    switch (props.$type) {
      case 'info': return '#e3f2fd';
      case 'warning': return '#fff3e0';
      case 'success': return '#e8f5e8';
      default: return '#f8f9fa';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'info': return '#2196f3';
      case 'warning': return '#ff9800';
      case 'success': return '#4caf50';
      default: return '#6c757d';
    }
  }};
  border-radius: 15px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const NotificationIcon = styled.div`
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationText = styled.div`
  color: #2d3436;
  font-weight: 600;
  margin-bottom: 5px;
`;

const NotificationTime = styled.div`
  color: #636e72;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 1.3rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  font-size: 1.2rem;
  color: #e74c3c;
  background: #fdf2f2;
  border-radius: 15px;
  margin-bottom: 20px;
  border: 2px solid #f8d7da;
`;

const RetryButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #e55a2b 0%, #e0851a 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
  }
`;

export default DashboardStats;
