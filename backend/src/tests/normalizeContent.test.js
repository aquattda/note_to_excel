const {
  normalizeContent
} = require('../utils/normalize/normalizeContent');

describe('normalizeContent', () => {
  it('normalizes Vietnamese accents, casing, spaces and separators', () => {
    expect(normalizeContent('phân gà')).toBe('phan ga');
    expect(normalizeContent(' PhAn   ga ')).toBe('phan ga');
    expect(normalizeContent('PHÂN_GÀ')).toBe('phan ga');
    expect(normalizeContent('phan-ga')).toBe('phan ga');
  });

  it('removes unnecessary symbols', () => {
    expect(normalizeContent('PHAN***GA!!!')).toBe('phan ga');
  });
});
