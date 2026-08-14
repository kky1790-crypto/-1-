'use strict';

// 파일시스템 데이터 계층. inventory/items/*.md 를 유일한 진실 소스로 삼는다.
// content_type 등 의미 판단은 여기서 하지 않는다 — 순수 읽기/쓰기만 담당한다.
//
// 경로는 매 호출마다 process.env에서 다시 읽는다(상수로 고정하지 않음) —
// 테스트가 REVIEW_ADMIN_ITEMS_DIR/REVIEW_ADMIN_HISTORY_DIR를 임시 디렉터리로
// 지정해서 실제 inventory/items/를 절대 건드리지 않도록 하기 위함.

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function itemsDir() {
  return process.env.REVIEW_ADMIN_ITEMS_DIR || path.join(REPO_ROOT, 'inventory', 'items');
}

function historyDir() {
  return process.env.REVIEW_ADMIN_HISTORY_DIR || path.join(REPO_ROOT, 'inventory', '_history');
}

function ensureDirs() {
  fs.mkdirSync(itemsDir(), { recursive: true });
  fs.mkdirSync(historyDir(), { recursive: true });
}

function listItemFiles() {
  ensureDirs();
  const dir = itemsDir();
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function readItemFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  return { data: parsed.data, content: parsed.content, _file: filePath };
}

function listItems() {
  return listItemFiles().map(readItemFile);
}

function findItemFile(id) {
  for (const f of listItemFiles()) {
    const { data } = readItemFile(f);
    if (data.id === id) return f;
  }
  return null;
}

function getItem(id) {
  const f = findItemFile(id);
  if (!f) return null;
  return readItemFile(f);
}

function writeItemFile(filePath, data, content = '') {
  const out = matter.stringify(content, data);
  fs.writeFileSync(filePath, out, 'utf8');
}

function saveItem(id, data) {
  const f = findItemFile(id);
  if (!f) throw new Error(`ITEM_NOT_FOUND: ${id}`);
  // frontmatter 아래에 사람이 직접 적어둔 마크다운 본문이 있을 수 있다 —
  // writeItemFile의 content 기본값('')으로 덮어써 조용히 지우지 않도록
  // 기존 본문을 먼저 읽어 보존한다.
  const existing = readItemFile(f);
  writeItemFile(f, data, existing.content);
  return { data, _file: f };
}

function slugify(text) {
  return (
    String(text || 'untitled')
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'untitled'
  );
}

function createItem(data) {
  if (!data || typeof data.id !== 'string' || !data.id.trim()) {
    throw new Error('CREATE_ITEM_MISSING_ID: refusing to write an item file without a valid id');
  }
  ensureDirs();
  const dir = itemsDir();
  const slug = slugify(data.title || (data.topics && data.topics[0]));
  let filename = `${data.id}-${slug}.md`;
  let filePath = path.join(dir, filename);
  let n = 2;
  while (fs.existsSync(filePath)) {
    filename = `${data.id}-${slug}-${n}.md`;
    filePath = path.join(dir, filename);
    n += 1;
  }
  writeItemFile(filePath, data);
  return filePath;
}

function nextId() {
  let max = 0;
  for (const { data } of listItems()) {
    const m = /^INV-(\d+)$/.exec(data.id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `INV-${String(max + 1).padStart(4, '0')}`;
}

module.exports = {
  itemsDir,
  historyDir,
  ensureDirs,
  listItems,
  getItem,
  saveItem,
  createItem,
  nextId,
};
