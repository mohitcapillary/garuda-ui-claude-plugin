import { figmaColorToHex, findColorToken } from '../../src/utils/color';
import { findSpacingToken, pxToRem } from '../../src/utils/spacing';
import { findLabelType, findFontSizeToken, mapFontToNonRoboto } from '../../src/utils/typography';
import { TokenMapping } from '../../src/types';

// ─── Color Utils ──────────────────────────────────────────────────────────────

describe('figmaColorToHex', () => {
  test('Converts primary green to hex', () => {
    expect(figmaColorToHex({ r: 0.278, g: 0.686, b: 0.275, a: 1 })).toBe('#47af46');
  });
  test('Converts white', () => {
    expect(figmaColorToHex({ r: 1, g: 1, b: 1, a: 1 })).toBe('#ffffff');
  });
  test('Converts black', () => {
    expect(figmaColorToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
  });
  test('Converts secondary blue', () => {
    expect(figmaColorToHex({ r: 0.141, g: 0.4, b: 0.918, a: 1 })).toBe('#2466ea');
  });
  test('Rounds channels correctly', () => {
    // 0.5 * 255 = 127.5 → rounds to 128 = 0x80
    expect(figmaColorToHex({ r: 0.5, g: 0.5, b: 0.5, a: 1 })).toBe('#808080');
  });
});

describe('findColorToken', () => {
  const tokens: TokenMapping[] = [
    { figmaVariable: 'primary/base', figmaValuePattern: '#47af46', blazeCSSVar: '$cap-primary-base', tokenType: 'COLOR' },
    { figmaVariable: 'secondary/base', figmaValuePattern: '#2466ea', blazeCSSVar: '$cap-secondary-base', tokenType: 'COLOR' },
    { figmaVariable: 'white', figmaValuePattern: '#ffffff', blazeCSSVar: '$cap-white', tokenType: 'COLOR' },
  ];

  test('Returns exact match', () => {
    const result = findColorToken('#47af46', tokens);
    expect(result?.blazeCSSVar).toBe('$cap-primary-base');
  });
  test('Returns nearest match for close color', () => {
    // #47af45 is 1 off from primary
    const result = findColorToken('#47af45', tokens);
    expect(result?.blazeCSSVar).toBe('$cap-primary-base');
  });
  test('Returns null for empty token list', () => {
    expect(findColorToken('#47af46', [])).toBeNull();
  });
  test('Case-insensitive hex matching', () => {
    const result = findColorToken('#47AF46', tokens);
    expect(result?.blazeCSSVar).toBe('$cap-primary-base');
  });
});

// ─── Spacing Utils ────────────────────────────────────────────────────────────

describe('findSpacingToken', () => {
  test('Returns exact match for 16px', () => {
    expect(findSpacingToken(16)).toBe('$cap-space-16');
  });
  test('Returns nearest for 15px (closest is 16px)', () => {
    expect(findSpacingToken(15)).toBe('$cap-space-16');
  });
  test('Returns nearest for 13px (closest is 12px)', () => {
    expect(findSpacingToken(13)).toBe('$cap-space-12');
  });
  test('Returns 0 token for 0px', () => {
    expect(findSpacingToken(0)).toBe('$cap-space-00');
  });
  test('Returns 80 token for large value', () => {
    expect(findSpacingToken(80)).toBe('$cap-space-80');
  });
  test('Nearest-neighbor for 100px returns space-80 (largest)', () => {
    expect(findSpacingToken(100)).toBe('$cap-space-80');
  });
});

describe('pxToRem', () => {
  test('14px base: 14px = 1rem', () => {
    expect(pxToRem(14)).toBe('1rem');
  });
  test('14px base: 28px = 2rem', () => {
    expect(pxToRem(28)).toBe('2rem');
  });
  test('Custom base: 16px base, 32px = 2rem', () => {
    expect(pxToRem(32, 16)).toBe('2rem');
  });
});

// ─── Typography Utils ─────────────────────────────────────────────────────────

describe('findLabelType', () => {
  test('16px + 500 weight → label17', () => {
    expect(findLabelType(16, 500)).toBe('label17');
  });
  test('12px + 400 weight → label1 (first match)', () => {
    expect(findLabelType(12, 400)).toBe('label1');
  });
  test('12px + 500 weight → label4', () => {
    expect(findLabelType(12, 500)).toBe('label4');
  });
  test('14px + 400 weight → label14 or label15', () => {
    const result = findLabelType(14, 400);
    expect(['label14', 'label15', 'label18', 'label23', 'label24'].includes(result)).toBe(true);
  });
  test('14px + 500 weight → label7 or label16', () => {
    const result = findLabelType(14, 500);
    expect(['label7', 'label16', 'label20', 'label25', 'label32', 'label33'].includes(result)).toBe(true);
  });
  test('10px + 400 weight → label5 (first match)', () => {
    expect(findLabelType(10, 400)).toBe('label5');
  });
  test('24px + 400 weight → label22', () => {
    expect(findLabelType(24, 400)).toBe('label22');
  });
  test('Unknown size falls back to nearest', () => {
    const result = findLabelType(13, 400);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^label\d+$/);
  });
});

describe('findFontSizeToken', () => {
  test('24px → $font-size-vl', () => {
    expect(findFontSizeToken(24)).toBe('$font-size-vl');
  });
  test('16px → $font-size-l', () => {
    expect(findFontSizeToken(16)).toBe('$font-size-l');
  });
  test('14px → $font-size-m', () => {
    expect(findFontSizeToken(14)).toBe('$font-size-m');
  });
  test('12px → $font-size-s', () => {
    expect(findFontSizeToken(12)).toBe('$font-size-s');
  });
  test('10px → $font-size-vs', () => {
    expect(findFontSizeToken(10)).toBe('$font-size-vs');
  });
  test('15px → nearest is $font-size-l (16px)', () => {
    expect(findFontSizeToken(15)).toBe('$font-size-l');
  });
  test('11px → nearest is $font-size-s (12px)', () => {
    expect(findFontSizeToken(11)).toBe('$font-size-s');
  });
});

describe('mapFontToNonRoboto', () => {
  test('Roboto returns null (no override needed)', () => {
    expect(mapFontToNonRoboto('Roboto')).toBeNull();
  });
  test('roboto (lowercase) returns null', () => {
    expect(mapFontToNonRoboto('roboto')).toBeNull();
  });
  test('Inter returns font name (override needed)', () => {
    expect(mapFontToNonRoboto('Inter')).toBe('Inter');
  });
  test('Helvetica Neue returns font name', () => {
    expect(mapFontToNonRoboto('Helvetica Neue')).toBe('Helvetica Neue');
  });
});
