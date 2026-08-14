'use strict';

// 변경 이력 저장소. append-only JSONL, item당 파일 하나.
// 절대 덮어쓰지 않는다 — "원래 뭐라고 되어 있었지?"에 항상 답할 수 있어야 한다.

const fs = require('fs');
const path = require('path');
const { historyDir, ensureDirs } = require('./dataStore');

function historyFile(id) {
  ensureDirs();
  return path.join(historyDir(), `${id}.jsonl`);
}

function appendHistory(id, entry) {
  const record = {
    timestamp: new Date().toISOString(),
    actor: 'unknown',
    note: '',
    ...entry,
  };
  fs.appendFileSync(historyFile(id), JSON.stringify(record) + '\n', 'utf8');
  return record;
}

function readHistory(id) {
  const f = historyFile(id);
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

module.exports = { appendHistory, readHistory };
