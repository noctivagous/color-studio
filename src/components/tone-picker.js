import { LitElement, html, css } from 'lit';
import { THEME_MODES } from '../lib/theme-modes.js';
import { grayHexFromLightness, normalizeThemeIntensity, toneBand } from '../lib/tone-canvas.js';
import { buildPalette, hexToHsl, hslToHex, schemeSliderHues } from '../lib/color.js';

export class TonePicker extends LitElement {
  static properties = {
    themeMode: { type: String, attribute: 'theme-mode' },
    themeIntensity: { type: Number, attribute: 'theme-intensity' },
    surfaceSaturation: { type: Number, attribute: 'surface-saturation' },
    textSaturation: { type: Number, attribute: 'text-saturation' },
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }
    .mode-picker {
      display: grid;
      gap: 8px;
    }
    .field-label {
      font-size: 11px;
      opacity: 0.75;
    }
    .tone-segments {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      overflow: hidden;
      border: 1px solid var(--gm-border, rgba(255, 255, 255, 0.15));
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.18);
    }
    .tone-segment {
      display: grid;
      gap: 4px;
      align-content: center;
      justify-items: center;
      min-height: 56px;
      margin: 0;
      padding: 8px 4px;
      border: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0;
      background: transparent;
      color: var(--gm-muted, rgba(242, 238, 252, 0.65));
      cursor: pointer;
      box-sizing: border-box;
      text-align: center;
    }
    .tone-segment:last-child {
      border-right: 0;
    }
    .tone-segment:hover {
      background: rgba(139, 92, 246, 0.1);
    }
    .tone-segment:focus-visible {
      z-index: 1;
      outline: 2px solid var(--gm-accent, #8b5cf6);
      outline-offset: -2px;
    }
    .tone-segment[aria-pressed='true'] {
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
      box-shadow: inset 0 -2px 0 var(--gm-accent, #7c3aed);
      color: var(--gm-text, #f2eefc);
    }
    .tone-name {
      font: 650 11px/1.1 system-ui, sans-serif;
      letter-spacing: 0.01em;
    }
    .tone-caption {
      max-width: 11ch;
      font: 10px/1.25 system-ui, sans-serif;
      opacity: 0.72;
    }
    .tone-preview-swatches {
      display: flex;
      width: 100%;
      height: 8px;
      gap: 2px;
      margin-top: 2px;
    }
    .tone-preview-swatch {
      flex: 1 1 0;
      min-width: 0;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 2px;
    }
    .grayscale-control {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .grayscale-control-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      opacity: 0.8;
    }
    .grayscale-control input[type='range'] {
      width: 100%;
      padding: 0;
      background: transparent;
      border: 0;
    }
    .grayscale-track {
      height: 8px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
    }
    .scheme-saturation-control {
      display: grid;
      gap: 6px;
      width: 100%;
    }
    .scheme-saturation-track {
      position: relative;
      display: grid;
      grid-template-columns: repeat(var(--scheme-saturation-count, 1), minmax(0, 1fr));
      height: 24px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 4px;
    }
    .scheme-saturation-preview {
      min-width: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.22);
    }
    .scheme-saturation-preview:last-of-type {
      border-right: 0;
    }
    .scheme-saturation-track input {
      position: absolute;
      inset: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      margin: 0;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      padding: 0;
      cursor: pointer;
    }
    .scheme-saturation-track input::-webkit-slider-runnable-track {
      height: 100%;
      background: transparent;
    }
    .scheme-saturation-track input::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 8px;
      height: 28px;
      margin-top: -2px;
      border: 1px solid #fff;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
    }
    .scheme-saturation-track input::-moz-range-track {
      height: 100%;
      background: transparent;
    }
    .scheme-saturation-track input::-moz-range-thumb {
      width: 8px;
      height: 28px;
      border: 1px solid #fff;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
    }
    .hint {
      margin: 0;
      font-size: 10px;
      opacity: 0.6;
    }
  `;

  constructor() {
    super();
    this.themeMode = 'dark';
    this.themeIntensity = 0.5;
    this.surfaceSaturation = 0.4;
    this.textSaturation = 0.35;
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
  }

  render() {
    const intensity = normalizeThemeIntensity(this.themeIntensity);
    const surfaceSaturation = Math.max(0, Math.min(1, Number(this.surfaceSaturation) || 0));
    const textSaturation = Math.max(0, Math.min(1, Number(this.textSaturation) || 0));
    const band = toneBand(this.themeMode);
    const intensityTrack = `background:linear-gradient(to right, ${grayHexFromLightness(band.lighter)}, ${grayHexFromLightness(band.darker)})`;
    return html`
      <div class="mode-picker">
        <span class="field-label" id="theme-mode-label">Tone</span>
        <div class="tone-segments" role="group" aria-labelledby="theme-mode-label">
          ${THEME_MODES.map(
            (mode) => html`
              <button
                type="button"
                class="tone-segment"
                aria-pressed=${mode.id === this.themeMode}
                title=${mode.description}
                @click=${() => this._setMode(mode.id)}
              >
                <span class="tone-name">${mode.label}</span>
                <span class="tone-caption">${mode.description}</span>
                ${this._renderTonePreview(
                  mode.id,
                  intensity,
                  surfaceSaturation,
                  textSaturation
                )}
              </button>
            `
          )}
        </div>
        <label class="grayscale-control">
          <span class="grayscale-control-header">
            <span>Tone intensity</span>
            <output>${Math.round(intensity * 100)}%</output>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(intensity)}
            aria-label="Tone intensity"
            @input=${(event) => this._setIntensity(event.target.value)}
          />
          <span class="grayscale-track" style=${intensityTrack} aria-hidden="true"></span>
        </label>
        ${this._renderSchemeSaturationControl('Surface saturation', surfaceSaturation, 'surface')}
        ${this._renderSchemeSaturationControl('Text saturation', textSaturation, 'text')}
        <p class="hint">
          Tone controls surface lightness. The saturation previews show every hue in the selected
          scheme; the hue wheel is unchanged.
        </p>
      </div>
    `;
  }

  _renderSchemeSaturationControl(label, value, kind) {
    const amount = Math.max(0, Math.min(1, Number(value) || 0));
    const source = hexToHsl(this.baseColor || '#7c3aed');
    const hues = schemeSliderHues(this.baseColor, this.scheme);
    const setter = kind === 'surface' ? this._setSurfaceSaturation : this._setTextSaturation;
    return html`
      <label class="scheme-saturation-control">
        <span class="grayscale-control-header">
          <span>${label}</span>
          <output>${Math.round(amount * 100)}%</output>
        </span>
        <span
          class="scheme-saturation-track"
          style="--scheme-saturation-count:${hues.length}"
        >
          ${hues.map((hue) => html`
            <span
              class="scheme-saturation-preview"
              style="background:${hslToHex({ h: hue, s: amount * 100, l: source.l })}"
              aria-hidden="true"
            ></span>
          `)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(amount)}
            aria-valuemin="0"
            aria-valuemax="1"
            aria-valuenow=${String(amount)}
            aria-label=${label}
            @input=${(event) => setter.call(this, event.target.value)}
          />
        </span>
      </label>
    `;
  }

  _renderTonePreview(mode, intensity, surfaceSaturation, textSaturation) {
    const palette = buildPalette(
      this.baseColor,
      this.scheme,
      mode,
      intensity,
      surfaceSaturation,
      textSaturation
    );
    return html`
      <span class="tone-preview-swatches" aria-label="Tone color preview">
        <span
          class="tone-preview-swatch"
          style="background:${palette.background}"
          title="Background"
        ></span>
        <span
          class="tone-preview-swatch"
          style="background:${palette.surfaceContainers}"
          title="Surface"
        ></span>
        <span
          class="tone-preview-swatch"
          style="background:${palette.text}"
          title="Text"
        ></span>
        <span
          class="tone-preview-swatch"
          style="background:${palette.accent}"
          title="Accent"
        ></span>
      </span>
    `;
  }

  _setMode(themeMode) {
    this.dispatchEvent(
      new CustomEvent('tone-change', {
        detail: { themeMode },
        bubbles: true,
        composed: true,
      })
    );
  }

  _setIntensity(value) {
    this.dispatchEvent(
      new CustomEvent('intensity-change', {
        detail: { themeIntensity: normalizeThemeIntensity(value) },
        bubbles: true,
        composed: true,
      })
    );
  }

  _setSurfaceSaturation(value) {
    this.dispatchEvent(
      new CustomEvent('surface-saturation-change', {
        detail: { surfaceSaturation: Math.max(0, Math.min(1, Number(value))) },
        bubbles: true,
        composed: true,
      })
    );
  }

  _setTextSaturation(value) {
    this.dispatchEvent(
      new CustomEvent('text-saturation-change', {
        detail: { textSaturation: Math.max(0, Math.min(1, Number(value))) },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('color-studio-tone', TonePicker);
