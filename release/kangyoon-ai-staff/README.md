# 강윤 AI 참모실 (kangyoon-ai-staff)

조사 → 전략 → 반론 → (콘텐츠 제작 업무면) 원고 작성 → 근거 검수를 거쳐, 비서실장(메인 Claude)이 결과를 하나로 통합해 짧게 보고하는 AI 직원 조직 플러그인입니다. 해피니언 마곡점 강윤님의 개인/매장 업무를 지원하기 위해 설계되었습니다.

> 이 문서 중 "Cowork에서 실행하는 방법"과 "실행 예시"는 이 플러그인 설계자(Claude)가 공식 문서와 이 프로젝트의 설계 내용을 바탕으로 정리한 것이며, Cowork 실제 런타임에서 직접 실행해 확인한 것은 아닙니다(근거 상태: INFERENCE / UNVERIFIED_LEAD — 아래 "확인되지 않은 부분" 참고). 실제 Cowork 환경에서 명령어나 동작이 다르면 이 문서를 그 결과에 맞게 고쳐야 합니다.

## 이 플러그인이 하는 일

사용자가 요청을 하면 비서실장이 먼저 업무를 크기(A/B/C)로 분류합니다.

- **A(단순 업무)**: 비서실장이 직접 짧게 답합니다. 직원회의를 열지 않습니다.
- **B(판단 업무)**: research-analyst(조사) → decision-strategist(전략) → red-team-reviewer(반론) 순서로 호출한 뒤, 비서실장이 결과를 통합해 6항목 짧은 보고를 합니다.
- **C(콘텐츠·문서 제작 업무)**: B의 절차에 이어 content-drafter(원고 작성) → evidence-reviewer(근거·안전성 검수)까지 진행합니다. 사용자가 실제 제작을 승인하면 같은 대화에서 `content-production` Skill을 호출해 실제 파일(문서·PDF·프레젠테이션·스프레드시트 등)을 만듭니다.

모든 결과물은 사용자가 명시적으로 "승인"이라고 답하기 전까지 `PROPOSED` 상태로 남습니다. AI 직원의 `PASS`/`COMPLETED` 판정은 내부 검수 통과일 뿐 사용자 승인을 의미하지 않습니다.

## 포함된 직원과 Skill

**직원 (agents/)**

| 이름 | 역할 | 도구 |
|---|---|---|
| research-analyst | 내부·외부 자료 조사 | Read, Glob, Grep, WebFetch, WebSearch |
| decision-strategist | 선택지 비교와 추천안 작성 | Read, Glob, Grep |
| red-team-reviewer | 반론과 위험 검증 | Read, Glob, Grep |
| content-drafter | 체크리스트·만화 콘티·설명문·상담 스크립트 원고 작성 | Read, Glob, Grep |
| evidence-reviewer | 원고의 근거·저작권·상표·개인정보·표현 위험 검수 | Read, Glob, Grep |
| memory-curator | 기억 후보 정리(MEMORY_CANDIDATE만, 저장 권한 없음) | Read, Glob, Grep |

**Skill (skills/)**

| 이름 | 역할 |
|---|---|
| staff-meeting | 위 직원들을 순서대로 호출하는 직원회의 절차. A/B/C 자동분류 포함 |
| content-production | C유형에서 사용자 승인 후 실제 파일을 만드는 유일한 Skill |

**참조 문서 (references/)**

| 파일 | 내용 |
|---|---|
| AI_EMPLOYEE_CHARTER.md | 전 직원 공통 헌장 (우선순위, 근거 상태, 승인 필요 행동, 콘텐츠 제작 원칙 등) |
| CHIEF_OF_STAFF_RULES.md | 비서실장 운영 규칙 (업무 분류, 직원 배정, 보고 형식, 근거·승인 상태 정의 등) |

두 참조 문서는 원본 저장소의 `docs/AI_EMPLOYEE_CHARTER.md`, `.claude/rules/00-chief-of-staff.md`를 그대로 옮긴 것이며, 내부 자기참조 경로만 `${CLAUDE_PLUGIN_ROOT}/references/...` 형태로 바뀌었습니다.

## 설치 방법

1. 이 플러그인 ZIP(`kangyoon-ai-staff-v0.1.0.zip`)을 Cowork(또는 Claude Code)의 플러그인 설치 경로에 업로드하거나, 압축을 풀어 플러그인 디렉터리로 지정합니다.
2. 설치 후 플러그인이 활성화됐는지 확인합니다(`defaultEnabled: true`로 설정되어 있어 설치 시 기본적으로 켜집니다).
3. Claude Code에서 로컬로 먼저 시험해보려면(설치 없이 1회성 실행): `claude --plugin-dir ./release/kangyoon-ai-staff`

## Cowork에서 실행하는 방법 (예시)

