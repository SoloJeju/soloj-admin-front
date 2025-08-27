import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getReportedContent, updateContentStatus, applyContentAction, getPostDetail, getCommentDetail } from '../services/contentService';

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
  const [detailModal, setDetailModal] = useState<{ open: boolean; contentId: string | null }>({ open: false, contentId: null });
  const [contentDetail, setContentDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    fetchContentReports();
  }, [currentPage, statusFilter, contentTypeFilter, searchTerm]);

  const fetchContentReports = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit: 10,
        type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      };
      
      
      const response = await getReportedContent(filters);
  
      
      setReports(response.contents || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
      setError(null);
    } catch (err) {
      setError('콘텐츠 신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContentReports();
  };

  const handleStatusChange = async (contentId: string, contentType: string, newStatus: string) => {
    try {
      setActionLoading(contentId);
      await updateContentStatus(contentId, contentType, newStatus, '관리자에 의한 상태 변경');
      await fetchContentReports(); // 목록 새로고침
      alert('상태가 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('Status update error:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (contentId: string, contentType: string, actionType: string) => {
    try {
      setActionLoading(contentId);
      await applyContentAction(contentId, contentType, {
        actionType: actionType as 'hide' | 'show' | 'delete' | 'restore',
        reason: '관리자에 의한 조치'
      });
      await fetchContentReports(); // 목록 새로고침
      alert('조치가 성공적으로 적용되었습니다.');
    } catch (err) {
      console.error('Action apply error:', err);
      alert('조치 적용에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDetailView = async (contentId: string, contentType: string) => {
    try {
      setDetailLoading(true);
      setDetailModal({ open: true, contentId });
      
      // 현재 선택된 콘텐츠 정보 찾기
      const currentContent = reports.find((content: any) => content.contentId === contentId);
      setSelectedContent(currentContent);
      
      let detail;
      if (contentType === 'comment') {
        // 댓글 상세조회
        detail = await getCommentDetail(contentId);
      } else {
        // 게시글 상세조회
        detail = await getPostDetail(contentId);
      }
      
      setContentDetail(detail);
    } catch (err) {
      console.error('Detail fetch error:', err);
      alert('콘텐츠 상세 정보를 불러오는데 실패했습니다.');
      setDetailModal({ open: false, contentId: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModal({ open: false, contentId: null });
    setContentDetail(null);
    setSelectedContent(null);
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
            <option value="deleted">삭제됨</option>
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
            placeholder="제목, 내용, 작성자명으로 검색..."
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
            {reports.map((content: any, index: number) => (
              <ReportCard key={`${content.contentId}-${content.contentType}-${index}`} onClick={() => handleDetailView(content.contentId, content.contentType)}>
                <ContentInfo>
                  <ContentTitle>{content.title || '제목 없음'}</ContentTitle>
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
                    <DetailValue>{content.reportCount || 0}건</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>콘텐츠 ID:</DetailLabel>
                    <DetailValue>{content.contentId}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>신고일:</DetailLabel>
                    <DetailValue>
                      {content.createdAt 
                        ? new Date(content.createdAt).toLocaleDateString('ko-KR')
                        : '없음'
                      }
                    </DetailValue>
                  </DetailItem>
                </ContentDetails>
                <ActionButtons>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(content.contentId, content.contentType, 'restore');
                    }}
                    disabled={content.status === 'visible' || actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '복구'}
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(content.contentId, content.contentType, 'hide');
                    }}
                    disabled={content.status === 'hidden' || actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '숨김'}
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(content.contentId, content.contentType, 'show');
                    }}
                    disabled={content.status === 'visible' || actionLoading === content.contentId}
                  >
                    {actionLoading === content.contentId ? '처리중...' : '표시'}
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        '⚠️ 경고: 삭제는 되돌릴 수 없는 심각한 조치입니다.\n\n' +
                        '정말로 이 콘텐츠를 삭제하시겠습니까?'
                      );
                      if (confirmed) {
                        handleAction(content.contentId, content.contentType, 'delete');
                      }
                    }}
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

      {/* 콘텐츠 상세 조회 모달 */}
      {detailModal.open && (
        <ModalOverlay onClick={closeDetailModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>콘텐츠 상세 정보</ModalTitle>
              <CloseButton onClick={closeDetailModal}>&times;</CloseButton>
            </ModalHeader>
            
            {detailLoading ? (
              <ModalBody>
                <LoadingText>상세 정보를 불러오는 중...</LoadingText>
              </ModalBody>
            ) : contentDetail ? (
              <ModalBody>
                {/* 댓글인 경우 게시글 맥락 정보 표시 */}
                {contentDetail.postMeta && (
                  <PostContextSection>
                    <PostContextLabel>게시글 맥락:</PostContextLabel>
                    <PostContextItem>
                      <PostContextTitle>제목: {contentDetail.postMeta.title}</PostContextTitle>
                      <PostContextAuthor>작성자: {contentDetail.postMeta.authorNickname}</PostContextAuthor>
                      <PostContextDate>작성일: {new Date(contentDetail.postMeta.createdAt).toLocaleString('ko-KR')}</PostContextDate>
                    </PostContextItem>
                  </PostContextSection>
                )}
                
                <DetailSection>
                  {contentDetail.title && (
                    <DetailRow>
                      <ModalDetailLabel>제목:</ModalDetailLabel>
                      <ModalDetailValue>{contentDetail.title}</ModalDetailValue>
                    </DetailRow>
                  )}
                  <DetailRow>
                    <ModalDetailLabel>작성자:</ModalDetailLabel>
                    <ModalDetailValue>{contentDetail.authorNickname || contentDetail.authorName || contentDetail.author}</ModalDetailValue>
                  </DetailRow>
                  <DetailRow>
                    <ModalDetailLabel>작성일:</ModalDetailLabel>
                    <ModalDetailValue>{new Date(contentDetail.createdAt).toLocaleString('ko-KR')}</ModalDetailValue>
                  </DetailRow>
                  <DetailRow>
                    <ModalDetailLabel>상태:</ModalDetailLabel>
                    <ModalDetailValue>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: getStatusColor(contentDetail.status || 'visible'),
                        color: 'white'
                      }}>
                        {getStatusText(contentDetail.status || 'visible')}
                      </span>
                    </ModalDetailValue>
                  </DetailRow>
                  {contentDetail.postCategory && (
                    <DetailRow>
                      <ModalDetailLabel>카테고리:</ModalDetailLabel>
                      <ModalDetailValue>{contentDetail.postCategory}</ModalDetailValue>
                    </DetailRow>
                  )}
                </DetailSection>
                
                <ContentSection>
                  <ContentLabel>{contentDetail.postMeta ? '댓글 내용:' : '게시글 내용:'}</ContentLabel>
                  <ContentText>{contentDetail.content}</ContentText>
                </ContentSection>
                
                {contentDetail.comments && contentDetail.comments.length > 0 && (
                  <CommentsSection>
                    <CommentsLabel>댓글 목록:</CommentsLabel>
                    {contentDetail.comments.map((comment: any, index: number) => (
                      <CommentItem key={comment.commentId || comment.id || index}>
                        <CommentHeader>
                          <CommentAuthor>{comment.authorNickname || comment.authorName || comment.author}</CommentAuthor>
                          <CommentDate>{new Date(comment.createdAt).toLocaleString('ko-KR')}</CommentDate>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: getStatusColor(comment.status || 'visible'),
                            color: 'white'
                          }}>
                            {getStatusText(comment.status || 'visible')}
                          </span>
                        </CommentHeader>
                        <CommentContent>{comment.content}</CommentContent>
                      </CommentItem>
                    ))}
                  </CommentsSection>
                )}
                
                {selectedContent && (
                  <ReportSection>
                    <ReportLabel>신고 정보:</ReportLabel>
                    <ReportItem>
                      <ReportHeader>
                        <ReportReason>신고 사유: {getReportReasonText(selectedContent.reason)}</ReportReason>
                        <ReportDate>신고일: {new Date(selectedContent.createdAt).toLocaleString('ko-KR')}</ReportDate>
                      </ReportHeader>
                      <ReportDetails>
                        <ReportDetailItem>
                          <ReportDetailLabel>신고 ID:</ReportDetailLabel>
                          <ReportDetailValue>{selectedContent.reportId}</ReportDetailValue>
                        </ReportDetailItem>
                        <ReportDetailItem>
                          <ReportDetailLabel>신고자:</ReportDetailLabel>
                          <ReportDetailValue>{selectedContent.authorName}</ReportDetailValue>
                        </ReportDetailItem>
                        <ReportDetailItem>
                          <ReportDetailLabel>콘텐츠 유형:</ReportDetailLabel>
                          <ReportDetailValue>{getContentTypeText(selectedContent.contentType)}</ReportDetailValue>
                        </ReportDetailItem>
                        <ReportDetailItem>
                          <ReportDetailLabel>현재 상태:</ReportDetailLabel>
                          <ReportDetailValue>{getStatusText(selectedContent.status)}</ReportDetailValue>
                        </ReportDetailItem>
                      </ReportDetails>
                    </ReportItem>
                  </ReportSection>
                )}
              </ModalBody>
            ) : (
              <ModalBody>
                <ErrorText>상세 정보를 불러올 수 없습니다.</ErrorText>
              </ModalBody>
            )}
          </ModalContent>
        </ModalOverlay>
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'visible': return '#28a745'; // 초록
    case 'hidden': return '#ffc107'; // 노랑
    case 'deleted': return '#dc3545'; // 빨강
    default: return '#6c757d'; // 회색
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

const getReportReasonText = (reason: string) => {
  switch (reason) {
    case 'SPAM': return '스팸';
    case 'HARASSMENT': return '괴롭힘';
    case 'VIOLENCE': return '폭력';
    case 'HATE_SPEECH': return '혐오 발언';
    case 'INAPPROPRIATE': return '부적절한 내용';
    case 'COPYRIGHT': return '저작권 침해';
    case 'OTHER': return '기타';
    default: return reason || '알 수 없음';
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
  
  @media (max-width: 768px) {
    padding: 20px;
    gap: 15px;
    flex-direction: column;
    align-items: stretch;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    gap: 12px;
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
  
  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
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

const StatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
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
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    border-radius: 10px;
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
  background: ${props => getStatusColor(props.status)};
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
  
  @media (max-width: 768px) {
    gap: 8px;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  background: white;
  color: #6c757d;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  
  &:hover:not(:disabled) {
    background: #6c757d;
    color: white;
    border-color: #6c757d;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 0.95rem;
    width: 100%;
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
  border: 2px solid ${props => props.$active ? '#007bff' : '#e9ecef'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #007bff;
    background: #007bff;
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

// 모달 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const DetailSection = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: center;
`;

const ModalDetailLabel = styled.span`
  font-weight: 600;
  color: #495057;
  min-width: 80px;
  margin-right: 10px;
`;

const ModalDetailValue = styled.span`
  color: #333;
  flex: 1;
`;

const ContentSection = styled.div`
  margin-bottom: 20px;
`;

const ContentLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
`;

const ContentText = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const CommentsSection = styled.div`
  margin-bottom: 20px;
`;

const CommentsLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
`;

const CommentItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 10px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: #495057;
`;

const CommentDate = styled.span`
  font-size: 0.9rem;
  color: #6c757d;
`;

const CommentContent = styled.div`
  color: #333;
  line-height: 1.5;
`;

// 게시글 맥락 관련 스타일 컴포넌트들
const PostContextSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const PostContextLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
`;

const PostContextItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PostContextTitle = styled.span`
  font-weight: 600;
  color: #343a40;
`;

const PostContextAuthor = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const PostContextDate = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 1.1rem;
  padding: 40px 20px;
`;

const ErrorText = styled.div`
  text-align: center;
  color: #dc3545;
  font-size: 1.1rem;
  padding: 40px 20px;
`;

// 상태 배지 스타일 컴포넌트
const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => getStatusColor(props.status)};
  color: white;
`;

// 신고 관련 스타일 컴포넌트들
const ReportSection = styled.div`
  margin-bottom: 20px;
`;

const ReportLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
`;

const ReportItem = styled.div`
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ReportReason = styled.span`
  font-weight: 600;
  color: #856404;
`;

const ReportDate = styled.span`
  font-size: 0.9rem;
  color: #856404;
`;

const ReportDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
`;

const ReportDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ReportDetailLabel = styled.span`
  font-size: 0.8rem;
  color: #856404;
  font-weight: 600;
`;

const ReportDetailValue = styled.span`
  font-size: 0.9rem;
  color: #856404;
`;

export default ContentReportList;
