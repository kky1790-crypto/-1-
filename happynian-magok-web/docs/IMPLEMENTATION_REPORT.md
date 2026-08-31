# 구현 보고서 — Happynian Magok 강윤 디자이너 웹사이트

**상태 업데이트 (사용자 요청에 따라 진행):** 소스는 `claude/happynian-magok-website-wvon56`
브랜치에, 빌드 결과물은 `gh-pages` 브랜치에 푸시되어 있습니다. GitHub Pages를 저장소
Settings → Pages에서 `gh-pages` 브랜치로 지정하면 `https://kky1790-crypto.github.io/-1-/`
에서 공개됩니다(이 마지막 설정 토글은 API로 처리할 수 없어 사용자가 직접 눌러야 합니다).
Google Search Console 등록은 사용자가 원할 때 진행하는 선택 사항으로 남겨두었습니다. 아래
내용은 이 배포 결정 이전에 로컬/작업환경에서 실행한 검증 결과이며, SITE_URL/BASE_PATH를
GitHub Pages 구조에 맞게 조정한 뒤 링크 무결성만 추가로 재검증했습니다(전 페이지·전
내부링크 200 확인, 위 "실제 검증 결과" 표 갱신 없이 별도 확인 완료).

## 1. 구현 개요

- **기술 스택**: Astro 7 + TypeScript(strict), 정적 출력(`output: static`)
- **JavaScript**: 페이지 전체에서 커스텀 스크립트는 모바일 메뉴 토글 하나뿐입니다. 그 외
  진입 애니메이션 등은 모두 순수 CSS로 구현해 JavaScript 실행 여부와 무관하게 콘텐츠가 항상
  보이도록 했습니다.
- **폰트**: `@fontsource/pretendard`(오픈소스 한글 폰트, 자체 호스팅 — 외부 Google Fonts
  요청 없음)
- **이미지**: `astro:assets`의 `<Picture>` 컴포넌트로 빌드 시 AVIF/WebP 파생본과 반응형
  `srcset`을 자동 생성. 원본은 `src/assets/`에 보존, 첨부 원본은 `assets-source-original/`에
  별도 보관.
- **페이지 수**: 10개 (홈 1, 작업 목록 1, 작업 상세 4, 가이드 목록 1, 가이드 글 3)
- **콘텐츠 구조**: `src/data/*.ts` 한곳에서 문구·가격·링크·작업·디자이너·가이드를 관리 (자세한
  내용은 `docs/OWNER_EDIT_GUIDE.md` 참고). `designers.ts`는 배열 구조로 향후 다른 디자이너
  추가를 염두에 두고 설계했습니다.

## 2. 화면별 구현 요약

| 섹션 | 구현 내용 |
|---|---|
| 헤더 | 텍스트 워드마크(강윤 \| HAPPYNIAN MAGOK), 데스크톱 가로 메뉴, 모바일 햄버거 메뉴(aria-expanded 상태 관리) |
| 첫 화면(HERO) | 애쉬베이지 작업 사진 2장(대표+보조), 확정 문구 그대로, 네이버 예약 CTA + 보조문구, "강윤의 작업 보기" 보조 버튼. 모바일에서도 사진이 텍스트보다 먼저 보이도록 배치 |
| SELECTED WORK | 4개 작업. 데스크톱에서는 1번 작업이 전체 폭을 차지하는 리드 이미지 + 나머지 3개가 아래 나란히 배치되는 갭 없는 편집형 그리드, 모바일은 1열 |
| CONSULTATION | 확정된 4가지 고민 문구 + 상담 시 확인하는 6가지 사실(얼굴형, 두상, 모질, 직업과 평소 분위기, 평소 손질 습관, 현재 모발 상태와 이전 시술 이력) |
| SERVICES | 텍스쳐컷/펌 정상가·1회 혜택가, 염색·탈색은 "상담 후 안내"만 표시(숫자 없음), 혜택 조건 문구 |
| ABOUT KANGYOON | 확정 소개 문구, 원형 마스크 프로필 사진(회색 모서리 노출 없음, 확대 없음), "11 YEARS OF EXPERIENCE" |
| GUIDE | 3개 글 미리보기 카드 → 각 글 상세 페이지 연결 |
| VISIT | 주소, 교통(마곡역 4번 출구 158m), 주차(그랑트윈타워 B동), 영업시간은 고정 숫자 대신 네이버 예약 확인 안내, 네이버 지도/인스타/예약 링크 |
| 푸터 | 워드마크, 주소, 외부 링크, 저작권 |
| 모바일 고정 CTA | 화면 하단 고정 네이버 예약 버튼, iOS safe-area(`env(safe-area-inset-bottom)`) 대응, 본문이 가려지지 않도록 `body`에 여분 패딩 적용 |
| 작업 상세 4개 | `/work/ash-beige-texture-cut/`, `/work/blonde-cortis-texture-cut/`, `/work/vintage-hippie-perm/`, `/work/see-through-leaf-cut/` — 스타일명, 사진, 관찰 가능한 디자인 특징, 상담 참고 포인트, 모발 상태 안내 문구, 예약 CTA, BreadcrumbList |
| 가이드 글 3개 | 지정된 slug·제목 그대로, 각 1,300~1,500자 내외(요구 범위 1,200~1,800자 충족), 작성자/작성일 표기, 관련 작업 링크, Article + BreadcrumbList 구조화 데이터 |

