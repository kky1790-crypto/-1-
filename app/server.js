'use strict';

// Phase 3 식구용 앱 — 프로토타입 v1.
//
// 이 서버는 자체 데이터 계층을 갖지 않는다. review-admin이 관리하는
// inventory/items/의 review_status: approved 항목만, review-admin의
// publicFilter를 통과한 필드만 그대로 재노출한다 — 승인 권한과 공개 필터
// 로직은 review-admin에 단 하나만 존재한다(중복/불일치 방지).
//
// 나중에 Phase 2(content/) 승격 파이프라인이 생기면 이 부분을 그쪽으로
// 바꿀 수 있지만, 지금은 review-admin의 공개 API를 그대로 재사용한다.

const path = require('path');
const express = require('express');
const publicApi = require('../review-admin/routes/publicApi');

const app = express();
app.use(express.json());

app.use('/api/public', publicApi);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4100;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`staff app (Phase 3 prototype) listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
