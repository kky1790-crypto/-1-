'use strict';

// 식구용(공개) 미리보기 API. approved 항목만, publicFilter를 거친 필드만 반환한다.
// 이 파일은 반드시 src/publicFilter.js를 통해서만 데이터를 내보내야 한다 —
// reviewService의 전체 아이템을 직접 res.json으로 흘려보내지 않는다.

const express = require('express');
const reviewService = require('../src/reviewService');
const publicFilter = require('../src/publicFilter');

const router = express.Router();

router.get('/items', (req, res) => {
  const allItems = reviewService.listAllItemData();
  res.json({ items: publicFilter.listPublicItems(allItems) });
});

router.get('/items/:id', (req, res) => {
  const allItems = reviewService.listAllItemData();
  const item = publicFilter.getPublicItem(allItems, req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_APPROVED' });
  res.json({ item });
});

module.exports = router;
