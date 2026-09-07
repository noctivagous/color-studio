import { LitElement, html, css } from 'lit';
import { THEME_MODES } from '../lib/theme-modes.js';
import { grayHexFromLightness, normalizeThemeIntensity, toneBand } from '../lib/tone-canvas.js';

export class TonePicker extends LitElement {
  static properties = {
    themeMode: { type: String, attribute: 'theme-mode' },
    themeIntensity: { type: Number, attribute: 'theme-intensity' },
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
  }

  render() {
    const intensity = normalizeThemeIntensity(this.themeIntensity);
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
        <p class="hint">
          Light through Dark sets the preview surface direction. Intensity moves within that tone.
          The hue wheel is unchanged.
        </p>
      </div>
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
}

customElements.define('color-studio-tone', TonePicker);
