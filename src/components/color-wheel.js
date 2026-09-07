import { LitElement, html, css } from 'lit';
import { hexToHsl, hslToHex, hueRingHex, accentHueOffsets } from '../lib/color.js';

export class ColorWheel extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 160px;
      height: 160px;
      position: relative;
      user-select: none;
    }
    .wheel {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: none;
      position: relative;
      cursor: crosshair;
      touch-action: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .wheel::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        #ff0000,
        #ffff00,
        #00ff00,
        #00ffff,
        #0000ff,
        #ff00ff,
        #ff0000
      );
      -webkit-mask-image: radial-gradient(closest-side, transparent 74%, #000 75.5%);
      mask-image: radial-gradient(closest-side, transparent 74%, #000 75.5%);
      pointer-events: none;
    }
    .wheel::after {
      content: '';
      position: absolute;
      inset: 20px;
      background: transparent;
      border-radius: 50%;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }
    .handle {
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-radius: 50%;
      background: var(--current-color, #fff);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 2;
    }
    .accent-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    }
  `;

  constructor() {
    super();
    this.baseColor = '#7c3aed';
    this.scheme = 'analog';
  }

  render() {
    const { h } = hexToHsl(this.baseColor || '#7c3aed');
    const radius = 60;
    const mainPos = this._getPos(h, radius + 10);
    const offsets = accentHueOffsets(this.scheme);
    const ringColor = hueRingHex(h);

    return html`
      <div
        class="wheel"
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerUp}
        style="--current-color: ${ringColor}"
      >
        <div
          class="handle"
          style="transform: translate(calc(-50% + ${mainPos.x}px), calc(-50% + ${mainPos.y}px))"
        ></div>
        ${offsets.map((offset) => {
          const accentPos = this._getPos(h + offset, radius);
          const accentColor = hueRingHex(h + offset);
          return html`
            <div
              class="accent-dot"
              style="
                background: ${accentColor};
                transform: translate(calc(-50% + ${accentPos.x}px), calc(-50% + ${accentPos.y}px))
              "
            ></div>
          `;
        })}
      </div>
    `;
  }

  _getPos(hue, radius) {
    const rad = ((hue - 90) * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  }

  _onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    this._updateHue(event);
  }

  _onPointerMove(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    this._updateHue(event);
  }

  _onPointerUp(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  _updateHue(e) {
    const wheel = this.renderRoot.querySelector('.wheel');
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    const hsl = hexToHsl(this.baseColor || '#7c3aed');
    this.dispatchEvent(
      new CustomEvent('color-change', {
        detail: { baseColor: hslToHex({ ...hsl, h: angle }) },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('color-studio-wheel', ColorWheel);