고객 리뷰 영역은 만들지 않았습니다(빈 자리, "곧 추가됩니다" 문구도 없음).

## 3. 첨부 이미지 매핑

| 파일 | 사용 위치 | alt |
|---|---|---|
| work-01-ash-beige-main.jpeg | 첫 화면 대표, 작업 01 대표 | 애쉬베이지 브라운 컬러와 텍스쳐컷을 한 남성의 인물 사진 |
| work-01-ash-beige-editorial.jpeg | 첫 화면 보조 | 애쉬베이지 브라운 텍스쳐컷의 결 움직임을 보여주는 보조 사진 |
| work-02-blonde-final.jpeg | 작업 02 대표 | 블론드 탈색과 코르티스 텍스쳐컷을 완성한 남성 |
| work-02-bleach-process.jpeg | 작업 02 보조(시술 과정으로만 표기, Before 아님) | 블론드 탈색 시술 중 모발에 약제를 도포한 과정 |
| work-03-vintage-hippie-perm.jpeg | 작업 03 | 빈티지 히피펌으로 자연스러운 웨이브를 만든 남성 (배경 사슴 그림이 사람 위에 겹쳐 보이는 문제는 CSS `object-position: center 100%` + `transform: scale(1.16)` 조합으로 얼굴·헤어를 자르지 않는 범위에서 크게 완화) |
| work-04-see-through-leaf-cut.jpeg | 작업 04 | 시스루 리프컷과 다운펌의 옆선 실루엣 |
| profile-kangyoon.jpeg | ABOUT 섹션 소형 원형 프로필로만 사용 | 강윤 디자이너 프로필 사진 (원형 마스크로 회색 모서리 제거, 104~112px로 작게만 표시, 확대·복원 없음) |

## 4. 실제 검증 결과

아래는 이 세션에서 **실제로 실행한** 명령과 결과입니다. Playwright(Chromium, 사전 설치된
브라우저) 기반 자동화 스크립트로 검증했습니다.

