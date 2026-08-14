'use strict';

const CONTENT_TYPES = [
  'philosophy', 'principle', 'rule', 'guideline', 'procedure', 'metric', 'case', 'opinion', 'question',
];
const SCOPES = [
  'happynian_all', 'gangseo', 'magok', 'leader', 'designer', 'partner', 'customer_service', 'personal_growth',
];
const STATUS_LABEL = {
  pending_review: '미검수',
  editing: '검토중',
  approved: '승인',
  hold: '보류',
  rejected: '반려',
  archived: '보관',
};

const state = { items: [], currentId: null };

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

async function api(path, opts) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.error || `HTTP ${res.status}`);
    err.code = body.error;
    err.status = res.status;
    throw err;
  }
  return body;
}

function buildCheckboxGroup(containerSel, values, groupName) {
  const el = $(containerSel);
  el.innerHTML = values
    .map((v) => `<label><input type="checkbox" name="${groupName}" value="${v}" /> ${v}</label>`)
    .join('');
}

function setCheckboxGroup(containerSel, checkedValues) {
  $all(`${containerSel} input[type=checkbox]`).forEach((el) => {
    el.checked = checkedValues.includes(el.value);
  });
}

function getCheckboxGroup(containerSel) {
  return $all(`${containerSel} input[type=checkbox]:checked`).map((el) => el.value);
}

