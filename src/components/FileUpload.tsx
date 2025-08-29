import React, { useState, useRef } from 'react';
import { uploadFile, uploadMultipleFiles, deleteFile, FileUploadResponse } from '../services/fileService';

interface FileUploadProps {
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // MB 단위
  className?: string;
}

interface UploadedFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
  originalFile: File;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  accept = 'image/*',
  maxSize = 10, // 기본 10MB
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 크기 검증
  const validateFileSize = (file: File): boolean => {
    const maxSizeInBytes = maxSize * 1024 * 1024; // MB를 바이트로 변환
    if (file.size > maxSizeInBytes) {
      onUploadError?.(`파일 크기가 ${maxSize}MB를 초과합니다.`);
      return false;
    }
    return true;
  };

  // 파일 타입 검증
  const validateFileType = (file: File): boolean => {
    if (accept === '*') return true;
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    return acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type || fileName.endsWith(type.replace('*', ''));
    });
  };

  // 파일 업로드 처리
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // 파일 검증
    for (const file of fileArray) {
      if (!validateFileSize(file)) return;
      if (!validateFileType(file)) {
        onUploadError?.(`지원하지 않는 파일 형식입니다: ${file.name}`);
        return;
      }
    }

    setIsUploading(true);

    try {
      let uploadResponses: FileUploadResponse[];

      if (multiple) {
        uploadResponses = await uploadMultipleFiles(fileArray);
      } else {
        const response = await uploadFile(fileArray[0]);
        uploadResponses = [response];
      }

      const newUploadedFiles: UploadedFile[] = uploadResponses.map((response, index) => ({
        fileId: response.fileId || `file_${Date.now()}_${index}`,
        fileName: response.fileName || fileArray[index].name,
        fileUrl: response.fileUrl || '',
        originalFile: fileArray[index]
      }));

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

      // 성공 콜백 호출
      newUploadedFiles.forEach(file => {
        onUploadSuccess?.(file.fileUrl, file.fileName);
      });

    } catch (error: any) {
      onUploadError?.(error.message || '파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 삭제
  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.fileId !== fileId));
    } catch (error: any) {
      onUploadError?.(error.message || '파일 삭제에 실패했습니다.');
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // 파일 입력 변경 핸들러
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  // 파일 선택 버튼 클릭
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          transition: 'all 0.3s ease',
          marginBottom: '20px'
        }}
      >
        {isUploading ? (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>파일 업로드 중...</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#666' }}>📁</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              파일을 드래그하거나 클릭하여 업로드
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {multiple ? '여러 파일을 선택할 수 있습니다' : '하나의 파일을 선택하세요'}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              최대 {maxSize}MB, {accept === 'image/*' ? '이미지 파일' : accept} 지원
            </div>
          </div>
        )}
      </div>

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
            업로드된 파일 ({uploadedFiles.length})
          </h4>
          <div style={{ display: 'grid', gap: '10px' }}>
            {uploadedFiles.map((file) => (
              <div
                key={file.fileId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {file.fileName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(file.originalFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {file.fileUrl && (
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      보기
                    </a>
                  )}
                  <button
                    onClick={() => handleFileDelete(file.fileId)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
