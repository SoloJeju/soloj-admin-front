export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  contentType: 'post' | 'comment';
  contentId?: string;
  contentTitle?: string;
  reason: ReportReason;
  detailReason?: string;
  status: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'REJECTED';
  createdAt: string;
  adminAction?: AdminAction;
  adminNote?: string;
}

export type ReportReason = 
  | 'spam'
  | 'abuse'
  | 'inappropriate'
  | 'other';

export interface AdminAction {
  type: 'warning' | 'softBlock' | 'restrictWriting' | 'permanentBan' | 'restore';
  appliedAt: string;
  adminId: string;
  adminName: string;
  duration?: number; // 일 단위
}

export interface UserReportSummary {
  userId: string;
  userName: string;
  totalReports: number;
  recentReports: Report[];
  currentStatus: 'normal' | 'softBlocked' | 'restricted' | 'banned';
  lastAction?: AdminAction;
}

export interface ContentReportSummary {
  contentId: string;
  contentType: 'post' | 'comment';
  contentTitle: string;
  authorId: string;
  authorName: string;
  reports: Report[];
  status: 'visible' | 'hidden';
}

// 1:1 문의하기 관련 타입
export interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: InquiryCategory;
  subject: string;
  content: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  adminReplyAt?: string;
  adminId?: string;
  adminName?: string;
  attachments?: string[];
}

export type InquiryCategory = 
  // API enum 값들
  | 'ACCOUNT'        // 계정 관련
  | 'PAYMENT'        // 결제 관련
  | 'GENERAL'        // 서비스 이용
  | 'TECHNICAL'      // 기술적 문제
  | 'REPORT'         // 신고 관련
  | 'OTHER'          // 기타
  // 기존 값들 (하위 호환성)
  | 'account'        // 계정 관련
  | 'payment'        // 결제 관련
  | 'service'        // 서비스 이용
  | 'technical'      // 기술적 문제
  | 'safety'         // 안전 관련
  | 'other';         // 기타

export type InquiryStatus = 
  // API enum 값들
  | 'PENDING'        // 대기중
  | 'IN_PROGRESS'    // 처리중
  | 'REPLIED'        // 답변완료
  | 'CLOSED'         // 종료
  // 기존 값들 (하위 호환성)
  | 'pending'        // 대기중
  | 'inProgress'     // 처리중
  | 'answered'       // 답변완료
  | 'closed';        // 종료

export type InquiryPriority = 
  // API enum 값들
  | 'LOW'            // 낮음
  | 'NORMAL'         // 보통
  | 'HIGH'           // 높음
  | 'URGENT'         // 긴급
  // 기존 값들 (하위 호환성)
  | 'low'            // 낮음
  | 'normal'         // 보통
  | 'high'           // 높음
  | 'urgent';        // 긴급

export interface InquirySummary {
  id: string;
  userName: string;
  category: InquiryCategory;
  subject: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  createdAt: string;
  hasReply: boolean;
  replyCount: number;
}

export interface InquiryResponse {
  inquiries: InquirySummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface InquiryDetailResponse {
  inquiry: Inquiry;
}

export interface CreateInquiryRequest {
  category: InquiryCategory;
  subject: string;
  content: string;
  priority: InquiryPriority;
  attachments?: File[];
}

export interface ReplyInquiryRequest {
  adminReply: string;
  status: InquiryStatus;
}
