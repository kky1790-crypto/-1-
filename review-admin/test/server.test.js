'use strict';

// 이 테스트가 이 프로젝트에서 가장 중요하다: "승인 전 항목은 절대 공개 API에
// 나타나지 않는다 / confirm 없이는 승인되지 않는다"는 핵심 안전 보장을
// 실제 HTTP 서버를 띄워 end-to-end로 검증한다.

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
  tmpItems = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-items-'));
  tmpHistory = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-history-'));
  process.env.REVIEW_ADMIN_ITEMS_DIR = tmpItems;
  process.env.REVIEW_ADMIN_HISTORY_DIR = tmpHistory;

  const app = require('../server');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmpItems, { recursive: true, force: true });
  fs.rmSync(tmpHistory, { recursive: true, force: true });
  delete process.env.REVIEW_ADMIN_ITEMS_DIR;
  delete process.env.REVIEW_ADMIN_HISTORY_DIR;
});

async function postJson(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patchJson(url, body) {
  return fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('end-to-end: pending item is invisible publicly; approve requires confirm; approved item is visible with limited fields; unapprove hides it again', async () => {
  const createRes = await postJson(`${baseUrl}/api/admin/items`, {
    title: 'E2E 테스트 항목',
    topics: ['E2E'],
    rawExcerpt: '비공개 원문 — 절대 노출 금지',
    rawSummary: '비공개 요약',
  });
  assert.equal(createRes.status, 201);
  const { item } = await createRes.json();
  const id = item.id;
  assert.equal(item.review_status, 'pending_review');

  // pending: admin sees it, public does not
  const adminList = await (await fetch(`${baseUrl}/api/admin/items`)).json();
  assert.ok(adminList.items.some((i) => i.id === id));

  let pub = await (await fetch(`${baseUrl}/api/public/items`)).json();
  assert.ok(!pub.items.some((i) => i.id === id), 'pending item must not appear in public list');

  const pubOne = await fetch(`${baseUrl}/api/public/items/${id}`);
  assert.equal(pubOne.status, 404, 'pending item must 404 on public single-item lookup');

  // approve without confirm -> 409, must not change status
  const noConfirm = await postJson(`${baseUrl}/api/admin/items/${id}/transition`, {
    status: 'approved',
    actor: 'tester',
  });
  assert.equal(noConfirm.status, 409);
  const stillPending = await (await fetch(`${baseUrl}/api/admin/items/${id}`)).json();
  assert.equal(stillPending.item.review_status, 'pending_review');

  // approve with confirm
  const approveRes = await postJson(`${baseUrl}/api/admin/items/${id}/transition`, {
    status: 'approved',
    actor: 'tester',
    confirm: true,
    note: '확인 완료',
  });
  assert.equal(approveRes.status, 200);

  // now visible publicly, without internal fields
  pub = await (await fetch(`${baseUrl}/api/public/items`)).json();
  const pubItem = pub.items.find((i) => i.id === id);
  assert.ok(pubItem, 'approved item should now be public');
  assert.equal(pubItem.raw_excerpt, undefined);
  assert.equal(pubItem.notes, undefined);
  assert.equal(pubItem.review_note, undefined);

  const pubOneApproved = await (await fetch(`${baseUrl}/api/public/items/${id}`)).json();
  assert.equal(pubOneApproved.item.id, id);

  // history recorded the approval
  const historyRes = await (await fetch(`${baseUrl}/api/admin/items/${id}/history`)).json();
  assert.ok(historyRes.history.some((h) => h.action === 'status_change' && h.after === 'approved'));

  // revert to editing (승인 취소) -> disappears from public again
  await postJson(`${baseUrl}/api/admin/items/${id}/transition`, { status: 'editing', actor: 'tester' });
  pub = await (await fetch(`${baseUrl}/api/public/items`)).json();
  assert.ok(!pub.items.some((i) => i.id === id), 'unapproved item must disappear from public list again');
});

test('editing raw_excerpt via normal PATCH is ignored; only the raw-excerpt endpoint changes it', async () => {
  const createRes = await postJson(`${baseUrl}/api/admin/items`, {
    title: '원문 보호 테스트',
    topics: ['테스트'],
    rawExcerpt: '원본',
  });
  const { item } = await createRes.json();

  await patchJson(`${baseUrl}/api/admin/items/${item.id}`, {
    patch: { raw_excerpt: '몰래 바꾸려는 값', notes: '메모' },
    actor: 'tester',
  });
  let fetched = await (await fetch(`${baseUrl}/api/admin/items/${item.id}`)).json();
  assert.equal(fetched.item.raw_excerpt, '원본');
  assert.equal(fetched.item.notes, '메모');

  await patchJson(`${baseUrl}/api/admin/items/${item.id}/raw-excerpt`, {
    rawExcerpt: '정식으로 수정된 원문',
    actor: 'tester',
    note: '오타 수정',
  });
  fetched = await (await fetch(`${baseUrl}/api/admin/items/${item.id}`)).json();
  assert.equal(fetched.item.raw_excerpt, '정식으로 수정된 원문');
});

test('unknown item id returns 404 from admin API', async () => {
  const res = await fetch(`${baseUrl}/api/admin/items/INV-DOES-NOT-EXIST`);
  assert.equal(res.status, 404);
});

test('raw-excerpt endpoint returns 400 instead of crashing when rawExcerpt is missing (regression)', async () => {
  const createRes = await postJson(`${baseUrl}/api/admin/items`, { title: '원문 누락 테스트', topics: ['t'] });
  const { item } = await createRes.json();

  const res = await patchJson(`${baseUrl}/api/admin/items/${item.id}/raw-excerpt`, { actor: 'tester' });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'INVALID_RAW_EXCERPT');
});

test('admin PATCH rejects an invalid source_level instead of storing it (regression: stored-XSS surface)', async () => {
  const createRes = await postJson(`${baseUrl}/api/admin/items`, { title: '값 검증 테스트', topics: ['t'] });
  const { item } = await createRes.json();

  const res = await patchJson(`${baseUrl}/api/admin/items/${item.id}`, {
    patch: { source_level: '<img src=x onerror=alert(1)>' },
    actor: 'tester',
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'INVALID_FIELD_VALUE');

  const fetched = await (await fetch(`${baseUrl}/api/admin/items/${item.id}`)).json();
  assert.notEqual(fetched.item.source_level, '<img src=x onerror=alert(1)>');
});
