import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { systemService, SystemSettings } from '../services/systemService';

const SystemStatus: React.FC = () => {
  const [systemData, setSystemData] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        const data = await systemService.getSystemSettings();
        setSystemData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '시스템 데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();

    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchSystemData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case '연결됨':
        return '#28a745';
      case 'warning':
      case '경고':
        return '#ffc107';
      case 'offline':
      case '연결 끊김':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return '온라인';
      case 'offline':
        return '오프라인';
      case 'warning':
        return '경고';
      case '연결됨':
        return '연결됨';
      case '연결 끊김':
        return '연결 끊김';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>
          <LoadingIcon>🍊</LoadingIcon>
          시스템 상태를 확인하는 중...
        </LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>오류가 발생했습니다</ErrorTitle>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={() => window.location.reload()}>
            다시 시도
          </RetryButton>
        </ErrorMessage>
      </Container>
    );
  }

  if (!systemData) {
    return (
      <Container>
        <ErrorMessage>
          <ErrorIcon>❌</ErrorIcon>
          <ErrorTitle>데이터를 불러올 수 없습니다</ErrorTitle>
          <ErrorText>시스템 데이터가 없습니다.</ErrorText>
        </ErrorMessage>
      </Container>
    );
  }

  const apiResponseTimeMs = systemService.parseResponseTime(systemData.apiResponseTime.time);
  const cpuUsage = systemService.parsePercentage(systemData.systemLoad.cpu);
  const memoryUsage = systemService.parsePercentage(systemData.performanceMetrics.memoryUsage);
  const diskUsage = systemService.parsePercentage(systemData.performanceMetrics.diskUsage);

  return (
    <Container>
      <Header>
        <Title>시스템 상태 모니터링</Title>
        <Subtitle>실시간 시스템 상태와 성능 지표를 확인하세요</Subtitle>
      </Header>

      <StatusGrid>
        {/* 서버 상태 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.serverStatus.icon}</StatusIcon>
            <StatusTitle>서버 상태</StatusTitle>
          </StatusHeader>
          <StatusValue color={getStatusColor(systemData.serverStatus.status)}>
            {getStatusText(systemData.serverStatus.status)}
          </StatusValue>
          <StatusDescription>
            {systemData.serverStatus.description}
          </StatusDescription>
        </StatusCard>

        {/* 데이터베이스 상태 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.databaseStatus.icon}</StatusIcon>
            <StatusTitle>데이터베이스</StatusTitle>
          </StatusHeader>
          <StatusValue color={getStatusColor(systemData.databaseStatus.status)}>
            {getStatusText(systemData.databaseStatus.status)}
          </StatusValue>
          <StatusDescription>
            {systemData.databaseStatus.description}
          </StatusDescription>
        </StatusCard>

        {/* API 응답 시간 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.apiResponseTime.icon}</StatusIcon>
            <StatusTitle>API 응답 시간</StatusTitle>
          </StatusHeader>
          <StatusValue color={apiResponseTimeMs < 100 ? '#28a745' : apiResponseTimeMs < 200 ? '#ffc107' : '#dc3545'}>
            {systemData.apiResponseTime.time}
          </StatusValue>
          <StatusDescription>
            {systemData.apiResponseTime.description}
          </StatusDescription>
        </StatusCard>

        {/* 활성 사용자 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.activeUsers.icon}</StatusIcon>
            <StatusTitle>활성 사용자</StatusTitle>
          </StatusHeader>
          <StatusValue color="#17a2b8">
            {systemData.activeUsers.count}명
          </StatusValue>
          <StatusDescription>
            {systemData.activeUsers.description}
          </StatusDescription>
        </StatusCard>

        {/* 신고 통계 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.reportStatus.icon}</StatusIcon>
            <StatusTitle>신고 현황</StatusTitle>
          </StatusHeader>
          <StatusValue color="#6f42c1">
            {systemData.reportStatus.pending}/{systemData.reportStatus.total}
          </StatusValue>
          <StatusDescription>
            {systemData.reportStatus.description}
          </StatusDescription>
        </StatusCard>

        {/* 시스템 부하 */}
        <StatusCard>
          <StatusHeader>
            <StatusIcon>{systemData.systemLoad.icon}</StatusIcon>
            <StatusTitle>시스템 부하</StatusTitle>
          </StatusHeader>
          <StatusValue color={cpuUsage < 50 ? '#28a745' : cpuUsage < 80 ? '#ffc107' : '#dc3545'}>
            {systemData.systemLoad.cpu}
          </StatusValue>
          <StatusDescription>
            {systemData.systemLoad.description}
          </StatusDescription>
        </StatusCard>
      </StatusGrid>

      <DetailedMetrics>
        <MetricsTitle>상세 성능 지표</MetricsTitle>
        <MetricsGrid>
          <MetricItem>
            <MetricLabel>메모리 사용률</MetricLabel>
            <MetricBar>
              <MetricFill width={memoryUsage} color={memoryUsage < 70 ? '#28a745' : memoryUsage < 90 ? '#ffc107' : '#dc3545'} />
            </MetricBar>
            <MetricValue>{systemData.performanceMetrics.memoryUsage}</MetricValue>
          </MetricItem>

          <MetricItem>
            <MetricLabel>디스크 사용률</MetricLabel>
            <MetricBar>
              <MetricFill width={diskUsage} color={diskUsage < 70 ? '#28a745' : diskUsage < 90 ? '#ffc107' : '#dc3545'} />
            </MetricBar>
            <MetricValue>{systemData.performanceMetrics.diskUsage}</MetricValue>
          </MetricItem>
        </MetricsGrid>
      </DetailedMetrics>

      <SystemInfo>
        <InfoTitle>시스템 정보</InfoTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>서버 버전</InfoLabel>
            <InfoValue>{systemData.systemInfo.serverVersion}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Spring Boot</InfoLabel>
            <InfoValue>{systemData.systemInfo.springBootVersion}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Java</InfoLabel>
            <InfoValue>{systemData.systemInfo.javaVersion}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>자동 조치</InfoLabel>
            <InfoValue>{systemData.autoActionEnabled ? '활성화' : '비활성화'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>사용자당 최대 신고</InfoLabel>
            <InfoValue>{systemData.maxReportsPerUser}건</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>신고 쿨다운</InfoLabel>
            <InfoValue>{systemData.reportCooldownHours}시간</InfoValue>
          </InfoItem>
        </InfoGrid>
      </SystemInfo>
    </Container>
  );
};

const Container = styled.div`
  padding: 40px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 200px);
  font-family: 'Noto Sans KR', sans-serif;
  color: #343a40;

  @media (max-width: 768px) {
    padding: 20px;
  }
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #343a40;
  margin: 0 0 10px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f4;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 25px;
    border-radius: 15px;
  }
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const StatusIcon = styled.div`
  font-size: 2rem;
`;

const StatusTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #343a40;
  margin: 0;
`;

const StatusValue = styled.div<{ color: string }>`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.color};
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatusDescription = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const DetailedMetrics = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f4;
  margin-bottom: 30px;
`;

const MetricsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 25px 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MetricLabel = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const MetricBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
`;

const MetricFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 6px;
  transition: width 0.5s ease;
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-align: right;
`;

const SystemInfo = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f4;
`;

const InfoTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 25px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const InfoValue = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #6c757d;
`;

const LoadingIcon = styled.span`
  font-size: 3rem;
  margin-bottom: 20px;
  animation: spin 1.5s linear infinite;
  color: #ff6b35;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #dc3545;
`;

const ErrorIcon = styled.span`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dc3545;
`;

const ErrorTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc3545;
  margin-bottom: 10px;
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 20px;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

export default SystemStatus;
