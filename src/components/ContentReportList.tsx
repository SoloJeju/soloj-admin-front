import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getReportedContent, updateContentStatus, applyContentAction } from '../services/contentService';

const ContentReportList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchContentReports();
  }, [currentPage, statusFilter, contentTypeFilter]);

  const fetchContentReports = async () => {
    try {
      setLoading(true);
      const response = await getReportedContent({
        page: currentPage,
        limit: 10,
        type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      
      setReports(response.contents || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
      setError(null);
    } catch (err) {
      console.error('Content reports fetch error:', err);
      setError('콘텐츠 신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContentReports();
  };

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      setActionLoading(contentId);
      await updateContentStatus(contentId, newStatus, '관리자에 의한 상태 변경');
      await fetchContentReports(); // 목록 새로고침
    } catch (err) {
      console.error('Status update error:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (contentId: string, actionType: string) => {
    try {
      setActionLoading(contentId);
      await applyContentAction(contentId, {
        actionType: actionType as 'restore' | 'delete' | 'temporaryBlock',
        reason: '관리자에 의한 조치',
        adminId: 'current-admin' // 실제로는 로그인된 관리자 ID 사용
      });
      await fetchContentReports(); // 목록 새로고침
    } catch (err) {
      console.error('Action apply error:', err);
      alert('조치 적용에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSection>
          <LoadingIcon>🍊</LoadingIcon>
          <LoadingText>콘텐츠 신고 목록을 불러오는 중...</LoadingText>
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
          <RetryButton onClick={fetchContentReports}>다시 시도</RetryButton>
        </ErrorSection>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>콘텐츠 신고 관리</Title>
        <Subtitle>신고된 콘텐츠들의 목록을 확인하고 관리하세요</Subtitle>
      </Header>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>상태별 필터</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="visible">표시됨</option>
            <option value="hidden">숨김</option>
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
          </FilterSelect>
        </FilterGroup>

        <SearchGroup>
          <SearchInput
            type="text"
            placeholder="콘텐츠 제목 또는 작성자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchGroup>
      </FilterSection>

      <StatsBar>
        <StatItem>
          <StatLabel>총 콘텐츠</StatLabel>
          <StatValue>{totalItems}개</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>현재 페이지</StatLabel>
          <StatValue>{currentPage} / {totalPages}</StatValue>
        </StatItem>
      </StatsBar>

      {reports.length > 0 ? (
        <>
          <ReportList>
            {reports.map((content: any) => (
              <ReportCard key={content.contentId}>
                <ContentInfo>
                  <ContentTitle>{content.contentTitle || '제목 없음'}</ContentTitle>
                  <ContentStatus status={content.status || 'unknown'}>
                    {getStatusText(content.status)}
                  </ContentStatus>
                </ContentInfo>
                <ContentDetails>
                  <DetailItem>
                    <DetailLabel>콘텐츠 유형:</DetailLabel>
                    <DetailValue>{getContentTypeText(content.contentType)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>작성자:</DetailLabel>
                    <DetailValue>{content.authorName || '알 수 없음'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>신고 수:</DetailLabel>
                    <DetailValue>{content.reports?.length || 0}건</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>콘텐츠 ID:</DetailLabel>
                    <DetailValue>{content.contentId}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>최근 신고:</DetailLabel>
                    <DetailValue>
                      {content.reports?.[0]?.createdAt 
                        ? new Date(content.reports[0].createdAt).toLocaleDateString()
                        : '없음'
                      }
                    </DetailValue>
                  </DetailItem>
                </ContentDetails>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleStatusChange(content.contentId, 'visible')}
                    disabled={content.status === 'visible' || actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '복구'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleStatusChange(content.contentId, 'hidden')}
                    disabled={content.status === 'hidden' || actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '숨김'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(content.contentId, 'delete')}
                    disabled={actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '삭제'}
                  </ActionButton>
                </ActionButtons>
              </ReportCard>
            ))}
          </ReportList>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                이전
              </PageButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <PageButton
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    $active={currentPage === page}
                  >
                    {page}
                  </PageButton>
                );
              })}
              
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                다음
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>신고된 콘텐츠가 없습니다</EmptyTitle>
          <EmptyDescription>
            현재 신고된 콘텐츠가 없습니다. 새로운 신고가 접수되면 여기에 표시됩니다.
          </EmptyDescription>
        </EmptyState>
      )}
    </Container>
  );
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'visible': return '표시됨';
    case 'hidden': return '숨김';
    case 'deleted': return '삭제됨';
    default: return '알 수 없음';
  }
};

const getContentTypeText = (type: string) => {
  switch (type) {
    case 'post': return '게시글';
    case 'comment': return '댓글';
    case 'review': return '리뷰';
    default: return type || '알 수 없음';
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

const StatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
`;

const StatItem = styled.div`
  background: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b35;
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
  max-width: 900px;
  margin: 0 auto 30px auto;
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

const ContentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ContentTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #343a40;
  margin: 0;
  flex: 1;
  margin-right: 20px;
`;

const ContentStatus = styled.span<{ status: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'visible': return '#28a745';
      case 'hidden': return '#ffc107';
      case 'deleted': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
  flex-shrink: 0;
`;

const ContentDetails = styled.div`
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
  flex-wrap: wrap;
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

export default ContentReportList;
