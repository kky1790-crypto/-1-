# 해피니언 마곡점 판단 시스템

해피니언 마곡점 식구들이 애매한 상황에서 스스로 판단할 수 있도록 돕는
살아있는 운영·교육·판단 시스템.

- 프로젝트 헌법(개발 규칙): [`CLAUDE.md`](./CLAUDE.md)
- 제품 목적/Phase 로드맵: [`docs/PRODUCT.md`](./docs/PRODUCT.md)
- 정보구조(메뉴/화면): [`docs/IA.md`](./docs/IA.md)
- Phase 1 원자료 인벤토리 스키마: [`docs/INVENTORY_MODEL.md`](./docs/INVENTORY_MODEL.md)
- Phase 2 콘텐츠 데이터 모델: [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)
- 출처 레벨 정책: [`docs/SOURCE_POLICY.md`](./docs/SOURCE_POLICY.md)
- 완료 전 QA 체크리스트: [`docs/QA_CHECKLIST.md`](./docs/QA_CHECKLIST.md)
- 변경 이력: [`CHANGELOG.md`](./CHANGELOG.md)

## 현재 상태 (Phase 로드맵 기준)

- Phase 0 (프로젝트 기반: 헌법/Skills/Agents/폴더 구조) — 완료
- Phase 1 (Knowledge Inventory) — 진행 중, `inventory/items/`에 원자료 3건
  (전부 `pending_review`)
- Phase 1.5 (`review-admin/` 관리자 검수 시스템) — 프로토타입 v1
- Phase 2 (`content/`) — 미착수, 여전히 빈 상태
- Phase 3 (`app/` 식구용 앱) — 프로토타입 v1, `review-admin`의 승인된
  항목만 재노출
- Phase 4~5 — 미착수

사용자가 지금의 3건짜리 검수/공개 구조를 직접 써보고 확인하기 전까지는
나머지 원자료를 추가하지 않는다. 실행 방법은 `review-admin/README.md`,
`app/README.md` 참고.