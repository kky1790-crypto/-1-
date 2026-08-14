<!--
TEMPLATE — 이 파일 자체는 실제 원자료가 아니다.
새 인벤토리 항목을 만들 때 이 파일을 복사해서 값을 채운 뒤
inventory/items/<id>-<짧은-slug>.md 로 저장한다.
스키마 설명 및 1A/1B/1C 단계 구분: docs/INVENTORY_MODEL.md
작성 전 CLAUDE.md 5장(PHASE 1 EXTRACTION RULES)을 반드시 확인한다.
-->

---
id: ""

title: ""

# 1A. Raw Capture
topics: []

source:
  speaker: ""            # 모르면 unknown
  date: ""                # 모르면 unknown
  context: ""             # 모르면 unknown

raw_excerpt: ""

raw_summary: ""

interpretation: null      # Phase 1에서는 항상 null

# 1B. Classification
source_level: ""          # H1 | H2 | G1 | M1 | K1 | CASE | IDEA | unknown

possible_content_type: []  # philosophy | principle | rule | guideline | procedure | metric | case | opinion | question

scope: []                  # happynian_all | gangseo | magok | leader | designer | partner | customer_service | personal_growth

authority_status: unknown  # official | adopted | local_practice | proposed | discussed | personal_view | unknown

certainty: unclear          # explicit | inferred | unclear

currentness: unknown        # current | historical | unknown

uncertainty:
  speaker: unknown           # known | unknown
  date: unknown               # known | unknown
  context: unknown            # known | unknown
  meaning: unclear             # clear | unclear

# 1C. Conflict Map
conflict:
  exists: false
  related_items: []
  tension: ""

# 검수 워크플로 (review-admin)
review_status: pending_review  # pending_review | editing | approved | hold | rejected | archived
reviewed_by: null
reviewed_at: null
review_note: ""
duplicate_of: []

# Phase 2 승격 여부
official_rule:
  status: not_confirmed
  ref: ""

notes: ""
---
