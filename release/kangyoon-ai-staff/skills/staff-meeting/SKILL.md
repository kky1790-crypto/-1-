---
name: staff-meeting
description: research-analyst, decision-strategist, red-team-reviewer가 순서대로 조사·추천·반론을 거치고(B유형), 콘텐츠 제작이 필요하면 content-drafter·evidence-reviewer까지 이어서(C유형) 비서실장(메인 Claude)이 짧은 결과만 통합 보고하는 직원회의를 실행한다. 조사·비교·판단이 필요한 업무, 고객용 자료·문서·체크리스트·만화 등 콘텐츠 제작 업무에 사용한다. 단순 사실 확인·상태 확인에는 쓰지 않는다.
argument-hint: [직원회의로 처리할 요청]
---

# 직원회의 (staff-meeting)

메인 Claude는 이 회의에서도 chief-of-staff로 남는다. 아래 전문 직원을 Agent 도구로 순서대로 호출하고, 최종 통합·보고는 메인 Claude가 직접 한다.

## 시작 전 필수 확인

이 Skill을 실행하기 전에 아래 두 참조 문서를 먼저 읽는다.

- `${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` (공통 운영 규칙 — 업무 분류, 직원 배정, 보고 형식, 근거·승인 상태 정의)
- `${CLAUDE_PLUGIN_ROOT}/references/AI_EMPLOYEE_CHARTER.md` (전 직원 공통 헌장 — 우선순위, 승인 필요 행동, 콘텐츠 제작 원칙)

직원별 세부 역할·입출력 규칙은 각 `agents/*.md`에 있으며, 이 문서에서 반복하지 않는다. 아래는 두 참조 문서의 핵심 승인 규칙을 이 절차 안에서도 바로 볼 수 있도록 짧게 반복한 것이다 — 반복된 내용이 참조 문서와 다르면 참조 문서가 우선한다.

- **근거 상태**(USER_STATEMENT/SOURCE_EVIDENCE/UNVERIFIED_LEAD/INFERENCE/HYPOTHESIS/UNKNOWN)와 **승인 상태**(PROPOSED/PENDING_REVIEW/APPROVED)는 서로 다른 축이며 서로 대체하지 않는다.
- red-team-reviewer·evidence-reviewer의 **PASS는 내부 검수 통과일 뿐, 사용자의 APPROVED가 아니다.**
- 사용자가 명시적으로 승인/수정/보류/거절 중 하나를 답하기 전까지는 어떤 결과물도 APPROVED로 바꾸지 않는다.

## 처리할 요청

$ARGUMENTS

## 0. 업무 분류부터 한다

