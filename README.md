# dayfix

회의 일정 잡는 사내용 솔루션 — 디자인 프로토타입.

- **스택**: Vite 6 · React 19 · TypeScript · Tailwind v3.4
- **디자인 시스템**: thaki TDS (`@thakicloud/shared`) — 모든 색/타이포/컴포넌트의 단일 기준(SSOT)

## 처음 시작 (새 노트북에서)

### 1) 도구 준비 — 최초 1회

```bash
# Node 20+ (nodejs.org 또는 nvm). .nvmrc가 있어 nvm 사용 시:
nvm use            # 없으면 nvm install
corepack enable    # pnpm 활성화 (별도 설치 불필요)

# gh CLI(cli.github.com) 로그인 — 반드시 read:packages 스코프 포함
gh auth login
gh auth refresh -s read:packages   # 기존 로그인에 스코프만 추가할 때
```

### 2) 클론 & 실행

```bash
git clone https://github.com/mjhan-tk/dayfix.git
cd dayfix
export GITHUB_TOKEN=$(gh auth token)   # ⚠️ install 전에 필수
pnpm install
pnpm dev                               # → http://localhost:5180
```

> **왜 토큰이 필요?** TDS(`@thakicloud/shared`)는 공개 npm이 아니라 **GitHub Packages**(`npm.pkg.github.com`)에 있어 인증이 필요합니다.
> `.npmrc`가 값 대신 `${GITHUB_TOKEN}` 환경변수만 참조하므로 리포엔 실토큰이 없습니다 — **토큰은 절대 커밋하지 마세요.**
>
> - `pnpm install` **전에** `export GITHUB_TOKEN=$(gh auth token)`. 안 하면 설치가 **401**로 실패합니다.
> - 새 터미널마다 export가 번거로우면 `~/.zshrc`(또는 `~/.bashrc`)에 `export GITHUB_TOKEN=$(gh auth token)` 한 줄 추가.
> - 로그인은 됐는데 401이면 대개 `read:packages` 누락 → `gh auth refresh -s read:packages`.

## 실행 스크립트

```bash
pnpm dev        # 개발 서버 → http://localhost:5180
pnpm build      # 타입체크 + 프로덕션 빌드 (dist/)
pnpm preview    # 빌드 결과 로컬 미리보기
```

## 구조

```
src/
├── components/          # 앱 공통 UI (AppShell, Avatar, ResponsiveDrawer)
├── features/
│   ├── home/            # 홈 — 예정된 일정 + 조율 중 목록
│   ├── scheduling/      # 조율 상세 — 추천/히트맵/응답 드로어
│   ├── meeting/         # 새 회의 만들기 드로어 + 커스텀 캘린더
│   └── profile/         # 내 고정 스케줄 드로어
├── lib/                 # scheduling.ts · home.ts (프로토타입 mock + 도메인 로직)
├── App.tsx              # 화면 조립 (홈 ↔ 상세 전환, 오버레이)
└── main.tsx             # TDS core.css / OverlayProvider / i18n 부트스트랩
```

## 디자인 일관성 규칙

- 색은 하드코딩하지 말고 TDS 토큰 클래스(`bg-surface`, `text-text-muted`, `bg-primary` 등) 사용
- 버튼/입력/배지/상태표시는 TDS 컴포넌트(`@thakicloud/shared`)를 그대로 사용
- TDS에 없는 요소(예: Avatar)만 토큰 기반으로 직접 구현
