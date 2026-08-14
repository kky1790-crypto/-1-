# inventory/

Phase 1 (Knowledge Inventory) 저장소. 스키마는
`../docs/INVENTORY_MODEL.md` 참고.

- `items/` — 실제 원자료 항목이 하나씩 파일로 쌓이는 곳. **현재 3건**
  (`review-admin` 검수 프로토타입 검증용, 전부 `pending_review`).
- `_history/` — 검수 도구(`review-admin`)가 남기는 변경 이력(JSONL). 실행
  전에는 존재하지 않고, 실제 검수 활동이 생기면 자동으로 채워진다.
- `_templates/item.template.md` — 새 항목 작성 시 복사해서 쓰는 템플릿.

이 폴더의 항목은 공식 기준이 아니다. `review_status: approved`가 아니면
`app/`(식구용 화면)에 노출되지 않으며(`review-admin` 참고), `status:
confirmed`도 아니어서 Phase 2 승격 절차(`docs/INVENTORY_MODEL.md` 참고)를
거치기 전까지는 정식 콘텐츠도 아니다.

새 항목은 사용자가 원자료(대화/경험 등)를 정리해서 제공한 뒤 채운다 —
AI가 주제명만 보고 내용을 지어내지 않는다 (`CLAUDE.md` 3장, 4장). 사용자가
현재 3건짜리 검수 구조를 확인하기 전까지는 나머지를 추가하지 않는다.
