import { LitElement, html, css } from 'lit';
import { hexToHsl, hslToHex, schemeHslTrackStyle } from '../lib/color.js';

export class HslSliders extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }
    .hsl-sliders {
      display: grid;
      grid-template-columns: repeat(2, 50px);
      gap: 6px;
      justify-content: center;
      min-height: 160px;
    }
    .hsl-slider {
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 5px;
      justify-items: center;
      color: var(--gm-muted, rgba(242, 238, 252, 0.7));
      font: 700 9px/1 system-ui, sans-serif;
    }
    .hsl-slider-shell {
      position: relative;
      width: 50px;
      height: 150px;
    }
    .hsl-track {
      position: absolute;
      inset: 0;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 4px;
      background-image:
        linear-gradient(to top, var(--hsl-band-0-a), var(--hsl-band-0-b)),
        linear-gradient(to top, var(--hsl-band-1-a), var(--hsl-band-1-b)),
        linear-gradient(to top, var(--hsl-band-2-a), var(--hsl-band-2-b)),
        linear-gradient(to top, var(--hsl-band-3-a), var(--hsl-band-3-b));
      background-size: calc(100% / var(--hsl-band-count, 1)) 100%;
      background-position:
        calc(0 * 100% / var(--hsl-band-count, 1)) 0,
        calc(1 * 100% / var(--hsl-band-count, 1)) 0,
        calc(2 * 100% / var(--hsl-band-count, 1)) 0,
        calc(3 * 100% / var(--hsl-band-count, 1)) 0;
      background-repeat: no-repeat;
      pointer-events: none;
    }
    .hsl-slider input {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 150px;
      height: 50px;
      margin: 0;
      transform: translate(-50%, -50%) rotate(-90deg);
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      padding: 0;
      cursor: pointer;
    }
    .hsl-slider input::-webkit-slider-runnable-track {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      height: 50px;
    }
    .hsl-slider input::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 10px;
      height: 48px;
      margin: 0;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
      cursor: grab;
    }
    @media (max-width: 560px) {
      .hsl-sliders {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
        width: 100%;
        min-height: auto;
      }
      .hsl-slider-shell {
        width: 100%;
        height: 50px;
      }
      .hsl-track {
        background-image:
          linear-gradient(to right, var(--hsl-band-0-a), var(--hsl-band-0-b)),
          linear-gradient(to right, var(--hsl-band-1-a), var(--hsl-band-1-b)),
          linear-gradient(to right, var(--hsl-band-2-a), var(--hsl-band-2-b)),
          linear-gradient(to right, var(--hsl-band-3-a), var(--hsl-band-3-b));
        background-size: 100% calc(100% / var(--hsl-band-count, 1));
        background-position:
          0 calc(0 * 100% / var(--hsl-band-count, 1)),
          0 calc(1 * 100% / var(--hsl-band-count, 1)),
          0 calc(2 * 100% / var(--hsl-band-count, 1)),
          0 calc(3 * 100% / var(--hsl-band-count, 1));
      }
      .hsl-slider input {
        left: 0;
        top: 0;
        width: 100%;
        height: 50px;
        transform: none;
      }
      .hsl-slider input::-webkit-slider-runnable-track {
        width: 100%;
        height: 50px;
      }
      .hsl-slider input::-webkit-slider-thumb {
        width: 10px;
        height: 48px;
      }
    }
  `;

  constructor() {
    super();
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
  }

  render() {
    const hsl = hexToHsl(this.baseColor || '#7c3aed');
    return html`
      <div class="hsl-sliders" aria-label="Saturation and lightness">
        ${this._slider('S', 'Saturation', hsl.s, 0, 100, 's')}
        ${this._slider('L', 'Lightness', hsl.l, 8, 92, 'l')}
      </div>
    `;
  }

  _slider(shortLabel, label, value, min, max, key) {
    return html`
      <label class="hsl-slider">
        <span class="hsl-slider-shell">
          <span
            class="hsl-track"
            style=${schemeHslTrackStyle(this.baseColor, this.scheme, key)}
            aria-hidden="true"
          ></span>
          <input
            type="range"
            min=${min}
            max=${max}
            step="1"
            .value=${String(Math.round(value))}
            aria-label=${label}
            @input=${(event) => this._setHsl(key, event.target.value)}
          />
        </span>
        <span>${shortLabel}</span>
      </label>
    `;
  }

  _setHsl(key, value) {
    const hsl = hexToHsl(this.baseColor || '#7c3aed');
    this.dispatchEvent(
      new CustomEvent('color-change', {
        detail: { baseColor: hslToHex({ ...hsl, [key]: Number(value) }) },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('color-studio-sliders', HslSliders);
