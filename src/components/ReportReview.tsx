import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getReports, updateReportStatus, processReport, ReportListResponse, ReportFilters, Report } from '../services/reportService';
import { getPostDetail, getCommentDetail } from '../services/contentService';
import { getUserDetail } from '../services/userService';

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
  const [processModal, setProcessModal] = useState<{ open: boolean; reportId: string | null; action: string | null }>({ open: false, reportId: null, action: null });
  const [processReason, setProcessReason] = useState('');
  const [contentDetailModal, setContentDetailModal] = useState<{ open: boolean; contentId: string | null; contentType: string | null }>({ open: false, contentId: null, contentType: null });
  const [contentDetail, setContentDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userDetailModal, setUserDetailModal] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

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

  const handleProcessReport = (reportId: string, action: string) => {
    setProcessModal({ open: true, reportId, action });
    setProcessReason('');
  };

  const handleProcessConfirm = async () => {
    if (!processModal.reportId || !processModal.action || !processReason.trim()) {
      alert('처리 사유를 입력해주세요.');
      return;
    }

    try {
      const success = await processReport(processModal.reportId, {
        action: processModal.action as 'approve' | 'reject',
        reason: processReason.trim()
      });
      
      if (success) {
        alert('신고가 성공적으로 처리되었습니다.');
        setProcessModal({ open: false, reportId: null, action: null });
        setProcessReason('');
        fetchReports(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Report process error:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  const handleProcessCancel = () => {
    setProcessModal({ open: false, reportId: null, action: null });
    setProcessReason('');
  };

  const handleContentDetailView = async (contentId: string, contentType: string) => {
    try {
      setDetailLoading(true);
      setContentDetailModal({ open: true, contentId, contentType });
      
      console.log('콘텐츠 상세조회 요청 ID:', contentId, '타입:', contentType);
      
      let detail;
      if (contentType === 'comment') {
        console.log('댓글 상세조회 시작');
        detail = await getCommentDetail(contentId);
        console.log('댓글 상세조회 응답:', detail);
      } else {
        console.log('게시글 상세조회 시작');
        detail = await getPostDetail(contentId);
        console.log('게시글 상세조회 응답:', detail);
      }
      
      console.log('응답 구조 확인:', {
        title: detail?.title,
        authorNickname: detail?.authorNickname,
        status: detail?.status,
        comments: detail?.comments,
        content: detail?.content,
        postMeta: detail?.postMeta
      });
      
      setContentDetail(detail);
    } catch (err) {
      console.error('Content detail fetch error:', err);
      alert('콘텐츠 상세 정보를 불러오는데 실패했습니다.');
      setContentDetailModal({ open: false, contentId: null, contentType: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleContentDetailClose = () => {
    setContentDetailModal({ open: false, contentId: null, contentType: null });
    setContentDetail(null);
  };

  const handleUserDetailView = async (userId: string) => {
    try {
      setUserDetailLoading(true);
      setUserDetailModal({ open: true, userId });
      
      console.log('사용자 상세조회 요청 ID:', userId);
      
      const detail = await getUserDetail(userId);
      console.log('사용자 상세조회 응답:', detail);
      
      setUserDetail(detail);
    } catch (err) {
      console.error('User detail fetch error:', err);
      alert('사용자 상세 정보를 불러오는데 실패했습니다.');
      setUserDetailModal({ open: false, userId: null });
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleUserDetailClose = () => {
    setUserDetailModal({ open: false, userId: null });
    setUserDetail(null);
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const success = await updateReportStatus(reportId, newStatus);
      if (success) {
        // 상태 업데이트 성공 시 목록 새로고침
        fetchReports();
      }
    } catch (error) {
      // 에러 처리
    }
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
      case 'PENDING': return '대기 중';
      case 'REVIEWED': return '검토 중';
      case 'RESOLVED': return '처리 완료';
      default: return status || '알 수 없음';
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'SPAM': '스팸',
      'HARASSMENT': '괴롭힘',
      'VIOLENCE': '폭력',
      'HATE_SPEECH': '혐오 발언',
      'INAPPROPRIATE': '부적절한 내용',
      'COPYRIGHT': '저작권 침해',
      'OTHER': '기타'
    };
    return reasonMap[reason] || reason;
  };

  const getContentTypeText = (type: string) => {
    if (!type) return '사용자 신고';
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
                         <ReportItem 
               key={report.id} 
               onClick={() => report.contentId && handleContentDetailView(report.contentId, report.contentType)}
               $clickable={!!report.contentId}
             >
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
                    <TimeStamp>{new Date(report.createdAt).toLocaleString('ko-KR')}</TimeStamp>
                  </ReportMeta>
                  <ReportDetails>
                                         <DetailItem>
                       <DetailLabel>신고자:</DetailLabel>
                       <ClickableUserName onClick={(e) => { e.stopPropagation(); handleUserDetailView(report.reporterId); }}>
                         {report.reporterName}
                       </ClickableUserName>
                     </DetailItem>
                     <DetailItem>
                       <DetailLabel>피신고자:</DetailLabel>
                       <ClickableUserName onClick={(e) => { e.stopPropagation(); handleUserDetailView(report.reportedUserId); }}>
                         {report.reportedUserName}
                       </ClickableUserName>
                     </DetailItem>
                                         {report.contentTitle && (
                       <DetailItem>
                         <DetailLabel>콘텐츠:</DetailLabel>
                         <DetailValue>{report.contentTitle}</DetailValue>
                       </DetailItem>
                     )}
                  </ReportDetails>
                </ReportInfo>
                                 <ActionButtons onClick={(e) => e.stopPropagation()}>
                   <ActionButton
                     onClick={() => handleProcessReport(report.id, 'approve')}
                     disabled={report.status === 'RESOLVED'}
                     $primary
                   >
                     승인
                   </ActionButton>
                   <ActionButton
                     onClick={() => handleProcessReport(report.id, 'reject')}
                     disabled={report.status === 'RESOLVED'}
                     $secondary
                   >
                     반려
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

       {/* 신고 처리 모달 */}
       {processModal.open && (
         <ModalOverlay onClick={handleProcessCancel}>
           <ModalContent onClick={(e) => e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>
                 신고 {processModal.action === 'approve' ? '승인' : '반려'}
               </ModalTitle>
               <CloseButton onClick={handleProcessCancel}>&times;</CloseButton>
             </ModalHeader>
             <ModalBody>
               <ModalSection>
                 <ModalLabel>처리 사유:</ModalLabel>
                 <ModalTextarea
                   value={processReason}
                   onChange={(e) => setProcessReason(e.target.value)}
                   placeholder={`신고 ${processModal.action === 'approve' ? '승인' : '반려'} 사유를 입력하세요...`}
                   rows={4}
                 />
               </ModalSection>
               <ModalActions>
                 <ModalButton onClick={handleProcessConfirm} $primary>
                   {processModal.action === 'approve' ? '승인' : '반려'}
                 </ModalButton>
                 <ModalCancelButton onClick={handleProcessCancel}>
                   취소
                 </ModalCancelButton>
               </ModalActions>
             </ModalBody>
           </ModalContent>
         </ModalOverlay>
       )}

       {/* 콘텐츠 상세정보 모달 */}
       {contentDetailModal.open && (
         <ModalOverlay onClick={handleContentDetailClose}>
           <ModalContent onClick={(e) => e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>
                 {contentDetailModal.contentType === 'comment' ? '댓글' : '게시글'} 상세정보
               </ModalTitle>
               <CloseButton onClick={handleContentDetailClose}>&times;</CloseButton>
             </ModalHeader>
             <ModalBody>
               {detailLoading ? (
                 <LoadingMessage>
                   <LoadingIcon>🍊</LoadingIcon>
                   콘텐츠 정보를 불러오는 중...
                 </LoadingMessage>
               ) : contentDetail ? (
                 <>
                   {/* 게시글 맥락 정보 (댓글인 경우) */}
                   {contentDetail.postMeta && (
                     <PostContextSection>
                       <PostContextLabel>게시글 맥락:</PostContextLabel>
                       <PostContextItem>
                         <PostContextTitle>{contentDetail.postMeta.title}</PostContextTitle>
                         <PostContextAuthor>작성자: {contentDetail.postMeta.authorNickname}</PostContextAuthor>
                         <PostContextDate>작성일: {new Date(contentDetail.postMeta.createdAt).toLocaleString('ko-KR')}</PostContextDate>
                       </PostContextItem>
                     </PostContextSection>
                   )}

                   {/* 콘텐츠 상태 */}
                   <ModalSection>
                     <ModalLabel>상태:</ModalLabel>
                     <span style={{
                       display: 'inline-block',
                       padding: '4px 12px',
                       borderRadius: '15px',
                       fontSize: '0.8rem',
                       fontWeight: '700',
                       textTransform: 'uppercase',
                       letterSpacing: '0.5px',
                       backgroundColor: contentDetail.status === 'visible' ? '#28a745' : 
                                       contentDetail.status === 'hidden' ? '#ffc107' : '#dc3545',
                       color: 'white',
                       boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                     }}>
                       {contentDetail.status === 'visible' ? '표시됨' : 
                        contentDetail.status === 'hidden' ? '숨김' : '삭제됨'}
                     </span>
                   </ModalSection>

                   {/* 제목 (게시글인 경우) */}
                   {contentDetail.title && (
                     <ModalSection>
                       <ModalLabel>제목:</ModalLabel>
                       <ModalDetailValue>{contentDetail.title}</ModalDetailValue>
                     </ModalSection>
                   )}

                   {/* 작성자 */}
                   <ModalSection>
                     <ModalLabel>작성자:</ModalLabel>
                     <ModalDetailValue>{contentDetail.authorNickname || contentDetail.authorName}</ModalDetailValue>
                   </ModalSection>

                   {/* 카테고리 (게시글인 경우) */}
                   {contentDetail.postCategory && (
                     <ModalSection>
                       <ModalLabel>카테고리:</ModalLabel>
                       <ModalDetailValue>{contentDetail.postCategory}</ModalDetailValue>
                     </ModalSection>
                   )}

                   {/* 작성일 */}
                   <ModalSection>
                     <ModalLabel>작성일:</ModalLabel>
                     <ModalDetailValue>{new Date(contentDetail.createdAt).toLocaleString('ko-KR')}</ModalDetailValue>
                   </ModalSection>

                   {/* 내용 */}
                   <ModalSection>
                     <ModalLabel>{contentDetail.postMeta ? '댓글 내용:' : '게시글 내용:'}</ModalLabel>
                     <ModalDetailValue style={{ 
                       whiteSpace: 'pre-wrap', 
                       lineHeight: '1.6',
                       padding: '15px',
                       backgroundColor: '#f8f9fa',
                       borderRadius: '8px',
                       border: '1px solid #e9ecef'
                     }}>
                       {contentDetail.content}
                     </ModalDetailValue>
                   </ModalSection>

                   {/* 댓글 목록 (게시글인 경우) */}
                   {contentDetail.comments && contentDetail.comments.length > 0 && (
                     <ModalSection>
                       <ModalLabel>댓글 목록:</ModalLabel>
                       <CommentList>
                         {contentDetail.comments.map((comment: any, index: number) => (
                           <CommentItem key={index}>
                             <CommentHeader>
                               <CommentAuthor>{comment.authorNickname}</CommentAuthor>
                               <span style={{
                                 display: 'inline-block',
                                 padding: '2px 8px',
                                 borderRadius: '10px',
                                 fontSize: '0.7rem',
                                 fontWeight: '700',
                                 textTransform: 'uppercase',
                                 letterSpacing: '0.5px',
                                 backgroundColor: comment.status === 'visible' ? '#28a745' : 
                                                 comment.status === 'hidden' ? '#ffc107' : '#dc3545',
                                 color: 'white',
                                 boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
                               }}>
                                 {comment.status === 'visible' ? '표시됨' : 
                                  comment.status === 'hidden' ? '숨김' : '삭제됨'}
                               </span>
                               <CommentDate>{new Date(comment.createdAt).toLocaleString('ko-KR')}</CommentDate>
                             </CommentHeader>
                             <CommentContent>{comment.content}</CommentContent>
                           </CommentItem>
                         ))}
                       </CommentList>
                     </ModalSection>
                   )}
                 </>
               ) : (
                 <ErrorMessage>콘텐츠 정보를 불러올 수 없습니다.</ErrorMessage>
               )}
             </ModalBody>
           </ModalContent>
         </ModalOverlay>
               )}

        {/* 사용자 상세정보 모달 */}
        {userDetailModal.open && (
          <ModalOverlay onClick={handleUserDetailClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>사용자 상세정보</ModalTitle>
                <CloseButton onClick={handleUserDetailClose}>&times;</CloseButton>
              </ModalHeader>
              <ModalBody>
                {userDetailLoading ? (
                  <LoadingMessage>
                    <LoadingIcon>🍊</LoadingIcon>
                    사용자 정보를 불러오는 중...
                  </LoadingMessage>
                ) : userDetail ? (
                  <>
                    {/* 기본 정보 */}
                    <ModalSection>
                      <ModalLabel>사용자 정보:</ModalLabel>
                      <ModalDetailValue>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>이름:</strong> {userDetail.userName}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>이메일:</strong> {userDetail.email}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>가입일:</strong> {new Date(userDetail.joinDate).toLocaleString('ko-KR')}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>상태:</strong> 
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            backgroundColor: userDetail.userStatus === 'active' ? '#28a745' : '#dc3545',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            marginLeft: '8px'
                          }}>
                            {userDetail.userStatus === 'active' ? '활성' : '비활성'}
                          </span>
                        </div>
                      </ModalDetailValue>
                    </ModalSection>

                    {/* 신고 통계 */}
                    <ModalSection>
                      <ModalLabel>신고 통계:</ModalLabel>
                      <ModalDetailValue>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>총 신고 수:</strong> {userDetail.totalReports}건
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>대기 중:</strong> {userDetail.pendingReports}건
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>처리 완료:</strong> {userDetail.processedReports}건
                        </div>
                      </ModalDetailValue>
                    </ModalSection>

                    {/* 제재 정보 */}
                    {userDetail.penaltyInfo && (
                      <ModalSection>
                        <ModalLabel>제재 정보:</ModalLabel>
                        <ModalDetailValue>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>제재 레벨:</strong> {userDetail.penaltyInfo.penaltyLevel}
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>현재 제재:</strong> {userDetail.penaltyInfo.currentRestriction}
                          </div>
                          {userDetail.penaltyInfo.restrictedUntil && (
                            <div style={{ marginBottom: '10px' }}>
                              <strong>제재 만료일:</strong> {new Date(userDetail.penaltyInfo.restrictedUntil).toLocaleString('ko-KR')}
                            </div>
                          )}
                          {userDetail.penaltyInfo.restrictionReason && (
                            <div style={{ marginBottom: '10px' }}>
                              <strong>제재 사유:</strong> {userDetail.penaltyInfo.restrictionReason}
                            </div>
                          )}
                        </ModalDetailValue>
                      </ModalSection>
                    )}

                    {/* 활동 정보 */}
                    {userDetail.activityInfo && (
                      <ModalSection>
                        <ModalLabel>활동 정보:</ModalLabel>
                        <ModalDetailValue>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>게시글:</strong> {userDetail.activityInfo.totalPosts}개
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>댓글:</strong> {userDetail.activityInfo.totalComments}개
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>리뷰:</strong> {userDetail.activityInfo.totalReviews}개
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>마지막 활동:</strong> {new Date(userDetail.activityInfo.lastActivityDate).toLocaleString('ko-KR')}
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>신고된 게시글:</strong> {userDetail.activityInfo.reportedPosts}개
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>신고된 댓글:</strong> {userDetail.activityInfo.reportedComments}개
                          </div>
                        </ModalDetailValue>
                      </ModalSection>
                    )}

                    {/* 최근 신고 내역 */}
                    {userDetail.recentReports && userDetail.recentReports.length > 0 && (
                      <ModalSection>
                        <ModalLabel>최근 신고 내역:</ModalLabel>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {userDetail.recentReports.map((report: any, index: number) => (
                            <div key={index} style={{
                              padding: '10px',
                              marginBottom: '8px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>
                                {report.contentTitle || '사용자 신고'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                신고자: {report.reporterName} | 사유: {getReasonText(report.reason)} | 상태: {getStatusText(report.status)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {new Date(report.createdAt).toLocaleString('ko-KR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ModalSection>
                    )}

                    {/* 제재 이력 */}
                    {userDetail.penaltyHistory && userDetail.penaltyHistory.length > 0 && (
                      <ModalSection>
                        <ModalLabel>제재 이력:</ModalLabel>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {userDetail.penaltyHistory.map((penalty: any, index: number) => (
                            <div key={index} style={{
                              padding: '10px',
                              marginBottom: '8px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>
                                {penalty.action}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                사유: {penalty.reason}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {new Date(penalty.createdAt).toLocaleString('ko-KR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ModalSection>
                    )}
                  </>
                ) : (
                  <ErrorMessage>사용자 정보를 불러올 수 없습니다.</ErrorMessage>
                )}
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}

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
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f4;
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  align-items: end;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  }

  @media (max-width: 768px) {
    padding: 25px;
    gap: 20px;
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

const ReportItem = styled.div<{ $clickable?: boolean }>`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f4;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  }

  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-4px)' : 'none'};
    box-shadow: ${props => props.$clickable ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.1)'};
  }

  @media (max-width: 768px) {
    padding: 25px;
    border-radius: 15px;
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
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReasonBadge = styled.span`
  background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentTypeBadge = styled.span`
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(111, 66, 193, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const ClickableContentTitle = styled.span`
  color: #007bff;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
`;

const ClickableUserName = styled.span`
  color: #007bff;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
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

const ActionButton = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => {
    if (props.$primary) return '#28a745';
    if (props.$secondary) return '#17a2b8';
    return '#ff6b35';
  }};
  background: white;
  color: ${props => {
    if (props.$primary) return '#28a745';
    if (props.$secondary) return '#17a2b8';
    return '#ff6b35';
  }};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;

  &:hover:not(:disabled) {
    background: ${props => {
      if (props.$primary) return '#28a745';
      if (props.$secondary) return '#17a2b8';
      return '#ff6b35';
    }};
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

// 모달 관련 스타일 컴포넌트들
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
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const ModalSection = styled.div`
  margin-bottom: 25px;
`;

const ModalLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 0.95rem;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border: 2px solid ${props => props.$primary ? '#28a745' : '#6c757d'};
  background: ${props => props.$primary ? '#28a745' : 'white'};
  color: ${props => props.$primary ? 'white' : '#6c757d'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.$primary ? '#218838' : '#6c757d'};
    color: white;
    transform: translateY(-2px);
  }
`;

const ModalCancelButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: #dc3545;
    color: white;
    transform: translateY(-2px);
  }
`;

// 콘텐츠 상세정보 모달 관련 스타일 컴포넌트들
const ModalDetailValue = styled.div`
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const PostContextSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #ff6b35;
`;

const PostContextLabel = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

const PostContextItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PostContextTitle = styled.div`
  font-weight: 600;
  color: #343a40;
  font-size: 0.95rem;
`;

const PostContextAuthor = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const PostContextDate = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
`;

const CommentItem = styled.div`
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
`;

const CommentDate = styled.span`
  color: #6c757d;
  font-size: 0.8rem;
`;

const CommentContent = styled.div`
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

export default ReportReview;
