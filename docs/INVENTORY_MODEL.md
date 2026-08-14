# INVENTORY_MODEL.md — Phase 1 원자료 인벤토리 스키마

Phase 1(Knowledge Inventory)의 목적은 대화·경험 등에 흩어진 원자료를
**규칙화하지 않고 있는 그대로** 수집·분류하는 것이다. 아직 정답도, 정책도,
매뉴얼도 만들지 않는다.

**"무슨 뜻인지 정리하는 것"과 "어떻게 운영해야 하는지 결정하는 것"을
철저히 분리한다.** 예를 들어 원자료가

> "고객 앞에서 파트너가 기본적인 기술 질문을 하면 고객이 불안해할 수 있다."

라면, Phase 1에서는 여기서 "그러면 고객 앞 질문 금지" / "이것이 마곡점
원칙" / "이렇게 교육해야 함"으로 넘어가지 않는다. 원문을 있는 그대로,
그리고 그 성격에 대한 **가설**만 남긴다.

이 단계에서 절대 하면 안 되는 것 14가지는 `CLAUDE.md` 5장
(PHASE 1 EXTRACTION RULES) 참고. 인벤토리 항목은 그 자체로 공식 기준이
아니다 — 반드시 `review_needed` 또는 `draft` 상태로 시작하며, 확정
(Phase 2로 승격)은 별도 검토를 거친다.

---

## Phase 1의 3단계

Phase 1은 한 번에 끝내지 않고 세 단계로 나눠서 진행한다. 같은 항목이라도
1A에서 곧바로 1B/1C까지 다 채울 필요는 없다 — 정보가 부족하면 다음 단계
필드는 `unknown`/`null`로 비워두고 넘어간다.

### 1A. Raw Capture

원자료를 최대한 손대지 않고 저장한다. 이 단계에서 채우는 것:
`id`, `topics`, `source`(누가/언제/어떤 맥락), `raw_excerpt`(가능하면 실제
발화 그대로), `raw_summary`(원문에 최대한 충실한 요약).
**옳고 그름, 성격 분류, 충돌 여부는 아직 판단하지 않는다.**

### 1B. Classification

내용의 **성격만** 분류한다: `possible_content_type`, `source_level`,
`scope`, `authority_status`, `certainty`, `currentness`, `uncertainty`.
이때도 옳고 그름 판단은 하지 않는다 — "이게 철학처럼 보인다"까지만
말하고 "그러니까 규칙이 아니다/맞다"라고 결론 내지 않는다.

### 1C. Conflict Map

서로 충돌하거나 긴장되는 원자료를 연결한다. 이게 이 프로젝트에서 특히
중요하다. 예:

> "사람이 원할 때까지 기다린다." ↔ "미용사로서 기본 기술은 일정 기간 안에
> 갖춰야 한다."

이 둘은 모순이 아니라 둘 다 동시에 존재할 수 있는 **긴장 관계**다. 하나를
삭제하거나 어느 쪽이 맞는지 판단하지 않고 다음처럼 남긴다:

```
개인 성장의 자율성
  ↕ tension
직업적 책임의 최소 기준
```

`conflict.exists = true`인 항목끼리 `conflict.related_items`로 서로
연결하고, `conflict.tension`에 이 긴장을 "누가 맞는가"가 아니라 **"어떤
가치와 어떤 가치가 부딪히는가"** 형태로 서술한다.

---

## 저장 위치

`inventory/items/`에 항목당 파일 하나. 파일명: `<id>-<짧은-slug>.md`
(예: `INV-0001-고객-앞-기술-질문.md`). 템플릿:
`inventory/_templates/item.template.md`.

## 스키마

