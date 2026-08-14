'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const publicFilter = require('../src/publicFilter');

function makeItem(overrides) {
  return {
    id: 'INV-1',
    title: '제목',
    topics: ['주제'],
    raw_excerpt: '내부용 원문 — 절대 노출되면 안됨',
    raw_summary: '내부 요약',
    interpretation: null,
    source_level: 'M1',
    possible_content_type: ['procedure'],
    scope: ['partner'],
    authority_status: 'adopted',
    review_status: 'pending_review',
    reviewed_by: '강윤',
    reviewed_at: null,
    review_note: '내부 메모 — 노출 금지',
    notes: '내부 메모2',
    uncertainty: { speaker: 'unknown', date: 'known', context: 'known', meaning: 'clear' },
    conflict: { exists: true, related_items: ['INV-2'], tension: '내부용' },
    duplicate_of: [],
    source: { speaker: '강윤', date: '2026-08', context: '내부 회의' },
    ...overrides,
  };
}

test('listPublicItems excludes non-approved items entirely', () => {
  const items = [
    makeItem({ review_status: 'pending_review' }),
    makeItem({ id: 'INV-2', review_status: 'hold' }),
    makeItem({ id: 'INV-3', review_status: 'editing' }),
    makeItem({ id: 'INV-4', review_status: 'rejected' }),
    makeItem({ id: 'INV-5', review_status: 'archived' }),
  ];
  assert.deepEqual(publicFilter.listPublicItems(items), []);
});

test('listPublicItems includes approved items with only whitelisted fields', () => {
  const items = [makeItem({ review_status: 'approved', interpretation: '고객 신뢰 관련 정리본' })];
  const result = publicFilter.listPublicItems(items);
  assert.equal(result.length, 1);
  const pub = result[0];
  assert.equal(pub.id, 'INV-1');
  assert.equal(pub.summary, '고객 신뢰 관련 정리본');
  assert.equal(pub.summary_is_interpretation, true);

  const forbidden = [
    'raw_excerpt',
    'raw_summary',
    'notes',
    'review_note',
    'reviewed_by',
    'uncertainty',
    'conflict',
    'duplicate_of',
    'source',
  ];
  const keys = Object.keys(pub);
  for (const f of forbidden) {
    assert.ok(!keys.includes(f), `public item must not expose "${f}"`);
  }
});

test('getPublicItem returns null for an existing-but-not-approved id', () => {
  const items = [makeItem({ id: 'INV-3', review_status: 'rejected' })];
  assert.equal(publicFilter.getPublicItem(items, 'INV-3'), null);
});

test('getPublicItem returns null for an unknown id', () => {
  const items = [makeItem({ review_status: 'approved' })];
  assert.equal(publicFilter.getPublicItem(items, 'INV-DOES-NOT-EXIST'), null);
});

test('summary falls back to raw_summary when interpretation is null, flagged accordingly', () => {
  const items = [
    makeItem({ review_status: 'approved', interpretation: null, raw_summary: '아직 해석 전 요약' }),
  ];
  const pub = publicFilter.listPublicItems(items)[0];
  assert.equal(pub.summary, '아직 해석 전 요약');
  assert.equal(pub.summary_is_interpretation, false);
});

test('toPublicItem never throws on missing optional arrays/objects', () => {
  const minimal = { id: 'INV-9', review_status: 'approved' };
  const pub = publicFilter.toPublicItem(minimal);
  assert.equal(pub.id, 'INV-9');
  assert.deepEqual(pub.topics, []);
  assert.deepEqual(pub.scope, []);
  assert.equal(pub.summary, '');
});
