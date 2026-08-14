'use strict';

// 일회성 스크립트: 실제 검수 파이프라인을 사용자가 직접 써볼 수 있도록
// inventory/items/에 원자료 3건을 등록한다.
//
// 이 3건은 전부 "이 프로젝트를 설계하는 Claude Code 대화 중 사용자가 직접
// 예시로 언급한 문장"에서만 가져왔다 — 새로운 철학/규칙/운영 기준을
// 지어내지 않았다 (CLAUDE.md 3장 NEVER INVENT POLICY). 화자/날짜/맥락이
// 불확실하므로 uncertainty/certainty를 그에 맞게 낮게 표시했다.
//
// 모두 review_status: pending_review로 생성된다 — 승인 여부는 사용자가
// review-admin에서 직접 판단한다. 이 스크립트는 재실행해도 이미 존재하는
// id는 건너뛴다.

const dataStore = require('../src/dataStore');

const ITEMS = [
  {
    id: 'INV-0001',
    title: '고객 앞에서의 기술 질문',
    topics: ['고객 앞에서의 기술 질문', '고객 신뢰'],
    source: {
      speaker: 'unknown',
      date: 'unknown',
      context:
        '이 프로젝트(해피니언 마곡점 판단 시스템)를 설계하는 Claude Code 대화 중, ' +
        '사용자가 Phase 1 인벤토리 스키마를 설명하기 위해 예시로 든 문장. ' +
        '실제 화자·시점은 확인되지 않았다.',
    },
    raw_excerpt: '고객 앞에서 파트너가 기본적인 기술 질문을 하면 고객이 불안해할 수 있다.',
    raw_summary:
      '고객 앞에서 파트너가 자신이 맡을 기술의 기본 원리 자체를 모르는 것처럼 질문하면 ' +
      '고객의 신뢰가 낮아질 수 있다는 의견.',
    interpretation: null,
    source_level: 'unknown',
    possible_content_type: ['opinion', 'guideline'],
    scope: ['customer_service', 'partner'],
    authority_status: 'unknown',
    certainty: 'unclear',
    currentness: 'unknown',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'known', meaning: 'clear' },
    conflict: {
      exists: true,
      related_items: [],
      tension:
        '질문 자체를 막으면 학습 기회를 제한할 수 있다는 의견도 존재한다. ' +
        '(어느 쪽이 맞는지 판단하지 않는다 — 두 가치가 부딪히는 지점만 서술)',
    },
    review_status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '',
  },
  {
    id: 'INV-0002',
    title: '고객이 미용실을 찾는 이유',
    topics: ['고객 응대 철학'],
    source: {
      speaker: 'unknown',
      date: 'unknown',
      context:
        '이 프로젝트를 설계하는 Claude Code 대화 중, 사용자가 "원문(raw_excerpt)과 ' +
        'AI 정리 초안(raw_summary)을 화면에서 절대 섞지 말라"는 UI 요구사항을 설명하며 ' +
        '직접 예로 든 문장. 실제 화자·시점은 확인되지 않았다.',
    },
    raw_excerpt: '일단 고객님은 기분 좋으려고 매장에 오는거야.',
    raw_summary: '고객이 미용실을 찾는 핵심 이유를 기분 전환으로 보는 관점.',
    interpretation: null,
    source_level: 'unknown',
    possible_content_type: ['opinion', 'philosophy'],
    scope: ['customer_service'],
    authority_status: 'unknown',
    certainty: 'unclear',
    currentness: 'unknown',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'known', meaning: 'clear' },
    conflict: { exists: false, related_items: [], tension: '' },
    review_status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '',
  },
  {
    id: 'INV-0003',
    title: '개인 성장의 속도와 기본 기술 습득 기한',
    topics: ['파트너 성장', '정신적 성장과 직업적 성장'],
    source: {
      speaker: 'unknown',
      date: 'unknown',
      context:
        '이 프로젝트를 설계하는 Claude Code 대화 중, 사용자가 Phase 1 Conflict Map(1C) ' +
        '개념 — 서로 긴장 관계에 있는 원자료를 어떻게 연결해야 하는지 — 을 설명하며 ' +
        '예로 든 두 관점 중 하나. 실제 화자·시점은 확인되지 않았다.',
    },
    raw_excerpt: '사람이 원할 때까지 기다린다.',
    raw_summary: '개인의 성장은 본인이 준비될 때까지 기다려주는 것이 맞다는 관점.',
    interpretation: null,
    source_level: 'unknown',
    possible_content_type: ['principle', 'opinion'],
    scope: ['partner', 'personal_growth'],
    authority_status: 'unknown',
    certainty: 'unclear',
    currentness: 'unknown',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'known', meaning: 'clear' },
    conflict: {
      exists: true,
      related_items: [],
      tension:
        '"미용사로서 기본 기술은 일정 기간 안에 갖춰야 한다"는 관점과 부딪힌다 — ' +
        '개인 성장의 자율성 ↔ 직업적 책임의 최소 기준. (어느 쪽이 맞는지 판단하지 않는다)',
    },
    review_status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '',
  },
];

function main() {
  const existingIds = dataStore.listItems().map((i) => i.data.id);
  let created = 0;
  let skipped = 0;
  for (const item of ITEMS) {
    if (existingIds.includes(item.id)) {
      console.log(`건너뜀 (이미 존재): ${item.id}`);
      skipped += 1;
      continue;
    }
    dataStore.createItem(item);
    console.log(`추가됨: ${item.id} — ${item.title} (review_status: ${item.review_status})`);
    created += 1;
  }
  console.log(`\n완료: ${created}개 추가, ${skipped}개 건너뜀.`);
}

main();
