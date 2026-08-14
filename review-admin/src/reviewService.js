'use strict';

const dataStore = require('./dataStore');
const { appendHistory, readHistory } = require('./historyStore');
const duplicateDetection = require('./duplicateDetection');

const REVIEW_STATUSES = ['pending_review', 'editing', 'approved', 'hold', 'rejected', 'archived'];

// raw_excerpt는 여기 포함하지 않는다 — 별도 editRawExcerpt()를 통해서만 수정 가능.
const EDITABLE_FIELDS = [
  'title',
  'topics',
  'raw_summary',
  'interpretation',
  'source_level',
  'possible_content_type',
  'scope',
  'authority_status',
  'certainty',
  'currentness',
  'uncertainty',
  'conflict',
  'duplicate_of',
  'notes',
];

// docs/DATA_MODEL.md / docs/INVENTORY_MODEL.md 의 네 축(source_level,
// content_type, scope, authority_status) 값 집합. 인증 없는 관리자 API를
// 통해 임의 문자열이 그대로 저장/렌더링되지 않도록 서버에서도 검증한다
// (프런트엔드 select/checkbox만 믿지 않는다).
const SOURCE_LEVELS = ['H1', 'H2', 'G1', 'M1', 'K1', 'CASE', 'IDEA', 'unknown'];
const AUTHORITY_STATUSES = [
  'official',
  'adopted',
  'local_practice',
  'proposed',
  'discussed',
  'personal_view',
  'unknown',
];
const CERTAINTY_VALUES = ['explicit', 'inferred', 'unclear'];
const CURRENTNESS_VALUES = ['current', 'historical', 'unknown'];
const CONTENT_TYPES = [
  'philosophy',
  'principle',
  'rule',
  'guideline',
  'procedure',
  'metric',
  'case',
  'opinion',
  'question',
];
// scope는 docs/INVENTORY_MODEL.md에 따라 필요시 계속 확장되는 open enum이라
// 고정 목록으로 막지 않는다 — 대신 안전한 식별자 형태(소문자 스네이크케이스)만
// 허용해 자유 텍스트/HTML이 섞여 들어오는 것을 막는다.
const SAFE_IDENTIFIER = /^[a-z][a-z0-9_]*$/;
const KNOWN_UNKNOWN = ['known', 'unknown'];
const CLEAR_UNCLEAR = ['clear', 'unclear'];

class ReviewServiceError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

function assertValidStatus(status) {
  if (!REVIEW_STATUSES.includes(status)) {
    throw new ReviewServiceError('INVALID_STATUS', `Invalid review_status: ${status}`);
  }
}

function invalid(field, message) {
  throw new ReviewServiceError('INVALID_FIELD_VALUE', `${field}: ${message}`);
}

// patch에 실제로 들어있는 필드만 검사한다(부분 수정 지원) — 값 자체가
// 스키마를 벗어나면 저장을 거부한다. 의미 판단(이 값이 맞는지)이 아니라
// 형식 검증이다.
function validateFieldValues(patchToValidate) {
  if ('source_level' in patchToValidate && !SOURCE_LEVELS.includes(patchToValidate.source_level)) {
    invalid('source_level', `must be one of ${SOURCE_LEVELS.join('/')}`);
  }
  if (
    'authority_status' in patchToValidate &&
    !AUTHORITY_STATUSES.includes(patchToValidate.authority_status)
  ) {
    invalid('authority_status', `must be one of ${AUTHORITY_STATUSES.join('/')}`);
  }
  if ('certainty' in patchToValidate && !CERTAINTY_VALUES.includes(patchToValidate.certainty)) {
    invalid('certainty', `must be one of ${CERTAINTY_VALUES.join('/')}`);
  }
  if ('currentness' in patchToValidate && !CURRENTNESS_VALUES.includes(patchToValidate.currentness)) {
    invalid('currentness', `must be one of ${CURRENTNESS_VALUES.join('/')}`);
  }
  if ('possible_content_type' in patchToValidate) {
    const v = patchToValidate.possible_content_type;
    if (!Array.isArray(v) || v.some((x) => !CONTENT_TYPES.includes(x))) {
      invalid('possible_content_type', `each value must be one of ${CONTENT_TYPES.join('/')}`);
    }
  }
  if ('scope' in patchToValidate) {
    const v = patchToValidate.scope;
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !SAFE_IDENTIFIER.test(x))) {
      invalid('scope', 'each value must be a lowercase snake_case identifier');
    }
  }
  if ('uncertainty' in patchToValidate) {
    const u = patchToValidate.uncertainty || {};
    if (
      !KNOWN_UNKNOWN.includes(u.speaker) ||
      !KNOWN_UNKNOWN.includes(u.date) ||
      !KNOWN_UNKNOWN.includes(u.context) ||
      !CLEAR_UNCLEAR.includes(u.meaning)
    ) {
      invalid('uncertainty', 'speaker/date/context must be known|unknown, meaning must be clear|unclear');
    }
  }
  if ('conflict' in patchToValidate) {
    const c = patchToValidate.conflict || {};
    if (typeof c.exists !== 'boolean' || !Array.isArray(c.related_items)) {
      invalid('conflict', 'exists must be boolean, related_items must be an array');
    }
  }
}