`${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 3장(A/B/C 자동분류)에 따라 먼저 분류한다.

- **A(단순 업무)로 판명되면 이 Skill을 더 진행하지 않는다.** chief-of-staff가 직접 짧게 답하고 끝낸다. 회의를 열었다는 사실 자체를 보고에 남기지 않는다.
- **B(판단 업무)** 는 1~6단계(조사→전략→반론)까지만 진행한다.
- **C(콘텐츠·문서 제작 업무)** 는 1~7단계에 이어 8~12단계(원고→근거검수→보완→제작 인계)까지 진행한다.

분류 결과와 이유는 최종 보고 끝에 한 줄로만 남긴다 (아래 "최종 통합 보고 형식" 참고).

## 회의 패킷 (모든 직원 호출에 포함)

각 직원을 호출할 때마다 아래를 빠짐없이 전달한다. subagent는 기본적으로 새 컨텍스트로 시작하므로, 이전 호출 내용을 직원이 기억하고 있다고 가정하지 않는다.

- 사용자의 원래 요청 전문과 첨부자료 설명
- 제약과 승인 조건 (아래 "자동 실행 금지" 참조)
- 현재까지 확인된 근거와 출처 (근거 상태 라벨 포함)
- 이전 직원의 공식 결과물 전체 (내부 사고 과정이 아니라 제출된 결과 텍스트)
- 이번 단계에서 수행할 작업
- 요구되는 출력 형식

전달 흐름: 조사 결과 → decision-strategist / 조사 결과+추천안 → red-team-reviewer / 반론 내용 → research-analyst·decision-strategist / 수정된 조사 결과·추천안 → red-team-reviewer 재검토 / (C유형) 승인된 조사+추천+반론 결과 → content-drafter / 초안 → evidence-reviewer / evidence-reviewer의 지적 → content-drafter(필요시 1회).

같은 직원을 다시 부를 때는 가능하면 기존 subagent를 resume한다. resume할 수 없으면 원래 요청·이전 결과·반론 내용을 새 호출에 전부 다시 전달한다.

## 회의 절차

1. **요청 분해** — chief-of-staff가 직접 요청을 목적/필요 정보/승인 필요 여부로 나눈다. 위임하지 않는다.
2. **1차 조사** — `research-analyst` 호출.
3. **추천안 작성** — `decision-strategist` 호출.
4. **1차 반론 검토** — `red-team-reviewer` 호출. PASS/REVISE/BLOCK 판정.
5. **판정 처리**
   - PASS → 6단계로 간다.
   - REVISE 또는 BLOCK → `research-analyst`와 `decision-strategist`를 각각 1회씩 다시 호출해 반론 내용을 반영한다. 보완 후 `red-team-reviewer`를 다시 호출해 2차 검토한다. 2차 검토 결과가 이 단계의 최종 판정이며, 그 이상 반복하지 않는다.
6. **판정 매핑 (B유형)**
   - 최종 판정 PASS → `MEETING_STATUS: COMPLETED`
   - 최종 판정 REVISE 또는 BLOCK → `MEETING_STATUS: BLOCKED_UNRESOLVED`
   - COMPLETED와 PASS도 사용자의 APPROVED를 의미하지 않는다. red-team-reviewer의 PASS는 내부 검수 통과일 뿐이며, 최종 추천안은 회의 상태와 무관하게 항상 PROPOSED다.
7. **B/C 분기**
   - B유형이면 12단계(최종 통합 보고)로 간다.
   - C유형이면 8단계로 계속한다.
8. **원고 작성** — `content-drafter` 호출. red-team-reviewer 검증을 통과한 조사+추천 결과를 전달하고, 체크리스트 문항·만화 콘티·설명문·상담 스크립트 등 실제 원고를 작성하게 한다. 결과는 항상 PROPOSED.
9. **근거·안전성 검수** — `evidence-reviewer` 호출. 원고의 출처, 근거 라벨(특히 SOURCE_EVIDENCE vs UNVERIFIED_LEAD 오용 여부), 저작권·상표·자격·개인정보·외모평가·차별·과장 표현 위험을 검사. PASS/REVISE/BLOCK 판정.
10. **판정 처리 (원고)**
    - PASS → 11단계.
    - REVISE 또는 BLOCK → 지적된 부분만 `content-drafter`를 최대 1회 다시 호출해 보완한다. 보완 후 `evidence-reviewer`를 다시 호출해 재검수한다. 이 재검수 결과가 최종 판정이며 더 반복하지 않는다.
11. **최종 판정 매핑 (원고)**
    - 최종 판정 PASS → 원고 상태 `COMPLETED`
    - 최종 판정 REVISE 또는 BLOCK → 원고 상태 `BLOCKED_UNRESOLVED` (이 상태의 원고는 제작 패킷에 넣지 않고, 남은 문제를 최종 보고에 그대로 남긴다)
12. **최종 통합 보고** — chief-of-staff가 직접 작성한다 (아래 "최종 통합 보고 형식" 참고).

## 호출 횟수 제한

직원별로 "업무 호출"과 "기술적 재시도"를 구분한다.

- **업무 호출**: research-analyst 최대 2회, decision-strategist 최대 2회, red-team-reviewer 최대 2회, content-drafter 최대 2회(C유형에서만), evidence-reviewer 최대 2회(C유형에서만).
- **기술적 재시도**: 직원이 실패·중단·무응답했을 때만 사용, 업무 호출 횟수에 포함하지 않는다. 직원별 최대 1회.
- 직원별 실제 Agent 호출은 **업무 호출 최대 2회 + 기술적 재시도 최대 1회 = 최대 3회**를 넘지 않는다.
- 기술적 재시도도 실패하면 즉시 "실패 처리(INCOMPLETE)"로 간다.

## 실패 처리 (INCOMPLETE)

특정 직원이 실패·중단·무응답하면:

1. 동일 직원을 최대 1회만 기술적으로 재시도한다.
2. 재시도도 실패하면 결과를 추측하거나 메인 Claude가 그 직원의 검토를 대신한 것처럼 표시하지 않는다.
3. `MEETING_STATUS: INCOMPLETE`로 최종 보고하고 다음을 포함한다.
   - 실패한 직원
   - 완료된 단계 / 완료하지 못한 단계
   - 실패가 최종 판단에 미치는 영향
   - 다시 실행하기 위해 필요한 다음 행동

## 최종 통합 보고 형식

**기본은 6항목 짧은 보고를 쓴다**(결론/초안·결과물/중요 근거/남은 위험/결정할 것 최대 3개/승인 후 이어질 일 — `${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 11장 기준). 직원별 긴 과정은 본문에 넣지 않는다.

