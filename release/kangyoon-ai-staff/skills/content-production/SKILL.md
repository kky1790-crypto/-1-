---
name: content-production
description: staff-meeting C유형에서 승인된 콘텐츠 초안과 제작 패킷을 받아 실제 문서·PDF·프레젠테이션·스프레드시트 파일을 만든다. 이 조직에서 실제 파일을 만드는 유일한 Skill이다. staff-meeting이 끝나고 사용자가 실제 제작을 승인한 뒤에만 호출한다.
argument-hint: [승인된 제작 패킷 요약 또는 staff-meeting 결과 참조]
---

# 콘텐츠 제작 (content-production)

이 Skill은 **사용자가 실제 제작을 승인한 뒤에만** 호출한다. staff-meeting 안에서는 호출하지 않는다 (staff-meeting은 읽기·조사·분석·텍스트 초안까지만 담당 — `skills/staff-meeting/SKILL.md` "자동 실행 금지" 참고).

## 시작 전 확인

`${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 11장(보고 방식)과 `${CLAUDE_PLUGIN_ROOT}/references/AI_EMPLOYEE_CHARTER.md`(승인 필요 행동, 콘텐츠 제작 원칙)를 따른다. red-team-reviewer·evidence-reviewer의 PASS는 사용자의 APPROVED가 아니다 — 이 Skill은 사용자가 실제로 "승인" 또는 이에 준하는 명시적 의사표시를 한 뒤에만 실행한다.

## 입력 (제작 패킷)

호출하는 쪽(chief-of-staff)이 아래를 전달한다. 이 정보가 없으면 먼저 확인 질문을 최대 3개까지 한다.

- 승인된 원고 전체 (content-drafter 최종 결과물)
- evidence-reviewer의 검수 결과와 남은 주의사항
- 사용자가 요청한 크기·페이지 수·형식(문서/PDF/프레젠테이션/스프레드시트 등)·용도
- 자동 실행 금지 항목 (아래와 동일)

## 제작 순서

1. **형식 판단** — 요청된 결과물이 문서/PDF/프레젠테이션/스프레드시트/인쇄용 디자인 중 무엇에 해당하는지 확인한다.
2. **적합한 제작 도구로 실제 파일 생성** — 이 세션에서 사용 가능한 기존 제작 Skill(예: docx, pptx, xlsx, pdf, canvas-design 등)을 그대로 활용해서 실제 파일을 만든다. content-production이 파일 형식을 새로 발명하지 않는다.
3. **원고 반영 확인** — 승인된 원고의 문구·구성을 임의로 바꾸지 않는다. 레이아웃·분량 조정으로 문구 자체가 달라지면 그 변경을 최종 보고에 표시한다.
4. **최종 QA** — 완성된 파일을 `evidence-reviewer`에게 다시 전달해(또는 evidence-reviewer 접근이 어려운 파일 형식이면 chief-of-staff가 직접) 다음을 확인한다.
   - 승인된 원고와 실제로 다른 부분이 있는가(누락·오탈자 포함)
   - 근거·출처 표시가 파일에도 그대로 남아 있는가(필요한 경우)
   - 외모 평가·차별·과장 표현이 제작 과정에서 새로 들어가지 않았는가
   - 레이아웃·페이지 수·크기가 요청과 맞는가
5. **결과 보고** — 만들어진 파일과 짧은 보고를 사용자에게 전달한다.

## 확인되지 않은 부분 (설계 시점 UNKNOWN)

- evidence-reviewer(Read/Glob/Grep만 가짐)가 실제 생성된 파일(pptx/docx 등 바이너리)을 직접 열어 검수할 수 있는지는 이 환경에서 확인하지 못했다. 확인 안 되면 evidence-reviewer 대신 chief-of-staff가 생성 직전 원고 텍스트 기준으로 QA하고, 이 사실을 최종 보고에 표시한다.
- 이 Skill이 실제 Cowork 세션에서 동일하게 동작하는지는 로컬(Claude Code) 환경에서 완전히 검증할 수 없다. Cowork 공식 문서를 이 세션에서는 접근하지 못했다 (network egress 차단, 확인 시도: code.claude.com만 접근 가능, claude.com·support.claude.com 접근 불가). 실제 Cowork에서 첫 실행 시 별도로 확인이 필요하다.

## 자동 실행 금지

다음은 이 Skill 안에서도 사용자 승인 전에는 자동 실행하지 않는다.

- 완성된 파일의 외부 전송·공개·인쇄
- 고객·식구에게 직접 전달
- 승인받지 않은 추가 콘텐츠 생성(요청 범위를 벗어난 페이지·문구 추가 등)
- Canva·Google Drive 등 이번 단계에서 연결하지 않기로 한 외부 도구 호출

## 완료 후

만든 파일 목록, 원고 대비 달라진 점(있다면), QA 결과, 아직 필요한 사용자 승인(배포·인쇄 등)을 `${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 11장 6항목 형식으로 짧게 보고한다.
