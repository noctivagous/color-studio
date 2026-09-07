const DEFAULT_STATE = Object.freeze({
  scheme: 'analog',
  baseColor: '#7c3aed',
  /** @type {'hsl'|'hex'|'rgb'} */
  colorFormat: 'hsl',
  /** @type {'copy'|'palette'|'base'} */
  swatchMode: 'base',
  showSwatchValues: true,
  /** @type {string[]} */
  userPalette: [],
  /** @type {'light'|'light-gray'|'gray'|'dark-gray'|'dark'} */
  themeMode: 'dark',
  themeIntensity: 0.5,
  surfaceSaturation: 0.4,
  textSaturation: 0.35,
});

let state = { ...DEFAULT_STATE };
const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @param {Partial<{ scheme: string, baseColor: string, colorFormat: 'hsl'|'hex'|'rgb', swatchMode: 'copy'|'palette'|'base', showSwatchValues: boolean, userPalette: string[], themeMode: string, themeIntensity: number, surfaceSaturation: number, textSaturation: number }>} patch */
export function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

/** @param {string} hex */
export function addToUserPalette(hex) {
  const normalized = hex.toLowerCase();
  if (state.userPalette.includes(normalized)) return;
  setState({ userPalette: [...state.userPalette, normalized] });
}

/** @param {string} hex */
export function removeFromUserPalette(hex) {
  const normalized = hex.toLowerCase();
  setState({ userPalette: state.userPalette.filter((item) => item !== normalized) });
}

export function clearUserPalette() {
  setState({ userPalette: [] });
}
