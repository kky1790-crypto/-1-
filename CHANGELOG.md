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

다음 단계 (미완료): 실제 앱 구현 없음. content/ 아래 실제 콘텐츠 없음.
기술 스택 미결정.
