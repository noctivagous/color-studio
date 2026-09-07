import { LitElement, html, css } from 'lit';
import { getState, setState, subscribe, addToUserPalette, removeFromUserPalette, clearUserPalette } from '../state.js';
import { boardExport, buildSwatchBoard, hexToHsl, swatchInk } from '../lib/color.js';
import './scheme-picker.js';
import './color-wheel.js';
import './hsl-sliders.js';
import './swatch-board.js';
import './tone-picker.js';
import './live-preview.js';
import './export-preview.js';

function flowArrow() {
  return html`
    <span class="picker-flow-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
        <path
          d="M5 12h12m0 0-5-5m5 5-5 5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  `;
}

function legend(step, label) {
  return html`
    <legend>
      <span class="picker-step-index">${step}</span>
      ${label}
    </legend>
  `;
}

export class ColorStudioApp extends LitElement {
  static properties = {
    scheme: { state: true },
    baseColor: { state: true },
    copiedKind: { state: true },
    copiedPaletteHex: { state: true },
    exportKind: { state: true },
    swatchMode: { state: true },
    userPalette: { state: true },
    themeMode: { state: true },
    themeIntensity: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      max-width: 1040px;
      margin: 0 auto;
      padding: 24px 20px 48px;
      color: var(--gm-text, #f2eefc);
    }
    h1 {
      margin: 0 0 6px;
      font: 700 22px/1.2 system-ui, sans-serif;
    }
    .lede {
      margin: 0 0 20px;
      max-width: 52em;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      font: 13px/1.45 system-ui, sans-serif;
    }
    .color-picker-flow {
      display: grid;
      gap: 12px;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
    .color-picker-pipeline {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 6px;
      align-items: stretch;
      width: 100%;
      min-width: 0;
    }
    .picker-fieldset {
      margin: 0;
      min-width: 0;
      padding: 8px 8px 10px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.18);
      box-sizing: border-box;
    }
    .picker-group-fieldset {
      width: 100%;
    }
    .picker-fieldset legend {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 6px;
      color: var(--gm-text, #f2eefc);
      font: 650 11px/1.2 system-ui, sans-serif;
      letter-spacing: 0.02em;
    }
    .picker-step-index {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--gm-accent, #7c3aed);
      color: #fff;
      font: 700 9px/1 system-ui, sans-serif;
    }
    .scheme-fieldset {
      flex: 1 1 140px;
      align-self: stretch;
    }
    .hue-fieldset {
      display: grid;
      flex: 0 0 auto;
      justify-items: center;
      align-content: center;
      gap: 8px;
      width: max-content;
      align-self: stretch;
    }
    .hue-fieldset color-studio-wheel {
      width: 160px;
    }
    .hue-caption {
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      font: 700 9px/1 system-ui, sans-serif;
      letter-spacing: 0.04em;
    }
    .hsl-fieldset {
      display: grid;
      flex: 0 0 auto;
      justify-items: center;
      align-content: center;
      width: max-content;
      align-self: stretch;
    }
    .picker-flow-arrow {
      display: grid;
      flex: 0 0 auto;
      align-self: stretch;
      place-items: center;
      width: 16px;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
    }
    .picker-flow-arrow svg {
      display: block;
    }
    .current {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin: 0 0 16px;
    }
    .current-swatch {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .current button,
    .export-actions button {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: inherit;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font: 650 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .current button:hover,
    .export-actions button:hover {
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
    }
    .export-actions button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .export-actions button[aria-pressed='true'] {
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
      box-shadow: inset 0 -2px 0 var(--gm-accent, #7c3aed);
    }
    .pipeline-hint {
      margin: 8px 0 0;
      color: var(--gm-muted, rgba(242, 238, 252, 0.62));
      font: 10px/1.35 system-ui, sans-serif;
    }
    .export {
      display: grid;
      gap: 8px;
    }
    .export-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .export-preview {
      width: 100%;
      min-height: 140px;
      max-height: 320px;
      overflow: auto;
      box-sizing: border-box;
      margin: 0;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: var(--gm-muted, rgba(242, 238, 252, 0.75));
      font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
      padding: 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .export-hex {
      font-weight: 700;
      text-shadow:
        0 0 1px rgba(0, 0, 0, 0.85),
        0 0 1px rgba(255, 255, 255, 0.55);
    }
    .user-palette {
      display: grid;
      gap: 8px;
    }
    .palette-empty {
      margin: 0;
      color: var(--gm-muted, rgba(242, 238, 252, 0.62));
      font: 12px/1.4 system-ui, sans-serif;
    }
    .palette-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .palette-chip {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: 72px;
      min-height: 56px;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      box-sizing: border-box;
      font: 650 10px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .palette-copy {
      flex: 1;
      display: flex;
      align-items: flex-end;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      text-align: left;
    }
    .palette-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      cursor: pointer;
      font: 700 12px/18px system-ui, sans-serif;
    }
    .palette-remove:hover {
      background: rgba(0, 0, 0, 0.7);
    }
    .status {
      min-height: 1.2em;
      margin: 0;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      font: 11px/1.3 system-ui, sans-serif;
    }
  `;

  constructor() {
    super();
    const initial = getState();
    this.scheme = initial.scheme;
    this.baseColor = initial.baseColor;
    this.copiedKind = '';
    this.copiedPaletteHex = '';
    this.exportKind = 'css';
    this.swatchMode = initial.swatchMode;
    this.userPalette = [...initial.userPalette];
    this.themeMode = initial.themeMode;
    this.themeIntensity = initial.themeIntensity;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsub = subscribe((next) => {
      this.scheme = next.scheme;
      this.baseColor = next.baseColor;
      this.swatchMode = next.swatchMode;
      this.userPalette = next.userPalette;
      this.themeMode = next.themeMode;
      this.themeIntensity = next.themeIntensity;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  render() {
    const hsl = hexToHsl(this.baseColor);
    const board = buildSwatchBoard(this.baseColor, this.scheme);
    const exported = boardExport(board);
    const exportText = this.exportKind === 'hex' ? exported.hexLines : exported.css;

    return html`
      <h1>Color Studio</h1>
      <p class="lede">
        Pick a harmony, a hue, then saturation and lightness. Use the tint, shade, and tone
        board for art and design direction. Nothing here talks to gMixer.
      </p>

      <div class="current">
        <span class="current-swatch" style="background:${this.baseColor}"></span>
        <button type="button" @click=${() => this._copy(this.baseColor, 'base')}>
          ${this.copiedKind === 'base' ? 'copied' : this.baseColor}
        </button>
        <span class="status">H ${Math.round(hsl.h)} · S ${Math.round(hsl.s)} · L ${Math.round(hsl.l)}</span>
      </div>

      <div class="color-picker-flow" aria-label="Color scheme pipeline">
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Pick base colors</legend>
          <div class="color-picker-pipeline">
            <fieldset class="picker-fieldset scheme-fieldset">
              ${legend(1, 'Scheme')}
              <color-studio-schemes
                scheme=${this.scheme}
                @scheme-change=${this._onScheme}
              ></color-studio-schemes>
            </fieldset>
            ${flowArrow()}
            <fieldset class="picker-fieldset hue-fieldset">
              ${legend(2, 'Hue')}
              <color-studio-wheel
                base-color=${this.baseColor}
                scheme=${this.scheme}
                @color-change=${this._onColor}
              ></color-studio-wheel>
              <span class="hue-caption">Hue</span>
            </fieldset>
            ${flowArrow()}
            <fieldset class="picker-fieldset hsl-fieldset">
              ${legend(3, 'Saturation & Lightness')}
              <color-studio-sliders
                base-color=${this.baseColor}
                scheme=${this.scheme}
                @color-change=${this._onColor}
              ></color-studio-sliders>
            </fieldset>
          </div>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Tint, shade, tone</legend>
          <color-studio-swatches
            base-color=${this.baseColor}
            scheme=${this.scheme}
            mode=${this.swatchMode}
            .palette=${this.userPalette}
            @mode-change=${this._onSwatchMode}
            @palette-add=${this._onPaletteAdd}
            @hex-copied=${() => this._flash('swatch')}
          ></color-studio-swatches>
        </fieldset>
        <p class="pipeline-hint">
          Pipeline: scheme, then hue, then saturation and lightness. Hue and S/L recolor the
          boxes without changing the scheme.
        </p>
        <fieldset class="picker-fieldset picker-group-fieldset export">
          <legend>Export</legend>
          <div class="export-actions">
            <button type="button" aria-pressed=${this.exportKind === 'css'} @click=${() => this._setExportKind('css')}>CSS variables</button>
            <button type="button" aria-pressed=${this.exportKind === 'hex'} @click=${() => this._setExportKind('hex')}>Hex list</button>
            <button type="button" @click=${() => this._copy(exportText, 'export')}>
              ${this.copiedKind === 'export' ? 'copied' : 'Copy'}
            </button>
          </div>
          <pre class="export-preview" aria-label="Palette export">${this._colorizeExport(exportText)}</pre>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset user-palette">
          <legend>User palette</legend>
          <div class="export-actions">
            <button
              type="button"
              ?disabled=${this.userPalette.length === 0}
              @click=${() => this._copy(this.userPalette.join('\n'), 'user-palette')}
            >${this.copiedKind === 'user-palette' ? 'copied' : 'Copy hex list'}</button>
            <button
              type="button"
              ?disabled=${this.userPalette.length === 0}
              @click=${() => clearUserPalette()}
            >Clear</button>
          </div>
          ${this.userPalette.length === 0
            ? html`<p class="palette-empty">Switch swatches to Add to Palette, then click colors to collect them here.</p>`
            : html`<div class="palette-chips">
                ${this.userPalette.map((hex) => html`
                  <div
                    class="palette-chip"
                    style="background:${hex};color:${swatchInk(hex)}"
                  >
                    <button
                      type="button"
                      class="palette-copy"
                      title=${`Copy ${hex}`}
                      @click=${() => this._copyPaletteChip(hex)}
                    >${this.copiedPaletteHex === hex ? 'copied' : hex}</button>
                    <button
                      type="button"
                      class="palette-remove"
                      aria-label=${`Remove ${hex}`}
                      @click=${() => removeFromUserPalette(hex)}
                    >×</button>
                  </div>
                `)}
              </div>`}
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Tone</legend>
          <color-studio-tone
            theme-mode=${this.themeMode}
            theme-intensity=${this.themeIntensity}
            @tone-change=${this._onTone}
            @intensity-change=${this._onIntensity}
          ></color-studio-tone>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Live Preview</legend>
          <color-studio-preview
            base-color=${this.baseColor}
            scheme=${this.scheme}
            theme-mode=${this.themeMode}
            theme-intensity=${this.themeIntensity}
          ></color-studio-preview>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Export Preview</legend>
          <color-studio-role-export
            base-color=${this.baseColor}
            scheme=${this.scheme}
            theme-mode=${this.themeMode}
            theme-intensity=${this.themeIntensity}
          ></color-studio-role-export>
        </fieldset>
      </div>
    `;
  }

  _onTone(event) {
    setState({ themeMode: event.detail.themeMode });
  }

  _onIntensity(event) {
    setState({ themeIntensity: event.detail.themeIntensity });
  }

  _onSwatchMode(event) {
    setState({ swatchMode: event.detail.mode });
  }

  _onPaletteAdd(event) {
    addToUserPalette(event.detail.hex);
  }

  _onScheme(event) {
    setState({ scheme: event.detail.scheme });
  }

  _onColor(event) {
    setState({ baseColor: event.detail.baseColor });
  }

  _setExportKind(kind) {
    this.exportKind = kind;
  }

  /** Wrap each #rrggbb so it renders in that color. */
  _colorizeExport(text) {
    return text.split(/(#[0-9a-fA-F]{6})/g).map((part) => {
      if (/^#[0-9a-fA-F]{6}$/.test(part)) {
        return html`<span class="export-hex" style="color:${part}">${part}</span>`;
      }
      return part;
    });
  }

  _flash(kind) {
    this.copiedKind = kind;
    window.clearTimeout(this._statusTimer);
    this._statusTimer = window.setTimeout(() => {
      this.copiedKind = '';
      this.copiedPaletteHex = '';
    }, 1200);
  }

  async _copyPaletteChip(hex) {
    this.copiedPaletteHex = hex;
    await this._copy(hex, 'user-chip');
  }

  async _copy(text, kind) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    this._flash(kind);
  }
}

customElements.define('color-studio-app', ColorStudioApp);
