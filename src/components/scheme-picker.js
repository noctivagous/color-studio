import { LitElement, html, css } from 'lit';
import { SCHEMES } from '../lib/color.js';

export class SchemePicker extends LitElement {
  static properties = {
    scheme: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }
    .scheme-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
      gap: 6px;
      align-content: start;
      width: 100%;
      min-width: 0;
      margin: 0;
    }
    .scheme-option {
      padding: 8px 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: 650 11px/1.2 system-ui, sans-serif;
    }
    .scheme-option[aria-pressed='true'] {
      color: var(--gm-text, #f2eefc);
      background: var(--gm-accent-soft, rgba(124, 58, 237, 0.28));
      box-shadow: inset 0 -2px 0 var(--gm-accent, #7c3aed);
    }
  `;

  constructor() {
    super();
    this.scheme = 'analog';
  }

  render() {
    return html`
      <div class="scheme-options" role="group" aria-label="Scheme">
        ${SCHEMES.map(
          (scheme) => html`
            <button
              type="button"
              class="scheme-option"
              aria-pressed=${this.scheme === scheme.id}
              @click=${() => this._select(scheme.id)}
            >
              ${scheme.label}
            </button>
          `
        )}
      </div>
    `;
  }

  _select(scheme) {
    this.dispatchEvent(
      new CustomEvent('scheme-change', {
        detail: { scheme },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('color-studio-schemes', SchemePicker);
