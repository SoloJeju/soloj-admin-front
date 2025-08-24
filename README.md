# 🚨 신고 관리 시스템 - 관리자 대시보드

여행 동행 서비스를 위한 종합적인 신고 관리 시스템의 관리자 대시보드입니다.

## ✨ 주요 기능

### 📊 대시보드 통계
- 총 신고 건수, 대기 중인 신고, 처리 완료 등 실시간 통계
- 최근 관리자 활동 내역
- 빠른 조치 버튼으로 다른 탭으로 즉시 이동

### 🔍 신고 목록 관리
- 모든 신고 건에 대한 통합 관리
- 상태별, 사유별, 콘텐츠 유형별 필터링
- 검색 기능 (피신고자, 콘텐츠 제목, 신고자)
- 페이지네이션 지원
- 신고 상세 정보 모달

### 👥 사용자 관리
- 신고된 사용자 목록 및 누적 신고 현황
- 사용자별 조치 이력 관리
- 경고, 임시 차단, 글쓰기 제한, 영구 정지 등 조치 적용
- 사용자 복구 기능

### 📝 콘텐츠 관리
- 신고된 게시글 및 댓글 관리
- 콘텐츠 복구, 삭제, 임시 차단 등 조치
- 콘텐츠별 신고 내역 상세 보기
- 작성자 정보 및 상태 관리

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript
- **Styling**: Styled Components
- **State Management**: React Hooks (useState, useEffect)
- **API Integration**: Fetch API with custom service layer
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ADMIN_TOKEN_KEY=adminToken
REACT_APP_ENV=development
```

**주의**: `.env` 파일에는 포트번호까지만 입력하고, API 요청 시 자동으로 `/api` 경로가 추가됩니다.

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 4. 로그인
- 첫 화면에서 로그인 화면이 표시됩니다
- 개발 중에는 "🚀 개발자 모드 (임시 로그인)" 버튼을 사용할 수 있습니다
- 실제 배포 시에는 관리자 계정으로 로그인해야 합니다

## 🔌 API 연동

### API 서비스 구조
```
src/services/
├── api.ts              # 기본 API 설정 및 공통 함수
├── dashboardService.ts # 대시보드 통계 API
├── reportService.ts    # 신고 목록 API
├── userService.ts      # 사용자 관리 API
└── contentService.ts   # 콘텐츠 관리 API
```

### 주요 API 엔드포인트

#### 대시보드 통계
- `GET /api/admin/dashboard/stats` - 통계 데이터
- `GET /api/admin/dashboard/recent-activities` - 최근 활동

#### 신고 관리
- `GET /api/admin/reports` - 신고 목록 (페이지네이션 + 필터링)
- `GET /api/admin/reports/{id}` - 신고 상세 정보
- `PATCH /api/admin/reports/{id}/status` - 신고 상태 변경

#### 사용자 관리
- `GET /api/admin/users/reported` - 신고된 사용자 목록
- `POST /api/admin/users/{id}/actions` - 사용자 조치 적용
- `PATCH /api/admin/users/{id}/status` - 사용자 상태 변경

#### 콘텐츠 관리
- `GET /api/admin/content/reported` - 신고된 콘텐츠 목록
- `POST /api/admin/content/{id}/actions` - 콘텐츠 조치 적용
- `PATCH /api/admin/content/{id}/status` - 콘텐츠 상태 변경

### API 응답 형식

#### 페이지네이션 응답
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 에러 응답
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "관리자 권한이 필요합니다.",
    "details": {}
  }
}
```

## 🎨 UI/UX 특징

### 디자인 테마
- **주 색상**: 오렌지 (#ff6b35)
- **보조 색상**: 그레이 스케일 (#2d3436, #636e72, #95a5a6)
- **상태 색상**: 
  - 경고: 노란색 (#ffc107)
  - 성공: 초록색 (#28a745)
  - 위험: 빨간색 (#dc3545)
  - 정보: 파란색 (#17a2b8)

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 화면 크기 지원
- CSS Grid와 Flexbox를 활용한 유연한 레이아웃
- 터치 친화적인 버튼 크기와 간격

### 사용자 경험
- 로딩 상태 및 에러 처리
- 실시간 데이터 업데이트
- 직관적인 아이콘과 색상 사용
- 부드러운 애니메이션과 전환 효과

## 📱 컴포넌트 구조

```
src/components/
├── AdminDashboard.tsx      # 메인 대시보드 (탭 네비게이션)
├── DashboardStats.tsx      # 통계 및 최근 활동
├── ReportReview.tsx        # 신고 목록 관리
├── UserReportList.tsx      # 사용자 관리
└── ContentReportList.tsx   # 콘텐츠 관리
```

## 🔐 인증 및 권한

### 로그인 시스템
- 첫 화면에서 로그인 화면 표시
- 아이디/비밀번호 입력 또는 개발자 모드 임시 로그인
- 로그인 성공 시 JWT 토큰을 `localStorage`에 저장

### 관리자 토큰
- `localStorage`에 `adminToken` 저장
- 모든 API 요청에 `Authorization: Bearer {token}` 헤더 포함
- 토큰 만료 시 자동 로그아웃 처리

### 권한 관리
- 관리자별 조치 이력 추적
- 조치 적용 시 관리자 ID 기록
- 감사 로그 생성

### 보안 기능
- 로그아웃 시 토큰 및 관리자 정보 자동 삭제
- 401 에러 시 자동 로그아웃 처리
- 헤더에 현재 로그인한 관리자 정보 표시

## 🚀 향후 개발 계획

### 단기 계획
- [ ] 실시간 알림 시스템 (WebSocket)
- [ ] 엑셀/PDF 리포트 내보내기
- [ ] 대량 조치 기능

### 중기 계획
- [ ] 고급 검색 및 필터링
- [ ] 자동 조치 규칙 설정 UI
- [ ] 통계 차트 및 그래프

### 장기 계획
- [ ] AI 기반 신고 분류
- [ ] 예측 분석 대시보드
- [ ] 모바일 앱 버전

## 🐛 문제 해결

### 일반적인 문제들

#### API 연결 실패
- `.env` 파일의 `REACT_APP_API_URL` 확인
- 백엔드 서버 실행 상태 확인
- 네트워크 연결 상태 확인

#### 컴포넌트 렌더링 오류
- 브라우저 콘솔에서 에러 메시지 확인
- `npm install`로 의존성 재설치
- 개발 서버 재시작

#### 스타일 문제
- 브라우저 캐시 삭제
- Styled Components 버전 호환성 확인

## 📞 지원 및 문의

개발 관련 문의사항이나 버그 리포트는 이슈 트래커를 통해 제출해주세요.

---

**개발자**: AI Assistant  
**최종 업데이트**: 2024년 1월  
**버전**: 1.0.0
