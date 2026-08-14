# DATA_MODEL.md — 콘텐츠 메타데이터 스키마

모든 콘텐츠 항목(규칙/추천/사례/용어)은 다음 메타데이터를 **필수로** 가진다.
앱 UI에서도 이 메타데이터(특히 출처·상태 배지)를 항상 표시한다.

## 필수 필드

```yaml
title: 고객 앞에서 기술 질문하기
category: 시술 중                # docs/IA.md 의 목차 경로
source_level: M1                 # H1 | H2 | G1 | M1 | K1 | CASE | IDEA
status: confirmed                # confirmed | review_needed | draft | deprecated
type: rule                       # rule | recommendation | case | glossary | faq
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
| `source_level` | `docs/SOURCE_POLICY.md` 참조. 서로 다른 레벨을 섞지 않는다 |
| `status` | `confirmed`(확정) / `review_needed`(확인 필요) / `draft`(초안) / `deprecated`(폐기·과거 기준) |
| `type` | `rule`(공식 규칙) / `recommendation`(추천) / `case`(과거 사례) / `glossary`(용어) / `faq` |
| `owner` | 작성/책임자 |
| `last_updated` | 최종 수정일 |
| `verified_by` | 최종 확인자 (없으면 `review_needed`로 유지) |
| `related` | 연관 항목 (검색/추천 연결용) |

## type 별 추가 필드

### rule / recommendation
```yaml
why: "짧은 이유 요약 (Why? 토글에 표시)"
```

### case
```yaml
what_happened: ""
response_at_the_time: ""
lesson: ""
current_standard_ref: ""   # 현재 기준 문서로의 링크. 없으면 review_needed
```
사례는 절대 그 자체로 규칙이 되지 않는다. "과거 사례"라는 라벨을 UI에서
항상 함께 노출한다.

### glossary
```yaml
term: 깨모닝
short_definition: ""
long_explanation: ""
```

## 상태(conflict) 처리

같은 주제에 대해 서로 다른 `source_level`/내용의 문서가 존재하면
자동으로 하나를 선택하지 않는다. 두 문서 모두 유지하고 관리자 화면에
`conflict`로 노출한다.

## 변경 이력

콘텐츠 항목 변경 시 `CHANGELOG.md`에 다음 형식으로 남긴다.

```
- 2026-08-14 | [정액권 > 환불 기준] status: draft → confirmed | 사유: 원장 확인 완료 | source: M1
```