function csvToArray(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function currentFilters() {
  return {
    search: $('#searchInput').value.trim(),
    status: $('#filterStatus').value,
    sourceLevel: $('#filterSourceLevel').value,
    topic: $('#filterTopic').value.trim(),
    hasConflict: $('#filterConflict').checked ? 'true' : '',
    hasUncertainty: $('#filterUncertainty').checked ? 'true' : '',
  };
}

async function loadStats() {
  const stats = await api('/api/admin/stats');
  $('#stats').textContent =
    `검수 대기 ${stats.pending_review} · 검토중 ${stats.editing} · ` +
    `승인 ${stats.approved} · 보류 ${stats.hold} · 반려 ${stats.rejected} · ` +
    `보관 ${stats.archived} / 전체 ${stats.total}`;
}

function hasUncertaintyFlag(item) {
  const u = item.uncertainty || {};
  return Object.values(u).some((v) => v === 'unknown' || v === 'unclear');
}

function renderQueueList() {
  const list = $('#queueList');
  if (state.items.length === 0) {
    list.innerHTML = '<li class="queue-item" style="cursor:default;color:var(--muted)">해당하는 항목이 없습니다.</li>';
    return;
  }
  list.innerHTML = state.items
    .map((item, idx) => {
      const badges = [`<span class="badge badge-${item.review_status}">${STATUS_LABEL[item.review_status] || item.review_status}</span>`];
      if (item.source_level) badges.push(`<span class="badge">${escapeHtml(item.source_level)}</span>`);
      if (item.conflict && item.conflict.exists) badges.push('<span class="badge badge-conflict">충돌</span>');
      if (hasUncertaintyFlag(item)) badges.push('<span class="badge badge-uncertain">불확실</span>');
      const title = item.title || (item.topics || [])[0] || '(제목 없음)';
      const active = item.id === state.currentId ? ' active' : '';
      return `<li class="queue-item${active}" data-id="${item.id}" data-idx="${idx}">
        <div class="queue-item-title">${escapeHtml(title)}</div>
        <div class="queue-item-badges">${badges.join('')}</div>
      </li>`;
    })
    .join('');
  $all('.queue-item[data-id]').forEach((el) => {
    el.addEventListener('click', () => selectItem(el.dataset.id, true));
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function loadQueue() {
  const { items } = await api('/api/admin/items?' + new URLSearchParams(currentFilters()));
  state.items = items;
  renderQueueList();
  await loadStats();
}

function findIndexInQueue(id) {
  return state.items.findIndex((i) => i.id === id);
}

async function selectItem(id, fromMobileTap) {
  state.currentId = id;
  renderQueueList();
  const { item } = await api(`/api/admin/items/${encodeURIComponent(id)}`);
  // 이 요청이 진행되는 동안 사용자가 다른 항목을 클릭했다면(느린 네트워크 등)
  // 응답이 뒤바뀐 순서로 도착해 다른 항목의 데이터로 폼을 덮어쓸 수 있다 —
  // 그 상태에서 "저장"을 누르면 엉뚱한 항목에 저장되는 데이터 무결성 문제로
  // 이어진다. 그새 선택이 바뀌었으면 이 응답은 버린다.
  if (state.currentId !== id) return;
  populateForm(item);
  $('#saveStatus').textContent = '';
  $('#detailEmpty').hidden = true;
  $('#detailContent').hidden = false;
  updatePositionLabel();
  loadDuplicates(id);
  if (fromMobileTap) $('#layout').classList.add('show-detail');
}

function updatePositionLabel() {
  const idx = findIndexInQueue(state.currentId);
  $('#detailPosition').textContent = idx >= 0 ? `${idx + 1} / ${state.items.length}` : '';
  $('#btnPrev').disabled = idx <= 0;
  $('#btnNext').disabled = idx < 0 || idx >= state.items.length - 1;
}

async function loadDuplicates(id) {
  const { duplicates } = await api(`/api/admin/items/${encodeURIComponent(id)}/duplicates`);
  if (state.currentId !== id) return; // selection changed while this was in flight
  const list = $('#duplicateSuggestions');
  if (duplicates.length === 0) {
    list.innerHTML = '<li style="color:var(--muted)">중복 가능성 있는 항목 없음</li>';
    return;
  }
  list.innerHTML = duplicates
    .map((d) => `<li>가능성 있음: <strong>${d.id}</strong> (유사도 ${Math.round(d.score * 100)}%)</li>`)
    .join('');
}

function populateForm(item) {
  $('#fieldTitle').value = item.title || '';
  $('#statusBadge').textContent = STATUS_LABEL[item.review_status] || item.review_status;
  $('#statusBadge').className = 'badge badge-' + item.review_status;
  const src = item.source || {};
  $('#detailMeta').textContent =
    `${item.id} · 화자: ${src.speaker ?? 'unknown'} · 날짜: ${src.date ?? 'unknown'} · 맥락: ${src.context ?? 'unknown'}`;

  $('#rawExcerptView').textContent = item.raw_excerpt || '(원문 없음)';
  $('#rawExcerptInput').value = item.raw_excerpt || '';
  $('#rawEditArea').hidden = true;
  $('#rawEditNote').value = '';

  $('#fieldRawSummary').value = item.raw_summary || '';
  $('#fieldInterpretation').value = item.interpretation == null ? '' : item.interpretation;

  $('#fieldTopics').value = (item.topics || []).join(', ');
  $('#fieldSourceLevel').value = item.source_level || 'unknown';
  setCheckboxGroup('#fieldContentType', item.possible_content_type || []);
  setCheckboxGroup('#fieldScope', item.scope || []);
  $('#fieldAuthorityStatus').value = item.authority_status || 'unknown';
  $('#fieldCertainty').value = item.certainty || 'unclear';
  $('#fieldCurrentness').value = item.currentness || 'unknown';

  const unc = item.uncertainty || {};
  $('#uncSpeaker').value = unc.speaker || 'unknown';
  $('#uncDate').value = unc.date || 'unknown';
  $('#uncContext').value = unc.context || 'unknown';
  $('#uncMeaning').value = unc.meaning || 'unclear';

  const conflict = item.conflict || {};
  $('#conflictExists').checked = !!conflict.exists;
  $('#conflictRelated').value = (conflict.related_items || []).join(', ');
  $('#conflictTension').value = conflict.tension || '';

  $('#fieldDuplicateOf').value = (item.duplicate_of || []).join(', ');
  $('#fieldNotes').value = item.notes || '';
  $('#fieldReviewNote').value = item.review_note || '';

  const actorSaved = localStorage.getItem('review_admin_actor');
  if (actorSaved && !$('#fieldActor').value) $('#fieldActor').value = actorSaved;

  $('#btnUnapprove').hidden = item.review_status !== 'approved';
  $('#btnApprove').hidden = item.review_status === 'approved';
  // saveStatus는 여기서 지우지 않는다 — refreshAfterMutation()이 저장/전이 직후
  // populateForm()을 다시 호출하는데, 여기서 비워버리면 방금 뜬 "저장됨"/
  // "상태 변경됨" 메시지가 사용자 눈에 보이기도 전에 사라진다(실제로 발견된 버그).
  // 새 항목을 선택할 때 메시지를 지우는 것은 selectItem()이 담당한다.
}

function collectPatch() {
  const interpretationRaw = $('#fieldInterpretation').value;
  return {
    title: $('#fieldTitle').value,
    topics: csvToArray($('#fieldTopics').value),
    raw_summary: $('#fieldRawSummary').value,
    interpretation: interpretationRaw.trim() === '' ? null : interpretationRaw,
    source_level: $('#fieldSourceLevel').value,
    possible_content_type: getCheckboxGroup('#fieldContentType'),
    scope: getCheckboxGroup('#fieldScope'),
    authority_status: $('#fieldAuthorityStatus').value,
    certainty: $('#fieldCertainty').value,
    currentness: $('#fieldCurrentness').value,
    uncertainty: {
      speaker: $('#uncSpeaker').value,
      date: $('#uncDate').value,
      context: $('#uncContext').value,
      meaning: $('#uncMeaning').value,
    },
    conflict: {
      exists: $('#conflictExists').checked,
      related_items: csvToArray($('#conflictRelated').value),
      tension: $('#conflictTension').value,
    },
    duplicate_of: csvToArray($('#fieldDuplicateOf').value),
    notes: $('#fieldNotes').value,
  };
}

function actor() {
  const v = $('#fieldActor').value.trim();
  if (v) localStorage.setItem('review_admin_actor', v);
  return v || 'unknown';
}

async function saveEdits() {
  const id = state.currentId;
  if (!id) return;
  $('#saveStatus').textContent = '저장 중...';
  try {
    const result = await api(`/api/admin/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ patch: collectPatch(), actor: actor() }),
    });
    $('#saveStatus').textContent = result.changed ? '저장됨' : '변경 사항 없음';
    await refreshAfterMutation(id);
  } catch (err) {
    $('#saveStatus').textContent = '저장 실패: ' + err.message;
  }
}

async function refreshAfterMutation(id) {
  await loadQueue();
  const stillExists = state.items.some((i) => i.id === id);
  if (stillExists) {
    const { item } = await api(`/api/admin/items/${encodeURIComponent(id)}`);
    populateForm(item);
    updatePositionLabel();
  }
}

async function doTransition(status, { needsConfirm } = {}) {
  const id = state.currentId;
  if (!id) return;
  const note = $('#fieldReviewNote').value;
  const run = async (confirmFlag) => {
    try {
      await api(`/api/admin/items/${encodeURIComponent(id)}/transition`, {
        method: 'POST',
        body: JSON.stringify({ status, actor: actor(), note, confirm: confirmFlag }),
      });
      $('#saveStatus').textContent = `상태 변경됨: ${STATUS_LABEL[status] || status}`;
      await refreshAfterMutation(id);
    } catch (err) {
      $('#saveStatus').textContent = '상태 변경 실패: ' + err.message;
    }
  };
  if (needsConfirm) {
    $('#confirmModal').hidden = false;
    $('#confirmYes').onclick = () => {
      $('#confirmModal').hidden = true;
      run(true);
    };
    $('#confirmNo').onclick = () => { $('#confirmModal').hidden = true; };
  } else {
    run(true);
  }
}

async function saveRawExcerpt() {
  const id = state.currentId;
  if (!id) return;
  try {
    await api(`/api/admin/items/${encodeURIComponent(id)}/raw-excerpt`, {
      method: 'PATCH',
      body: JSON.stringify({
        rawExcerpt: $('#rawExcerptInput').value,
        actor: actor(),
        note: $('#rawEditNote').value,
      }),
    });
    $('#saveStatus').textContent = '원문 저장됨 (변경 이력에 기록됨)';
    await refreshAfterMutation(id);
  } catch (err) {
    $('#saveStatus').textContent = '원문 저장 실패: ' + err.message;
  }
}

async function openHistory() {
  const id = state.currentId;
  if (!id) return;
  const { history } = await api(`/api/admin/items/${encodeURIComponent(id)}/history`);
  const list = $('#historyList');
  if (history.length === 0) {
    list.innerHTML = '<li style="color:var(--muted)">이력 없음</li>';
  } else {
    list.innerHTML = history
      .slice()
      .reverse()
      .map((h) => {
        const before = h.before === null || h.before === undefined ? '(없음)' : JSON.stringify(h.before);
        const after = h.after === null || h.after === undefined ? '(없음)' : JSON.stringify(h.after);
        return `<li><strong>${h.timestamp}</strong> · ${escapeHtml(h.actor || 'unknown')} · ${h.action}${h.field ? ` (${h.field})` : ''}
          <br/><span style="color:var(--danger)">전: ${escapeHtml(before)}</span>
          <br/><span style="color:var(--approve)">후: ${escapeHtml(after)}</span>
          ${h.note ? `<br/>메모: ${escapeHtml(h.note)}` : ''}
        </li>`;
      })
      .join('');
  }
  $('#historyModal').hidden = false;
}

function bindEvents() {
  ['searchInput', 'filterStatus', 'filterSourceLevel', 'filterTopic'].forEach((id) => {
    let t;
    $('#' + id).addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(loadQueue, 250);
    });
  });
  ['filterConflict', 'filterUncertainty'].forEach((id) => {
    $('#' + id).addEventListener('change', loadQueue);
  });

  $('#btnBack').addEventListener('click', () => $('#layout').classList.remove('show-detail'));

  $('#btnPrev').addEventListener('click', () => {
    const idx = findIndexInQueue(state.currentId);
    if (idx > 0) selectItem(state.items[idx - 1].id);
  });
  $('#btnNext').addEventListener('click', () => {
    const idx = findIndexInQueue(state.currentId);
    if (idx >= 0 && idx < state.items.length - 1) selectItem(state.items[idx + 1].id);
  });

  $('#btnRawEditToggle').addEventListener('click', () => {
    $('#rawEditArea').hidden = !$('#rawEditArea').hidden;
  });
  $('#btnRawSave').addEventListener('click', saveRawExcerpt);
  $('#btnRawCancel').addEventListener('click', () => {
    $('#rawEditArea').hidden = true;
  });

  $('#btnSave').addEventListener('click', saveEdits);
  $('#btnApprove').addEventListener('click', () => doTransition('approved', { needsConfirm: true }));
  $('#btnUnapprove').addEventListener('click', () => doTransition('editing'));
  $('#btnHold').addEventListener('click', () => doTransition('hold'));
  $('#btnReject').addEventListener('click', () => doTransition('rejected'));
  $('#btnArchive').addEventListener('click', () => doTransition('archived'));
  $('#btnHistory').addEventListener('click', openHistory);
  $('#historyClose').addEventListener('click', () => { $('#historyModal').hidden = true; });
}

function init() {
  buildCheckboxGroup('#fieldContentType', CONTENT_TYPES, 'content_type');
  buildCheckboxGroup('#fieldScope', SCOPES, 'scope');
  bindEvents();
  loadQueue();
}

init();
