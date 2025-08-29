import { apiCall } from './api';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
  fileName?: string;
  fileId?: string;
}

export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

// 파일 업로드
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiCall('/image/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // FormData를 사용할 때는 Content-Type을 설정하지 않습니다
        // 브라우저가 자동으로 multipart/form-data로 설정합니다
      },
    });

    return response;
  } catch (error: any) {
    throw new Error(error.message || '파일 업로드에 실패했습니다.');
  }
};

// 다중 파일 업로드
export const uploadMultipleFiles = async (files: File[]): Promise<FileUploadResponse[]> => {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  try {
    const response = await apiCall('/image/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // FormData를 사용할 때는 Content-Type을 설정하지 않습니다
      },
    });

    return response;
  } catch (error: any) {
    throw new Error(error.message || '파일 업로드에 실패했습니다.');
  }
};

// 파일 삭제
export const deleteFile = async (fileId: string): Promise<FileDeleteResponse> => {
  try {
    const response = await apiCall(`/image/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ fileId }),
    });

    return response;
  } catch (error: any) {
    throw new Error(error.message || '파일 삭제에 실패했습니다.');
  }
};

// 파일 다운로드 URL 생성 (필요시)
export const getFileDownloadUrl = (fileId: string): string => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  return `${API_BASE_URL}/api/image/download/${fileId}`;
};
