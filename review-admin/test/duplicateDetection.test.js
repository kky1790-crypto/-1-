'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { findPossibleDuplicates, duplicatesFor } = require('../src/duplicateDetection');

test('flags near-identical text as possible duplicate', () => {
  const items = [
    {
      id: 'A',
      title: '고객 앞 기술 질문',
      raw_summary: '고객 앞에서 기본적인 기술 질문을 하면 신뢰가 떨어질 수 있다',
    },
    {
      id: 'B',
      title: '고객 앞에서의 질문',
      raw_summary: '고객 앞에서 기본적인 기술 질문을 하면 신뢰가 떨어질 수 있음',
    },
    { id: 'C', title: '전혀 다른 주제', raw_summary: '마감 청소 순서에 대한 이야기' },
  ];
  const pairs = findPossibleDuplicates(items);
  assert.ok(pairs.some((p) => (p.a === 'A' && p.b === 'B') || (p.a === 'B' && p.b === 'A')));
  assert.ok(!pairs.some((p) => [p.a, p.b].includes('C')));
});

test('duplicatesFor returns suggestions for a given id and never mutates input', () => {
  const items = [
    { id: 'A', raw_summary: '가나다라마바사아자차카타파하가나다라마바사' },
    { id: 'B', raw_summary: '가나다라마바사아자차카타파하가나다라마바사아' },
  ];
  const dups = duplicatesFor('A', items);
  assert.ok(dups.length >= 1);
  assert.equal(dups[0].id, 'B');
  assert.equal(items[0].duplicate_of, undefined, 'must not auto-write duplicate_of onto items');
});

test('does not flag unrelated short texts as duplicates', () => {
  const items = [
    { id: 'A', raw_summary: '오픈 준비' },
    { id: 'B', raw_summary: '컴플레인 대응' },
  ];
  assert.equal(findPossibleDuplicates(items).length, 0);
});

test('findPossibleDuplicates never throws on empty or single-item lists', () => {
  assert.deepEqual(findPossibleDuplicates([]), []);
  assert.deepEqual(findPossibleDuplicates([{ id: 'A', raw_summary: '내용' }]), []);
});
