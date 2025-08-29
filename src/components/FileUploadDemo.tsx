import React, { useState } from 'react';
import FileUpload from './FileUpload';

const FileUploadDemo: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, { url: fileUrl, name: fileName }]);
    setErrors([]);
  };

  const handleUploadError = (error: string) => {
    setErrors(prev => [...prev, error]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>파일 업로드 데모</h1>
      
      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '8px',
          color: '#721c24'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>오류 발생:</h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <button
            onClick={clearErrors}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            오류 메시지 닫기
          </button>
        </div>
      )}

      {/* 단일 파일 업로드 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>단일 이미지 업로드</h2>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          multiple={false}
          accept="image/*"
          maxSize={5}
        />
      </div>

      {/* 다중 파일 업로드 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>다중 이미지 업로드</h2>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          multiple={true}
          accept="image/*"
          maxSize={10}
        />
      </div>

      {/* 모든 파일 타입 업로드 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>모든 파일 타입 업로드</h2>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          multiple={true}
          accept="*"
          maxSize={20}
        />
      </div>

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px', color: '#555' }}>
            업로드된 파일 목록 ({uploadedFiles.length})
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '15px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
          }}>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <strong>파일명:</strong> {file.name}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>URL:</strong> 
                  <div style={{ 
                    wordBreak: 'break-all', 
                    fontSize: '12px', 
                    color: '#666',
                    backgroundColor: '#fff',
                    padding: '5px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    {file.url}
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  새 창에서 보기
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API 정보 */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#495057' }}>API 정보</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>파일 업로드:</strong> POST /api/image/upload</p>
          <p><strong>파일 삭제:</strong> DELETE /api/image/delete</p>
          <p><strong>지원 형식:</strong> 이미지 파일 (JPG, PNG, GIF 등)</p>
          <p><strong>최대 크기:</strong> 설정 가능 (기본 10MB)</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo;
