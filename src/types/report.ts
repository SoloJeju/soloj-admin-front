export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  contentType: 'user' | 'post' | 'comment' | 'room';
  contentId?: string;
  contentTitle?: string;
  reason: ReportReason;
  detailReason?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  adminAction?: AdminAction;
  adminNote?: string;
}

export type ReportReason = 
  | 'spam'
  | 'abuse'
  | 'illegal'
  | 'scam'
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