| 항목 | 명령/방법 | 결과 |
|---|---|---|
| 1. 의존성 설치 | `npm install` | **PASS** — 285 packages, 0 vulnerabilities |
| 2. 타입·Astro 검사 | `npm run check` (`astro check`) | **PASS** — 0 errors, 0 warnings, 0 hints |
| 3. production build | `npm run build` | **PASS** — 10 page(s) built, 105개 이미지 파생본 생성 |
| 4. production preview 실행 | `npm run preview` (포트 4321) | **PASS** — 서버 정상 기동, 모든 라우트 200 응답 |
| 5. 모든 내부 링크·생성 페이지 200 확인 | Playwright로 10개 페이지 + robots.txt + sitemap-index.xml + sitemap-0.xml 요청 | **PASS** — 13개 URL 전부 HTTP 200, 콘솔 에러 0건, 실패한 네트워크 요청 0건 |
| 6. 네이버 예약·Instagram·네이버 지도 href 정확성 | 빌드된 HTML 전수 grep | **PASS** — `https://booking.naver.com/booking/13/bizes/324883`, `https://www.instagram.com/happynian_kangyoon/`, 네이버 지도 URL 모두 정확히 일치, 변형 없음 |
| 7. 이미지 7개 섹션 매핑 확인 | 위 표 참고, 육안 검증 + alt 텍스트 grep | **PASS** |
| 8. 사진 4번(탈색 과정)을 Before로 표기하지 않았는지 | `grep -rn "[Bb]efore\|비포"` (data/pages) | **PASS** — 일치 없음. alt/캡션 모두 "시술 과정"으로만 표기 |
| 9. 390px 가로 스크롤, 메뉴, 고정 CTA, 이미지 크롭 확인 | Playwright `scrollWidth` vs `clientWidth` 비교(전 페이지) + 스크린샷 | **PASS** — 모든 페이지 390px에서 가로 스크롤 0px. 모바일 메뉴 열기/닫기(aria-expanded 토글, Escape 닫힘) 정상. 고정 예약 버튼 정상 표시 |
| 10. 768px·1440px 레이아웃 확인 | Playwright 스크린샷 | **PASS** — 가로 스크롤 없음, 편집형 그리드 정상 렌더 |
| 11. 키보드 탐색·focus 확인 | Playwright로 Tab 순서 자동 확인(skip link → 헤더 링크), CSS `:focus-visible` 아웃라인 유지 확인 | **PASS** |
| 12. 콘솔 오류·네트워크 404 확인 | 10개 페이지 전체 순회 | **PASS** — 콘솔 에러 0건, 404 등 실패 요청 0건 |
| 13. sitemap, robots, 메타데이터, JSON-LD 확인 | 빌드 결과물 직접 파싱(Python `json.loads`) | **PASS** — `sitemap-index.xml`/`sitemap-0.xml`에 10개 페이지 전부 포함, `robots.txt`에 일반 봇 + `OAI-SearchBot` 허용, `noindex` 전무. 페이지별 `<title>` 10개 전부 고유. JSON-LD 전부 유효한 JSON, 스키마 타입 확인(Person/HairSalon/WebSite — 홈, BreadcrumbList — 전 상세 페이지, Article — 가이드 3편) |
| 14. 구조화 데이터가 보이는 본문과 모순되지 않는지 | 수동 대조 | **PASS** — Person의 "11년 경력" 설명은 홈 화면(11년 경력이 실제로 표시되는 페이지)에서만 포함되도록 코드로 강제(`personSchema(includeExperience)`). AggregateRating/Review 등 리뷰 관련 스키마는 어디에도 없음 |
| 15. Happynian 철자 전수 검색 | `grep -ril "Happyn" dist/` 후 `Happyn[a-z]*` 패턴 추출 | **PASS** — 모든 매치가 예외 없이 "Happynian" (Happynion 등 오탈자 0건) |
| 16. 가짜 리뷰·수상·경력·Before 정보 전수 검색 | `grep -rniE "리뷰|후기|평점|수상|1위|최고의|넘버원|곧 추가"` (data/pages) | **PASS** — 일치 없음 |
| 접근성 자동 검사 | axe-core(WCAG 2.0/2.1 A+AA) — 10개 페이지 전체 | **PASS** — 위반 0건 (최초 1건은 다크 배경 위 레드 텍스트 대비 부족이었고, `--color-red-on-dark`(#ef6068, 대비 5.4:1) 토큰을 추가해 수정 후 0건으로 확인) |
| Lighthouse — Accessibility | 모바일 프리셋, 실제 URL 대상 | **PASS — 100/100** |
| Lighthouse — Best Practices | 〃 | **PASS — 100/100** |
| Lighthouse — SEO | 〃 | **PASS — 100/100** |
| Lighthouse — Performance | 모바일 프리셋(시뮬레이션 스로틀링) | **주의 필요 — 55/100.** 아래 "성능 측정에 대한 참고" 항목 참고 |
| Lighthouse — Performance(스로틀링 미적용) | 동일 페이지, throttling 없이 재측정 | **100/100**, FCP/LCP 0.1~0.2초, TBT 0ms, CLS 0 |

### 성능 측정에 대한 참고

이 작업환경(샌드박스 컨테이너)에서 Lighthouse의 기본 모바일 프리셋(가상 느린 4G + 4배
CPU 스로틀링)으로 측정하면 Performance 점수가 55점, FCP/LCP가 12초대로 나옵니다. 하지만
같은 페이지에서 **Total Blocking Time은 0ms, Cumulative Layout Shift는 0** — 즉 메인
스레드를 막는 스크립트도, 레이아웃 이동도 전혀 없습니다. 스로틀링을 끄고 동일 페이지를
다시 측정하면 Performance/Accessibility/Best Practices/SEO 전부 100점, FCP·LCP 0.1~0.2초로
나옵니다. 이는 이 샌드박스 환경의 네트워크 스택이 시뮬레이션 스로틀링과 겹치며 생기는
환경적 아티팩트로 판단되며, 실제 정적 호스팅(CDN)에 배포하면 재현되지 않을 가능성이 높습니다.
**다만 이 세션의 측정만으로 실제 운영 환경의 모바일 4G 성능을 보장할 수는 없으므로, 실제
도메인에 배포한 뒤 반드시 Lighthouse를 다시 실행해 확인하는 것을 권장합니다.**

### 미실행 항목

- **실제 모바일 기기 테스트**: 이 환경에는 실제 iOS/Android 기기가 없어 Chromium
  에뮬레이션(390/768/1440 뷰포트)으로만 확인했습니다. safe-area 처리는 CSS `env()` 함수로
  구현했으나 실제 iPhone에서의 시각 확인은 하지 못했습니다.
- **스크린리더 실사용 테스트**: axe-core 자동 검사만 실행했고, VoiceOver/NVDA 등 실제
  스크린리더로 직접 들어보는 수동 테스트는 하지 못했습니다.
- **실 도메인 기준 Google Search Console 등록/제출**: 사용자 지시에 따라 실행하지 않았습니다.
- **실제 배포 후 성능 재측정**: 위 성능 측정 참고 항목 참고.

## 5. 알려진 제한 사항

- 첫 화면의 SELECTED WORK 1번(애쉬베이지) 리드 카드는 가로로 넓은 크롭(16:10)을 사용해
  머리 스타일이 크게 보이도록 조정했습니다. 원본 사진이 세로 인물 사진이라, 이 비율에서는
  어깨 아래 일부가 잘립니다. 얼굴과 헤어는 항상 온전히 보이도록 확인했습니다.
- 빈티지 히피펌(work-03) 사진은 배경 그림 속 사슴 귀 장식이 완전히 사라지지는 않고, 화면
  최상단에서 거의 보이지 않는 수준까지 줄였습니다(요청하신 "얼굴과 헤어를 자르지 않는
  범위에서 최대한 크롭" 원칙을 지켰습니다).
- 홈 화면 시각 미리보기(Artifact)는 홈 화면 스냅샷이며, `/work/`, `/guide/` 등 내부 페이지
  이동은 지원하지 않습니다. 전체 다중 페이지 사이트는 ZIP의 `npm run preview`로 확인해야
  합니다.

## 6. 변경·생성 파일 목록

`happynian-magok-web/` 폴더 전체가 이번 작업으로 새로 생성되었습니다(기존 저장소의 다른
파일은 수정하지 않았습니다). 주요 파일:

```
astro.config.mjs, package.json, tsconfig.json, README.md
src/data/{site,designers,works,services,consultation,guides}.ts
src/lib/schema.ts
src/layouts/BaseLayout.astro
src/components/{Header,Footer,MobileCta,Breadcrumb}.astro
src/pages/index.astro
src/pages/work/{index,[slug]}.astro
src/pages/guide/{index,[slug]}.astro
src/pages/robots.txt.ts
src/styles/global.css
src/assets/works/*.jpeg (7개 원본, works/ 6개 + profile/ 1개)
public/favicon.svg
docs/OWNER_EDIT_GUIDE.md, docs/IMPLEMENTATION_REPORT.md(본 문서)
proof/*.png (5개 스크린샷)
assets-source-original/*.jpeg (첨부 원본 보존본)
```
