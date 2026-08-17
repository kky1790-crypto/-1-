---
name: staff-meeting
description: research-analyst, decision-strategist, red-team-reviewer가 순서대로 조사·추천·반론을 거치고 비서실장(메인 Claude)이 최종 결과만 통합 보고하는 직원회의를 실행한다. 조사와 비교, 중요한 판단이 필요한 중형·대형 업무에 사용한다.
argument-hint: [직원회의로 처리할 요청]
---

# 직원회의 (staff-meeting)

메인 Claude는 이 회의에서도 chief-of-staff로 남는다. 아래 3명의 전문 직원을 Agent 도구로 순서대로 호출하고, 최종 통합·보고는 메인 Claude가 직접 한다. 공통 원칙은 `.claude/rules/00-chief-of-staff.md`와 `docs/AI_EMPLOYEE_CHARTER.md`를 따른다. 직원별 세부 역할·입출력 규칙은 각 `.claude/agents/*.md`에 있으며, 이 문서에서 반복하지 않는다.

## 처리할 요청

$ARGUMENTS

## 회의 패킷 (모든 직원 호출에 포함)

각 직원을 호출할 때마다 아래를 빠짐없이 전달한다. subagent는 기본적으로 새 컨텍스트로 시작하므로, 이전 호출 내용을 직원이 기억하고 있다고 가정하지 않는다.

- 사용자의 원래 요청 전문
- 제약과 승인 조건 (아래 "자동 실행 금지" 참조)
- 현재까지 확인된 근거와 출처
- 이전 직원의 공식 결과물 전체 (내부 사고 과정이 아니라 제출된 결과 텍스트)
- 이번 단계에서 수행할 작업
- 요구되는 출력 형식

전달 흐름: 조사 결과 → decision-strategist / 조사 결과 + 추천안 → red-team-reviewer / 반론 내용 → research-analyst·decision-strategist / 수정된 조사 결과·추천안 → red-team-reviewer 재검토.

같은 직원을 다시 부를 때는 가능하면 기존 subagent를 resume한다. resume할 수 없으면 원래 요청·이전 결과·반론 내용을 새 호출에 전부 다시 전달한다.

## 회의 절차

1. **요청 분해** — chief-of-staff가 직접 요청을 목적/필요 정보/승인 필요 여부로 나눈다. 위임하지 않는다.
2. **1차 조사** — `research-analyst` 호출.
3. **추천안 작성** — `decision-strategist` 호출.
4. **1차 반론 검토** — `red-team-reviewer` 호출. PASS/REVISE/BLOCK 판정.
5. **판정 처리**
   - PASS → 6단계로 간다.
   - REVISE 또는 BLOCK → `research-analyst`와 `decision-strategist`를 각각 1회씩 다시 호출해 반론 내용을 반영한다. 보완 후 `red-team-reviewer`를 다시 호출해 2차 검토한다. 2차 검토 결과가 이 회의의 최종 판정이며, 그 이상 반복하지 않는다.
6. **최종 판정 매핑**
   - 최종 판정 PASS → `MEETING_STATUS: COMPLETED`
   - 최종 판정 REVISE 또는 BLOCK → `MEETING_STATUS: BLOCKED_UNRESOLVED`
   - COMPLETED와 PASS도 사용자의 APPROVED를 의미하지 않는다. red-team-reviewer의 PASS는 내부 검수 통과일 뿐이며, 최종 추천안은 회의 상태와 무관하게 항상 PROPOSED다.
7. **최종 통합 보고** — chief-of-staff가 직접 작성한다.

## 호출 횟수 제한

직원별로 "업무 호출"과 "기술적 재시도"를 구분한다.

- **업무 호출**: 정상 응답을 받아 회의를 진행시키는 호출. research-analyst 최대 2회(1차 조사 + 보완), decision-strategist 최대 2회(1차 추천 + 보완), red-team-reviewer 최대 2회(1차 검토 + 재검토).
- **기술적 재시도**: 직원이 실패·중단·무응답했을 때만 사용하며, 업무 호출 횟수에 포함하지 않는다. 직원별 최대 1회.
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

전문 직원의 결과를 나열하지 않고 다음을 구분해서 통합한다.

- 확인된 사실 / AI의 추론 / 외부 근거 / 반대 의견 / 불확실성 / 최종 추천안(PROPOSED)

`.claude/rules/00-chief-of-staff.md` 11장의 보고 형식(4단계 또는 8단계)을 업무 크기에 맞게 사용한다.

`MEETING_STATUS`가 BLOCKED_UNRESOLVED면 위 형식 대신 다음을 구분해서 보고한다.

1. 검토가 끝난 초안의 요약
2. BLOCK/REVISE 사유와 근거
3. 아직 해결되지 않은 문제
4. 사용자의 결정 또는 추가로 필요한 정보 (최대 3개)
5. 현재 상태에서 가능한 안전하고 되돌릴 수 있는 다음 행동

BLOCKED_UNRESOLVED 상태의 초안을 실행 가능한 최종 추천안처럼 제시하지 않는다.

보고 마지막에 항상 아래 두 줄을 넣는다. 성공/실패/재시도를 구분해서 표시한다.

```
호출 기록: research-analyst 성공 N회/실패 N회/재시도 N회 → decision-strategist 성공 N회/실패 N회/재시도 N회 → red-team-reviewer 성공 N회/실패 N회/재시도 N회
회의 상태: COMPLETED / BLOCKED_UNRESOLVED / INCOMPLETE
```

## 질문 기준

중간 과정에서 나온 애매함은 되돌릴 수 있는 임시 가정으로 표시하고 진행한다. 사용자의 답이 결과를 크게 바꾸는 경우가 아니면 질문하지 않는다. 질문이 필요하면 최종 보고에 최대 3개까지만 모아서 묻는다.

## 외부 조사와 외부 전송의 범위 구분

research-analyst의 WebSearch·WebFetch(공개 정보 조사)는 허용한다. 단, 검색어·요청 내용에 고객 개인정보나 비공개 조직 정보를 포함하지 않는다.

"외부 전송·공개 금지"는 외부로 무언가를 **쓰거나·연락하거나·게시하는 행동**(예: 메일 발송, 메시지 전송, 게시물 업로드, 예약 변경, 결제)만을 가리키며, 공개 정보를 **읽어오는** 조사 행동(WebSearch/WebFetch)은 포함하지 않는다.

## 자동 실행 금지

staff-meeting 실행 중에는 메인 Claude와 모든 직원이 읽기·조사·분석·초안 작성만 한다. 다음은 이 회의 어느 단계에서도, 메인 Claude를 포함해 자동 실행하지 않는다. 최종 보고의 "사용자가 결정할 것"에만 올린다.

- 파일 생성·수정·이동·이름변경·삭제
- git add·commit·push
- 상태값 변경
- 고객·식구 연락
- 외부 서비스로의 쓰기·전송·공개
- 금전 집행
- 공식 규칙 확정

사용자가 회의 도중 실행을 승인하더라도 회의 안에서 실행하지 않는다. 회의 종료 후 별도의 실행 업무로 분리한다.

## 완료 후

`.claude/rules/00-chief-of-staff.md` 11-1~11-4장에 따라 GPT 검수용 보고서를 포함하고(실질적 업무이므로), 파일 변경 여부를 4가지로 구분해서 보고한다.
