'use strict';

// seed/demo/*.md 를 inventory/items/ 로 복사한다 (opt-in — 자동 실행 안 됨).
// 이미 같은 id가 존재하면 건너뛴다 (덮어쓰지 않음).

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const dataStore = require('../src/dataStore');

const DEMO_DIR = path.join(__dirname, '..', 'seed', 'demo');

function main() {
  if (!fs.existsSync(DEMO_DIR)) {
    console.log('데모 디렉터리가 없습니다:', DEMO_DIR);
    return;
  }
  const files = fs
    .readdirSync(DEMO_DIR)
    .filter((f) => f.endsWith('.md') && f.toUpperCase() !== 'README.MD');
  if (files.length === 0) {
    console.log('데모 파일이 없습니다:', DEMO_DIR);
    return;
  }

  const existingIds = dataStore.listItems().map((i) => i.data.id);
  let created = 0;
  let skipped = 0;

  for (const f of files) {
    const raw = fs.readFileSync(path.join(DEMO_DIR, f), 'utf8');
    const { data } = matter(raw);
    if (existingIds.includes(data.id)) {
      console.log(`건너뜀 (이미 존재): ${data.id}`);
      skipped += 1;
      continue;
    }
    dataStore.createItem(data);
    console.log(`추가됨: ${data.id} — ${data.title}`);
    created += 1;
  }

  console.log(`\n완료: ${created}개 추가, ${skipped}개 건너뜀. (실제 inventory/items/ 에 기록됨)`);
  console.log('review-admin을 실행해서 검수 큐에서 확인하세요: npm start');
}

main();
