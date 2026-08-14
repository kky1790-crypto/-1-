# INVENTORY_MODEL.md — Phase 1 원자료 인벤토리 스키마

Phase 1(Knowledge Inventory)의 목적은 대화·경험 등에 흩어진 원자료를
**규칙화하지 않고 있는 그대로** 수집·분류하는 것이다.

```
원문 → 주제 → 출처 → 현재성 → 확실성 → 충돌 여부
```

이 단계에서는 문장을 다듬거나 결론을 내리지 않는다. 원문을 요약할 때도
화자의 의도보다 강한 단정적 표현으로 바꾸지 않는다 (`CLAUDE.md` 4장
PHILOSOPHY ≠ RULE). 인벤토리 항목은 그 자체로 공식 기준이 아니다 — 반드시
`review_needed` 또는 `draft` 상태로 시작하며, 확정(Phase 2로 승격)은 별도
검토를 거친다.

## 저장 위치

`inventory/items/`에 항목당 파일 하나. 파일명: `<id>-<짧은-slug>.md`
(예: `M-00127-고객-앞-기술-질문.md`). 템플릿: `inventory/_templates/item.template.md`.

## 스키마

```yaml
id: M-00127

topic: 고객 앞에서 파트너가 기술 질문하는 상황

source:
  type: conversation        # conversation | document | memo | interview 등
  speaker: 강윤/효리/계훈
  date: 2026-08

raw_summary: |
  고객 앞에서 파트너가 자신이 맡을 기술의 기본 원리 자체를
  모르는 것처럼 질문하면 고객의 신뢰가 낮아질 수 있다는 의견.

source_level: K1            # H1 | H2 | G1 | M1 | K1 | CASE | IDEA — 확신 없으면 가장 낮은 확실성 쪽으로
possible_content_type: opinion   # docs/DATA_MODEL.md 의 content_type 후보 (확정 아님, 가설)

status: review_needed        # 인벤토리 단계는 거의 항상 review_needed 또는 draft

possible_related_topics:
  - 고객 신뢰
  - 파트너 교육
  - 시술 중 커뮤니케이션

conflict: true                # 이 주제에 대해 서로 다른/상충하는 의견이 존재하는가
conflict_detail: |
  질문 자체를 막으면 학습 기회를 제한할 수 있다는 의견도 존재.

official_rule: 아직 없음      # 이 주제에 대한 확정된 공식 기준이 있으면 링크, 없으면 "아직 없음"
```

## 필드 설명

| 필드 | 설명 |
|---|---|
| `id` | 고유 식별자. 접두어로 출처를 힌트할 수 있음(`M-`=마곡점 관련 등), 강제 규칙은 아님 |
| `topic` | 이 원자료가 다루는 주제 (한 문장) |
| `source` | 원자료가 어디서 나왔는지 (대화/문서/메모 등, 화자, 시기) |
| `raw_summary` | 원문 또는 원문에 최대한 가까운 요약. **의미를 바꾸지 않는다** |
| `source_level` | 확정이 아니라 현재 근거 기준 잠정 분류. 애매하면 낮은 레벨(K1/IDEA)로 |
| `possible_content_type` | `docs/DATA_MODEL.md`의 `content_type` 후보. 어디까지나 가설 |
| `status` | 인벤토리 단계 대부분 `review_needed`/`draft`. Phase 2로 승격되기 전엔 `confirmed` 금지 |
| `possible_related_topics` | 다른 주제와의 연결 후보 |
| `conflict` / `conflict_detail` | 같은 주제에 대해 상충하는 의견/기준이 있는지 |
| `official_rule` | 이미 확정된 공식 기준이 있으면 그 콘텐츠로 링크, 없으면 "아직 없음" |

## Phase 2로 승격하는 절차

1. 같은 주제의 인벤토리 항목을 모은다 (충돌 여부 포함해서 전부 확인).
2. 사용자(강윤)에게 확정 여부를 확인한다 — AI가 임의로 확정하지 않는다.
3. 확정된 내용만 `docs/DATA_MODEL.md` 스키마로 변환해 `content/` 아래
   알맞은 출처 폴더에 저장하고 `status: confirmed`로 바꾼다.
4. `CHANGELOG.md`에 인벤토리 → 콘텐츠 승격 이력을 남긴다.
5. 원본 인벤토리 항목은 삭제하지 않고 `official_rule` 필드에 새 콘텐츠로의
   링크를 추가해 남겨둔다 (원자료 추적성 유지, `CLAUDE.md` 22장).

## 지금 이 시점에서 하지 않는 것

- AI가 주제 이름만 보고 `raw_summary`나 결론을 지어내는 것 (`CLAUDE.md` 3장 위반)
- 인벤토리 항목을 곧바로 `status: confirmed`로 표시하는 것
- 인벤토리 단계에서 철학적 발언을 규칙처럼 요약하는 것 (`CLAUDE.md` 4장 위반)

실제 인벤토리 항목 작성은 사용자가 원자료를 정리해서 제공한 뒤 진행한다.
