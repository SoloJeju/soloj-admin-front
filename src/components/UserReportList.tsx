import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getReportedUsers, updateUserStatus, applyUserAction, getUserDetail } from '../services/userService';

const UserReportList: React.FC = () => {
  console.log('UserReportList 컴포넌트 렌더링 시작');
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    userId: string | null;
    actionType: string | null;
  }>({ open: false, userId: null, actionType: null });
  const [duration, setDuration] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [userDetailModal, setUserDetailModal] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  useEffect(() => {
    console.log('UserReportList useEffect 실행됨 - currentPage:', currentPage, 'statusFilter:', statusFilter, 'searchTerm:', searchTerm);
    fetchUserReports();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchUserReports = async () => {
    try {
      console.log('fetchUserReports 함수 시작');
      setLoading(true);
      const response: any = await getReportedUsers({
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      
      console.log('API 응답:', response); // 디버깅용
      
      // API 응답 구조에 맞게 처리 (result 배열 포함)
      if (response && response.result && Array.isArray(response.result)) {
        console.log('사용자 목록:', response.result); // 디버깅용
        setReports(response.result);
        setTotalPages(Math.ceil(response.result.length / 20));
        setTotalItems(response.result.length);
      } else {
        console.log('응답 데이터가 올바르지 않음:', response); // 디버깅용
        setReports([]);
        setTotalPages(1);
        setTotalItems(0);
      }
      setError(null);
    } catch (err) {
      console.error('User reports fetch error:', err);
      setError('사용자 신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      console.log('fetchUserReports 함수 완료');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUserReports();
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(userId);
      await updateUserStatus(userId, { status: newStatus, reason: '관리자에 의한 상태 변경' });
      await fetchUserReports(); // 목록 새로고침
    } catch (err) {
      console.error('Status update error:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = (userId: string, actionType: string) => {
    // 영구 정지의 경우 강력 경고
    if (actionType === 'permanentBan') {
      const confirmed = window.confirm(
        '⚠️ 경고: 영구 정지는 되돌릴 수 없는 심각한 조치입니다.\n\n' +
        '정말로 이 사용자를 영구 정지하시겠습니까?'
      );
      if (!confirmed) return;
    }
    
    setActionModal({ open: true, userId, actionType });
    setDuration(1);
    setReason('');
  };

  const handleActionConfirm = async () => {
    if (!actionModal.userId || !actionModal.actionType) return;
    
    try {
      setActionLoading(actionModal.userId);
      
      // API 명세에 맞게 actionType 매핑
      let apiActionType: 'warning' | 'softBlock' | 'restrictWriting' | 'permanentBan' | 'restore';
      let finalDuration: number | undefined;
      
      switch (actionModal.actionType) {
        case 'warning':
          apiActionType = 'warning';
          finalDuration = undefined; // 경고는 기간 불필요
          break;
        case 'softBlock':
          apiActionType = 'softBlock';
          finalDuration = duration;
          break;
        case 'restrictWriting':
          apiActionType = 'restrictWriting';
          finalDuration = duration;
          break;
        case 'permanentBan':
          apiActionType = 'permanentBan';
          finalDuration = undefined; // 영구 정지
          break;
        case 'restore':
          apiActionType = 'restore';
          finalDuration = undefined; // 복구는 기간 불필요
          break;
        default:
          throw new Error('알 수 없는 조치 유형입니다.');
      }
      
      await applyUserAction(actionModal.userId, {
        actionType: apiActionType,
        duration: finalDuration,
        reason: reason || '관리자에 의한 조치'
      });
      
      await fetchUserReports(); // 목록 새로고침
      alert('조치가 성공적으로 적용되었습니다.');
      setActionModal({ open: false, userId: null, actionType: null });
    } catch (err) {
      console.error('Action apply error:', err);
      alert('조치 적용에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const closeActionModal = () => {
    setActionModal({ open: false, userId: null, actionType: null });
    setDuration(1);
    setReason('');
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

      <FilterSection>
        <FilterGroup>
          <FilterLabel>상태별 필터</FilterLabel>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="normal">정상 상태</option>
            <option value="restricted">제한된 상태</option>
            <option value="banned">차단된 상태</option>
          </FilterSelect>
        </FilterGroup>

        <SearchGroup>
          <SearchInput
            type="text"
            placeholder="사용자 이름 또는 ID 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchGroup>
      </FilterSection>

      <StatsBar>
        <StatItem>
          <StatLabel>총 사용자</StatLabel>
          <StatValue>{totalItems}명</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>현재 페이지</StatLabel>
          <StatValue>{currentPage} / {totalPages}</StatValue>
        </StatItem>
      </StatsBar>

      {reports.length > 0 ? (
        <>
          <ReportList>
            {reports.map((user: any) => (
              <ReportCard 
                key={user.userId}
                onClick={() => {
                  console.log('신고 목록 클릭됨:', user.userName, 'userId:', user.userId);
                  handleUserDetailView(user.userId.toString());
                }}
              >
                <UserInfo>
                  <UserName>
                    {user.userName || '이름 없음'}
                  </UserName>
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
                  <DetailItem>
                    <DetailLabel>상태:</DetailLabel>
                    <DetailValue>{getStatusText(user.currentStatus)}</DetailValue>
                  </DetailItem>
                </ReportDetails>
                <ActionButtons>
                  <ActionButton
                    onClick={() => handleAction(user.userId.toString(), 'restore')}
                    disabled={actionLoading === user.userId.toString()}
                  >
                    {actionLoading === user.userId.toString() ? '처리중...' : '복구'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(user.userId.toString(), 'warning')}
                    disabled={actionLoading === user.userId.toString()}
                  >
                    {actionLoading === user.userId.toString() ? '처리중...' : '경고'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(user.userId.toString(), 'softBlock')}
                    disabled={actionLoading === user.userId.toString()}
                  >
                    {actionLoading === user.userId.toString() ? '처리중...' : '일시 차단'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(user.userId.toString(), 'restrictWriting')}
                    disabled={actionLoading === user.userId.toString()}
                  >
                    {actionLoading === user.userId.toString() ? '처리중...' : '작성 제한'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleAction(user.userId.toString(), 'permanentBan')}
                    disabled={actionLoading === user.userId.toString()}
                  >
                    {actionLoading === user.userId.toString() ? '처리중...' : '영구 정지'}
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
          <EmptyTitle>신고된 사용자가 없습니다</EmptyTitle>
          <EmptyDescription>
            현재 신고된 사용자가 없습니다. 새로운 신고가 접수되면 여기에 표시됩니다.
          </EmptyDescription>
        </EmptyState>
      )}

      {/* 조치 모달 */}
      {actionModal.open && (
        <ModalOverlay onClick={closeActionModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>사용자 조치 적용</ModalTitle>
              <CloseButton onClick={closeActionModal}>&times;</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <ModalSection>
                <ModalLabel>조치 유형:</ModalLabel>
                <ModalValue>{getActionLabel(actionModal.actionType || '')}</ModalValue>
              </ModalSection>
              
              {(actionModal.actionType === 'softBlock' || actionModal.actionType === 'restrictWriting') && (
                <ModalSection>
                  <ModalLabel>기간 (일):</ModalLabel>
                  <ModalInput
                    type="number"
                    min="1"
                    max="365"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    placeholder="기간을 입력하세요"
                  />
                </ModalSection>
              )}
              
              <ModalSection>
                <ModalLabel>사유:</ModalLabel>
                <ModalTextarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="조치 사유를 입력하세요"
                  rows={3}
                />
              </ModalSection>
              
              <ModalActions>
                <ModalButton onClick={handleActionConfirm} disabled={actionLoading === actionModal.userId}>
                  {actionLoading === actionModal.userId ? '처리중...' : '조치 적용'}
                </ModalButton>
                <ModalCancelButton onClick={closeActionModal}>
                  취소
                </ModalCancelButton>
              </ModalActions>
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
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🍊</div>
                  <div>사용자 정보를 불러오는 중...</div>
                </div>
              ) : userDetail ? (
                <>
                  {/* 기본 정보 */}
                  <ModalSection>
                    <ModalLabel>사용자 정보:</ModalLabel>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
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
                    </div>
                  </ModalSection>

                  {/* 신고 통계 */}
                  <ModalSection>
                    <ModalLabel>신고 통계:</ModalLabel>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>총 신고 수:</strong> {userDetail.totalReports}건
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>대기 중:</strong> {userDetail.pendingReports}건
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>처리 완료:</strong> {userDetail.processedReports}건
                      </div>
                    </div>
                  </ModalSection>

                  {/* 제재 정보 */}
                  {userDetail.penaltyInfo && (
                    <ModalSection>
                      <ModalLabel>제재 정보:</ModalLabel>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
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
                      </div>
                    </ModalSection>
                  )}

                  {/* 활동 정보 */}
                  {userDetail.activityInfo && (
                    <ModalSection>
                      <ModalLabel>활동 정보:</ModalLabel>
                      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
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
                      </div>
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
                              신고자: {report.reporterName} | 사유: {report.reason} | 상태: {report.status}
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
                <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                  사용자 정보를 불러올 수 없습니다.
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal': return '정상 상태';
    case 'restricted': return '제한된 상태';
    case 'banned': return '차단된 상태';
    case 'active': return '활성';
    case 'inactive': return '비활성';
    case 'softBlocked': return '일시 차단';
    default: return status || '알 수 없음';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return '#28a745'; // 초록 - 정상 상태
    case 'restricted': return '#ffc107'; // 노랑 - 제한된 상태
    case 'banned': return '#dc3545'; // 빨강 - 차단된 상태
    case 'active': return '#28a745'; // 초록 - 활성
    case 'inactive': return '#dc3545'; // 빨강 - 비활성
    case 'softBlocked': return '#fd7e14'; // 주황 - 일시 차단
    default: return '#6c757d'; // 회색
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case 'warning': return '경고';
    case 'softBlock': return '일시 차단단';
    case 'restrictWriting': return '작성 제한';
    case 'permanentBan': return '영구 정지';
    case 'restore': return '복구';
    default: return '조치';
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
    border-color: #e9ecef;
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
    border-color: #e9ecef;
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
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
    border-color: #007bff;
  }

  &:active {
    transform: translateY(0);
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

const ClickableUserName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #007bff;
  margin: 0;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
`;

const UserStatus = styled.span<{ status: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => getStatusColor(props.status)};
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
  max-width: 500px;
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

const ModalSection = styled.div`
  margin-bottom: 20px;
`;

const ModalLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
`;

const ModalValue = styled.div`
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #333;
  font-weight: 500;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #ced4da;
    box-shadow: none;
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #ced4da;
    box-shadow: none;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #e55a2b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalCancelButton = styled.button`
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

export default UserReportList;
