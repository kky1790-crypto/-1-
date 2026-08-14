'use strict';

// app/server.js는 자체 데이터 계층이 없다 — review-admin/routes/publicApi를
// 그대로 재사용한다. 이 테스트는 그 재사용 배선이 실제로 승인 필터를
// 지킨 채로 동작하는지, 그리고 정적 프런트엔드가 서빙되는지를 확인한다.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let tmpItems;
let tmpHistory;
let server;
let baseUrl;

before(async () => {
  tmpItems = fs.mkdtempSync(path.join(os.tmpdir(), 'app-items-'));
  tmpHistory = fs.mkdtempSync(path.join(os.tmpdir(), 'app-history-'));
  process.env.REVIEW_ADMIN_ITEMS_DIR = tmpItems;
  process.env.REVIEW_ADMIN_HISTORY_DIR = tmpHistory;

  // eslint-disable-next-line import/no-relative-packages
  const dataStore = require('../../review-admin/src/dataStore');
  dataStore.createItem({
    id: 'INV-9101',
    title: '승인된 항목',
    topics: ['t'],
    source: { speaker: 'unknown', date: 'unknown', context: 'unknown' },
    raw_excerpt: '내부용 원문',
    raw_summary: '요약',
    interpretation: null,
    source_level: 'M1',
    possible_content_type: ['procedure'],
    scope: ['partner'],
    authority_status: 'adopted',
    certainty: 'inferred',
    currentness: 'current',
    uncertainty: { speaker: 'unknown', date: 'unknown', context: 'known', meaning: 'clear' },
    conflict: { exists: false, related_items: [], tension: '' },
    review_status: 'approved',
    reviewed_by: '강윤',
    reviewed_at: new Date().toISOString(),
    review_note: '',
    duplicate_of: [],
    official_rule: { status: 'not_confirmed', ref: '' },
    notes: '내부 메모 — 노출되면 안 됨',
  });
  dataStore.createItem({
    id: 'INV-9102',
    title: '미검수 항목',
    topics: ['t'],
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

  const app = require('../server');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmpItems, { recursive: true, force: true });
  fs.rmSync(tmpHistory, { recursive: true, force: true });
  delete process.env.REVIEW_ADMIN_ITEMS_DIR;
  delete process.env.REVIEW_ADMIN_HISTORY_DIR;
});

test('only approved items are exposed, with internal fields stripped', async () => {
  const res = await fetch(`${baseUrl}/api/public/items`);
  const body = await res.json();
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].id, 'INV-9101');
  assert.equal(body.items[0].raw_excerpt, undefined);
  assert.equal(body.items[0].notes, undefined);

  const pending = await fetch(`${baseUrl}/api/public/items/INV-9102`);
  assert.equal(pending.status, 404);
});

test('static frontend (index.html) is served', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /해피니언 마곡점/);
});

test('health endpoint responds', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.deepEqual(await res.json(), { ok: true });
});
