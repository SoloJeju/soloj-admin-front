# 혼자옵서예 신고 관리 시스템

제주 동행 여행을 안전하게! 혼자옵서예 신고 관리 시스템은 사용자 신고와 1:1 문의를 체계적으로 관리할 수 있는 관리자 대시보드입니다.

## 주요 기능

### 🚨 신고 관리
- **사용자 신고 관리**: 신고된 사용자 목록 조회, 상태 변경, 조치 적용
- **콘텐츠 신고 관리**: 신고된 게시글/댓글 관리, 숨김/삭제 처리
- **신고 목록 관리**: 전체 신고 내역 통합 관리 및 검토
- **자동 조치 시스템**: 누적 신고에 따른 자동 제재 (경고, 일시차단, 영구정지)

### 📝 1:1 문의 관리
- **문의 목록 조회**: 사용자 문의 전체 목록 및 상세 내용 확인
- **카테고리별 분류**: 계정, 결제, 서비스, 기술, 안전, 기타 등
- **우선순위 관리**: 긴급, 높음, 보통, 낮음 우선순위 설정
- **상태 관리**: 대기중, 처리중, 답변완료, 종료 상태 추적
- **관리자 답변**: 문의에 대한 상세 답변 작성 및 등록
- **문의 할당**: 특정 관리자에게 문의 할당

### 📊 대시보드
- **통계 현황**: 전체 사용자, 신고, 문의 수 등 핵심 지표
- **최근 활동**: 신고 접수, 문의 등록, 처리 완료 등 실시간 활동
- **빠른 작업**: 주요 관리 기능으로의 빠른 이동

## 기술 스택

- **Frontend**: React 19 + TypeScript
- **Styling**: Styled Components
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Authentication**: JWT (JSON Web Tokens)
- **Responsive Design**: CSS Media Queries, Flexbox, Grid

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
# API 서버 URL (백엔드 서버 주소로 변경하세요)
REACT_APP_API_URL=http://localhost:8080

# 개발 환경 설정
REACT_APP_ENV=development
```

**중요**: `REACT_APP_API_URL`을 실제 백엔드 API 서버 주소로 변경해주세요.

### 3. 개발 서버 실행
```bash
npm start
```

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── AdminDashboard.tsx      # 메인 대시보드
│   ├── DashboardStats.tsx      # 통계 및 최근 활동
│   ├── UserReportList.tsx      # 사용자 신고 관리
│   ├── ContentReportList.tsx   # 콘텐츠 신고 관리
│   ├── ReportReview.tsx        # 신고 목록 관리
│   └── InquiryList.tsx         # 1:1 문의 관리
├── services/           # API 서비스
│   ├── api.ts                 # 공통 API 유틸리티
│   ├── authService.ts         # 인증 관련 API
│   ├── dashboardService.ts    # 대시보드 API
│   ├── reportService.ts       # 신고 관련 API
│   ├── userService.ts         # 사용자 관리 API
│   ├── contentService.ts      # 콘텐츠 관리 API
│   ├── inquiryService.ts      # 1:1 문의 API
│   └── adminService.ts        # 관리자 전용 API
├── contexts/          # React Context
│   └── AuthContext.tsx        # 인증 상태 관리
├── types/             # TypeScript 타입 정의
│   └── report.ts              # 신고 및 문의 관련 타입
└── utils/             # 유틸리티 함수
    └── jwtUtils.ts            # JWT 토큰 처리
```

## API 엔드포인트

### 🔐 인증
- `POST /api/admin/auth/login` - 관리자 로그인
- `GET /api/admin/auth/permissions` - 관리자 권한 조회
- `GET /api/admin/auth/activity-logs` - 관리자 활동 로그 조회

### 📊 대시보드
- `GET /api/admin/dashboard/stats` - 대시보드 통계
- `GET /api/admin/dashboard/recent-activities` - 최근 활동

### 📋 신고 관리
- `GET /api/admin/reports` - 신고 목록 조회
- `GET /api/admin/reports/{reportId}` - 신고 상세 정보 조회
- `POST /api/admin/reports/{reportId}/process` - 신고 처리
- `POST /api/admin/notifications/send-report-result` - 신고 처리 결과 알림 전송

### 👥 사용자 관리
- `GET /api/admin/users/reported` - 신고된 사용자 목록 조회
- `PATCH /api/admin/users/{userId}/status` - 사용자 상태 변경
- `POST /api/admin/users/{userId}/actions` - 사용자 조치 적용
- `POST /api/admin/notifications/send-user-action` - 사용자 조치 알림 전송

### 📝 콘텐츠 관리
- `GET /api/admin/content/reported` - 신고된 콘텐츠 목록 조회
- `PATCH /api/admin/content/{contentId}/status` - 콘텐츠 상태 변경
- `POST /api/admin/content/{contentId}/actions` - 콘텐츠 조치 적용

### 💬 1:1 문의 관리
- `GET /api/admin/inquiries` - 문의 목록 조회
- `GET /api/admin/inquiries/{id}` - 문의 상세 조회
- `PUT /api/admin/inquiries/{id}/reply` - 문의 답변
- `PUT /api/admin/inquiries/{id}/status` - 문의 상태 변경
- `PUT /api/admin/inquiries/{id}/priority` - 문의 우선순위 변경
- `PUT /api/admin/inquiries/{id}/assign` - 문의 할당
- `GET /api/admin/inquiries/stats` - 문의 통계
- `GET /api/admin/inquiries/statuses` - 문의 상태 목록
- `GET /api/admin/inquiries/priorities` - 문의 우선순위 목록
- `GET /api/admin/inquiries/categories` - 문의 카테고리 목록

