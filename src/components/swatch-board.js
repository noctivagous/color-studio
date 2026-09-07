import { LitElement, html, css } from 'lit';
import { buildSwatchBoard, swatchInk } from '../lib/color.js';

export class SwatchBoard extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
    mode: { type: String },
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.18);
      min-width: min(100%, 280px);
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
      gap: 8px;
    }
    .scheme-color-swatches {
      display: flex;
      flex: 1 1 auto;
      gap: 1px;
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
      min-width: 3.5rem;
      color: var(--gm-muted, rgba(242, 238, 252, 0.55));
      font-size: 10px;
    }
    .scale-label.base-colors {
      line-height: 1.15;
      text-align: right;
    }
  `;

  constructor() {
    super();
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
    this.mode = 'copy';
    this.palette = [];
    this.flashHex = '';
    this.flashLabel = '';
  }

  render() {
    const board = buildSwatchBoard(this.baseColor, this.scheme);
    const cellsFor = (scale) => board.cells.filter((cell) => cell.scale === scale);
    const copyMode = this.mode !== 'palette';
    return html`
      <div class="toolbar">
        <div class="swatch-mode" role="group" aria-label="Swatch click mode">
          <button
            type="button"
            class="swatch-mode-option"
            aria-pressed=${copyMode}
            @click=${() => this._setMode('copy')}
          >Copy</button>
          <button
            type="button"
            class="swatch-mode-option"
            aria-pressed=${!copyMode}
            @click=${() => this._setMode('palette')}
          >Add to Palette</button>
        </div>
        <p class="hint">
          ${copyMode
            ? 'Click a swatch to copy its hex. Tint mixes toward white, shade toward black, tone desaturates.'
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
          <span class="scale-label">Tint</span>
          ${cellsFor('tint').map((cell) => this._cell(cell))}
        </div>
        <div class="scale">
          <span class="scale-label">Shade</span>
          ${cellsFor('shade').map((cell) => this._cell(cell))}
        </div>
        <div class="scale">
          <span class="scale-label">Tone</span>
          ${cellsFor('tone').map((cell) => this._cell(cell))}
        </div>
      </div>
    `;
  }

  _cell(cell) {
    const ink = swatchInk(cell.hex);
    const hex = cell.hex.toLowerCase();
    const flashing = this.flashHex === hex;
    const inPalette = (this.palette || []).includes(hex);
    return html`
      <button
        type="button"
        class="swatch"
        data-in-palette=${inPalette}
        style="background:${cell.hex};color:${ink}"
        title=${`${cell.scale} ${cell.hex}`}
        @click=${() => this._onSwatch(hex)}
      >
        <span class="swatch-hex">${flashing ? this.flashLabel : cell.hex}</span>
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

  async _onSwatch(hex) {
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
      await navigator.clipboard.writeText(hex);
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