플러그인이 설치되면 Skill은 `/<플러그인 이름>:<Skill 이름>` 형태의 명령으로 호출됩니다. 이 플러그인의 이름은 `kangyoon-ai-staff`이므로:

```
/kangyoon-ai-staff:staff-meeting 다음 요청을 검토해줘: [실제 요청 내용]
```

예시:

```
/kangyoon-ai-staff:staff-meeting 신규 남성 고객 대상 헤어 상담 체크리스트 초안을 검토해줘.
```

C유형 업무에서 원고가 완성되고 사용자가 승인하면, 같은 대화에서 아래처럼 제작 Skill이 이어서 호출됩니다(자동 실행이 아니라 승인 후 진행):

```
/kangyoon-ai-staff:content-production 방금 승인된 체크리스트를 A4 1장 PDF로 만들어줘.
```

위 두 예시는 이 플러그인의 실제 명령 형식을 보여주기 위해 새로 만든 예시이며, Cowork에서 실제로 실행해 확인한 결과는 아닙니다.

## 사용자 승인이 필요한 행동 (자동 실행하지 않음)

다음은 어떤 단계에서도 사용자의 명시적 승인 없이 자동 실행되지 않습니다.

- 파일 생성·수정·이동·이름변경·삭제 (staff-meeting 안에서는 원고까지만, 실제 파일은 content-production 승인 후에만)
- git add·commit·push
- 상태값 변경 (PROPOSED → APPROVED 포함)
- 고객·식구 연락, 예약 변경, 결제
- 외부 서비스로의 쓰기·전송·공개
- 공식 규칙 확정
- 고객 개인정보·고객 사진 사용
- 저작권·상표 위험이 있는 자료의 배포
- 완성된 제작 결과물의 최종 배포·인쇄

## 삭제·업데이트 방법

- **삭제**: 설치한 플러그인을 Cowork(또는 Claude Code)의 플러그인 관리 화면/명령에서 제거합니다. 이 플러그인은 원본 저장소와 분리된 독립 패키지이므로, 삭제해도 `kky1790-crypto/-1-` 저장소의 원본 파일에는 영향이 없습니다.
- **업데이트**: 원본 저장소(`.claude/agents/`, `.claude/skills/`, `docs/`, `.claude/rules/`)의 내용이 바뀌면, 이 `release/kangyoon-ai-staff/` 패키지를 다시 생성(참조 문서·직원·Skill 파일을 다시 복사하고 경로만 치환)한 뒤 `version`을 올리고 새 ZIP을 만들어 재설치합니다. 버전은 `.claude-plugin/plugin.json`의 `version` 필드로 관리합니다.

## 문제 해결 (Troubleshooting)

- **직원이 호출되지 않는다 / "찾을 수 없음" 오류**: 설치 직후에는 새로 추가된 agent 등록이 한 턴 정도 지연될 수 있습니다(Claude Code 환경에서 관찰된 현상, 근거 상태: INFERENCE). 재설치 후 새 대화를 한 번 시작해 다시 시도하세요.
- **`content-production`이 파일을 만들지 못한다**: 이 Skill은 Cowork(또는 Claude Code) 세션에서 사용 가능한 문서/PDF/프레젠테이션/스프레드시트 제작 도구가 있어야 동작합니다. 해당 세션에 그런 도구가 연결되어 있는지 확인하세요.
- **evidence-reviewer가 완성된 파일(pptx/docx 등)을 직접 열어 검수할 수 있는지 불확실**: 이 직원은 Read/Glob/Grep만 가지고 있어 바이너리 파일을 열지 못할 수 있습니다. 이 경우 `content-production`이 비서실장에게 QA를 넘기도록 설계되어 있습니다.
- **Cowork 전용 동작이 문서와 다르게 보인다**: 이 패키지 설계 시점에는 `claude.com`/`support.claude.com`의 Cowork 전용 공식 문서에 네트워크로 접근할 수 없었습니다(egress 차단, `code.claude.com`만 접근 가능했음. 확인 시도일: 2026-08-18). 따라서 Cowork 런타임 관련 서술은 검증되지 않은 추정(UNVERIFIED_LEAD/INFERENCE)이 섞여 있을 수 있습니다. 실제 동작과 다르면 이 README와 Skill 파일을 실제 동작에 맞게 수정해야 합니다.

## 확인되지 않은 부분

- evidence-reviewer가 실제 생성된 바이너리 파일을 직접 검수할 수 있는지: UNKNOWN (chief-of-staff 대체 경로로 설계됨).
- 이 플러그인이 실제 Cowork 세션에서 설계된 대로 동작하는지: UNKNOWN (로컬 Claude Code 환경에서는 완전히 검증 불가, 실제 설치 후 확인 필요).