```yaml
id: INV-0001

title: 고객 앞에서의 기술 질문   # 검수 큐에서 한눈에 보는 짧은 라벨. topics와 별개, 사람이 자유롭게 수정 가능

# 1A. Raw Capture -----------------------------------------------------
topics:                       # 리스트. 하나의 원자료가 여러 주제를 다룰 수 있음
  - 고객 앞에서의 기술 질문

source:
  speaker: 강윤/효리/계훈       # 확실하지 않으면 unknown
  date: 2026-08                # 확실하지 않으면 unknown
  context: ""                   # 어떤 상황/대화에서 나온 말인지, 확실하지 않으면 unknown

raw_excerpt: |
  (가능하면 실제 발화를 그대로. 없으면 비워둔다)

raw_summary: |
  고객 앞에서 파트너가 자신이 맡을 기술의 기본 원리 자체를
  모르는 것처럼 질문하면 고객의 신뢰가 낮아질 수 있다는 의견.

interpretation: null           # Phase 1에서는 항상 null. 해석은 후속 단계에서만 채움

# 1B. Classification ----------------------------------------------------
source_level: K1                # H1 | H2 | G1 | M1 | K1 | CASE | IDEA | unknown

possible_content_type:          # 리스트. 복수 후보 허용
  - opinion
  - guideline

scope:                          # 리스트. 확장 가능한 enum 취급 (아래 참고)
  - customer_service
  - partner

authority_status: discussed     # official | adopted | local_practice | proposed |
                                 # discussed | personal_view | unknown

certainty: inferred             # explicit(직접 인용) | inferred(맥락에서 추정) | unclear

currentness: unknown            # current | historical | unknown — 추측 금지, 모르면 unknown

uncertainty:                    # 어떤 부분이 불확실한지 명시적으로 표시
  speaker: known                # known | unknown
  date: known                   # known | unknown
  context: unknown              # known | unknown
  meaning: clear                # clear | unclear

# 1C. Conflict Map --------------------------------------------------------
conflict:
  exists: true
  related_items: []              # 긴장 관계에 있는 다른 item id 리스트
  tension: |
    질문 자체를 막으면 학습 기회를 제한할 수 있다는 의견도 존재.
    (어느 쪽이 맞는지 판단하지 않는다 — 두 가치가 부딪히는 지점만 서술)

# 검수 워크플로 (review-admin) --------------------------------------------
review_status: pending_review    # pending_review | editing | approved | hold | rejected | archived
reviewed_by: null
reviewed_at: null
review_note: ""
duplicate_of: []                 # 시스템이 제안한 중복 가능 item id. 자동 병합 안 함, 관리자 판단 대상

# Phase 2 승격 여부 -------------------------------------------------------
official_rule:
  status: not_confirmed          # not_confirmed | confirmed
  ref: ""                         # confirmed면 content/ 경로

notes: ""
```

## 필드 설명

| 필드 | 설명 |
|---|---|
| `id` | 고유 식별자 (`INV-0001`처럼 순번). 재사용하지 않는다 |
| `title` | 검수 큐에서 한눈에 보는 짧은 라벨. `topics`(다중 주제 태그)와 별개이며 자유롭게 수정 가능 |
| `topics` | 이 원자료가 다루는 주제들 (리스트, 1개 이상). 하나만 있다고 임의로 단일화하지 않는다 |
| `source.speaker/date/context` | 원자료의 출처 메타. 모르면 `unknown` — 추측해서 채우지 않는다 |
| `raw_excerpt` | 실제 발화 원문. 확보되면 최우선으로 기록 |
| `raw_summary` | 원문에 최대한 충실한 요약. 가치 판단/해석을 섞지 않는다 |
| `interpretation` | 해석. **Phase 1에서는 항상 `null`** — 채우는 순간 Phase 1 규칙 위반 |
| `source_level` | 누가/어디서 나온 말인가 (`docs/SOURCE_POLICY.md`) |
| `possible_content_type` | 무슨 종류의 말처럼 보이는가에 대한 가설(복수 허용). `docs/DATA_MODEL.md` 참고 |
| `scope` | 누구/어디에 적용되는 것처럼 보이는가(복수 허용). 아래 enum 참고 |
| `authority_status` | 지금 조직에서 실제로 어떤 권위를 갖는 것처럼 보이는가 |
| `certainty` | 이 추출 자체가 얼마나 확실한가 (직접 인용/추정/불명확) |
| `currentness` | 지금도 유효한 것으로 보이는가, 과거 것인가, 모르는가 |
| `uncertainty` | 화자/날짜/맥락/의미 중 무엇이 불확실한지 개별적으로 표시 |
| `conflict` | 이 항목과 긴장 관계에 있는 다른 항목들 (옳고 그름이 아니라 연결) |
| `review_status` | **사람의 검수 진행 상태.** 아래 "검수 워크플로" 참고 |
| `reviewed_by` / `reviewed_at` / `review_note` | 누가/언제/어떤 메모와 함께 검수했는가 |
| `duplicate_of` | 시스템이 "중복 가능성 있음"으로 제안한 다른 item id. 관리자가 확인하기 전엔 자동 병합하지 않는다 |
| `official_rule` | Phase 2로 승격되어 확정 콘텐츠가 됐는지 여부와 경로 |
| `notes` | 위 필드로 표현 안 되는 것 (자유 서술) |

