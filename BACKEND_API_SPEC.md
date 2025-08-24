# 혼자옵서예 1:1 문의하기 기능 백엔드 API 명세서

## 개요
사용자가 1:1 문의를 작성하고, 관리자가 답변할 수 있는 시스템의 백엔드 API 명세서입니다.

## 데이터베이스 스키마

### 1. 1:1 문의 테이블 (inquiries)
```sql
CREATE TABLE inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(20) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_reply TEXT,
    admin_reply_at TIMESTAMP NULL,
    admin_id BIGINT NULL,
    admin_name VARCHAR(100) NULL,
    attachments JSON NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_admin_id (admin_id)
);
```

### 2. 문의 첨부파일 테이블 (inquiry_attachments)
```sql
CREATE TABLE inquiry_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
    INDEX idx_inquiry_id (inquiry_id)
);
```

## API 엔드포인트

### 1. 사용자용 API

#### 1.1 문의 작성
- **POST** `/api/inquiries`
- **설명**: 사용자가 1:1 문의를 작성합니다.
- **요청 본문**:
```json
{
    "category": "account",
    "subject": "계정 비밀번호 변경 문의",
    "content": "비밀번호를 변경하고 싶습니다.",
    "priority": "normal"
}
```
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY001",
    "message": "문의가 성공적으로 등록되었습니다.",
    "result": {
        "inquiryId": "123",
        "createdAt": "2024-01-15T10:30:00Z"
    }
}
```

#### 1.2 내 문의 목록 조회
- **GET** `/api/inquiries/my`
- **설명**: 로그인한 사용자의 문의 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `status`: 상태 필터 (pending, inProgress, answered, closed)
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY002",
    "message": "문의 목록을 성공적으로 조회했습니다.",
    "result": {
        "inquiries": [
            {
                "id": "123",
                "category": "account",
                "subject": "계정 비밀번호 변경 문의",
                "status": "answered",
                "priority": "normal",
                "createdAt": "2024-01-15T10:30:00Z",
                "hasReply": true,
                "replyCount": 1
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalItems": 1,
            "itemsPerPage": 10
        }
    }
}
```

#### 1.3 문의 상세 조회
- **GET** `/api/inquiries/{id}`
- **설명**: 특정 문의의 상세 내용과 답변을 조회합니다.
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY003",
    "message": "문의 상세를 성공적으로 조회했습니다.",
    "result": {
        "inquiry": {
            "id": "123",
            "category": "account",
            "subject": "계정 비밀번호 변경 문의",
            "content": "비밀번호를 변경하고 싶습니다.",
            "status": "answered",
            "priority": "normal",
            "createdAt": "2024-01-15T10:30:00Z",
            "adminReply": "비밀번호 변경 방법을 안내드립니다...",
            "adminReplyAt": "2024-01-15T14:20:00Z",
            "adminName": "관리자1",
            "attachments": []
        }
    }
}
```

### 2. 관리자용 API

#### 2.1 문의 목록 조회
- **GET** `/api/admin/inquiries`
- **설명**: 관리자가 모든 문의 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `status`: 상태 필터 (pending, inProgress, answered, closed)
  - `category`: 카테고리 필터 (account, payment, service, technical, safety, other)
  - `priority`: 우선순위 필터 (urgent, high, normal, low)
  - `search`: 제목 또는 내용 검색
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY004",
    "message": "문의 목록을 성공적으로 조회했습니다.",
    "result": {
        "inquiries": [
            {
                "id": "123",
                "userName": "홍길동",
                "category": "account",
                "subject": "계정 비밀번호 변경 문의",
                "status": "pending",
                "priority": "normal",
                "createdAt": "2024-01-15T10:30:00Z",
                "hasReply": false,
                "replyCount": 0
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalItems": 1,
            "itemsPerPage": 10
        }
    }
}
```

