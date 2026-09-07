import { LitElement, html, css } from 'lit';
import { getState, setState, subscribe, addToUserPalette, removeFromUserPalette, clearUserPalette } from '../state.js';
import { boardExport, buildSwatchBoard, formatColorValue, schemeHueHexes, swatchInk } from '../lib/color.js';
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
    colorFormat: { state: true },
    copiedKind: { state: true },
    copiedPaletteHex: { state: true },
    exportKind: { state: true },
    swatchMode: { state: true },
    userPalette: { state: true },
    themeMode: { state: true },
    themeIntensity: { state: true },
    surfaceSaturation: { state: true },
    textSaturation: { state: true },
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
      padding: 10px 10px 12px;
      border: 1px solid var(--gm-border, rgba(216, 198, 255, 0.2));
      border-radius: 10px;
      background: var(--gm-surface-raised, #211d2b);
      box-sizing: border-box;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.045),
        0 8px 24px rgba(0, 0, 0, 0.14);
    }
    .color-picker-flow > .picker-fieldset {
      background: var(--gm-surface, #1b1823);
      border-color: var(--gm-border-strong, rgba(216, 198, 255, 0.34));
    }
    .picker-group-fieldset {
      width: 100%;
    }
    .palette-maker {
      display: grid;
      gap: 12px;
    }
    .picker-fieldset legend {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 2px;
      padding: 0 8px;
      border: 1px solid var(--gm-border, rgba(216, 198, 255, 0.2));
      border-radius: 999px;
      background: var(--gm-surface, #1b1823);
      color: var(--gm-text, #f2eefc);
      font: 650 11px/1.2 system-ui, sans-serif;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .color-picker-flow > .picker-fieldset > legend {
      border-color: var(--gm-border-strong, rgba(216, 198, 255, 0.34));
      background: var(--gm-surface-raised, #211d2b);
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
      gap: 12px 16px;
      margin: 0 0 16px;
    }
    .current-colors {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1 1 220px;
    }
    .current-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .current-swatch {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex: 0 0 auto;
    }
    .value-format {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.18);
      flex: 0 0 auto;
      margin-left: auto;
    }
    .value-format-option {
      border: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 8px 12px;
      font: 650 11px/1.2 system-ui, sans-serif;
    }
    .value-format-option:last-child {
      border-right: 0;
    }
    .value-format-option[aria-pressed='true'] {
      color: var(--gm-text, #f2eefc);
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
      box-shadow: inset 0 -2px 0 var(--gm-accent, #7c3aed);
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
      background: var(--gm-surface-inset, #100e15);
      border: 1px solid var(--gm-border, rgba(216, 198, 255, 0.2));
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
      width: 118px;
      min-height: 56px;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      box-sizing: border-box;
      font: 650 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
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
    this.colorFormat = initial.colorFormat;
    this.copiedKind = '';
    this.copiedPaletteHex = '';
    this.exportKind = 'css';
    this.swatchMode = initial.swatchMode;
    this.userPalette = [...initial.userPalette];
    this.themeMode = initial.themeMode;
    this.themeIntensity = initial.themeIntensity;
    this.surfaceSaturation = initial.surfaceSaturation;
    this.textSaturation = initial.textSaturation;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsub = subscribe((next) => {
      this.scheme = next.scheme;
      this.baseColor = next.baseColor;
      this.colorFormat = next.colorFormat;
      this.swatchMode = next.swatchMode;
      this.userPalette = next.userPalette;
      this.themeMode = next.themeMode;
      this.themeIntensity = next.themeIntensity;
      this.surfaceSaturation = next.surfaceSaturation;
      this.textSaturation = next.textSaturation;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  render() {
    const schemeHexes = schemeHueHexes(this.baseColor, this.scheme);
    const board = buildSwatchBoard(this.baseColor, this.scheme);
    const exported = boardExport(board);
    const exportSource = this.exportKind === 'hex' ? exported.hexLines : exported.css;
    const exportText = this._formattedExport(exportSource);

    return html`
      <h1>Color Studio</h1>
      <p class="lede">
        Pick a harmony, a hue, then saturation and lightness. Use the tint, shade, and tone
        board for art and design direction.
      </p>

      <div class="current">
        <div class="current-colors">
          ${schemeHexes.map((hex, index) => html`
            <div class="current-chip">
              <span class="current-swatch" style="background:${hex}"></span>
              <button type="button" @click=${() => this._copy(formatColorValue(hex, this.colorFormat), `base-${index}`)}>
                ${this.copiedKind === `base-${index}` ? 'copied' : formatColorValue(hex, this.colorFormat)}
              </button>
            </div>
          `)}
        </div>
        <div class="value-format" role="group" aria-label="Color value format">
          ${['hsl', 'hex', 'rgb'].map((format) => html`
            <button
              type="button"
              class="value-format-option"
              aria-pressed=${this.colorFormat === format}
              @click=${() => setState({ colorFormat: format })}
            >${format === 'hsl' ? 'HSL' : format === 'hex' ? 'Hex' : 'RGB'}</button>
          `)}
        </div>
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
            color-format=${this.colorFormat}
            .palette=${this.userPalette}
            @mode-change=${this._onSwatchMode}
            @palette-add=${this._onPaletteAdd}
            @base-color-change=${this._onBaseColorChange}
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
          <pre class="export-preview" aria-label="Palette export">${this._colorizeExport(exportSource)}</pre>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset user-palette">
          <legend>User palette</legend>
          <div class="export-actions">
            <button
              type="button"
              ?disabled=${this.userPalette.length === 0}
              @click=${() => this._copy(this.userPalette.map((hex) => formatColorValue(hex, this.colorFormat)).join('\n'), 'user-palette')}
            >${this.copiedKind === 'user-palette' ? 'copied' : 'Copy list'}</button>
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
                      title=${`Copy ${formatColorValue(hex, this.colorFormat)}`}
                      @click=${() => this._copyPaletteChip(hex)}
                    >${this.copiedPaletteHex === hex ? 'copied' : formatColorValue(hex, this.colorFormat)}</button>
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
        <fieldset class="picker-fieldset picker-group-fieldset palette-maker">
          <legend>Web Page Color Palette Maker</legend>
          <fieldset class="picker-fieldset">
            <legend>Tone</legend>
            <color-studio-tone
              theme-mode=${this.themeMode}
              base-color=${this.baseColor}
              scheme=${this.scheme}
              .themeIntensity=${this.themeIntensity}
              .surfaceSaturation=${this.surfaceSaturation}
              .textSaturation=${this.textSaturation}
              @tone-change=${this._onTone}
              @intensity-change=${this._onIntensity}
              @surface-saturation-change=${this._onSurfaceSaturation}
              @text-saturation-change=${this._onTextSaturation}
            ></color-studio-tone>
          </fieldset>
          <fieldset class="picker-fieldset">
            <legend>Live Preview</legend>
            <color-studio-preview
              base-color=${this.baseColor}
              scheme=${this.scheme}
              theme-mode=${this.themeMode}
              .themeIntensity=${this.themeIntensity}
              .surfaceSaturation=${this.surfaceSaturation}
              .textSaturation=${this.textSaturation}
            ></color-studio-preview>
          </fieldset>
        </fieldset>
        <fieldset class="picker-fieldset picker-group-fieldset">
          <legend>Export Preview</legend>
          <color-studio-role-export
            base-color=${this.baseColor}
            scheme=${this.scheme}
            theme-mode=${this.themeMode}
            .themeIntensity=${this.themeIntensity}
            .surfaceSaturation=${this.surfaceSaturation}
            .textSaturation=${this.textSaturation}
            color-format=${this.colorFormat}
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

  _onSurfaceSaturation(event) {
    setState({ surfaceSaturation: event.detail.surfaceSaturation });
  }

  _onTextSaturation(event) {
    setState({ textSaturation: event.detail.textSaturation });
  }

  _onSwatchMode(event) {
    setState({ swatchMode: event.detail.mode });
  }

  _onPaletteAdd(event) {
    addToUserPalette(event.detail.hex);
  }

  _onBaseColorChange(event) {
    setState({ baseColor: event.detail.baseColor, swatchMode: 'base' });
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

  /** Wrap each color so it renders in that color, using the active value format. */
  _colorizeExport(text) {
    return text.split(/(#[0-9a-fA-F]{6})/g).map((part) => {
      if (/^#[0-9a-fA-F]{6}$/.test(part)) {
        return html`<span class="export-hex" style="color:${part}">${formatColorValue(part, this.colorFormat)}</span>`;
      }
      return part;
    });
  }

  _formattedExport(text) {
    return text.replace(/#[0-9a-fA-F]{6}/g, (hex) => formatColorValue(hex, this.colorFormat));
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
    await this._copy(formatColorValue(hex, this.colorFormat), 'user-chip');
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
