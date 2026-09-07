import { LitElement, html, css } from 'lit';
import { buildSwatchBoard, formatColorValue, swatchInk } from '../lib/color.js';

export class SwatchBoard extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
    mode: { type: String },
    colorFormat: { type: String, attribute: 'color-format' },
    showValues: { type: Boolean, attribute: 'show-values' },
    /** Hexes already in the user palette (lowercase). */
    palette: { type: Array },
    flashHex: { state: true },
    flashLabel: { state: true },
  };

  static styles = css`
    :host {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
    }
    .swatch-mode {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.18);
      min-width: min(100%, 280px);
    }
    .swatch-mode-label {
      align-self: center;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      font: 650 11px/1.2 system-ui, sans-serif;
    }
    .swatch-mode-option {
      border: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 8px;
      font: 650 11px/1.2 system-ui, sans-serif;
    }
    .swatch-mode-option:last-child {
      border-right: 0;
    }
    .swatch-mode-option[aria-pressed='true'] {
      color: var(--gm-text, #f2eefc);
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
      box-shadow: inset 0 -2px 0 var(--gm-accent, #7c3aed);
    }
    .values-toggle {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      cursor: pointer;
      font: 650 11px/1.2 system-ui, sans-serif;
      user-select: none;
    }
    .values-toggle input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .values-switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.3);
      box-sizing: border-box;
      transition: background 120ms ease, border-color 120ms ease;
    }
    .values-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(242, 238, 252, 0.72);
      transition: transform 120ms ease, background 120ms ease;
    }
    .values-toggle input:checked + .values-switch {
      border-color: var(--gm-accent, #7c3aed);
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
    }
    .values-toggle input:checked + .values-switch::after {
      background: var(--gm-text, #f2eefc);
      transform: translateX(12px);
    }
    .values-toggle input:focus-visible + .values-switch {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
    .hint {
      margin: 0;
      flex: 1 1 180px;
      color: var(--gm-muted, rgba(242, 238, 252, 0.62));
      font: 10px/1.35 system-ui, sans-serif;
    }
    .scales-grid {
      display: grid;
      gap: 6px;
    }
    .scale {
      display: flex;
      gap: 2px;
      min-width: 0;
      align-items: center;
    }
    .scale.scheme-colors {
      gap: 2px;
    }
    .scheme-color-swatches {
      display: flex;
      flex: 1 1 auto;
      gap: 2px;
      min-width: 0;
      background: rgba(255, 255, 255, 0.14);
    }
    .scheme-color-swatches .swatch {
      flex: 1 1 0;
      min-height: 52px;
      aspect-ratio: auto;
      border: 0;
      border-radius: 0;
    }
    .swatch {
      position: relative;
      display: flex;
      flex: 1 1 0;
      align-items: flex-end;
      justify-content: flex-start;
      width: 100%;
      min-width: 0;
      min-height: 36px;
      aspect-ratio: 1;
      margin: 0;
      padding: 4px;
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box;
      cursor: pointer;
      font: 600 9px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: inherit;
    }
    .swatch:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 1px;
    }
    .swatch[data-in-palette='true']::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
    }
    .swatch-hex {
      opacity: 0.85;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .scale-label {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 3.5rem;
      width: 3.5rem;
      min-width: 3.5rem;
      color: var(--gm-muted, rgba(242, 238, 252, 0.55));
      font-size: 10px;
      box-sizing: border-box;
      padding: 4px;
      border-radius: 2px;
      text-align: right;
    }
  `;

  constructor() {
    super();
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
    this.mode = 'copy';
    this.colorFormat = 'hsl';
    this.showValues = true;
    this.palette = [];
    this.flashHex = '';
    this.flashLabel = '';
  }

  render() {
    const board = buildSwatchBoard(this.baseColor, this.scheme);
    const cellsFor = (scale) => board.cells.filter((cell) => cell.scale === scale);
    const extremeFor = (scale) => cellsFor(scale)[0];
    const copyMode = this.mode === 'copy';
    return html`
      <div class="toolbar">
        <span class="swatch-mode-label">Click:</span>
        <div class="swatch-mode" role="group" aria-label="Swatch click mode">
          <button
            type="button"
            class="swatch-mode-option"
            aria-pressed=${this.mode === 'base'}
            @click=${() => this._setMode('base')}
          >Apply to Base Colors</button>
          <button
            type="button"
            class="swatch-mode-option"
            aria-pressed=${copyMode}
            @click=${() => this._setMode('copy')}
          >Copy</button>
          <button
            type="button"
            class="swatch-mode-option"
            aria-pressed=${this.mode === 'palette'}
            @click=${() => this._setMode('palette')}
          >Add to Palette</button>
        </div>
        <label class="values-toggle">
          <input
            type="checkbox"
            role="switch"
            .checked=${this.showValues}
            aria-label="Show color values in swatches"
            @change=${(event) => this._setShowValues(event.target.checked)}
          />
          <span class="values-switch" aria-hidden="true"></span>
          <span>Show values</span>
        </label>
        <p class="hint">
          ${this.mode === 'base'
            ? 'Click a tint, shade, or tone to apply that treatment to every scheme color.'
            : copyMode
            ? `Click a swatch to copy its ${this.colorFormat === 'hex' ? 'hex' : this.colorFormat.toUpperCase()} value. Tint, shade, and tone keep some of the base hue; white, black, and gray sit in the row below.`
            : 'Click a swatch to add it to your palette below Export. Duplicates are skipped.'}
        </p>
      </div>
      <div class="scales-grid">
        <div class="scale scheme-colors">
          <span class="scale-label base-colors">Base<br />Colors</span>
          <div class="scheme-color-swatches">
            ${cellsFor('colors').map((cell) => this._cell(cell))}
          </div>
        </div>
        <div class="scale">
          <span
            class="scale-label"
            style="background:${extremeFor('white').hex};color:${swatchInk(extremeFor('white').hex)}"
          >Tint</span>
          ${cellsFor('tint').map((cell) => this._cell(cell))}
        </div>
        <div class="scale">
          <span
            class="scale-label"
            style="background:${extremeFor('black').hex};color:${swatchInk(extremeFor('black').hex)}"
          >Shade</span>
          ${cellsFor('shade').map((cell) => this._cell(cell))}
        </div>
        <div class="scale">
          <span
            class="scale-label"
            style="background:${extremeFor('gray').hex};color:${swatchInk(extremeFor('gray').hex)}"
          >Tone</span>
          ${cellsFor('tone').map((cell) => this._cell(cell))}
        </div>
      </div>
    `;
  }

  _cell(cell) {
    const ink = swatchInk(cell.hex);
    const hex = cell.hex.toLowerCase();
    const label = formatColorValue(hex, this.colorFormat);
    const flashing = this.flashHex === hex;
    const inPalette = (this.palette || []).includes(hex);
    return html`
      <button
        type="button"
        class="swatch"
        data-in-palette=${inPalette}
        style="background:${cell.hex};color:${ink}"
        title=${`${cell.scale} ${label}`}
        @click=${() => this._onSwatch(cell)}
      >
        ${this.showValues
          ? html`<span class="swatch-hex">${flashing ? this.flashLabel : label}</span>`
          : ''}
      </button>
    `;
  }

  _setMode(mode) {
    this.dispatchEvent(
      new CustomEvent('mode-change', {
        detail: { mode },
        bubbles: true,
        composed: true,
      })
    );
  }

  _setShowValues(showValues) {
    this.dispatchEvent(
      new CustomEvent('values-change', {
        detail: { showValues },
        bubbles: true,
        composed: true,
      })
    );
  }

  async _onSwatch(cell) {
    const hex = cell.hex.toLowerCase();
    if (this.mode === 'base') {
      this.dispatchEvent(
        new CustomEvent('base-color-change', {
          detail: {
            baseColor: hex,
            scale: cell.scale,
            step: cell.step,
          },
          bubbles: true,
          composed: true,
        })
      );
      this._flash(hex, 'applied');
      return;
    }
    if (this.mode === 'palette') {
      const already = (this.palette || []).includes(hex);
      this.dispatchEvent(
        new CustomEvent('palette-add', {
          detail: { hex },
          bubbles: true,
          composed: true,
        })
      );
      this._flash(hex, already ? 'in palette' : 'added');
      return;
    }
    try {
      await navigator.clipboard.writeText(formatColorValue(hex, this.colorFormat));
    } catch {
      /* clipboard may be denied */
    }
    this.dispatchEvent(
      new CustomEvent('hex-copied', {
        detail: { hex },
        bubbles: true,
        composed: true,
      })
    );
    this._flash(hex, 'copied');
  }

  _flash(hex, label) {
    this.flashHex = hex;
    this.flashLabel = label;
    window.clearTimeout(this._flashTimer);
    this._flashTimer = window.setTimeout(() => {
      this.flashHex = '';
      this.flashLabel = '';
    }, 1200);
  }
}

customElements.define('color-studio-swatches', SwatchBoard);
