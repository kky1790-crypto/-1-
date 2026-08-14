# inventory/

Phase 1 (Knowledge Inventory) 저장소. 스키마는
`../docs/INVENTORY_MODEL.md` 참고.

- `items/` — 실제 원자료 항목이 하나씩 파일로 쌓이는 곳. **현재 비어 있음.**
- `_templates/item.template.md` — 새 항목 작성 시 복사해서 쓰는 템플릿.

이 폴더의 항목은 공식 기준이 아니다. `status: confirmed`가 아니며,
Phase 2 승격 절차(`docs/INVENTORY_MODEL.md` 참고)를 거치기 전까지는
앱에서 "기준"으로 노출하지 않는다.

실제 항목은 사용자가 원자료(대화/경험 등)를 정리해서 제공한 뒤 채운다 —
AI가 주제명만 보고 내용을 지어내지 않는다 (`CLAUDE.md` 3장, 4장).