#### 2.2 문의 상세 조회
- **GET** `/api/admin/inquiries/{id}`
- **설명**: 관리자가 특정 문의의 상세 내용을 조회합니다.
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY005",
    "message": "문의 상세를 성공적으로 조회했습니다.",
    "result": {
        "inquiry": {
            "id": "123",
            "userId": "456",
            "userName": "홍길동",
            "userEmail": "hong@example.com",
            "category": "account",
            "subject": "계정 비밀번호 변경 문의",
            "content": "비밀번호를 변경하고 싶습니다.",
            "status": "pending",
            "priority": "normal",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z",
            "adminReply": null,
            "adminReplyAt": null,
            "adminId": null,
            "adminName": null,
            "attachments": []
        }
    }
}
```

#### 2.3 문의 답변
- **PUT** `/api/admin/inquiries/{id}/reply`
- **설명**: 관리자가 문의에 답변합니다.
- **요청 본문**:
```json
{
    "adminReply": "비밀번호 변경 방법을 안내드립니다...",
    "status": "answered"
}
```
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY006",
    "message": "답변이 성공적으로 등록되었습니다.",
    "result": {
        "replyId": "789",
        "repliedAt": "2024-01-15T14:20:00Z"
    }
}
```

#### 2.4 문의 상태 변경
- **PUT** `/api/admin/inquiries/{id}/status`
- **설명**: 문의의 상태를 변경합니다.
- **요청 본문**:
```json
{
    "status": "inProgress"
}
```
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY007",
    "message": "문의 상태가 성공적으로 변경되었습니다.",
    "result": {
        "updatedAt": "2024-01-15T14:20:00Z"
    }
}
```

#### 2.5 문의 우선순위 변경
- **PUT** `/api/admin/inquiries/{id}/priority`
- **설명**: 문의의 우선순위를 변경합니다.
- **요청 본문**:
```json
{
    "priority": "high"
}
```
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY008",
    "message": "문의 우선순위가 성공적으로 변경되었습니다.",
    "result": {
        "updatedAt": "2024-01-15T14:20:00Z"
    }
}
```

