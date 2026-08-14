# CHANGELOG

형식: `날짜 | 변경 항목 | 변경 이유 | 영향 범위 | 출처`

## 2026-08-14 (4차 라운드) — 관리자 검수 시스템 (review-admin) 구현

- `review-admin/` 신규: Phase 1 인벤토리 항목을 사람이 직접 검수·승인하기
  전까지 어떤 형태로도 공개 노출되지 않도록 하는 관리자 도구. Node/Express +
  빌드 단계 없는 vanilla JS. `inventory/items/*.md`를 유일한 데이터 소스로
  사용, 변경 이력은 `inventory/_history/<id>.jsonl`에 append-only 기록 |
  사유: Phase 2 콘텐츠 작업으로 바로 넘어가지 않고 "AI 초안 → 사람 승인"
  검수 게이트를 먼저 확보 | 영향 범위: 신규 디렉터리 | 출처: 사용자(강윤) 지시
- 검수 상태(`review_status`) 6종(pending_review/editing/approved/hold/
  rejected/archived), `reviewed_by`/`reviewed_at`/`review_note`,
  `duplicate_of`, `title` 필드를 `docs/INVENTORY_MODEL.md`와
  `inventory/_templates/item.template.md`에 추가 | 사유: 검수 워크플로를
  스키마에 정식 반영 | 영향 범위: Phase 1 스키마 | 출처: 사용자(강윤) 지시
- 공개 API(`/api/public/*`)는 `review_status === 'approved'` 항목만, 내부
  필드(raw_excerpt/notes/review_note/reviewed_by/uncertainty/conflict/
  duplicate_of/source)를 제외한 화이트리스트 필드만 반환하도록 코드 레벨에서
  분리(`src/publicFilter.js`) — UI에서만 숨기는 방식에 의존하지 않음.
  승인은 `confirm:true` 없이는 거부(`409 APPROVAL_CONFIRMATION_REQUIRED`).
  `raw_excerpt`는 일반 PATCH로 수정 불가, 별도 엔드포인트에서만 수정되고
  `raw_edit` 액션으로 이력이 남음 | 영향 범위: 핵심 안전 불변식 |
  출처: 사용자(강윤) 지시
- Review Queue + 상세/수정 반응형 프런트엔드(모바일/아이패드/데스크톱),
  원문(raw_excerpt)과 AI 정리 초안(raw_summary/interpretation)을 시각적으로
  분리 표시, 이전/다음 탐색, 검색/필터, 중복 가능성 표시(자동 병합 없음,
  제안만), 변경 이력 모달 | 영향 범위: 신규 UI | 출처: 사용자(강윤) 지시
- 테스트 34개(`node:test`, 별도 프레임워크 의존성 없음): 데이터 계층
  라운드트립, 상태 전이/승인 게이트, 공개 필터 격리, 실제 HTTP 서버를 띄운
  end-to-end 시나리오 포함, 전부 통과 | 영향 범위: `review-admin/test/` |
  출처: 사용자(강윤) 지시
- 데모 시드 2건(`review-admin/seed/demo/`): 이번 대화에서 사용자가 직접
  예로 든 문장만 사용(내용을 지어내지 않음), `npm run seed:demo` 실행 시에만
  `inventory/items/`에 반영되는 opt-in 스크립트 | 영향 범위: UX 검증용 |
  출처: 사용자(강윤) 지시

### 자체 검증 중 발견·수정한 문제 (커밋 전)

- `dataStore.createItem`이 `id` 없는 데이터로 빈 frontmatter 파일
  (`undefined-untitled.md`)을 조용히 생성하던 문제 → 데모 시드의 마크다운
  주석이 `gray-matter`의 frontmatter 인식을 깨뜨려 실제로 재현됨 → 가드
  추가(`CREATE_ITEM_MISSING_ID`) 및 회귀 테스트 작성
- `.modal { display: flex }` CSS가 `[hidden]` 속성을 덮어써 승인 확인
  모달/이력 모달이 "숨김" 상태에서도 실제로는 화면을 가리고 클릭을
  막던 문제(Playwright 자동화로 발견) → `.modal[hidden] { display: none; }`
  추가
- 저장/승인/원문수정 성공 메시지가 뒤이은 화면 새로고침(`populateForm`)에
  의해 사용자가 보기도 전에 지워지던 문제 → 메시지 초기화 시점을
  `selectItem`(다른 항목으로 전환할 때)으로 이동
