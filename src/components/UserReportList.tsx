import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getReportedUsers } from '../services/userService';

const UserReportList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const response = await getReportedUsers();
      console.log('UserReportList - API Response:', response);
      console.log('UserReportList - response.users:', response.users);
      setReports(response.users || []);
      setError(null);
    } catch (err) {
      console.error('User reports fetch error:', err);
      setError('사용자 신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSection>
          <LoadingIcon>🍊</LoadingIcon>
          <LoadingText>사용자 신고 목록을 불러오는 중...</LoadingText>
        </LoadingSection>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorSection>
          <ErrorIcon>❌</ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={fetchUserReports}>다시 시도</RetryButton>
        </ErrorSection>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>사용자 신고 관리</Title>
        <Subtitle>신고된 사용자들의 목록을 확인하고 관리하세요</Subtitle>
      </Header>

      {reports.length > 0 ? (
        <ReportList>
          {reports.map((user: any) => (
            <ReportCard key={user.userId}>
              <UserInfo>
                <UserName>{user.userName || '이름 없음'}</UserName>
                <UserStatus status={user.currentStatus || 'unknown'}>
                  {getStatusText(user.currentStatus)}
                </UserStatus>
              </UserInfo>
              <ReportDetails>
                <DetailItem>
                  <DetailLabel>신고 수:</DetailLabel>
                  <DetailValue>{user.totalReports || 0}건</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>사용자 ID:</DetailLabel>
                  <DetailValue>{user.userId}</DetailValue>
                </DetailItem>
              </ReportDetails>
              <ActionButtons>
                <ActionButton>상태 변경</ActionButton>
                <ActionButton>상세 보기</ActionButton>
              </ActionButtons>
            </ReportCard>
          ))}
        </ReportList>
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>신고된 사용자가 없습니다</EmptyTitle>
          <EmptyDescription>
            현재 신고된 사용자가 없습니다. 새로운 신고가 접수되면 여기에 표시됩니다.
          </EmptyDescription>
        </EmptyState>
      )}
    </Container>
  );
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal': return '정상';
    case 'softBlocked': return '일시 차단';
    case 'restricted': return '제한됨';
    case 'banned': return '영구 차단';
    default: return '알 수 없음';
  }
};

const Container = styled.div`
  padding: 40px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 200px);
  font-family: 'Noto Sans KR', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #343a40;
  margin: 0 0 15px 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const LoadingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  animation: spin 1.5s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #6c757d;
`;

const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const ErrorText = styled.p`
  font-size: 1.2rem;
  color: #e74c3c;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #c0392b;
  }
`;

const ReportList = styled.div`
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const ReportCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  }
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const UserName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #343a40;
  margin: 0;
`;

const UserStatus = styled.span<{ status: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'normal': return '#28a745';
      case 'softBlocked': return '#ffc107';
      case 'restricted': return '#fd7e14';
      case 'banned': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const ReportDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #495057;
`;

const DetailValue = styled.span`
  color: #6c757d;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #ff6b35;
  background: white;
  color: #ff6b35;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  max-width: 500px;
  margin: 0 auto;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  color: #343a40;
  margin: 0 0 15px 0;
`;

const EmptyDescription = styled.p`
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
`;

export default UserReportList;