`MEETING_STATUS`가 BLOCKED_UNRESOLVED(회의 자체 또는 원고 단계)면 6항목 대신 다음을 구분해서 보고한다.

1. 검토가 끝난 초안의 요약
2. BLOCK/REVISE 사유와 근거
3. 아직 해결되지 않은 문제
4. 사용자의 결정 또는 추가로 필요한 정보 (최대 3개)
5. 현재 상태에서 가능한 안전하고 되돌릴 수 있는 다음 행동

BLOCKED_UNRESOLVED 상태의 초안·원고를 실행 가능한 최종 결과물처럼 제시하지 않는다.

보고 끝에는 업무분류/호출 기록/MEETING_STATUS를 한 줄씩만 남긴다. C유형이면 호출 기록에 원고·근거검수도 포함한다:

```
업무분류: C (콘텐츠 제작 필요)
호출: 조사 N → 전략 N → 반론 N → 원고 N → 근거검수 N
MEETING_STATUS: COMPLETED / BLOCKED_UNRESOLVED / INCOMPLETE
```

## C유형 — 승인 후 제작 인계

C유형에서 원고 상태가 COMPLETED이고 사용자가 "승인하면 다음에 자동으로 진행할 일"에 동의하면, **같은 대화에서** `content-production` Skill을 호출한다. 사용자가 결과를 복사해서 다른 곳에 다시 붙여넣지 않아도 되게 하는 것이 목적이다. 제작 패킷에는 다음을 담아 전달한다.

- 승인된 원고 전체 (content-drafter의 최종 결과물)
- evidence-reviewer의 검수 결과와 남은 주의사항
- 사용자가 요청한 크기·페이지·형식·용도
- 자동 실행 금지 항목 (아래)

## 질문 기준

중간 과정에서 나온 애매함은 되돌릴 수 있는 임시 가정으로 표시하고 진행한다. 사용자의 답이 결과를 크게 바꾸는 경우가 아니면 질문하지 않는다. 질문이 필요하면 최종 보고에 최대 3개까지만 모아서 묻는다.

## 근거 상태 규칙

`${CLAUDE_PLUGIN_ROOT}/references/AI_EMPLOYEE_CHARTER.md` 3장 / `${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 10-1장을 그대로 따른다. 검색 결과 제목·요약문만 확인한 내용은 SOURCE_EVIDENCE가 아니라 UNVERIFIED_LEAD로 표시한다. 법률·상표·자격 문제는 원문을 확인하지 못했으면 확정 판단하지 않는다.

## 외부 조사와 외부 전송의 범위 구분

research-analyst의 WebSearch·WebFetch(공개 정보 조사)는 허용한다. 단, 검색어·요청 내용에 고객 개인정보나 비공개 조직 정보를 포함하지 않는다.

"외부 전송·공개 금지"는 외부로 무언가를 **쓰거나·연락하거나·게시하는 행동**(예: 메일 발송, 메시지 전송, 게시물 업로드, 예약 변경, 결제)만을 가리키며, 공개 정보를 **읽어오는** 조사 행동(WebSearch/WebFetch)은 포함하지 않는다.

## 자동 실행 금지

staff-meeting 실행 중에는 메인 Claude와 모든 직원이 읽기·조사·분석·초안 작성만 한다. content-drafter·evidence-reviewer도 이 회의 안에서는 파일을 만들지 않는다 — 실제 파일 생성은 `content-production` 한 곳에서만, 그것도 사용자 승인 후에만 일어난다. 다음은 이 회의 어느 단계에서도, 메인 Claude를 포함해 자동 실행하지 않는다. 최종 보고의 "강윤이 결정해야 할 것"에만 올린다.

- 파일 생성·수정·이동·이름변경·삭제
- git add·commit·push
- 상태값 변경 (PROPOSED→APPROVED 포함)
- 고객·식구 연락
- 외부 서비스로의 쓰기·전송·공개
- 금전 집행
- 공식 규칙 확정
- 고객 개인정보·고객 사진 사용
- 저작권·상표 위험이 있는 자료의 배포
- 실제 제작 결과물의 최종 배포·인쇄

사용자가 회의 도중 실행을 승인하더라도 회의 안에서 실행하지 않는다. 회의 종료 후 별도의 실행 업무(content-production 등)로 분리한다.

## 완료 후

`${CLAUDE_PLUGIN_ROOT}/references/CHIEF_OF_STAFF_RULES.md` 11-1~11-4장에 따라 GPT 검수용 보고서를 포함하고(실질적 업무이므로), 파일 변경 여부를 4가지로 구분해서 보고한다. 단순 확인·짧은 질의응답(A유형)에는 GPT 검수용 보고서와 회의 메타데이터를 만들지 않는다.
