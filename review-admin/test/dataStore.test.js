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

const dataStore = require('../src/dataStore');

test('createItem + listItems + getItem round-trip preserves fields', () => {
  const data = {
    id: 'INV-9001',
    title: '테스트 항목',
    topics: ['테스트 주제'],
    source: { speaker: 'unknown', date: 'unknown', context: 'unknown' },
    raw_excerpt: '원문 그대로',
    raw_summary: '요약',
    interpretation: null,
    source_level: 'unknown',
    possible_content_type: ['opinion'],
    scope: ['partner'],
    authority_status: 'unknown',
    certainty: 'unclear',
    currentness: 'unknown',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'unknown', meaning: 'unclear' },
    conflict: { exists: false, related_items: [], tension: '' },
    review_status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '',
  };
  dataStore.createItem(data);
  const items = dataStore.listItems();
  assert.equal(items.length, 1);
  assert.equal(items[0].data.id, 'INV-9001');
  assert.equal(items[0].data.raw_excerpt, '원문 그대로');
  assert.deepEqual(items[0].data.topics, ['테스트 주제']);

  const fetched = dataStore.getItem('INV-9001');
  assert.ok(fetched);
  assert.equal(fetched.data.title, '테스트 항목');
});

test('nextId increments based on existing INV- ids', () => {
  const id = dataStore.nextId();
  assert.equal(id, 'INV-9002');
});

test('saveItem overwrites existing file without creating duplicates', () => {
  const item = dataStore.getItem('INV-9001');
  dataStore.saveItem('INV-9001', { ...item.data, notes: '변경됨' });
  const items = dataStore.listItems();
  assert.equal(items.length, 1);
  assert.equal(items[0].data.notes, '변경됨');
});

test('getItem returns null for missing id', () => {
  assert.equal(dataStore.getItem('INV-DOES-NOT-EXIST'), null);
});

test('createItem refuses to write a file when data.id is missing (regression: gray-matter frontmatter-parse-miss must not silently create "undefined-untitled.md")', () => {
  const before = dataStore.listItems().length;
  assert.throws(() => dataStore.createItem({ title: '아이디 없는 항목' }), /CREATE_ITEM_MISSING_ID/);
  assert.throws(() => dataStore.createItem({}), /CREATE_ITEM_MISSING_ID/);
  assert.equal(dataStore.listItems().length, before, 'no file should be written on failed create');
});

test('saveItem preserves a hand-written markdown body below the frontmatter (regression: used to silently delete it)', () => {
  const id = 'INV-9003';
  dataStore.createItem({
    id,
    title: '본문 보존 테스트',
    topics: ['테스트'],
    source: { speaker: 'unknown', date: 'unknown', context: 'unknown' },
    raw_excerpt: '',
    raw_summary: '',
    interpretation: null,
    source_level: 'unknown',
    possible_content_type: [],
    scope: [],
    authority_status: 'unknown',
    certainty: 'unclear',
    currentness: 'unknown',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'unknown', meaning: 'unclear' },
    conflict: { exists: false, related_items: [], tension: '' },
    review_status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '',
  });

  const created = dataStore.getItem(id);
  fs.appendFileSync(created._file, '\n사람이 직접 적어둔 메모 — 절대 지워지면 안 됨.\n');

  const before = dataStore.getItem(id);
  assert.match(before.content, /사람이 직접 적어둔 메모/);

  dataStore.saveItem(id, { ...before.data, notes: '변경됨' });

  const after = dataStore.getItem(id);
  assert.equal(after.data.notes, '변경됨');
  assert.match(after.content, /사람이 직접 적어둔 메모/, 'markdown body must survive saveItem()');
});
