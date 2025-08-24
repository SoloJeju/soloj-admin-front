import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Report } from '../types/report';
import { getReports, ReportListResponse, ReportFilters } from '../services/reportService';

const ReportReview: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, reasonFilter, contentTypeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const filters: ReportFilters = {
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        reason: reasonFilter !== 'all' ? reasonFilter : undefined,
        type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
        search: searchTerm || undefined
      };

      const response: ReportListResponse = await getReports(filters);
      setReports(response.reports || []);
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
      
      setError(null);
    } catch (err) {
      setError('신고 목록을 불러오는데 실패했습니다.');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReports();
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    // 상태 변경 로직 구현
    console.log(`Report ${reportId} status changed to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'reviewed': return '#17a2b8';
      case 'resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'reviewed': return '검토 중';
      case 'resolved': return '처리 완료';
      default: return '알 수 없음';
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'spam': '스팸',
      'abuse': '욕설/폭력',
      'illegal': '불법/유해',
      'scam': '사기/금전거래',
      'inappropriate': '부적절한 콘텐츠',
      'other': '기타'
    };
    return reasonMap[reason] || reason;
  };

  const getContentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'post': '게시글',
      'comment': '댓글',
      'user': '사용자',
      'room': '동행방'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>
          <LoadingIcon>🍊</LoadingIcon>
          신고 목록을 불러오는 중...
        </LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={fetchReports}>
          다시 시도
        </RetryButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>신고 목록 관리</Title>
        <Subtitle>신고된 모든 콘텐츠와 사용자의 목록을 확인하고 관리하세요</Subtitle>
      </Header>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>상태</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="pending">대기 중</option>
            <option value="reviewed">검토 중</option>
            <option value="resolved">처리 완료</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>신고 사유</FilterLabel>
          <FilterSelect
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="spam">스팸</option>
            <option value="abuse">욕설/폭력</option>
            <option value="illegal">불법/유해</option>
            <option value="scam">사기/금전거래</option>
            <option value="inappropriate">부적절한 콘텐츠</option>
            <option value="other">기타</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>콘텐츠 유형</FilterLabel>
          <FilterSelect
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="post">게시글</option>
            <option value="comment">댓글</option>
            <option value="user">사용자</option>
            <option value="room">동행방</option>
          </FilterSelect>
        </FilterGroup>

        <SearchGroup>
          <SearchInput
            type="text"
            placeholder="신고자, 피신고자 또는 콘텐츠 제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>
            검색
          </SearchButton>
        </SearchGroup>
      </FilterSection>

      <ReportList>
        {reports.length > 0 ? (
          reports.map((report) => (
            <ReportItem key={report.id}>
              <ReportHeader>
                <ReportInfo>
                  <ReportTitle>
                    [{getContentTypeText(report.contentType)}] {report.reportedUserName}
                  </ReportTitle>
                  <ReportMeta>
                    <StatusBadge color={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </StatusBadge>
                    <ReasonBadge>{getReasonText(report.reason)}</ReasonBadge>
                    <ContentTypeBadge>{getContentTypeText(report.contentType)}</ContentTypeBadge>
                    <TimeStamp>{new Date(report.createdAt).toLocaleString()}</TimeStamp>
                  </ReportMeta>
                  <ReportDetails>
                    <DetailItem>
                      <DetailLabel>신고자:</DetailLabel>
                      <DetailValue>{report.reporterName}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>피신고자:</DetailLabel>
                      <DetailValue>{report.reportedUserName}</DetailValue>
                    </DetailItem>
                    {report.contentTitle && (
                      <DetailItem>
                        <DetailLabel>콘텐츠:</DetailLabel>
                        <DetailValue>{report.contentTitle}</DetailValue>
                      </DetailItem>
                    )}
                  </ReportDetails>
                </ReportInfo>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleStatusChange(report.id, 'resolved')}
                    disabled={report.status === 'resolved'}
                  >
                    처리 완료
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleStatusChange(report.id, 'reviewed')}
                    disabled={report.status === 'reviewed'}
                  >
                    검토 중
                  </ActionButton>
                </ActionButtons>
              </ReportHeader>
              
              <ReportDescription>
                {report.detailReason || '신고 내용이 없습니다.'}
              </ReportDescription>
            </ReportItem>
          ))
        ) : (
          <EmptyMessage>
            <EmptyIcon>📝</EmptyIcon>
            신고 내역이 없습니다.
          </EmptyMessage>
        )}
      </ReportList>

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            이전
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              onClick={() => setCurrentPage(page)}
              $active={currentPage === page}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            다음
          </PageButton>
        </Pagination>
      )}
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

const FilterSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: end;

  @media (max-width: 768px) {
    padding: 20px;
    gap: 15px;
  }
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #495057;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const SearchGroup = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 300px;

  @media (max-width: 480px) {
    min-width: auto;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const ReportItem = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 10px 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ReportMeta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const StatusBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ReasonBadge = styled.span`
  background: #17a2b8;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ContentTypeBadge = styled.span`
  background: #6f42c1;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TimeStamp = styled.span`
  color: #6c757d;
  font-size: 0.8rem;
`;

const ReportDetails = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
`;

const DetailValue = styled.span`
  color: #6c757d;
  font-size: 0.85rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
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
  font-size: 0.85rem;

  &:hover:not(:disabled) {
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 12px 16px;
  }
`;

const ReportDescription = styled.p`
  color: #495057;
  line-height: 1.6;
  margin: 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 10px 15px;
  border: 2px solid ${props => props.$active ? '#ff6b35' : '#e9ecef'};
  background: ${props => props.$active ? '#ff6b35' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #ff6b35;
    background: #ff6b35;
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  background: #fdf2f2;
  color: #e74c3c;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #c0392b;
  }
`;

export default ReportReview;
