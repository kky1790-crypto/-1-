# 변경 이력 (CHANGELOG)

- 상태: pending_review
- 최종 승인자: 강윤
- 용도: 무엇을 언제 왜 바꿨는지 기록해서, 반복된 문제를 다음 버전에 반영할 수 있게 한다 (AI 참모실 보완점 10번 대응).

## [미배포] AI 참모실 전면 점검 (v0.1.2 방향)

### 추가
- `.claude/agents/content-drafter.md` — 체크리스트·만화 콘티·설명문·상담 스크립트 원고 작성 직원
- `.claude/agents/evidence-reviewer.md` — 원고의 근거·출처·저작권·외모평가 위험 검수 직원
- `.claude/agents/memory-curator.md` — 기억 후보 정리 직원 (제한판, 자동 저장 권한 없음)
- `.claude/skills/content-production/SKILL.md` — 승인된 초안으로 실제 파일(문서·PDF·프레젠테이션 등)을 만드는 Skill
- `docs/CHANGELOG.md`, `docs/PLUGIN_STRUCTURE.md` — 이 문서들

### 변경
- `docs/AI_EMPLOYEE_CHARTER.md` v0.1 → v0.1.2: 근거 상태를 `.claude/rules/00-chief-of-staff.md`와 통일하고 `UNVERIFIED_LEAD` 추가, 콘텐츠 제작 원칙(16장) 신설, 승인 필요 항목 보강(8장)
- `.claude/rules/00-chief-of-staff.md` v0.1.1 → v0.1.2: 업무 A/B/C 자동분류 판단표, 콘텐츠 제작 흐름과 content-production 인계(5-1장), 짧은 6항목 보고 기본화(11장), UNVERIFIED_LEAD 근거상태, memory-curator 제한 범위 명시(14장)
- `.claude/skills/staff-meeting/SKILL.md`: A유형 조기 종료 규칙, B/C 분기, C유형(원고 작성→근거검수→1회 보완→제작 인계) 절차 추가, 짧은 6항목 보고 기본화

### 발견된 것 (다음 버전에 반영할 문제)
- 이전 헌장(v0.1) 3장과 비서실장 규칙 10-1장의 근거 상태 라벨 이름이 서로 달랐음(APPROVED_INTERNAL/EXTERNAL_EVIDENCE vs SOURCE_EVIDENCE 등) — 이번에 하나로 통일함.
- staff-meeting 실사용 테스트(얼굴타입진단 회의)에서 검색 요약만 확인한 근거가 SOURCE_EVIDENCE로 표시될 뻔한 사례 발견 — UNVERIFIED_LEAD 라벨 신설로 대응.
- Cowork 플러그인 공식 설치·실행 문서를 이 세션에서 직접 확인하지 못함(아래 참고) — 실제 Cowork 첫 실행 시 재확인 필요.

## 확인 불가로 남은 것 (UNKNOWN)

- Cowork에서 플러그인의 agents/skills가 정확히 어떻게 호출되는지, content-production이 실제로 파일을 만들 수 있는 범위가 어디까지인지: 이 세션에서는 `claude.com`, `support.claude.com` 접근이 네트워크 정책으로 차단되어 원문을 직접 확인하지 못했다. WebSearch 요약 수준의 정보만 있으며 UNVERIFIED_LEAD로 취급한다. 확인 가능한 다음 행동: 실제 Cowork 세션에서 이 플러그인을 설치해 직접 테스트하거나, `claude.com`/`support.claude.com` 접근이 가능한 환경에서 공식 문서를 다시 확인한다.
