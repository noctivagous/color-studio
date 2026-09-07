/**
 * Studio helpers on top of gMixer color-theory.
 * Conversions and scheme math live in color-theory.js (one implementation).
 */
export {
  hexToHsl,
  hslToHex,
  HUE_RING,
  hueRingHex,
  accentHueOffsets,
  getColorScale,
  buildPalette,
} from './color-theory.js';

import {
  SCHEMES as ALL_SCHEMES,
  hexToHsl,
  hslToHex,
  accentHueOffsets,
  getColorScale,
} from './color-theory.js';

export const SCHEMES = ALL_SCHEMES;

/** @param {string} hex */
export function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/**
 * @param {string} hex
 * @param {'hsl'|'hex'|'rgb'} [format='hsl']
 */
export function formatColorValue(hex, format = 'hsl') {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  if (format === 'hex') return normalized.toLowerCase();
  if (format === 'rgb') {
    const { r, g, b } = hexToRgb(normalized);
    return `rgb(${r} ${g} ${b})`;
  }
  const { h, s, l } = hexToHsl(normalized);
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

export function schemeHueHexes(hex, scheme) {
  const hsl = hexToHsl(hex || '#8a8a8a');
  return [0, ...accentHueOffsets(scheme)].map((offset) =>
    hslToHex({ ...hsl, h: (hsl.h + offset + 360) % 360 })
  );
}

export const SWATCH_SCALE_STEPS = 5;

export const NEUTRAL_EXTREMES = Object.freeze([
  { scale: 'white', hex: '#ffffff' },
  { scale: 'black', hex: '#000000' },
  { scale: 'gray', hex: '#808080' },
]);

/**
 * @param {string} baseColorHex
 * @param {string} scheme
 */
export function buildSwatchBoard(baseColorHex, scheme) {
  const hues = schemeHueHexes(baseColorHex, scheme);
  const steps = SWATCH_SCALE_STEPS;
  /** @type {{ scale: string, hue: number, step: number, hex: string }[]} */
  const cells = [];
  hues.forEach((hex, hue) => {
    cells.push({ scale: 'colors', hue, step: 0, hex });
  });
  for (const scale of /** @type {const} */ (['tint', 'shade', 'tone'])) {
    hues.forEach((hex, hue) => {
      getColorScale(hex, scale, steps).forEach((cellHex, step) => {
        cells.push({ scale, hue, step, hex: cellHex });
      });
    });
  }
  NEUTRAL_EXTREMES.forEach((extreme, hue) => {
    cells.push({ scale: extreme.scale, hue, step: 0, hex: extreme.hex });
  });
  const rowOf = (s) => cells.filter((cell) => cell.scale === s).map((cell) => cell.hex);
  return {
    hues: hues.length,
    steps,
    cells,
    rows: {
      colors: rowOf('colors'),
      tint: rowOf('tint'),
      shade: rowOf('shade'),
      tone: rowOf('tone'),
      extremes: NEUTRAL_EXTREMES.map((extreme) => extreme.hex),
    },
  };
}

export function schemeSliderHues(baseColorHex, scheme) {
  const { h } = hexToHsl(baseColorHex || '#8a8a8a');
  return [0, ...accentHueOffsets(scheme || 'analog')].map(
    (offset) => (h + offset + 360) % 360
  );
}

/**
 * @param {string} baseColorHex
 * @param {string} scheme
 * @param {'s'|'l'} channel
 */
export function schemeHslTrackStyle(baseColorHex, scheme, channel) {
  const hsl = hexToHsl(baseColorHex || '#8a8a8a');
  const hues = schemeSliderHues(baseColorHex, scheme);
  const n = Math.max(hues.length, 1);
  /** @type {string[]} */
  const parts = [`--hsl-band-count:${n}`];

  for (let i = 0; i < 4; i++) {
    if (i < hues.length) {
      const h = hues[i];
      if (channel === 's') {
        parts.push(`--hsl-band-${i}-a:${hslToHex({ h, s: 0, l: hsl.l })}`);
        parts.push(`--hsl-band-${i}-b:${hslToHex({ h, s: 100, l: hsl.l })}`);
      } else {
        parts.push(`--hsl-band-${i}-a:${hslToHex({ h, s: hsl.s, l: 8 })}`);
        parts.push(`--hsl-band-${i}-b:${hslToHex({ h, s: hsl.s, l: 92 })}`);
      }
    } else {
      parts.push(`--hsl-band-${i}-a:transparent`);
      parts.push(`--hsl-band-${i}-b:transparent`);
    }
  }

  return parts.join(';');
}

/** @param {string} hex */
export function swatchInk(hex) {
  try {
    return hexToHsl(hex).l > 55 ? '#14121a' : '#f2eefc';
  } catch {
    return '#f2eefc';
  }
}

/**
 * @param {{ cells: { scale: string, hue: number, step: number, hex: string }[] }} board
 */
export function boardExport(board) {
  const hexLines = board.cells.map((cell) => cell.hex).join('\n');
  const css = board.cells
    .map((cell) => `--${cell.scale}-${cell.hue}-${cell.step}: ${cell.hex};`)
    .join('\n');
  return { hexLines, css: `:root {\n${css}\n}` };
}

/** @param {string} key */
export function camelToKebab(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Role CSS groups for Export Preview (page theming starter). */
export const ROLE_EXPORT_GROUPS = [
  {
    comment: 'Surfaces',
    keys: [
      'background',
      'backgroundSecondary',
      'surfaceGui',
      'surfaceContainers',
      'border',
      'focus',
    ],
  },
  {
    comment: 'Type',
    keys: [
      'text',
      'headingLarge',
      'headingMedium',
      'headingSmall',
      'muted',
      'mutedKicker',
      'mutedPhotoCaption',
      'mutedAsideNotes',
    ],
  },
  {
    comment: 'Links and accent',
    keys: ['accent', 'link', 'linkHover', 'linkBare', 'linkArticle', 'navLink', 'navLinkHover'],
  },
  {
    comment: 'GUI',
    keys: ['guiButton', 'guiInput', 'guiTextarea', 'guiSlider'],
  },
];

/**
 * @param {Record<string, unknown>} palette
 * @returns {string}
 */
export function roleCssExport(palette) {
  const lines = [':root {'];
  for (const group of ROLE_EXPORT_GROUPS) {
    lines.push(`  /* ${group.comment} */`);
    for (const key of group.keys) {
      const value = palette[key];
      if (typeof value !== 'string' || !value.startsWith('#')) continue;
      lines.push(`  --${camelToKebab(key)}: ${value};`);
    }
    lines.push('');
  }
  const extra = Object.keys(palette)
    .filter((key) => {
      if (typeof palette[key] !== 'string' || !String(palette[key]).startsWith('#')) return false;
      if (ROLE_EXPORT_GROUPS.some((group) => group.keys.includes(key))) return false;
      if (key === 'surface') return false;
      return true;
    })
    .sort();
  if (extra.length) {
    lines.push('  /* Ink on surfaces */');
    for (const key of extra) {
      lines.push(`  --${camelToKebab(key)}: ${palette[key]};`);
    }
    lines.push('');
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  lines.push('}');
  return lines.join('\n');
}