#### 2.6 문의 할당
- **PUT** `/api/admin/inquiries/{id}/assign`
- **설명**: 문의를 특정 관리자에게 할당합니다.
- **요청 본문**:
```json
{
    "adminId": "789"
}
```
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY009",
    "message": "문의가 성공적으로 할당되었습니다.",
    "result": {
        "assignedAt": "2024-01-15T14:20:00Z"
    }
}
```

#### 2.7 문의 통계
- **GET** `/api/admin/inquiries/stats`
- **설명**: 1:1 문의 관련 통계를 조회합니다.
- **응답**:
```json
{
    "isSuccess": true,
    "code": "INQUIRY010",
    "message": "문의 통계를 성공적으로 조회했습니다.",
    "result": {
        "totalInquiries": 150,
        "pendingInquiries": 25,
        "inProgressInquiries": 15,
        "answeredInquiries": 100,
        "closedInquiries": 10,
        "urgentInquiries": 5,
        "highPriorityInquiries": 20,
        "todayInquiries": 8,
        "weekInquiries": 45,
        "monthInquiries": 120
    }
}
```

### 3. 대시보드 통계 업데이트

#### 3.1 대시보드 통계 API 수정
- **GET** `/api/admin/dashboard/stats`
- **응답에 추가할 필드**:
```json
{
    "isSuccess": true,
    "code": "DASHBOARD001",
    "message": "대시보드 통계를 성공적으로 조회했습니다.",
    "result": {
        "totalUsers": 1250,
        "totalReports": 89,
        "pendingReports": 15,
        "resolvedReports": 74,
        "totalInquiries": 150,
        "pendingInquiries": 25,
        "answeredInquiries": 100
    }
}
```

#### 3.2 최근 활동 API 수정
- **GET** `/api/admin/dashboard/recent-activities`
- **응답에 추가할 활동 타입**:
```json
{
    "isSuccess": true,
    "code": "DASHBOARD002",
    "message": "최근 활동을 성공적으로 조회했습니다.",
    "result": [
        {
            "id": "1",
            "type": "inquiry",
            "description": "새로운 1:1 문의가 등록되었습니다: 계정 관련 문의",
            "timestamp": "2024-01-15T10:30:00Z",
            "status": "pending"
        },
        {
            "id": "2",
            "type": "report",
            "description": "사용자 신고가 접수되었습니다: 스팸 게시글",
            "timestamp": "2024-01-15T09:15:00Z",
            "status": "pending"
        }
    ]
}
```

## 상태 및 우선순위 정의

### 문의 상태 (InquiryStatus)
- `pending`: 대기중 - 답변 대기
- `inProgress`: 처리중 - 관리자가 처리 중
- `answered`: 답변완료 - 답변 완료
- `closed`: 종료 - 문의 종료

### 문의 우선순위 (InquiryPriority)
- `urgent`: 긴급 - 즉시 처리 필요
- `high`: 높음 - 빠른 처리 필요
- `normal`: 보통 - 일반 처리
- `low`: 낮음 - 여유 있게 처리

### 문의 카테고리 (InquiryCategory)
- `account`: 계정 관련
- `payment`: 결제 관련
- `service`: 서비스 이용
- `technical`: 기술적 문제
- `safety`: 안전 관련
- `other`: 기타

## 에러 코드

### 문의 관련 에러 코드
- `INQUIRY001`: 문의 등록 성공
- `INQUIRY002`: 문의 목록 조회 성공
- `INQUIRY003`: 문의 상세 조회 성공
- `INQUIRY004`: 관리자 문의 목록 조회 성공
- `INQUIRY005`: 관리자 문의 상세 조회 성공
- `INQUIRY006`: 답변 등록 성공
- `INQUIRY007`: 상태 변경 성공
- `INQUIRY008`: 우선순위 변경 성공
- `INQUIRY009`: 문의 할당 성공
- `INQUIRY010`: 통계 조회 성공

### 공통 에러 코드
- `INQUIRY_ERROR_001`: 문의를 찾을 수 없습니다
- `INQUIRY_ERROR_002`: 권한이 없습니다
- `INQUIRY_ERROR_003`: 잘못된 상태값입니다
- `INQUIRY_ERROR_004`: 잘못된 우선순위값입니다
- `INQUIRY_ERROR_005`: 잘못된 카테고리값입니다

## 보안 고려사항

1. **인증**: 모든 API는 JWT 토큰 인증이 필요합니다.
2. **권한**: 사용자는 자신의 문의만 조회/수정 가능합니다.
3. **관리자 권한**: 관리자만 모든 문의를 조회하고 답변할 수 있습니다.
4. **입력 검증**: 모든 입력값에 대한 유효성 검증이 필요합니다.
5. **파일 업로드**: 첨부파일은 안전한 경로에 저장하고 바이러스 검사를 수행합니다.

## 성능 고려사항

1. **인덱싱**: 자주 조회되는 필드에 인덱스를 생성합니다.
2. **페이지네이션**: 대량의 데이터 조회 시 페이지네이션을 사용합니다.
3. **캐싱**: 자주 조회되는 통계 데이터는 캐싱을 고려합니다.
4. **비동기 처리**: 파일 업로드나 이메일 발송은 비동기로 처리합니다.

## 알림 시스템

1. **사용자 알림**: 답변이 등록되면 사용자에게 이메일/푸시 알림을 발송합니다.
2. **관리자 알림**: 새로운 문의가 등록되면 담당 관리자에게 알림을 발송합니다.
3. **우선순위 알림**: 긴급/높은 우선순위 문의는 즉시 알림을 발송합니다.

## 로깅 및 모니터링

1. **API 로그**: 모든 API 호출을 로깅합니다.
2. **에러 로그**: 에러 발생 시 상세한 로그를 기록합니다.
3. **성능 모니터링**: API 응답 시간을 모니터링합니다.
4. **사용량 통계**: API 사용량과 트래픽을 추적합니다.
