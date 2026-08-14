# CHANGELOG

형식: `날짜 | 변경 항목 | 변경 이유 | 영향 범위 | 출처`

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
