# DATA_MODEL.md — 콘텐츠 메타데이터 스키마 (Phase 2용)

이 스키마는 **Phase 2 (Knowledge Base)** 콘텐츠, 즉 검증이 끝나
`content/`에 확정 게시되는 항목에 적용된다. 검증 전 원자료는
`docs/INVENTORY_MODEL.md`(Phase 1 인벤토리) 스키마를 따른다.

모든 콘텐츠 항목(규칙/원칙/절차/사례/용어)은 다음 메타데이터를
**필수로** 가진다. 앱 UI에서도 이 메타데이터(특히 출처·성격·상태 배지)를
항상 표시한다.

## 필수 필드

```yaml
title: 고객 앞에서 기술 질문하기
category: 시술 중                # docs/IA.md 의 목차 경로
source_level: M1                 # 누가 말했는가: H1 | H2 | G1 | M1 | K1 | CASE | IDEA
content_type: procedure          # 그 말의 성격: philosophy | principle | rule |
                                  # guideline | procedure | metric | case | opinion | question
format: rule                     # 구조 템플릿: rule | case | glossary | faq
status: confirmed                # confirmed | review_needed | draft | deprecated
owner: 강윤
last_updated: 2026-08-14
verified_by: 강윤
related:
  - 고객 신뢰
  - 파트너 교육
```

## 필드 설명

| 필드 | 설명 |
|---|---|
| `title` | 항목 제목 |
| `category` | `docs/IA.md`의 목차 경로 (예: `시술 중 > 고객 앞 질문`) |
| `source_level` | **누가 말했는가.** `docs/SOURCE_POLICY.md` 참조. 서로 다른 레벨을 섞지 않는다 |
| `content_type` | **그 말의 성격이 무엇인가.** `source_level`과 독립적인 축. 아래 표 참고 |
| `format` | 콘텐츠의 구조 템플릿 선택자 (`rule` / `case` / `glossary` / `faq`) — 어떤 추가 필드가 붙는지 결정 |
| `status` | `confirmed`(확정) / `review_needed`(확인 필요) / `draft`(초안) / `deprecated`(폐기·과거 기준) |
| `owner` | 작성/책임자 |
| `last_updated` | 최종 수정일 |
| `verified_by` | 최종 확인자 (없으면 `review_needed`로 유지) |
| `related` | 연관 항목 (검색/추천 연결용) |

## `content_type` — source_level과 절대 혼동하지 않는다

`source_level`이 "누가 말했는가"라면 `content_type`은 "그 말의 성격이
무엇인가"다. 반드시 둘 다 기록한다 (`CLAUDE.md` 6장 참고).

| content_type | 의미 | 화면 표현 (`CLAUDE.md` 7장) |
|---|---|---|
| `philosophy` | 왜 존재하는가, 무엇을 지향하는가 | 원칙과 유사하게, 절대 단정적 규칙 어투 금지 |
| `principle` | 우리는 이런 방향을 중요하게 생각한다 | "원칙" 배지, 방향성 어투 |
| `rule` | 반드시 이렇게 한다 | "규칙" 배지, 단정적 어투 허용 |
| `guideline` | 상황에 따라 다르며 이런 요소를 고려한다 | "판단" 배지, 조건부 어투 |
| `procedure` | 실제 업무 순서 | 절차 단계로 표시 |
| `metric` | 지표/숫자 기준 | 숫자 + 출처 반드시 병기 |
| `case` | 실제 사례 | "과거 사례" 배지 필수 |
| `opinion` | 의견 | 누구의 의견인지(source_level) 강조 |
| `question` | 아직 답이 없는 질문 | 답 없음을 명시, `status: review_needed` |

예시:

- `source_level: H2` + `content_type: philosophy` → **사부님이 말했지만
  철학**이다. 반드시 지켜야 하는 규칙으로 표시하지 않는다.
- `source_level: M1` + `content_type: procedure` → **마곡점에서 실제로
  따라야 하는 업무 절차**다.
- `source_level: K1` + `content_type: opinion` → **강윤의 개인 의견**이다.
  공식 기준처럼 보이면 안 된다.

이 두 축을 분리하지 않으면 AI(Phase 4)가 "사부님이 말씀하셨다"는 이유만으로
철학적 발언을 절차처럼 답하는 사고가 발생한다.

## `format` 별 추가 필드

### format: rule (규칙/원칙/판단/절차 공통)
```yaml
why: "짧은 이유 요약 (Why? 토글에 표시)"
```

### format: case
```yaml
what_happened: ""
response_at_the_time: ""
lesson: ""
current_standard_ref: ""   # 현재 기준 문서로의 링크. 없으면 review_needed
```
사례는 절대 그 자체로 규칙이 되지 않는다. "과거 사례"라는 라벨을 UI에서
항상 함께 노출한다.

### format: glossary
```yaml
term: 깨모닝
short_definition: ""
long_explanation: ""
```

### format: faq
```yaml
question: ""
answer_ref: ""   # 답이 되는 다른 콘텐츠로의 링크. 없으면 status: review_needed
```

## 충돌(conflict) 처리

같은 주제에 대해 서로 다른 `source_level`/내용의 문서가 존재하면
자동으로 하나를 선택하지 않는다. 두 문서 모두 유지하고 관리자 화면에
`conflict`로 노출한다.

## 변경 이력

콘텐츠 항목 변경 시 `CHANGELOG.md`에 다음 형식으로 남긴다.

```
- 2026-08-14 | [정액권 > 환불 기준] status: draft → confirmed | 사유: 원장 확인 완료 | source: M1
```
