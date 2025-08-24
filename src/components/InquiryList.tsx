import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getInquiries, replyToInquiry, updateInquiryStatus, updateInquiryPriority } from '../services/inquiryService';
import { InquirySummary, InquiryStatus, InquiryPriority, InquiryCategory } from '../types/report';

const InquiryList: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, statusFilter, categoryFilter, priorityFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await getInquiries({
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      });
      
      setInquiries(response.inquiries || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
      setError(null);
    } catch (err) {
      console.error('Inquiries fetch error:', err);
      setError('1:1 문의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInquiries();
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      setActionLoading(inquiryId);
      await updateInquiryStatus(inquiryId, newStatus);
      await fetchInquiries();
    } catch (err) {
      console.error('Status update error:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePriorityChange = async (inquiryId: string, newPriority: string) => {
    try {
      setActionLoading(inquiryId);
      await updateInquiryPriority(inquiryId, newPriority);
      await fetchInquiries();
    } catch (err) {
      console.error('Priority update error:', err);
      alert('우선순위 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      setActionLoading(inquiryId);
      await replyToInquiry(inquiryId, {
        adminReply: replyText,
        status: 'answered'
      });
      setReplyText('');
      setSelectedInquiry(null);
      await fetchInquiries();
      alert('답변이 성공적으로 등록되었습니다.');
    } catch (err) {
      console.error('Reply error:', err);
      alert('답변 등록에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return '#ff6b35';
      case 'inProgress': return '#f7931e';
      case 'answered': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: InquiryPriority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#ff6b35';
      case 'normal': return '#f7931e';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryLabel = (category: InquiryCategory) => {
    switch (category) {
      case 'account': return '계정 관련';
      case 'payment': return '결제 관련';
      case 'service': return '서비스 이용';
      case 'technical': return '기술적 문제';
      case 'safety': return '안전 관련';
      case 'other': return '기타';
      default: return category;
    }
  };

  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'inProgress': return '처리중';
      case 'answered': return '답변완료';
      case 'closed': return '종료';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: InquiryPriority) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'normal': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <LoadingSection>
        <LoadingIcon>⏳</LoadingIcon>
        <LoadingText>1:1 문의 목록을 불러오는 중...</LoadingText>
      </LoadingSection>
    );
  }

  if (error) {
    return (
      <ErrorSection>
        <ErrorIcon>❌</ErrorIcon>
        <ErrorText>{error}</ErrorText>
      </ErrorSection>
    );
  }

  return (
    <Container>
      <Title>1:1 문의 관리</Title>
      
      <FilterSection>
        <FilterGroup>
          <FilterLabel>상태:</FilterLabel>
          <FilterSelect 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="pending">대기중</option>
            <option value="inProgress">처리중</option>
            <option value="answered">답변완료</option>
            <option value="closed">종료</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>카테고리:</FilterLabel>
          <FilterSelect 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="account">계정 관련</option>
            <option value="payment">결제 관련</option>
            <option value="service">서비스 이용</option>
            <option value="technical">기술적 문제</option>
            <option value="safety">안전 관련</option>
            <option value="other">기타</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>우선순위:</FilterLabel>
          <FilterSelect 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="normal">보통</option>
            <option value="low">낮음</option>
          </FilterSelect>
        </FilterGroup>

        <SearchGroup>
          <SearchInput
            type="text"
            placeholder="제목 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchGroup>
      </FilterSection>

      <StatsBar>
        <StatItem>
          <StatLabel>총 문의:</StatLabel>
          <StatValue>{totalItems}건</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>현재 페이지:</StatLabel>
          <StatValue>{currentPage} / {totalPages}</StatValue>
        </StatItem>
      </StatsBar>

      {inquiries.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>1:1 문의가 없습니다</EmptyTitle>
          <EmptyDescription>새로운 문의가 등록되면 여기에 표시됩니다.</EmptyDescription>
        </EmptyState>
      ) : (
        <>
          <InquiryListContainer>
            {inquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id}>
                <InquiryHeader>
                  <InquiryTitle>{inquiry.subject}</InquiryTitle>
                  <InquiryMeta>
                    <StatusBadge color={getStatusColor(inquiry.status)}>
                      {getStatusLabel(inquiry.status)}
                    </StatusBadge>
                    <PriorityBadge color={getPriorityColor(inquiry.priority)}>
                      {getPriorityLabel(inquiry.priority)}
                    </PriorityBadge>
                  </InquiryMeta>
                </InquiryHeader>

                <InquiryDetails>
                  <DetailItem>
                    <DetailLabel>작성자:</DetailLabel>
                    <DetailValue>{inquiry.userName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>카테고리:</DetailLabel>
                    <DetailValue>{getCategoryLabel(inquiry.category)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>작성일:</DetailLabel>
                    <DetailValue>{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>답변상태:</DetailLabel>
                    <DetailValue>
                      {inquiry.hasReply ? `답변완료 (${inquiry.replyCount}회)` : '답변대기'}
                    </DetailValue>
                  </DetailItem>
                </InquiryDetails>

                <ActionButtons>
                  <ActionButton
                    onClick={() => setSelectedInquiry(inquiry.id)}
                    disabled={actionLoading === inquiry.id}
                  >
                    답변하기
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => handleStatusChange(inquiry.id, 'inProgress')}
                    disabled={actionLoading === inquiry.id}
                  >
                    처리중으로 변경
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => handleStatusChange(inquiry.id, 'closed')}
                    disabled={actionLoading === inquiry.id}
                  >
                    종료
                  </ActionButton>
                </ActionButtons>

                {selectedInquiry === inquiry.id && (
                  <ReplySection>
                    <ReplyTextarea
                      placeholder="답변 내용을 입력하세요..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                    <ReplyActions>
                      <ReplyButton
                        onClick={() => handleReply(inquiry.id)}
                        disabled={actionLoading === inquiry.id}
                      >
                        답변 등록
                      </ReplyButton>
                      <CancelButton onClick={() => {
                        setSelectedInquiry(null);
                        setReplyText('');
                      }}>
                        취소
                      </CancelButton>
                    </ReplyActions>
                  </ReplySection>
                )}
              </InquiryCard>
            ))}
          </InquiryListContainer>

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
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 120px;
`;

const SearchGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 200px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e55a2b;
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 10px;
  color: white;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.9;
`;

const StatValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
`;

const InquiryListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const InquiryCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const InquiryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
`;

const InquiryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
`;

const InquiryMeta = styled.div`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 12px;
  background: ${props => props.color};
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const PriorityBadge = styled.span<{ color: string }>`
  padding: 4px 12px;
  background: ${props => props.color};
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const InquiryDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:first-child {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }

  &:nth-child(2) {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }

  &:nth-child(3) {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ReplySection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 15px;
  font-family: inherit;
`;

const ReplyActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ReplyButton = styled.button`
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$active ? '#ff6b35' : '#ced4da'};
  background: ${props => props.$active ? '#ff6b35' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.$active ? '600' : '400'};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#e55a2b' : '#f8f9fa'};
    border-color: ${props => props.$active ? '#e55a2b' : '#adb5bd'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
`;

const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const ErrorText = styled.p`
  font-size: 1.1rem;
  color: #dc3545;
  margin: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  color: #6c757d;
  margin: 0 0 10px 0;
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  color: #adb5bd;
  margin: 0;
`;

export default InquiryList;
