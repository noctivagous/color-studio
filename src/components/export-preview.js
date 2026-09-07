import { LitElement, html, css } from 'lit';
import { buildPalette, formatColorValue, roleCssExport } from '../lib/color.js';

export class ExportPreview extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
    themeMode: { type: String, attribute: 'theme-mode' },
    themeIntensity: { type: Number, attribute: 'theme-intensity' },
    surfaceSaturation: { type: Number, attribute: 'surface-saturation' },
    textSaturation: { type: Number, attribute: 'text-saturation' },
    colorFormat: { type: String, attribute: 'color-format' },
    copied: { state: true },
  };

  static styles = css`
    :host {
      display: grid;
      gap: 8px;
    }
    .export-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .export-actions button {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: inherit;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font: 650 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .export-actions button:hover {
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
    }
    .export-preview {
      width: 100%;
      min-height: 160px;
      max-height: 420px;
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
    .hint {
      margin: 0;
      color: var(--gm-muted, rgba(242, 238, 252, 0.62));
      font: 10px/1.35 system-ui, sans-serif;
    }
  `;

  constructor() {
    super();
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
    this.themeMode = 'dark';
    this.themeIntensity = 0.5;
    this.surfaceSaturation = 0.4;
    this.textSaturation = 0.35;
    this.colorFormat = 'hsl';
    this.copied = false;
  }

  render() {
    const palette = buildPalette(
      this.baseColor,
      this.scheme,
      this.themeMode,
      this.themeIntensity,
      this.surfaceSaturation,
      this.textSaturation
    );
    const cssText = roleCssExport(palette);
    const copyText = cssText.replace(/#[0-9a-fA-F]{6}/g, (hex) =>
      formatColorValue(hex, this.colorFormat)
    );
    return html`
      <p class="hint">
        CSS custom properties assigned to headers, body, links, GUI, and captions for this Tone.
      </p>
      <div class="export-actions">
        <button type="button" @click=${() => this._copy(copyText)}>
          ${this.copied ? 'copied' : 'Copy CSS'}
        </button>
      </div>
      <pre class="export-preview" aria-label="Role CSS export">${this._colorize(cssText)}</pre>
    `;
  }

  _colorize(text) {
    return text.split(/(#[0-9a-fA-F]{6})/g).map((part) => {
      if (/^#[0-9a-fA-F]{6}$/.test(part)) {
        return html`<span class="export-hex" style="color:${part}">${formatColorValue(part, this.colorFormat)}</span>`;
      }
      return part;
    });
  }

  async _copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    this.copied = true;
    window.clearTimeout(this._copyTimer);
    this._copyTimer = window.setTimeout(() => {
      this.copied = false;
    }, 1200);
  }
}

customElements.define('color-studio-role-export', ExportPreview);
