'use strict';

// 식구용(공개) 데이터 필터. 이 파일이 유일한 "공개 노출 허용" 경로다.
// review_status !== 'approved' 인 항목, 그리고 raw_excerpt/notes/review_note/
// reviewed_by/uncertainty/conflict/duplicate_of 같은 내부 필드는
// 이 함수를 거치지 않고서는 절대 밖으로 나가지 않는다.
//
// 라우트 계층이 실수로 전체 아이템 배열을 넘기더라도, 이 함수 내부에서
// review_status 필터와 필드 화이트리스트를 다시 강제한다 — UI에서만
// 숨기는 방식에 의존하지 않는다 (CLAUDE.md 24장 SECURITY).
//
// 주의: 이건 review-admin(인벤토리 검수 도구)의 "공개 미리보기"일 뿐이며,
// Phase 3 식구용 앱의 최종 화면이 아니다. Phase 2 승격(content/ 이관)
// 절차는 docs/INVENTORY_MODEL.md에 별도로 정의되어 있고 이 필터와 다르다.

function toPublicItem(item) {
  return {
    id: item.id,
    title: item.title || (item.topics && item.topics[0]) || '(제목 없음)',
    topics: Array.isArray(item.topics) ? item.topics : [],
    source_level: item.source_level || null,
    content_type:
      (Array.isArray(item.possible_content_type) && item.possible_content_type[0]) || null,
    scope: Array.isArray(item.scope) ? item.scope : [],
    authority_status: item.authority_status || null,
    summary: item.interpretation || item.raw_summary || '',
    summary_is_interpretation: Boolean(item.interpretation),
    approved_at: item.reviewed_at || null,
  };
}

function listPublicItems(allItems) {
  return allItems.filter((item) => item.review_status === 'approved').map(toPublicItem);
}

function getPublicItem(allItems, id) {
  const found = allItems.find((item) => item.id === id && item.review_status === 'approved');
  return found ? toPublicItem(found) : null;
}

module.exports = { listPublicItems, getPublicItem, toPublicItem };
