'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let tmpItems;
let tmpHistory;

before(() => {
  tmpItems = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-items-'));
  tmpHistory = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-history-'));
  process.env.REVIEW_ADMIN_ITEMS_DIR = tmpItems;
  process.env.REVIEW_ADMIN_HISTORY_DIR = tmpHistory;
});

after(() => {
  fs.rmSync(tmpItems, { recursive: true, force: true });
  fs.rmSync(tmpHistory, { recursive: true, force: true });
  delete process.env.REVIEW_ADMIN_ITEMS_DIR;
  delete process.env.REVIEW_ADMIN_HISTORY_DIR;
});

const reviewService = require('../src/reviewService');

let testId;

test('createDraftItem starts as pending_review with interpretation null', () => {
  const item = reviewService.createDraftItem(
    {
      title: '샘플',
      topics: ['샘플 주제'],
      source: { speaker: 'unknown', date: 'unknown', context: 'unknown' },
      rawExcerpt: '원문 샘플',
      rawSummary: '요약 샘플',
    },
    'tester'
  );
  testId = item.id;
  assert.equal(item.review_status, 'pending_review');
  assert.equal(item.interpretation, null);
  assert.equal(item.raw_excerpt, '원문 샘플');
});

test('updateFields ignores raw_excerpt and id even if included in patch', () => {
  const result = reviewService.updateFields(
    testId,
    { raw_excerpt: '몰래 바꾸려는 원문', notes: '메모 수정', id: 'INV-HACK' },
    'tester'
  );
  assert.equal(result.changed, true);
  const after = reviewService.getItem(testId);
  assert.equal(after.raw_excerpt, '원문 샘플', 'raw_excerpt must stay untouched via updateFields');
  assert.equal(after.notes, '메모 수정');
  assert.equal(after.id, testId, 'id must not be overwritable via patch');
});

test('updateFields records history entries per changed field, and none for raw_excerpt', () => {
  const history = reviewService.getHistory(testId);
  const editEntries = history.filter((h) => h.action === 'edit');
  assert.ok(editEntries.some((h) => h.field === 'notes' && h.after === '메모 수정'));
  assert.ok(!editEntries.some((h) => h.field === 'raw_excerpt'));
});

test('updateFields with no actual changes reports changed:false and adds no history', () => {
  const before = reviewService.getHistory(testId).length;
  const result = reviewService.updateFields(testId, { notes: '메모 수정' }, 'tester');
  assert.equal(result.changed, false);
  assert.equal(reviewService.getHistory(testId).length, before);
});

test('editRawExcerpt is the only way to change raw_excerpt, and logs raw_edit', () => {
  reviewService.editRawExcerpt(testId, '수정된 원문', 'tester', '오타 수정');
  const after = reviewService.getItem(testId);
  assert.equal(after.raw_excerpt, '수정된 원문');
  const history = reviewService.getHistory(testId);
  const rawEdits = history.filter((h) => h.action === 'raw_edit');
  assert.equal(rawEdits.length, 1);
  assert.equal(rawEdits[0].before, '원문 샘플');
  assert.equal(rawEdits[0].after, '수정된 원문');
  assert.equal(rawEdits[0].note, '오타 수정');
});

test('transition to approved without confirm throws APPROVAL_CONFIRMATION_REQUIRED and does not change status', () => {
  assert.throws(
    () => reviewService.transition(testId, 'approved', { actor: 'tester' }),
    (err) => err.code === 'APPROVAL_CONFIRMATION_REQUIRED'
  );
  const item = reviewService.getItem(testId);
  assert.equal(item.review_status, 'pending_review', 'status must not change without confirm');
});

test('transition to approved with confirm:true succeeds and logs status_change', () => {
  const item = reviewService.transition(testId, 'approved', {
    actor: 'tester',
    confirm: true,
    note: '확인함',
  });
  assert.equal(item.review_status, 'approved');
  assert.equal(item.reviewed_by, 'tester');
  assert.ok(item.reviewed_at);
  const history = reviewService.getHistory(testId);
  const statusChanges = history.filter((h) => h.action === 'status_change');
  assert.equal(statusChanges.length, 1);
  assert.equal(statusChanges[0].before, 'pending_review');
  assert.equal(statusChanges[0].after, 'approved');
});

test('approved item can be reverted to editing (승인 취소)', () => {
  const item = reviewService.transition(testId, 'editing', { actor: 'tester' });
  assert.equal(item.review_status, 'editing');
});

test('invalid review_status value is rejected', () => {
  assert.throws(() => reviewService.transition(testId, 'not_a_real_status', { actor: 'tester' }));
});

test('listItems filters by status and search text', () => {
  reviewService.transition(testId, 'hold', { actor: 'tester' });
  const held = reviewService.listItems({ status: 'hold' });
  assert.ok(held.some((i) => i.id === testId));

  const bySearch = reviewService.listItems({ search: '샘플' });
  assert.ok(bySearch.some((i) => i.id === testId));

  const noMatch = reviewService.listItems({ search: '존재하지않는검색어zzz' });
  assert.equal(noMatch.length, 0);
});

test('updateFields rejects invalid enum values instead of storing them verbatim (regression: stored-XSS via unvalidated source_level)', () => {
  assert.throws(
    () => reviewService.updateFields(testId, { source_level: '<img src=x onerror=alert(1)>' }, 'tester'),
    (err) => err.code === 'INVALID_FIELD_VALUE'
  );
  assert.throws(
    () => reviewService.updateFields(testId, { authority_status: 'not_a_real_status' }, 'tester'),
    (err) => err.code === 'INVALID_FIELD_VALUE'
  );
  assert.throws(
    () => reviewService.updateFields(testId, { possible_content_type: ['not_a_real_type'] }, 'tester'),
    (err) => err.code === 'INVALID_FIELD_VALUE'
  );
  assert.throws(
    () => reviewService.updateFields(testId, { scope: ['<script>bad</script>'] }, 'tester'),
    (err) => err.code === 'INVALID_FIELD_VALUE'
  );
  const item = reviewService.getItem(testId);
  assert.notEqual(item.source_level, '<img src=x onerror=alert(1)>', 'invalid value must not have been saved');
});

test('updateFields accepts valid enum values and a valid new scope identifier', () => {
  const result = reviewService.updateFields(
    testId,
    { source_level: 'M1', authority_status: 'adopted', scope: ['a_new_expandable_scope'] },
    'tester'
  );
  assert.equal(result.changed, true);
  const item = reviewService.getItem(testId);
  assert.equal(item.source_level, 'M1');
  assert.deepEqual(item.scope, ['a_new_expandable_scope']);
});

test('getDuplicateSuggestions never mutates stored data (suggestion only)', () => {
  reviewService.createDraftItem(
    {
      title: '샘플 (거의 동일)',
      topics: ['샘플 주제'],
      rawSummary: '요약 샘플',
    },
    'tester'
  );
  const suggestions = reviewService.getDuplicateSuggestions(testId);
  assert.ok(Array.isArray(suggestions));
  const item = reviewService.getItem(testId);
  assert.deepEqual(item.duplicate_of, [], 'duplicate detection must not auto-write duplicate_of');
});
