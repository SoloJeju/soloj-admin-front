import { mockUsers } from './mockData';

export interface UserReportSummary {
  id: string;
  username: string;
  email: string;
  status: string;
  reportCount: number;
  lastActive: string;
  joinDate: string;
}

export interface UserListResponse {
  users: UserReportSummary[];
  pagination?: {
    totalPages: number;
    totalItems: number;
    currentPage: number;
    limit: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// 신고된 사용자 목록 조회 (더미 데이터 사용)
export const getUserReports = async (filters: UserFilters = {}): Promise<UserListResponse> => {
  // 실제 API 호출 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 400)); // 로딩 시뮬레이션
  
  let filteredUsers = [...mockUsers];
  
  // 상태 필터링
  if (filters.status && filters.status !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }
  
  // 검색 필터링
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
  
  // 페이지네이션
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    users: paginatedUsers,
    pagination: {
      totalPages: Math.ceil(filteredUsers.length / limit),
      totalItems: filteredUsers.length,
      currentPage: page,
      limit
    }
  };
};

// 사용자 상태 업데이트 (더미 데이터 사용)
export const updateUserStatus = async (userId: string, newStatus: string, reason?: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const userIndex = mockUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].status = newStatus;
    return true;
  }
  
  return false;
};

// 신고된 사용자 조회 (getReportedUsers의 별칭)
export const getReportedUsers = getUserReports;

// 사용자 액션 적용 (더미 데이터 사용)
export const applyUserAction = async (userId: string, action: string, reason?: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const userIndex = mockUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    // 액션에 따른 상태 변경
    switch (action) {
      case 'warn':
        // 경고는 상태를 변경하지 않고 로그만 남김
        break;
      case 'softBlock':
        mockUsers[userIndex].status = 'softBlocked';
        break;
      case 'restrict':
        mockUsers[userIndex].status = 'restricted';
        break;
      case 'ban':
        mockUsers[userIndex].status = 'banned';
        break;
      case 'restore':
        mockUsers[userIndex].status = 'normal';
        break;
      default:
        return false;
    }
    return true;
  }
  
  return false;
};
