import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getDashboardData } from '../services/dashboardService';

interface DashboardStatsProps {
  onTabChange?: (tab: string) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    bannedUsers: 0,
    restrictedUsers: 0,
    todayReports: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setStats(data.stats);
        // recentActivities가 배열인지 확인하고 안전하게 설정
        if (Array.isArray(data.recentActivities)) {
          setRecentActivity(data.recentActivities);
        } else {
          console.warn('recentActivities가 배열이 아닙니다:', data.recentActivities);
          setRecentActivity([]);
        }
        setError(null);
      } catch (err) {
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    if (onTabChange) {
      switch (action) {
        case 'review':
          onTabChange('review');
          break;
        case 'users':
          onTabChange('users');
          break;
        case 'content':
          onTabChange('content');
          break;
        default:
          break;
      }
    }
  };

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
        
        <StatCard warning>
          <StatIcon>⏳</StatIcon>
          <StatNumber>{stats.pendingReports}</StatNumber>
          <StatLabel>대기 중인 신고</StatLabel>
          <StatDescription>검토 대기 중</StatDescription>
        </StatCard>
        
        <StatCard success>
          <StatIcon>✅</StatIcon>
          <StatNumber>{stats.resolvedReports}</StatNumber>
          <StatLabel>처리 완료</StatLabel>
          <StatDescription>검토 완료됨</StatDescription>
        </StatCard>
        
        <StatCard danger>
          <StatIcon>🚫</StatIcon>
          <StatNumber>{stats.bannedUsers}</StatNumber>
          <StatLabel>정지된 사용자</StatLabel>
          <StatDescription>계정 정지</StatDescription>
        </StatCard>
        
        <StatCard info>
          <StatIcon>⚠️</StatIcon>
          <StatNumber>{stats.restrictedUsers}</StatNumber>
          <StatLabel>제한된 사용자</StatLabel>
          <StatDescription>일부 기능 제한</StatDescription>
        </StatCard>
        
        <StatCard highlight>
          <StatIcon>📅</StatIcon>
          <StatNumber>{stats.todayReports}</StatNumber>
          <StatLabel>오늘 신고</StatLabel>
          <StatDescription>24시간 내 접수</StatDescription>
        </StatCard>
      </StatsGrid>

      <QuickActionsSection>
        <SectionTitle>
          <SectionIcon>⚡</SectionIcon>
          빠른 작업
        </SectionTitle>
        <ActionGrid>
          <ActionCard onClick={() => handleQuickAction('review')}>
            <ActionIcon>🔍</ActionIcon>
            <ActionTitle>신고 목록 관리</ActionTitle>
            <ActionDescription>접수된 신고들을 확인하고 처리하세요</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={() => handleQuickAction('users')}>
            <ActionIcon>👥</ActionIcon>
            <ActionTitle>사용자 관리</ActionTitle>
            <ActionDescription>신고된 사용자들의 상태를 관리하세요</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={() => handleQuickAction('content')}>
            <ActionIcon>📝</ActionIcon>
            <ActionTitle>콘텐츠 관리</ActionTitle>
            <ActionDescription>신고된 게시글과 댓글을 관리하세요</ActionDescription>
          </ActionCard>
        </ActionGrid>
      </QuickActionsSection>

      <RecentActivitySection>
        <SectionTitle>
          <SectionIcon>🕒</SectionIcon>
          최근 활동
        </SectionTitle>
        <ActivityList>
          {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon type={activity.type}>
                  {activity.type === 'user' ? '👤' : '📝'}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>
                    <strong>{activity.action}</strong> - {activity.target}
                  </ActivityText>
                  <ActivityTime>
                    {new Date(activity.timestamp).toLocaleString()}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))
          ) : (
            <ActivityItem>
              <ActivityContent>
                <ActivityText>최근 활동이 없습니다.</ActivityText>
              </ActivityContent>
            </ActivityItem>
          )}
        </ActivityList>
      </RecentActivitySection>
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatCard = styled.div<{ warning?: boolean; success?: boolean; danger?: boolean; info?: boolean; highlight?: boolean }>`
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;

  ${props => {
    if (props.warning) return `
      border-color: #ffc107;
      background: linear-gradient(135deg, #fffbf0 0%, #fff3cd 100%);
    `;
    if (props.success) return `
      border-color: #28a745;
      background: linear-gradient(135deg, #f0fff4 0%, #d4edda 100%);
    `;
    if (props.danger) return `
      border-color: #dc3545;
      background: linear-gradient(135deg, #fff5f5 0%, #f8d7da 100%);
    `;
    if (props.info) return `
      border-color: #17a2b8;
      background: linear-gradient(135deg, #f0f9ff 0%, #d1ecf1 100%);
    `;
    if (props.highlight) return `
      border-color: #ff6b35;
      background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
    `;
    return `
      border-color: #e9ecef;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    `;
  }}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      if (props.warning) return '#ffc107';
      if (props.success) return '#28a745';
      if (props.danger) return '#dc3545';
      if (props.info) return '#17a2b8';
      if (props.highlight) return '#ff6b35';
      return '#e9ecef';
    }};
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid #e9ecef;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    border-color: #ff6b35;
  }
`;

const ActionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
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

const RecentActivitySection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.type === 'user' ? '#ff6b35' : '#17a2b8'};
  color: white;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  color: #2d3436;
  font-weight: 600;
  margin-bottom: 5px;
`;

const ActivityTime = styled.div`
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
