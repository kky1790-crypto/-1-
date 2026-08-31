# Happynian Magok — 강윤 디자이너 웹사이트

서울 강서구 마곡 Happynian Magok 강윤 디자이너의 공개 웹사이트입니다. Astro + TypeScript로 만든
정적 사이트이며, 빌드된 HTML에 모든 주요 콘텐츠가 실제 텍스트로 포함됩니다(빈 SPA 아님).

> **현재 상태: PROPOSED — 아직 공개 배포되지 않았습니다.** 아래 "배포 전 설정"을 모두 마친 뒤,
> 사용자가 직접 확인하고 승인한 다음에만 공개하세요.

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

## 배포 전 설정 (필수)

공개 배포하기 전에 반드시 아래 항목을 확인하고 설정해야 합니다.

### 1. SITE_URL 교체

`src/data/site.ts` 파일의 `SITE_URL` 값이 현재 `https://example.com` (자리표시자)로 되어 있습니다.
실제 도메인이 정해지면 이 한 곳만 교체하면 canonical 태그, sitemap.xml, Open Graph/Twitter
이미지 주소가 모두 함께 바뀝니다.

```ts
// src/data/site.ts
export const SITE_URL = 'https://실제-도메인.com';
```

교체 후 `npm run build`를 다시 실행하세요.

### 2. 공개 배포

이 프로젝트는 정적 사이트(`dist/` 폴더)이므로 정적 호스팅이 가능한 어떤 서비스에도 배포할 수
있습니다(예: Cloudflare Pages, Vercel, Netlify 등). 이번 작업 범위에는 실제 배포, 도메인 연결이
포함되지 않았습니다 — 사용자가 원하는 서비스를 직접 선택해 배포해주세요.

### 3. Google Search Console 등록

도메인 연결과 공개 배포가 끝난 뒤, 사용자가 직접 다음 절차를 진행해야 합니다(이 작업에서는
실행하지 않았습니다).

1. [Google Search Console](https://search.google.com/search-console)에 접속
2. 실제 도메인으로 속성(Property) 추가
3. 소유권 확인 (DNS 또는 HTML 태그 방식)
4. `https://실제-도메인.com/sitemap-index.xml` 을 사이트맵으로 제출

### 4. 이미지 원본 백업

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
