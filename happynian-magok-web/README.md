# Happynian Magok — 강윤 디자이너 웹사이트

서울 강서구 마곡 Happynian Magok 강윤 디자이너의 공개 웹사이트입니다. Astro + TypeScript로 만든
정적 사이트이며, 빌드된 HTML에 모든 주요 콘텐츠가 실제 텍스트로 포함됩니다(빈 SPA 아님).

> **현재 상태: 배포 준비 완료, 마지막 한 단계만 남음.** 빌드 결과물을 `gh-pages` 브랜치에
> 푸시해두었습니다. 저장소 Settings → Pages에서 `gh-pages` 브랜치를 소스로 지정하면
> `https://kky1790-crypto.github.io/-1-/` 에서 바로 공개됩니다. 자세한 내용은 아래 "현재
> 배포 상태" 참고.

## 요구 사항

- Node.js 22 이상
- npm

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

기본적으로 `http://localhost:4321` 에서 열립니다.

## 타입·Astro 검사

```bash
npm run check
```

`astro check`를 실행해 TypeScript 타입 오류와 Astro 템플릿 오류를 확인합니다.

## 프로덕션 빌드

```bash
npm run build
```

`astro check`를 먼저 실행한 뒤 `dist/` 폴더에 정적 사이트를 빌드합니다. 빌드 과정에서 원본
사진으로부터 WebP/AVIF 파생 이미지와 반응형 srcset이 자동으로 생성됩니다.

## 프로덕션 미리보기

```bash
npm run preview
```

`dist/` 폴더를 로컬 서버로 제공합니다. 실제 배포본과 가장 가까운 상태를 확인할 수 있습니다.

## 프로젝트 구조

```
src/
  data/         콘텐츠 데이터 — 문구, 가격, 링크, 작업, 디자이너, 가이드 글 (한곳에서 관리)
  assets/       원본 사진 (works/, profile/) — astro:assets가 빌드 시 최적화
  components/   헤더, 푸터, 모바일 예약 버튼, 브레드크럼 등 공용 컴포넌트
  layouts/      BaseLayout.astro — 메타데이터, JSON-LD, 공통 레이아웃
  pages/        실제 라우트 (index, work/[slug], guide/[slug] 등)
  lib/schema.ts 구조화 데이터(JSON-LD) 생성 함수
  styles/       전역 CSS(디자인 토큰, 타이포그래피)
docs/
  OWNER_EDIT_GUIDE.md      비개발자를 위한 콘텐츠 수정 가이드
  IMPLEMENTATION_REPORT.md 구현 및 검증 결과 보고서
proof/          접근성·반응형 검증 스크린샷
assets-source-original/   첨부받은 원본 사진 보존본 (빌드에는 src/assets 사본 사용)
```

콘텐츠를 수정하려면 `docs/OWNER_EDIT_GUIDE.md`를 참고하세요.

## 현재 배포 상태

이 사이트는 **GitHub Pages 프로젝트 사이트**로 배포되어 있습니다.

- 소스: `claude/happynian-magok-website-wvon56` 브랜치
- 빌드 결과물: `gh-pages` 브랜치 (이 브랜치가 실제로 서빙됩니다)
- 공개 주소: `https://kky1790-crypto.github.io/-1-/` (저장소 이름이 `-1-`이라 주소에
  포함됩니다 — 아래 "커스텀 도메인으로 바꾸기" 참고)

**마지막으로 사용자가 GitHub에서 한 번만 해주면 됩니다:**
저장소 → **Settings → Pages** → **Source**를 `Deploy from a branch`로, **Branch**를
`gh-pages` / `(root)`로 설정하고 **Save**. 몇 분 안에 위 주소에서 접속됩니다.

## 커스텀 도메인으로 바꾸기 (선택, 나중에)

지금은 GitHub Pages 하위 경로(`/-1-/`)에 배포되어 있습니다. 나중에 원하는 도메인을 연결하려면:

1. `src/data/site.ts`에서 `SITE_URL`을 실제 도메인으로, `BASE_PATH`를 `'/'`로 바꿉니다.
2. `npm run build`로 다시 빌드한 뒤, `dist/` 내용을 원하는 호스팅(GitHub Pages 커스텀
   도메인, Cloudflare Pages, Vercel 등)에 다시 배포합니다.
3. GitHub Pages를 계속 쓴다면 저장소에 `CNAME` 파일을 추가하고 DNS에 해당 레코드를
   설정하면 됩니다.

### Google Search Console 등록 (선택, 원하실 때만)

구글 검색에 노출시키고 싶다면 나중에 아래 절차를 진행하시면 됩니다(지금 당장 필요한 건
아닙니다).

1. [Google Search Console](https://search.google.com/search-console)에 접속
2. `https://kky1790-crypto.github.io/-1-/` 로 속성(Property) 추가 (또는 커스텀 도메인으로
   바꿨다면 그 주소로)
3. 소유권 확인 (HTML 태그 방식이 GitHub Pages에서 가장 간단합니다)
4. `https://kky1790-crypto.github.io/-1-/sitemap-index.xml` 을 사이트맵으로 제출

## 이미지 원본 백업

`assets-source-original/` 폴더에 첨부받은 원본 사진 7장이 그대로 보존되어 있습니다. 필요 시
별도로 백업해두는 것을 권장합니다.

## 향후 확장 — 새 디자이너 추가

`src/data/designers.ts`에 디자이너 배열이 있습니다. 강윤 외 다른 식구(예: 효리)를 추가하려면
이 배열에 새 항목을 추가하고, `src/data/works.ts`에 해당 디자이너의 작업을 추가하면 됩니다.
자세한 절차는 `docs/OWNER_EDIT_GUIDE.md`의 "새 디자이너 추가하기" 항목을 참고하세요.

## 기술 스택

- [Astro](https://astro.build) 7 (정적 출력, TypeScript strict)
- 페이지별 최소 JavaScript (모바일 메뉴 토글 하나뿐 — 그 외 모든 상호작용/애니메이션은 순수 CSS)
- [@fontsource/pretendard](https://www.npmjs.com/package/@fontsource/pretendard) — 로컬 호스팅
  오픈소스 한글 폰트(외부 Google Fonts 요청 없음)
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — sitemap.xml
  자동 생성
- 외부 분석/광고/추적 스크립트 없음 (쿠키 배너 불필요)