function requireItem(id) {
  const item = dataStore.getItem(id);
  if (!item) throw new ReviewServiceError('ITEM_NOT_FOUND', `Item not found: ${id}`);
  return item;
}

function getItem(id) {
  const item = dataStore.getItem(id);
  return item ? item.data : null;
}

function listAllItemData() {
  return dataStore.listItems().map((f) => f.data);
}

function listItems(filters = {}) {
  const { status, sourceLevel, contentType, topic, hasConflict, hasUncertainty, search } = filters;
  let items = listAllItemData();

  if (status) items = items.filter((i) => i.review_status === status);
  if (sourceLevel) items = items.filter((i) => i.source_level === sourceLevel);
  if (contentType) {
    items = items.filter((i) => (i.possible_content_type || []).includes(contentType));
  }
  if (topic) {
    items = items.filter((i) => (i.topics || []).some((t) => t.includes(topic)));
  }
  if (hasConflict === true || hasConflict === 'true') {
    items = items.filter((i) => i.conflict && i.conflict.exists);
  }
  if (hasUncertainty === true || hasUncertainty === 'true') {
    items = items.filter((i) => {
      const u = i.uncertainty || {};
      return Object.values(u).some((v) => v === 'unknown' || v === 'unclear');
    });
  }
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((i) => {
      const haystack = [
        i.title,
        i.raw_excerpt,
        i.raw_summary,
        i.notes,
        i.source && i.source.speaker,
        (i.topics || []).join(' '),
      ]
        .filter(Boolean)
        .join(' \n ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
  return items;
}

function diffFields(before, after, fields) {
  const changes = [];
  for (const f of fields) {
    const b = JSON.stringify(before[f] ?? null);
    const a = JSON.stringify(after[f] ?? null);
    if (b !== a) changes.push({ field: f, before: before[f] ?? null, after: after[f] ?? null });
  }
  return changes;
}

function updateFields(id, patch, actor) {
  const current = requireItem(id);
  const before = current.data;
  const fieldsToApply = Object.keys(patch || {}).filter((k) => EDITABLE_FIELDS.includes(k));
  if (fieldsToApply.length === 0) {
    throw new ReviewServiceError('NO_EDITABLE_FIELDS', 'No editable fields in patch');
  }
  const patchToApply = {};
  for (const f of fieldsToApply) patchToApply[f] = patch[f];
  validateFieldValues(patchToApply);

  const after = { ...before };
  for (const f of fieldsToApply) after[f] = patch[f];

  const changes = diffFields(before, after, fieldsToApply);
  if (changes.length === 0) return { data: before, changed: false, changes: [] };

  dataStore.saveItem(id, after);
  for (const c of changes) {
    appendHistory(id, { action: 'edit', field: c.field, before: c.before, after: c.after, actor });
  }
  return { data: after, changed: true, changes };
}

function editRawExcerpt(id, newRawExcerpt, actor, note) {
  const current = requireItem(id);
  const before = current.data.raw_excerpt ?? null;
  if (before === newRawExcerpt) return { data: current.data, changed: false };
  const after = { ...current.data, raw_excerpt: newRawExcerpt };
  dataStore.saveItem(id, after);
  appendHistory(id, {
    action: 'raw_edit',
    field: 'raw_excerpt',
    before,
    after: newRawExcerpt,
    actor,
    note: note || '',
  });
  return { data: after, changed: true };
}

function transition(id, toStatus, { actor, note, confirm } = {}) {
  assertValidStatus(toStatus);
  if (toStatus === 'approved' && confirm !== true) {
    throw new ReviewServiceError(
      'APPROVAL_CONFIRMATION_REQUIRED',
      '승인은 confirm:true 없이는 처리되지 않는다'
    );
  }
  const current = requireItem(id);
  const before = current.data;
  const after = {
    ...before,
    review_status: toStatus,
    reviewed_by: actor || before.reviewed_by || null,
    reviewed_at: new Date().toISOString(),
    review_note: note !== undefined ? note : before.review_note,
  };
  dataStore.saveItem(id, after);
  appendHistory(id, {
    action: 'status_change',
    field: 'review_status',
    before: before.review_status,
    after: toStatus,
    actor,
    note: note || '',
  });
  return after;
}

function getHistory(id) {
  return readHistory(id);
}

function getDuplicateSuggestions(id) {
  const items = listAllItemData();
  return duplicateDetection.duplicatesFor(id, items);
}

function createDraftItem({ title, topics, source, rawExcerpt, rawSummary }, actor) {
  const id = dataStore.nextId();
  const data = {
    id,
    title: title || '',
    topics: Array.isArray(topics) ? topics : topics ? [topics] : [],
    source: {
      speaker: (source && source.speaker) || 'unknown',
      date: (source && source.date) || 'unknown',
      context: (source && source.context) || 'unknown',
    },
    raw_excerpt: rawExcerpt || '',
    raw_summary: rawSummary || '',
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
  };
  dataStore.createItem(data);
  appendHistory(id, { action: 'create', field: null, before: null, after: 'pending_review', actor });
  return data;
}

module.exports = {
  REVIEW_STATUSES,
  EDITABLE_FIELDS,
  ReviewServiceError,
  getItem,
  listItems,
  listAllItemData,
  updateFields,
  editRawExcerpt,
  transition,
  getHistory,
  getDuplicateSuggestions,
  createDraftItem,
};
