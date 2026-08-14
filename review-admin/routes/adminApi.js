'use strict';

const express = require('express');
const reviewService = require('../src/reviewService');
const { handleError } = require('./errorHelper');

const router = express.Router();

// 검수 큐 상단 카운트 ("검수 대기 12 / 326")
router.get('/stats', (req, res) => {
  const items = reviewService.listAllItemData();
  const stats = { total: items.length };
  for (const s of reviewService.REVIEW_STATUSES) {
    stats[s] = items.filter((i) => i.review_status === s).length;
  }
  res.json(stats);
});

router.get('/items', (req, res) => {
  const { status, sourceLevel, contentType, topic, hasConflict, hasUncertainty, search } = req.query;
  const items = reviewService.listItems({
    status,
    sourceLevel,
    contentType,
    topic,
    hasConflict,
    hasUncertainty,
    search,
  });
  res.json({ items, count: items.length });
});

router.post('/items', (req, res) => {
  try {
    const item = reviewService.createDraftItem(req.body || {}, req.body && req.body.actor);
    res.status(201).json({ item });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/items/:id', (req, res) => {
  const item = reviewService.getItem(req.params.id);
  if (!item) return handleError(res, { code: 'ITEM_NOT_FOUND', message: 'not found' });
  res.json({ item });
});

router.patch('/items/:id', (req, res) => {
  try {
    const { patch, actor } = req.body || {};
    const result = reviewService.updateFields(req.params.id, patch, actor);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.patch('/items/:id/raw-excerpt', (req, res) => {
  try {
    const { rawExcerpt, actor, note } = req.body || {};
    if (typeof rawExcerpt !== 'string') {
      return handleError(res, { code: 'INVALID_RAW_EXCERPT', message: 'rawExcerpt must be a string' });
    }
    const result = reviewService.editRawExcerpt(req.params.id, rawExcerpt, actor, note);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/items/:id/transition', (req, res) => {
  try {
    const { status, actor, note, confirm } = req.body || {};
    const item = reviewService.transition(req.params.id, status, { actor, note, confirm });
    res.json({ item });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/items/:id/history', (req, res) => {
  res.json({ history: reviewService.getHistory(req.params.id) });
});

router.get('/items/:id/duplicates', (req, res) => {
  res.json({ duplicates: reviewService.getDuplicateSuggestions(req.params.id) });
});

module.exports = router;
