'use strict';

// 중복 "가능성"만 계산한다. 절대 자동 병합하지 않는다 — 관리자가 판단할 근거만 제공.

function charBigrams(text) {
  const s = String(text || '').replace(/\s+/g, '');
  const set = new Set();
  for (let i = 0; i < s.length - 1; i += 1) set.add(s.slice(i, i + 2));
  if (set.size === 0 && s.length > 0) set.add(s);
  return set;
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter += 1;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function itemText(item) {
  return [item.title, (item.topics || []).join(' '), item.raw_summary, item.raw_excerpt]
    .filter(Boolean)
    .join(' \n ');
}

const DEFAULT_THRESHOLD = 0.35;

function findPossibleDuplicates(items, threshold = DEFAULT_THRESHOLD) {
  const withBigrams = items.map((it) => ({ id: it.id, bigrams: charBigrams(itemText(it)) }));
  const pairs = [];
  for (let i = 0; i < withBigrams.length; i += 1) {
    for (let j = i + 1; j < withBigrams.length; j += 1) {
      const score = jaccard(withBigrams[i].bigrams, withBigrams[j].bigrams);
      if (score >= threshold) {
        pairs.push({
          a: withBigrams[i].id,
          b: withBigrams[j].id,
          score: Math.round(score * 100) / 100,
        });
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

function duplicatesFor(id, items, threshold = DEFAULT_THRESHOLD) {
  return findPossibleDuplicates(items, threshold)
    .filter((p) => p.a === id || p.b === id)
    .map((p) => ({ id: p.a === id ? p.b : p.a, score: p.score }));
}

module.exports = { findPossibleDuplicates, duplicatesFor, DEFAULT_THRESHOLD };