### ⚙️ 시스템 설정
- `GET /api/admin/settings/system` - 시스템 설정 조회
- `PUT /api/admin/settings/system` - 시스템 설정 수정
- `GET /api/admin/settings/report-reasons` - 신고 사유 카테고리 조회
- `PUT /api/admin/settings/report-reasons` - 신고 사유 카테고리 수정
- `GET /api/admin/settings/content-types` - 콘텐츠 유형 설정 조회
- `PUT /api/admin/settings/content-types` - 콘텐츠 유형 설정 수정

### 🔍 검색
- `GET /api/admin/search` - 통합 검색
- `POST /api/admin/search/advanced` - 고급 검색

### 📈 통계
- `GET /api/admin/statistics/users` - 사용자 통계 조회
- `GET /api/admin/statistics/reports` - 신고 통계 조회
- `GET /api/admin/statistics/content` - 콘텐츠 통계 조회

### 🤖 자동 조치 시스템
- `GET /api/admin/auto-actions/rules` - 자동 조치 규칙 조회
- `PUT /api/admin/auto-actions/rules` - 자동 조치 규칙 업데이트
- `GET /api/admin/auto-actions/history` - 자동 조치 이력 조회

## 사용자 인터페이스

### 🎨 디자인 특징
- **메인 컬러**: 오렌지 계열 (#ff6b35, #f7931e)
- **반응형 디자인**: PC, 태블릿, 모바일 모든 화면 크기 지원
- **카드 기반 레이아웃**: 직관적이고 깔끔한 정보 표시
- **그라데이션 요소**: 모던하고 세련된 시각적 효과

### 📱 반응형 지원
- **PC (769px 이상)**: 전체 기능과 큰 탭 버튼
- **태블릿 (481px-768px)**: 중간 크기 UI 요소
- **모바일 (480px 이하)**: 터치 친화적 작은 UI 요소

### 🔧 사용자 경험
- **탭 기반 네비게이션**: 직관적인 카테고리별 이동
- **필터링 및 검색**: 빠른 데이터 찾기
- **페이지네이션**: 대량 데이터 효율적 탐색
- **실시간 상태 업데이트**: 즉시 반영되는 변경사항

## 신고 처리 프로세스

### 1. 신고 접수
- 사용자가 신고 버튼 클릭
- 신고 사유 선택 (스팸, 악용, 불법, 사기, 부적절, 기타)
- 추가 설명 입력 (선택사항)
- 신고 제출

### 2. 자동 조치 규칙
- **1-2회 신고**: 기록만 남김
- **3-4회 신고**: 일시 차단 (7일)
- **5-6회 신고**: 글쓰기/채팅 제한 (30일)
- **7회 이상**: 계정 정지 (90일)

### 3. 관리자 검토
- 신고 내용 상세 검토
- 증거 자료 확인
- 추가 조치 결정
- 최종 처리 완료

## 1:1 문의 처리 프로세스

### 1. 문의 접수
- 사용자가 문의 작성
- 카테고리 및 우선순위 선택
- 제목과 내용 입력
- 첨부파일 업로드 (선택사항)

### 2. 관리자 처리
- 문의 내용 검토
- 우선순위 및 상태 설정
- 담당자 할당
- 상세 답변 작성

### 3. 답변 완료
- 사용자에게 답변 전송
- 필요시 추가 문의 처리
- 문의 종료 처리

## 보안 및 권한

### 🔐 인증 시스템
- JWT 토큰 기반 인증
- 자동 토큰 만료 처리
- 보안 로그아웃

### 👥 권한 관리
- **관리자**: 모든 기능 접근 가능
- **일반 사용자**: 신고 작성, 문의 작성만 가능

### 🛡️ 보안 조치
- API 요청 검증
- 입력값 sanitization
- XSS/CSRF 방지

## 개발 가이드

### 새로운 컴포넌트 추가
1. `src/components/` 폴더에 컴포넌트 생성
2. Styled Components로 스타일링
3. TypeScript 타입 정의
4. API 서비스 연동

### API 서비스 추가
1. `src/services/` 폴더에 서비스 파일 생성
2. `api.ts`의 공통 함수 활용
3. 적절한 타입 정의
4. 에러 처리 로직 추가

### 스타일 가이드
- 메인 컬러: `#ff6b35`, `#f7931e`
- 보조 컬러: `#28a745`, `#dc3545`, `#ffc107`
- 중성 컬러: `#6c757d`, `#f8f9fa`, `#e9ecef`
- 그림자: `0 2px 8px rgba(0,0,0,0.1)`
- 둥근 모서리: `12px`, `20px`

## 배포

### 빌드
```bash
npm run build
```

### 환경별 설정
- **개발**: `REACT_APP_API_URL=http://localhost:8000`
- **스테이징**: `REACT_APP_API_URL=https://staging-api.example.com`
- **프로덕션**: `REACT_APP_API_URL=https://api.example.com`

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 문의 및 지원

- **프로젝트 관리자**: 혼자옵서예 팀
- **기술 지원**: 개발팀
- **문의**: support@example.com

---

**혼자옵서예** - 제주 동행 여행을 안전하게! 🍊