- (qa-reviewer subagent 실행 결과) `dataStore.saveItem`이 frontmatter 아래
  마크다운 본문을 매 저장마다 조용히 삭제하던 데이터 손실 위험 → 기존
  본문을 읽어 보존하도록 수정, 회귀 테스트 작성
- (qa-reviewer subagent 실행 결과) `selectItem()`의 비동기 응답 순서
  역전으로 다른 항목을 빠르게 연속 클릭하면 나중에 도착한 응답이 화면을
  덮어써 잘못된 항목에 저장될 수 있는 경합 조건 → `state.currentId` 재확인
  가드 추가
- (qa-reviewer subagent 실행 결과) `source_level` 배지, 변경 이력의 `actor`
  값이 이스케이프 없이 `innerHTML`에 삽입되던 저장형 XSS 2건 → `escapeHtml()`
  적용 + 서버 측에서 `source_level`/`authority_status`/`certainty`/
  `currentness`/`possible_content_type`/`scope`/`uncertainty`/`conflict`
  값 형식을 검증(`INVALID_FIELD_VALUE`)하도록 방어 계층 추가, 실제 브라우저
  (Playwright)로 재검증
- (qa-reviewer subagent 실행 결과) `raw-excerpt` PATCH에 필수값 검증이
  없어 값 누락 시 500과 함께 내부 라이브러리 에러 메시지가 노출되던 문제 →
  400 `INVALID_RAW_EXCERPT`로 정리

수정 후 테스트 29개 → 34개로 확장, 전부 통과 재확인. 데모 시드로 실제
서버를 띄워 curl + Playwright로 전체 워크플로(승인 게이트/공개 필터/원문
보호/상태 전이/이력/반응형 UI)를 직접 실행해 검증한 뒤, 생성된 파일은
모두 삭제해 `inventory/items/`를 다시 빈 상태로 되돌림.

## 2026-08-14

- CLAUDE.md 전면 재작성 (프로젝트 헌법: 역할, 목적, Phase 범위, 출처 정책,
  개발/QA 규칙, 가드레일) | 사유: 개발 운영 체계 수립 | 영향 범위: 전체
  프로젝트 지침 | 출처: 사용자(강윤) 지시
- docs/PRODUCT.md, IA.md, DATA_MODEL.md, SOURCE_POLICY.md, QA_CHECKLIST.md
  신규 작성 | 사유: 정보구조/데이터모델/출처정책/QA 기준을 코드 밖 문서로 고정 |
  영향 범위: 설계 문서 전체 | 출처: 사용자(강윤) 지시
- content/{official,gangseo,magok,cases,ideas,glossary} 폴더 및
  content/_templates 메타데이터 템플릿 생성 (실제 콘텐츠는 아직 없음) |
  사유: Phase 1 콘텐츠 작성을 위한 구조 준비 | 영향 범위: 콘텐츠 저장 구조 |
  출처: 사용자(강윤) 지시
- .claude/skills/{final-check,content-audit,ux-audit},
  .claude/agents/{qa-reviewer,content-reviewer,ux-reviewer,devil-advocate}
  신규 작성 | 사유: 반복 검증 절차 자동화 | 영향 범위: 개발 워크플로 |
  출처: 사용자(강윤) 지시

- (2차 라운드) 실제 저장소 상태 재검증 수행: branch/status/log/파일존재/
  local-remote HEAD 일치 전부 확인, 불일치 없음 | 사유: "완료 보고"와
  "실제 상태"를 분리 검증하는 습관 정착 | 영향 범위: 검증 절차 |
  출처: 사용자(강윤) 지시
- CLAUDE.md에 15장(VERIFY BEFORE REPORTING) 신설, Phase를 0~5로 재구성
  (0 기반/1 Knowledge Inventory/2 Knowledge Base/3 기본 앱/4 AI/5 운영
  시스템), 4장(PHILOSOPHY ≠ RULE), 6장(CONTENT TYPE), 7장(RULE vs
  PRINCIPLE vs JUDGMENT 화면 표현 원칙) 신설 | 사유: 철학이 규칙으로
  둔갑하는 것을 이 프로젝트의 최대 위험으로 명문화 | 영향 범위: 전체
  프로젝트 지침, 섹션 번호 전면 재배열 | 출처: 사용자(강윤) 지시
- docs/DATA_MODEL.md에 `content_type`(philosophy/principle/rule/
  guideline/procedure/metric/case/opinion/question) 필드와 `format`
  필드 추가, source_level과의 독립 축 설명/예시 추가 | 사유: "누가
  말했는가"와 "그 말의 성격"을 분리해 AI가 섞지 않도록 함 | 영향 범위:
  Phase 2 콘텐츠 스키마 | 출처: 사용자(강윤) 지시
