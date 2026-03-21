function normalizeContent(content) {
  if (typeof content !== 'string') {
    return '';
  }

  const normalized = content
    .normalize('NFKC')
    .replace(/[\u2010-\u2015_\.]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/-/g, ' ')
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

function makeDisplayName(content, fallback = 'untitled') {
  if (typeof content !== 'string') {
    return fallback;
  }

  const displayName = content
    .normalize('NFKC')
    .replace(/[\u2010-\u2015_\.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFC');

  return displayName || fallback;
}

module.exports = {
  normalizeContent,
  makeDisplayName
};
