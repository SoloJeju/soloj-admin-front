// 더미 데이터 정의
export const mockReports = [
  {
    id: '1',
    contentType: 'post',
    reportedUserName: '김철수',
    reporterName: '이영희',
    reason: 'spam',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    contentTitle: '제주도 동행 구합니다',
    detailReason: '스팸성 게시글입니다. 계속 올라오고 있어요.'
  },
  {
    id: '2',
    contentType: 'comment',
    reportedUserName: '박민수',
    reporterName: '최지영',
    reason: 'abuse',
    status: 'reviewed',
    createdAt: '2024-01-14T15:20:00Z',
    contentTitle: '제주도 여행 후기',
    detailReason: '욕설과 폭력적인 댓글을 남겼습니다.'
  },
  {
    id: '3',
    contentType: 'user',
    reportedUserName: '정수진',
    reporterName: '김동현',
    reason: 'scam',
    status: 'resolved',
    createdAt: '2024-01-13T09:15:00Z',
    contentTitle: null,
    detailReason: '사기성 계정입니다. 가짜 정보로 사기를 치고 있습니다.'
  },
  {
    id: '4',
    contentType: 'room',
    reportedUserName: '윤서연',
    reporterName: '박준호',
    reason: 'inappropriate',
    status: 'pending',
    createdAt: '2024-01-12T14:45:00Z',
    contentTitle: '제주도 동행방',
    detailReason: '부적절한 내용의 동행방입니다.'
  }
];

export const mockUsers = [
  {
    id: '1',
    username: '김철수',
    email: 'kim@example.com',
    status: 'active',
    reportCount: 3,
    lastActive: '2024-01-15T10:30:00Z',
    joinDate: '2023-12-01T00:00:00Z'
  },
  {
    id: '2',
    username: '이영희',
    email: 'lee@example.com',
    status: 'active',
    reportCount: 1,
    lastActive: '2024-01-15T09:15:00Z',
    joinDate: '2023-11-15T00:00:00Z'
  },
  {
    id: '3',
    username: '박민수',
    email: 'park@example.com',
    status: 'suspended',
    reportCount: 5,
    lastActive: '2024-01-10T16:20:00Z',
    joinDate: '2023-10-20T00:00:00Z'
  },
  {
    id: '4',
    username: '정수진',
    email: 'jung@example.com',
    status: 'banned',
    reportCount: 8,
    lastActive: '2024-01-08T11:30:00Z',
    joinDate: '2023-09-10T00:00:00Z'
  }
];

export const mockContents = [
  {
    id: '1',
    type: 'post',
    title: '제주도 동행 구합니다',
    author: '김철수',
    status: 'active',
    reportCount: 2,
    createdAt: '2024-01-15T10:30:00Z',
    content: '제주도 여행 동행 구합니다. 1월 20일부터 3박4일...'
  },
  {
    id: '2',
    type: 'comment',
    title: '제주도 여행 후기',
    author: '박민수',
    status: 'hidden',
    reportCount: 3,
    createdAt: '2024-01-14T15:20:00Z',
    content: '정말 좋았어요! 다음에 또 가고 싶어요...'
  },
  {
    id: '3',
    type: 'post',
    title: '제주도 맛집 추천',
    author: '이영희',
    status: 'active',
    reportCount: 0,
    createdAt: '2024-01-13T12:00:00Z',
    content: '제주도에서 꼭 가봐야 할 맛집들을 소개합니다...'
  }
];

export const mockInquiries = [
  {
    id: '1',
    title: '계정 정지 문의',
    category: 'account',
    status: 'pending',
    priority: 'high',
    author: '김철수',
    createdAt: '2024-01-15T10:30:00Z',
    content: '계정이 정지되었는데 이유를 모르겠습니다.',
    replyCount: 0
  },
  {
    id: '2',
    title: '신고 처리 결과 문의',
    category: 'report',
    status: 'answered',
    priority: 'medium',
    author: '이영희',
    createdAt: '2024-01-14T15:20:00Z',
    content: '신고한 게시글의 처리 결과가 궁금합니다.',
    replyCount: 1
  },
  {
    id: '3',
    title: '서비스 이용 문의',
    category: 'service',
    status: 'in_progress',
    priority: 'low',
    author: '박민수',
    createdAt: '2024-01-13T09:15:00Z',
    content: '서비스 이용 방법에 대해 문의드립니다.',
    replyCount: 0
  }
];

export const mockDashboardStats = {
  totalUsers: 1250,
  totalReports: 89,
  totalContents: 567,
  totalInquiries: 23,
  pendingReports: 15,
  pendingInquiries: 8,
  resolvedReports: 67,
  answeredInquiries: 12
};

export const mockRecentActivities = [
  {
    id: '1',
    type: 'report',
    action: '새로운 신고 접수',
    target: '게시글: 제주도 동행 구합니다',
    timestamp: '2024-01-15T10:30:00Z',
    user: '이영희'
  },
  {
    id: '2',
    type: 'user',
    action: '사용자 계정 정지',
    target: '박민수',
    timestamp: '2024-01-15T09:15:00Z',
    user: '관리자'
  },
  {
    id: '3',
    type: 'inquiry',
    action: '1:1 문의 답변 완료',
    target: '계정 정지 문의',
    timestamp: '2024-01-15T08:45:00Z',
    user: '관리자'
  },
  {
    id: '4',
    type: 'content',
    action: '콘텐츠 숨김 처리',
    target: '댓글: 제주도 여행 후기',
    timestamp: '2024-01-14T16:20:00Z',
    user: '관리자'
  }
];