- content/_templates/{rule,case,glossary}.template.md에 content_type/
  format 필드 반영 | 사유: 새 데이터 모델과 템플릿 동기화 | 영향 범위:
  콘텐츠 작성 템플릿 | 출처: 사용자(강윤) 지시
- docs/INVENTORY_MODEL.md 신규 작성 + inventory/{items,_templates} 폴더
  생성 (원자료 인벤토리 스키마: id/topic/source/raw_summary/
  source_level/possible_content_type/status/related/conflict/
  official_rule). 실제 인벤토리 항목은 아직 없음 | 사유: 콘텐츠 문장을
  바로 쓰지 않고 원자료를 있는 그대로 먼저 펼쳐두는 Phase 1 단계 확보 |
  영향 범위: 신규 폴더/문서 | 출처: 사용자(강윤) 지시
- docs/PRODUCT.md, IA.md, SOURCE_POLICY.md, QA_CHECKLIST.md, README.md의
  Phase 1/2 표기를 새 Phase 0~5 체계로 갱신 | 사유: 문서 간 Phase 번호
  불일치 방지 | 영향 범위: 문서 전반 | 출처: 사용자(강윤) 지시

## 2026-08-14 (3차 라운드) — Phase 1 인벤토리 설계 보강

- CLAUDE.md 5장(PHASE 1 EXTRACTION RULES) 신설: 원문 의도 보충 금지,
  여러 발화 통합 금지, 모순 해결 금지 등 14개 금지사항 명문화.
  6장을 "THE FOUR AXES"로 재구성해 source_level/content_type/scope/
  authority_status 네 축을 하나의 모델로 통합. 섹션 번호 전면 재배열
  (0~30, 31개 섹션) | 사유: Phase 1(원자료 인벤토리) 진입 전 안전장치
  보강 | 영향 범위: 전체 프로젝트 지침 | 출처: 사용자(강윤) 지시
- docs/INVENTORY_MODEL.md 전면 보강: Phase 1을 1A(Raw Capture) /
  1B(Classification) / 1C(Conflict Map) 3단계로 분리. `topics`/`scope`/
  `possible_content_type`을 리스트(다중 허용)로 변경, `raw_summary`와
  `interpretation`(Phase 1에서는 항상 null) 분리, `certainty`/
  `currentness`/`uncertainty`(speaker/date/context/meaning 개별 표시)
  필드 추가, `conflict`를 "누가 맞는가"가 아닌 "가치 간 긴장(tension)"
  연결 용도로 재정의 | 사유: 원자료 추출 과정에서 의미가 바뀌는 것을
  구조적으로 막기 위함 | 영향 범위: Phase 1 스키마 | 출처: 사용자(강윤) 지시
- docs/DATA_MODEL.md에 `scope`(누구/어디에 적용되는가), `authority_status`
  (official/adopted/local_practice/proposed/discussed/personal_view/
  unknown, 지금 조직에서 실제로 어떤 권위를 갖는가) 필드 추가.
  source_level이 높다는 이유만으로 authority_status가 과장되지 않도록
  경고 추가 | 사유: "사부님이 말했다"≠"공식 규정", "마곡점에서 매일
  한다"≠"해피니언 전체 정책" 구분 | 영향 범위: Phase 2 콘텐츠 스키마 |
  출처: 사용자(강윤) 지시
- inventory/_templates/item.template.md, content/_templates/
  {rule,case,glossary}.template.md, docs/SOURCE_POLICY.md,
  docs/QA_CHECKLIST.md, .claude/skills/content-audit,
  .claude/agents/{qa-reviewer,content-reviewer}를 새 필드/섹션 번호와
  동기화. CLAUDE.md 섹션 재배열로 발생한 문서 간 참조 번호 불일치
  4건(qa-reviewer.md 2곳, QA_CHECKLIST.md, tests/README.md) 발견 및 수정 |
  사유: 문서 간 상호 참조 무결성 | 영향 범위: 템플릿/스킬/에이전트/문서
  전반 | 출처: 사용자(강윤) 지시

다음 단계 (미완료): 실제 앱 구현 없음. content/, inventory/items/ 아래
실제 데이터 없음 (템플릿만 존재, `inventory/items/`는 `.gitkeep`만 있음).
기술 스택 미결정. Phase 1 원자료 인벤토리는 사용자가 원자료를 정리해서
제공한 뒤 시작.