## 검수 워크플로 (Review Workflow)

`review-admin/`(관리자 검수 도구)이 다루는 상태다. **모든 인벤토리 항목은
생성 시 `review_status: pending_review`로 시작한다.** AI가 만든 초안이
사용자의 확인 없이 자동으로 `approved`가 되는 경로는 존재하지 않는다.

| 값 | 의미 |
|---|---|
| `pending_review` | 아직 검수 전 (초기 상태) |
| `editing` | 관리자가 검토/수정 중이나 아직 승인/보류/반려를 결정하지 않음 |
| `approved` | **사람이 직접 확인하고 승인함.** 공개 미리보기(`review-admin`의 공개 API)에 노출 가능한 유일한 상태 |
| `hold` | 검토는 했으나 결정을 보류함 (추가 정보/논의 필요) |
| `rejected` | 검토 후 채택하지 않기로 함. **원자료 자체는 삭제하지 않는다** |
| `archived` | 더 이상 활성 대상은 아니지만 기록으로 보존 |

`review_status: approved`가 **아닌** 항목은 어떤 경우에도 공개 화면에
노출되지 않는다 — 이 필터는 UI에서만 숨기는 방식이 아니라 코드(데이터
계층)에서 분리한다 (`review-admin/src/publicFilter.js`).

`review_status`(사람이 이 항목을 검수했는가)와 `official_rule.status`
(Phase 2 `content/`로 실제 승격됐는가)는 **다른 축**이다. `approved`는
"이 인벤토리 항목의 내용을 사람이 확인했다"는 뜻이고, `official_rule.status:
confirmed`는 "그 내용이 실제로 정식 콘텐츠로 옮겨졌다"는 뜻이다. `approved`
항목이라도 아직 `content/`로 승격되지 않았을 수 있다.

### `scope` — 확장 가능한 enum

초기 값: `happynian_all`, `gangseo`, `magok`, `leader`, `designer`,
`partner`, `customer_service`, `personal_growth`. 실제 원자료를 다루다
새로운 적용 범위가 필요하면 이 목록에 추가한다 (`CLAUDE.md` 10장
INFORMATION ARCHITECTURE와 마찬가지로 임의 삭제는 하지 않는다).

---

## Phase 2로 승격하는 절차

1. 같은 주제(topics)의 인벤토리 항목을 모은다 — 충돌(conflict) 관계에
   있는 항목까지 전부 함께 확인한다.
2. 사용자(강윤)에게 확정 여부를 확인한다 — AI가 임의로 확정하지 않는다.
   이때 비로소 `interpretation`을 채우고, `content_type`/`scope`/
   `authority_status`를 가설(possible_*)에서 확정값으로 바꾼다.
3. 확정된 내용만 `docs/DATA_MODEL.md` 스키마로 변환해 `content/` 아래
   알맞은 출처 폴더에 저장하고 `status: confirmed`로 바꾼다.
4. `CHANGELOG.md`에 인벤토리 → 콘텐츠 승격 이력을 남긴다.
5. 원본 인벤토리 항목은 삭제하지 않고 `official_rule.status: confirmed`,
   `official_rule.ref`에 새 콘텐츠로의 링크를 추가해 남겨둔다 (원자료
   추적성 유지, `CLAUDE.md` 22장). 여전히 남아있는 `conflict.tension`은
   콘텐츠 승격 후에도 지우지 않는다 — 승격된 규칙과 별개로 그 긴장은
   현실에 계속 존재할 수 있다.

## 지금 이 시점에서 하지 않는 것

`CLAUDE.md` 5장(PHASE 1 EXTRACTION RULES) 14개 항목을 그대로 적용한다.
특히:

- AI가 주제 이름만 보고 `raw_summary`나 결론을 지어내는 것
- 인벤토리 항목을 곧바로 `status: confirmed`로 표시하는 것
- 인벤토리 단계에서 철학적 발언을 규칙처럼 요약하는 것
- `conflict`를 "어느 쪽이 맞는지" 판단하는 용도로 쓰는 것 (연결 용도로만)

`inventory/items/`에는 현재 원자료 3건이 있다(전부 `pending_review`) —
review-admin 검수 게이트 프로토타입을 사용자가 직접 써볼 수 있도록, 이
프로젝트를 설계하는 대화 중 사용자가 실제로 예로 든 문장만 사용해 등록한
것이다(`review-admin/scripts/seed-initial-three.js` 참고). 사용자가 이
구조를 확인하기 전까지는 나머지 원자료를 추가하지 않는다.
