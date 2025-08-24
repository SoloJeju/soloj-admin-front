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
export const updateUserStatus = async (userId: string, newStatus: string): Promise<boolean> => {
  // 실제 API 호출 대신 더미 데이터 업데이트
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  
  const userIndex = mockUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].status = newStatus;
    return true;
  }
  
  return false;
};
