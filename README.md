# dayfix

회의 일정 잡는 사내용 솔루션 — 디자인 프로토타입.

- **스택**: Vite 6 · React 19 · TypeScript · Tailwind v3.4
- **디자인 시스템**: thaki TDS (`@thakicloud/shared`) — 모든 색/타이포/컴포넌트의 단일 기준(SSOT)

## 사전 준비 — TDS 설치 인증

TDS는 공개 npm이 아니라 **GitHub Packages**(`npm.pkg.github.com`)에 있어, 설치 시 인증 토큰이 필요합니다.

```bash
# read:packages 권한이 있는 GitHub 토큰 필요. gh CLI가 있으면 그대로 사용 가능:
export GITHUB_TOKEN=$(gh auth token)
pnpm install
```

`.npmrc`가 `${GITHUB_TOKEN}` 환경변수를 참조합니다. 토큰은 절대 커밋하지 마세요.

## 실행

```bash
pnpm dev        # http://localhost:5180
pnpm build      # 타입체크 + 프로덕션 빌드
```

## 구조

```
src/
├── components/        # 앱 공통 UI (AppShell, Avatar)
├── features/meeting/  # 회의 도메인 화면 (대시보드, 회의 잡기 드로어)
├── lib/mock.ts        # 프로토타입용 mock 데이터
├── App.tsx            # 화면 조립
└── main.tsx           # TDS core.css / OverlayProvider / i18n 부트스트랩
```

## 디자인 일관성 규칙

- 색은 하드코딩하지 말고 TDS 토큰 클래스(`bg-surface`, `text-text-muted`, `bg-primary` 등) 사용
- 버튼/입력/배지/상태표시는 TDS 컴포넌트(`@thakicloud/shared`)를 그대로 사용
- TDS에 없는 요소(예: Avatar)만 토큰 기반으로 직접 구현
