'use strict';

const CONTENT_TYPE_INFO = {
  rule: { label: '규칙', explain: '반드시 이렇게 합니다.' },
  principle: { label: '원칙', explain: '우리는 이런 방향을 중요하게 생각합니다.' },
  philosophy: { label: '철학', explain: '왜 이렇게 하는지에 대한 생각입니다. 규칙이 아닙니다.' },
  guideline: { label: '판단', explain: '상황에 따라 다르며, 아래 요소를 고려해서 판단합니다.' },
  procedure: { label: '절차', explain: '실제 업무 순서입니다.' },
  metric: { label: '지표', explain: '숫자/기준입니다. 출처를 함께 확인하세요.' },
  case: { label: '사례', explain: '과거에 있었던 사례입니다. 지금의 공식 기준과 다를 수 있습니다.' },
  opinion: { label: '의견', explain: '특정 개인의 의견입니다. 공식 기준이 아닙니다.' },
  question: { label: '질문', explain: '아직 답이 정해지지 않은 질문입니다.' },
};

const SOURCE_LEVEL_LABEL = {
  H1: '해피니언 공식',
  H2: '사부님 전달 기준',
  G1: '강서 합의',
  M1: '마곡점 공식 기준',
  K1: '강윤 개인 의견',
  CASE: '과거 사례',
  IDEA: '검토 중 아이디어',
  unknown: '출처 확인 필요',
};

const AUTHORITY_LABEL = {
  official: '공식 확정',
  adopted: '실제 채택되어 사용 중',
  local_practice: '현장 관행 (공식 승인 아님)',
  proposed: '제안됨 (채택 여부 미정)',
  discussed: '논의됨 (아직 결론 없음)',
  personal_view: '개인 의견',
  unknown: '확인 필요',
};

const SCOPE_LABEL = {
  happynian_all: '해피니언 전체',
  gangseo: '강서',
  magok: '마곡점',
  leader: '리더',
  designer: '디자이너',
  partner: '파트너',
  customer_service: '고객 응대',
  personal_growth: '개인 성장',
};

const LOW_CONFIDENCE_SOURCE_LEVELS = ['unknown', 'K1', 'IDEA'];
const LOW_CONFIDENCE_AUTHORITY = ['unknown', 'discussed', 'proposed', 'personal_view'];

function $(sel) { return document.querySelector(sel); }

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const state = { items: [], activeScopes: new Set(), search: '' };

async function loadItems() {
  const res = await fetch('/api/public/items');
  const body = await res.json();
  state.items = body.items || [];
  renderScopeChips();
  renderList();
}

function renderScopeChips() {
  const scopes = new Set();
  state.items.forEach((i) => (i.scope || []).forEach((s) => scopes.add(s)));
  const el = $('#scopeChips');
  if (scopes.size === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = Array.from(scopes)
    .map((s) => {
      const active = state.activeScopes.has(s) ? ' active' : '';
      return `<button type="button" class="chip${active}" data-scope="${escapeHtml(s)}">${escapeHtml(SCOPE_LABEL[s] || s)}</button>`;
    })
    .join('');
  el.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.scope;
      if (state.activeScopes.has(s)) state.activeScopes.delete(s);
      else state.activeScopes.add(s);
      renderScopeChips();
      renderList();
    });
  });
}

function filteredItems() {
  let items = state.items;
  if (state.activeScopes.size > 0) {
    items = items.filter((i) => (i.scope || []).some((s) => state.activeScopes.has(s)));
  }
  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    items = items.filter((i) => {
      const hay = [i.title, i.summary, ...(i.topics || [])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  return items.slice().sort((a, b) => (b.approved_at || '').localeCompare(a.approved_at || ''));
}

function renderList() {
  const items = filteredItems();
  const list = $('#itemList');
  const empty = $('#emptyState');

  if (state.items.length === 0) {
    list.innerHTML = '';
    empty.hidden = false;
    $('#listHeading').textContent = '최근 승인된 내용';
    return;
  }
  empty.hidden = true;

  if (items.length === 0) {
    list.innerHTML = '<li class="muted" style="list-style:none;padding:20px 0;">검색/필터에 맞는 내용이 없습니다.</li>';
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const type = CONTENT_TYPE_INFO[item.content_type] || { label: item.content_type || '미분류' };
      const badges = [`<span class="badge badge-type-${escapeHtml(item.content_type || '')}">${escapeHtml(type.label)}</span>`];
      (item.scope || []).slice(0, 2).forEach((s) => {
        badges.push(`<span class="badge badge-scope">${escapeHtml(SCOPE_LABEL[s] || s)}</span>`);
      });
      return `<li class="item-card" data-id="${escapeHtml(item.id)}">
        <div class="item-card-title">${escapeHtml(item.title)}</div>
        <div class="item-card-summary">${escapeHtml(item.summary)}</div>
        <div class="badges">${badges.join('')}</div>
      </li>`;
    })
    .join('');

  list.querySelectorAll('.item-card').forEach((el) => {
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });
}

async function openDetail(id) {
  const res = await fetch(`/api/public/items/${encodeURIComponent(id)}`);
  if (!res.ok) return;
  const { item } = await res.json();
  renderDetail(item);
  $('#listView').hidden = true;
  $('#detailView').hidden = false;
  window.scrollTo(0, 0);
}

function renderDetail(item) {
  const type = CONTENT_TYPE_INFO[item.content_type] || { label: item.content_type || '미분류', explain: '' };
  const lowConfidence =
    LOW_CONFIDENCE_SOURCE_LEVELS.includes(item.source_level) ||
    LOW_CONFIDENCE_AUTHORITY.includes(item.authority_status);

  const scopeBadges = (item.scope || [])
    .map((s) => `<span class="badge badge-scope">${escapeHtml(SCOPE_LABEL[s] || s)}</span>`)
    .join('');

  const sourceLine = `출처: ${escapeHtml(SOURCE_LEVEL_LABEL[item.source_level] || item.source_level || '확인 필요')}` +
    ` · 권위: ${escapeHtml(AUTHORITY_LABEL[item.authority_status] || item.authority_status || '확인 필요')}`;

  $('#detailContent').innerHTML = `
    <div class="detail-type-banner badge-type-${escapeHtml(item.content_type || '')}">
      <h2>${escapeHtml(item.title)}</h2>
      <div class="type-explain"><strong>${escapeHtml(type.label)}</strong> — ${escapeHtml(type.explain || '')}</div>
    </div>
    <div class="detail-meta-row">${scopeBadges}</div>
    <div class="detail-summary">${escapeHtml(item.summary)}</div>
    <div class="source-note${lowConfidence ? ' caution' : ''}">
      ${lowConfidence ? '<strong>⚠ 아직 출처/권위가 명확히 확인되지 않았습니다.</strong><br/>' : ''}
      ${sourceLine}
    </div>
  `;
}

$('#btnBack').addEventListener('click', () => {
  $('#detailView').hidden = true;
  $('#listView').hidden = false;
});

let searchDebounce;
$('#searchInput').addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.search = e.target.value;
    renderList();
  }, 200);
});

loadItems();
