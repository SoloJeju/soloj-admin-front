import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getInquiries, replyToInquiry, updateInquiryStatus, updateInquiryPriority, getInquiryDetail } from '../services/inquiryService';
import { uploadFile, deleteFile } from '../services/fileService';
import { InquirySummary, InquiryStatus, InquiryPriority, InquiryCategory } from '../types/report';

const InquiryList: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | InquiryCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | InquiryPriority>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; inquiryId: string | null }>({ open: false, inquiryId: null });
  const [inquiryDetail, setInquiryDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  // 문의카테고리 옵션들
  const inquiryCategories = [
    { value: 'ACCOUNT', label: '계정 관련' },
    { value: 'PAYMENT', label: '결제 관련' },
    { value: 'GENERAL', label: '서비스 이용' },
    { value: 'TECHNICAL', label: '기술적 문제' },
    { value: 'REPORT', label: '신고 관련' },
    { value: 'OTHER', label: '기타' }
  ];

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, statusFilter, categoryFilter, priorityFilter, searchTerm]);



  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      };
      
      const response = await getInquiries(filters);
      
      // inquiryService의 InquirySummary를 types/report의 InquirySummary로 변환
      const convertedInquiries = (response.inquiries || []).map(inquiry => ({
        id: inquiry.id,
        userName: inquiry.userName || inquiry.author || '',
        category: inquiry.category as InquiryCategory,
        subject: inquiry.title,
        status: inquiry.status as InquiryStatus,
        priority: inquiry.priority as InquiryPriority,
        createdAt: inquiry.createdDate || inquiry.createdAt,
        hasReply: inquiry.replied || (inquiry.replyCount || 0) > 0,
        replyCount: inquiry.replyCount || 0
      }));
      setInquiries(convertedInquiries as InquirySummary[]);
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

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      setActionLoading(inquiryId);
      await updateInquiryStatus(inquiryId, { status: newStatus });
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
      await updateInquiryPriority(inquiryId, { priority: newPriority });
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
        reply: replyText,
        closeInquiry: false
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

  const handleDetailView = async (inquiryId: string) => {
    try {
      setDetailLoading(true);
      setDetailModal({ open: true, inquiryId });
      
      const detail = await getInquiryDetail(inquiryId);
      setInquiryDetail(detail);
    } catch (err) {
      console.error('Detail fetch error:', err);
      alert('문의 상세 정보를 불러오는데 실패했습니다.');
      setDetailModal({ open: false, inquiryId: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModal({ open: false, inquiryId: null });
    setInquiryDetail(null);
  };

  // 파일 업로드 처리
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setFileUploadLoading(true);
      const fileArray = Array.from(files);
      
      // 파일 업로드
      for (const file of fileArray) {
        await uploadFile(file);
      }
      
      setUploadedFiles(prev => [...prev, ...fileArray]);
      alert('파일이 성공적으로 업로드되었습니다.');
    } catch (err) {
      console.error('File upload error:', err);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setFileUploadLoading(false);
    }
  };

  // 파일 삭제 처리
  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      alert('파일이 성공적으로 삭제되었습니다.');
      // 필요시 목록 새로고침
      if (detailModal.open && detailModal.inquiryId) {
        await handleDetailView(detailModal.inquiryId);
      }
    } catch (err) {
      console.error('File delete error:', err);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      // API enum 값들
      case 'PENDING': return '#ff6b35';
      case 'IN_PROGRESS': return '#f7931e';
      case 'REPLIED': return '#28a745';
      case 'CLOSED': return '#6c757d';
      // 기존 값들 (하위 호환성)
      case 'pending': return '#ff6b35';
      case 'inProgress': return '#f7931e';
      case 'answered': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: InquiryPriority) => {
    switch (priority) {
      // API enum 값들
      case 'URGENT': return '#dc3545';
      case 'HIGH': return '#ff6b35';
      case 'NORMAL': return '#f7931e';
      case 'LOW': return '#28a745';
      // 기존 값들 (하위 호환성)
      case 'urgent': return '#dc3545';
      case 'high': return '#ff6b35';
      case 'normal': return '#f7931e';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryLabel = (category: InquiryCategory) => {
    switch (category) {
      // API enum 값들
      case 'ACCOUNT': return '계정 관련';
      case 'PAYMENT': return '결제 관련';
      case 'GENERAL': return '서비스 이용';
      case 'TECHNICAL': return '기술적 문제';
      case 'REPORT': return '신고 관련';
      case 'OTHER': return '기타';
      // 기존 값들 (하위 호환성)
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
      // API enum 값들
      case 'PENDING': return '대기중';
      case 'IN_PROGRESS': return '처리중';
      case 'REPLIED': return '답변완료';
      case 'CLOSED': return '종료';
      // 기존 값들 (하위 호환성)
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | InquiryStatus)}
          >
            <option value="all">전체</option>
            <option value="PENDING">대기중</option>
            <option value="IN_PROGRESS">처리중</option>
            <option value="REPLIED">답변완료</option>
            <option value="CLOSED">종료</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>카테고리:</FilterLabel>
          <FilterSelect 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | InquiryCategory)}
          >
            <option value="all">전체</option>
            {inquiryCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>우선순위:</FilterLabel>
          <FilterSelect 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | InquiryPriority)}
          >
            <option value="all">전체</option>
            <option value="URGENT">긴급</option>
            <option value="HIGH">높음</option>
            <option value="NORMAL">보통</option>
            <option value="LOW">낮음</option>
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
               <InquiryCard key={inquiry.id} onClick={() => handleDetailView(inquiry.id)}>
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
                    onClick={(e) => {
                      e.stopPropagation(); // 상세보기 카드 onClick 막기
                      setSelectedInquiry(inquiry.id);
                    }}
                    disabled={actionLoading === inquiry.id}
                  >
                    답변하기
                  </ActionButton>

                  
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(inquiry.id, 'IN_PROGRESS');
                      }}
                      disabled={actionLoading === inquiry.id}
                    >
                      처리중으로 변경
                    </ActionButton>

                  
                  <ActionButton
                    onClick={() => handlePriorityChange(inquiry.id, 'HIGH')}
                    disabled={actionLoading === inquiry.id}
                  >
                    우선순위 높임
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => handleStatusChange(inquiry.id, 'CLOSED')}
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
                    
                    {/* 답변용 파일 업로드 */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#495057' 
                      }}>
                        답변 첨부 파일:
                      </label>
                      <div style={{ 
                        border: '2px dashed #ced4da', 
                        borderRadius: '6px', 
                        padding: '15px', 
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          disabled={fileUploadLoading}
                          style={{ display: 'none' }}
                          id={`reply-file-upload-${inquiry.id}`}
                        />
                        <label 
                          htmlFor={`reply-file-upload-${inquiry.id}`}
                          style={{
                            cursor: 'pointer',
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: fileUploadLoading ? '#6c757d' : '#28a745',
                            color: 'white',
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}
                        >
                          {fileUploadLoading ? '업로드 중...' : '파일 선택'}
                        </label>
                        <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6c757d' }}>
                          답변에 첨부할 이미지를 선택하세요
                        </p>
                      </div>
                    </div>
                    
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

       {/* 상세 조회 모달 */}
       {detailModal.open && (
         <ModalOverlay onClick={closeDetailModal}>
           <ModalContent onClick={(e) => e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>문의 상세 정보</ModalTitle>
               <CloseButton onClick={closeDetailModal}>&times;</CloseButton>
             </ModalHeader>
             
             {detailLoading ? (
               <ModalBody>
                 <LoadingText>상세 정보를 불러오는 중...</LoadingText>
               </ModalBody>
             ) : inquiryDetail ? (
               <ModalBody>
                 <DetailSection>
                   <DetailRow>
                     <ModalDetailLabel>제목:</ModalDetailLabel>
                     <ModalDetailValue>{inquiryDetail.title}</ModalDetailValue>
                   </DetailRow>
                   <DetailRow>
                     <ModalDetailLabel>작성자:</ModalDetailLabel>
                     <ModalDetailValue>{inquiryDetail.userName} ({inquiryDetail.userEmail})</ModalDetailValue>
                   </DetailRow>
                   <DetailRow>
                     <ModalDetailLabel>카테고리:</ModalDetailLabel>
                     <ModalDetailValue>{inquiryDetail.categoryName || inquiryDetail.category}</ModalDetailValue>
                   </DetailRow>
                   <DetailRow>
                     <ModalDetailLabel>상태:</ModalDetailLabel>
                     <ModalDetailValue>{inquiryDetail.statusName || inquiryDetail.status}</ModalDetailValue>
                   </DetailRow>
                   <DetailRow>
                     <ModalDetailLabel>우선순위:</ModalDetailLabel>
                     <ModalDetailValue>{inquiryDetail.priorityName || inquiryDetail.priority}</ModalDetailValue>
                   </DetailRow>
                   <DetailRow>
                     <ModalDetailLabel>작성일:</ModalDetailLabel>
                     <ModalDetailValue>{new Date(inquiryDetail.createdDate).toLocaleString('ko-KR')}</ModalDetailValue>
                   </DetailRow>
                   {inquiryDetail.assignedAdminName && (
                     <DetailRow>
                       <ModalDetailLabel>담당자:</ModalDetailLabel>
                       <ModalDetailValue>{inquiryDetail.assignedAdminName}</ModalDetailValue>
                     </DetailRow>
                   )}
                 </DetailSection>
                 
                 <ContentSection>
                   <ContentLabel>문의 내용:</ContentLabel>
                   <ContentText>{inquiryDetail.content}</ContentText>
                 </ContentSection>
                 
                 <ContentSection>
                   <ContentLabel>첨부 이미지:</ContentLabel>
                   {inquiryDetail.imageUrl ? (
                     <div style={{ marginBottom: '15px' }}>
                       <div style={{ marginBottom: '10px' }}>
                         <strong>이미지명:</strong> {inquiryDetail.imageName || '이미지'}
                       </div>
                       <div style={{ marginBottom: '10px' }}>
                         <img 
                           src={inquiryDetail.imageUrl} 
                           alt={inquiryDetail.imageName || '문의 이미지'}
                           style={{
                             maxWidth: '100%',
                             maxHeight: '300px',
                             borderRadius: '8px',
                             border: '1px solid #e9ecef'
                           }}
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                             if (nextElement) {
                               nextElement.style.display = 'block';
                             }
                           }}
                         />
                         <div style={{ 
                           display: 'none', 
                           padding: '20px', 
                           backgroundColor: '#f8f9fa', 
                           borderRadius: '8px', 
                           border: '1px solid #e9ecef',
                           textAlign: 'center',
                           color: '#6c757d'
                         }}>
                           이미지를 불러올 수 없습니다.
                         </div>
                       </div>
                       <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                         <a 
                           href={inquiryDetail.imageUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style={{
                             display: 'inline-block',
                             padding: '8px 16px',
                             backgroundColor: '#007bff',
                             color: 'white',
                             textDecoration: 'none',
                             borderRadius: '5px',
                             fontSize: '0.9rem'
                           }}
                         >
                           새 창에서 보기
                         </a>
                         <button
                           onClick={() => handleFileDelete(inquiryDetail.imageId || inquiryDetail.id)}
                           style={{
                             padding: '8px 16px',
                             backgroundColor: '#dc3545',
                             color: 'white',
                             border: 'none',
                             borderRadius: '5px',
                             fontSize: '0.9rem',
                             cursor: 'pointer'
                           }}
                         >
                           파일 삭제
                         </button>
                       </div>
                     </div>
                   ) : (
                     <div style={{
                       padding: '15px',
                       backgroundColor: '#f8f9fa',
                       borderRadius: '8px',
                       border: '1px solid #e9ecef',
                       color: '#6c757d',
                       textAlign: 'center'
                     }}>
                       첨부된 이미지가 없습니다.
                     </div>
                   )}
                   
                   {/* 파일 업로드 섹션 */}
                   <div style={{ marginTop: '15px' }}>
                     <ContentLabel>새 파일 업로드:</ContentLabel>
                     <div style={{ 
                       border: '2px dashed #ced4da', 
                       borderRadius: '8px', 
                       padding: '20px', 
                       textAlign: 'center',
                       backgroundColor: '#f8f9fa'
                     }}>
                       <input
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={(e) => handleFileUpload(e.target.files)}
                         disabled={fileUploadLoading}
                         style={{ display: 'none' }}
                         id="file-upload"
                       />
                       <label 
                         htmlFor="file-upload"
                         style={{
                           cursor: 'pointer',
                           display: 'block',
                           padding: '10px',
                           backgroundColor: fileUploadLoading ? '#6c757d' : '#007bff',
                           color: 'white',
                           borderRadius: '5px',
                           fontSize: '0.9rem',
                           fontWeight: '600'
                         }}
                       >
                         {fileUploadLoading ? '업로드 중...' : '파일 선택'}
                       </label>
                       <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#6c757d' }}>
                         이미지 파일을 선택하여 업로드하세요
                       </p>
                     </div>
                   </div>
                 </ContentSection>
                 
                 {inquiryDetail.adminReply && (
                   <ModalReplySection>
                     <ReplyLabel>관리자 답변:</ReplyLabel>
                     <ReplyText>{inquiryDetail.adminReply}</ReplyText>
                     <ReplyDate>답변일: {new Date(inquiryDetail.repliedAt).toLocaleString('ko-KR')}</ReplyDate>
                   </ModalReplySection>
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
  cursor: pointer;

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
  max-width: 600px;
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

const ModalReplySection = styled.div`
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #c3e6c3;
`;

const ReplyLabel = styled.div`
  font-weight: 600;
  color: #155724;
  margin-bottom: 10px;
`;

const ReplyText = styled.div`
  color: #155724;
  white-space: pre-wrap;
  line-height: 1.5;
  margin-bottom: 10px;
`;

const ReplyDate = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const FileUploadSection = styled.div`
  margin-top: 15px;
  padding: 15px;
  border: 2px dashed #ced4da;
  border-radius: 8px;
  background-color: #f8f9fa;
  text-align: center;
`;

const FileUploadButton = styled.label`
  cursor: pointer;
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const FileUploadText = styled.p`
  margin-top: 10px;
  font-size: 0.8rem;
  color: #6c757d;
`;

const FileActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &.view {
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }
  }

  &.delete {
    background-color: #dc3545;
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
`;

export default InquiryList;
