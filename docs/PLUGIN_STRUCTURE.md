# 플러그인 구조와 공용 규칙 포함 방식

- 상태: pending_review
- 최종 승인자: 강윤
- 확인한 공식 문서: `https://code.claude.com/docs/en/plugins-reference` (Claude Code 플러그인 참조 문서, 확인일: 이 문서 작성 시점 세션)
- 확인하지 못한 것: Cowork 전용 플러그인 설치·실행 공식 문서(`claude.com`, `support.claude.com`)는 이 세션에서 network egress 차단으로 직접 열람하지 못했다. 아래 내용 중 "Claude Code 플러그인 표준 구조" 부분은 SOURCE_EVIDENCE(원문 직접 확인)이고, "Cowork 관련" 서술은 검색 요약 기반 UNVERIFIED_LEAD다.

## 기준 원본은 어디에 있는가

이 저장소(Claude Code, `kky1790-crypto/-1-`)가 유일한 기준 원본이다.

- `docs/AI_EMPLOYEE_CHARTER.md`
- `.claude/rules/00-chief-of-staff.md`
- `.claude/agents/*.md`
- `.claude/skills/*/SKILL.md`

Cowork에 설치할 플러그인은 이 원본을 **복사해서** 만든다. 플러그인 안의 사본을 직접 고치지 않는다 — 규칙을 바꿔야 하면 이 저장소의 원본을 먼저 고치고, 플러그인은 다시 포장(재배포)한다. 이것이 강윤이 지적한 14번 문제(Cowork에서 규칙을 따로 고쳐서 버전이 갈라지는 것)를 막는 방법이다.

## Claude Code 공식 플러그인 표준 구조 [SOURCE_EVIDENCE]

`https://code.claude.com/docs/en/plugins-reference`에서 직접 확인한 표준 레이아웃:

```
plugin-root/
├── .claude-plugin/
│   └── plugin.json          # 매니페스트. 이 폴더 안에는 plugin.json만 둔다.
├── skills/
│   ├── staff-meeting/SKILL.md
│   └── content-production/SKILL.md
├── agents/
│   ├── research-analyst.md
│   ├── decision-strategist.md
│   ├── red-team-reviewer.md
│   ├── content-drafter.md
│   ├── evidence-reviewer.md
│   └── memory-curator.md
└── references/                # 공용 규칙 사본 (아래 참고)
    ├── ai-employee-charter.md
    └── chief-of-staff-rules.md
```

중요한 제약(원문 확인됨): `.claude-plugin/` 폴더 안에는 `plugin.json`만 있어야 하고, `skills/`·`agents/` 등 나머지 폴더는 플러그인 루트에 바로 있어야 한다(`.claude-plugin/` 안에 넣으면 안 됨).

## 공용 규칙을 플러그인 안에서 읽는 방법 [SOURCE_EVIDENCE + 설계 판단]

공식 문서는 플러그인 안의 skill·agent 파일들이 "공용 참고 문서"를 서로 공유하는 표준 방법을 별도로 설명하지 않는다(원문에서 확인됨 — 없다는 것이 확인된 사실이다). 대신 문서에 있는 `${CLAUDE_PLUGIN_ROOT}` 치환 변수(플러그인 설치 경로를 가리킴, skill 본문과 `allowed-tools`에서 모두 쓸 수 있음)를 그대로 활용한다.

방식:
1. 원본(`docs/AI_EMPLOYEE_CHARTER.md`, `.claude/rules/00-chief-of-staff.md`)을 플러그인 포장 시점에 `references/ai-employee-charter.md`, `references/chief-of-staff-rules.md`로 그대로 복사한다.
2. 각 agent·skill 파일은 지금처럼 파일 경로를 문장으로 지시한다. 다만 저장소 경로(`docs/AI_EMPLOYEE_CHARTER.md`) 대신 플러그인 경로(`${CLAUDE_PLUGIN_ROOT}/references/ai-employee-charter.md`)를 가리키도록 포장 스크립트가 치환한다.
3. Claude(메인이든 subagent든)는 자동으로 이 파일이 로드된다고 가정하지 않고, 매번 Read 도구로 직접 읽는다 — 지금 research-analyst 등이 "docs/AI_EMPLOYEE_CHARTER.md를 읽고..."라고 명시적으로 지시받는 것과 같은 방식이다. 이렇게 하면 Cowork가 플러그인의 CLAUDE.md나 규칙 파일을 자동으로 읽어준다고 가정할 필요가 없다.

복사본과 원본이 달라지는 것을 막기 위해, 복사본은 사람이 손으로 고치지 않는다. 원본을 고친 뒤 포장 스크립트로만 다시 복사한다.

## 버전 표기

- `plugin.json`의 `version` 필드가 실제 설치 버전을 결정하는 기준이다(원문 확인: 캐시 키로 쓰이고, 값이 같으면 업데이트를 건너뛴다).
- 이전 버전은 재설치 후 약 14일 뒤 백그라운드로 정리된다는 설명은 원문에서 확인했지만, 재설치 시 충돌이나 다운그레이드를 어떻게 처리하는지는 공식 문서에 없었다(UNKNOWN).
- 그래서 이전 버전으로 돌아가고 싶을 때를 대비해, 배포한 zip 파일 자체를 버전별로 따로 보관하는 것을 권장한다 (아래 CHANGELOG와 함께).
