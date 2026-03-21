const MAX_SHEET_NAME_LENGTH = 31;
const FORBIDDEN_CHARS = /[\\\/?*\[\]]/g;

function sanitizeSheetName(inputName) {
  const source = typeof inputName === 'string' ? inputName : 'Sheet';

  const sanitized = source
    .normalize('NFKC')
    .replace(FORBIDDEN_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^'+|'+$/g, '')
    .trim();

  return (sanitized || 'Sheet').slice(0, MAX_SHEET_NAME_LENGTH);
}

function makeSafeSheetName(inputName, existingNames = new Set()) {
  const taken = new Set(Array.from(existingNames).map((name) => name.toLocaleLowerCase('vi-VN')));
  const baseName = sanitizeSheetName(inputName);

  if (!taken.has(baseName.toLocaleLowerCase('vi-VN'))) {
    return baseName;
  }

  let index = 2;
  while (index < 10000) {
    const suffix = ` (${index})`;
    const truncatedBase = baseName.slice(0, MAX_SHEET_NAME_LENGTH - suffix.length).trim();
    const candidate = `${truncatedBase}${suffix}`;
    if (!taken.has(candidate.toLocaleLowerCase('vi-VN'))) {
      return candidate;
    }
    index += 1;
  }

  return `${Date.now()}`.slice(-MAX_SHEET_NAME_LENGTH);
}

module.exports = {
  makeSafeSheetName,
  sanitizeSheetName,
  MAX_SHEET_NAME_LENGTH
};
