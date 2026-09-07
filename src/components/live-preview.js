import { LitElement, html, css } from 'lit';
import { buildPalette } from '../lib/color-theory.js';

const SAMPLE_IMAGE_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ec3ff"/>
      <stop offset="55%" stop-color="#f7c98a"/>
      <stop offset="100%" stop-color="#e07a5f"/>
    </linearGradient>
  </defs>
  <rect width="160" height="120" fill="url(#sky)"/>
  <circle cx="128" cy="28" r="16" fill="#ffe08a"/>
  <path d="M0 78 L28 52 L52 70 L78 40 L108 66 L132 50 L160 72 V120 H0 Z" fill="#3d6b4f"/>
  <path d="M0 92 L40 78 L70 88 L110 70 L160 86 V120 H0 Z" fill="#2f5540"/>
  <rect x="34" y="66" width="22" height="28" fill="#5c4033"/>
  <polygon points="34,66 45,52 56,66" fill="#8b3a2a"/>
</svg>
`.trim());

const SAMPLE_IMAGE_SRC = `data:image/svg+xml,${SAMPLE_IMAGE_SVG}`;

const NAV_BG_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" width="320" height="56" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="navSky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a5f"/>
      <stop offset="55%" stop-color="#3d5a80"/>
      <stop offset="100%" stop-color="#98c1d9"/>
    </linearGradient>
  </defs>
  <rect width="320" height="56" fill="url(#navSky)"/>
  <path d="M0 40 L36 22 L64 34 L98 14 L140 30 L178 18 L220 32 L260 20 L320 36 V56 H0 Z" fill="#243b55" opacity=".9"/>
  <path d="M0 46 L48 34 L90 42 L130 28 L180 40 L230 30 L280 38 L320 34 V56 H0 Z" fill="#1b2a41" opacity=".85"/>
  <circle cx="268" cy="14" r="7" fill="#ffe08a" opacity=".85"/>
</svg>
`.trim());

const NAV_BG_SRC = `data:image/svg+xml,${NAV_BG_SVG}`;

const UI = 'system-ui, sans-serif';

export class LivePreview extends LitElement {
  static properties = {
    baseColor: { type: String, attribute: 'base-color' },
    scheme: { type: String },
    themeMode: { type: String, attribute: 'theme-mode' },
    themeIntensity: { type: Number, attribute: 'theme-intensity' },
    surfaceSaturation: { type: Number, attribute: 'surface-saturation' },
    textSaturation: { type: Number, attribute: 'text-saturation' },
  };

  static styles = css`
    :host {
      display: block;
    }
    .theme-preview {
      position: relative;
      display: grid;
      gap: 8px;
    }
    .blurb {
      position: relative;
      display: grid;
      gap: 12px;
      padding: 12px;
      border: 1px solid transparent;
      border-radius: 8px;
      box-sizing: border-box;
    }
    .blurb-top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
    }
    .blurb-copy {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    .blurb-kicker,
    .blurb-title,
    .blurb-subhead,
    .blurb-body,
    .blurb-caption {
      margin: 0;
    }
    .blurb-kicker {
      font-size: 10px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .blurb-title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }
    .blurb-subhead {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
    }
    .blurb-body {
      font-size: 12px;
      line-height: 1.45;
    }
    .blurb-caption {
      font-size: 11px;
      line-height: 1.35;
    }
    .blurb-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin: 0;
    }
    .blurb-nav {
      position: relative;
      isolation: isolate;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 0 0 2px;
      padding: 10px 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px 6px 0 0;
      font-size: 11px;
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }
    .blurb-nav > .blurb-nav-link {
      position: relative;
      z-index: 1;
    }
    .blurb-nav-link,
    .blurb-link {
      text-decoration: underline;
      font-size: 12px;
    }
    .blurb-nav-link {
      font-size: 11px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
    }
    .blurb-code {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }
    .blurb-figure {
      margin: 0;
      display: grid;
      gap: 6px;
      width: 140px;
    }
    .blurb-image-wrap {
      display: block;
      width: 100%;
      border-radius: 4px;
    }
    .blurb-image {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: #2a2438;
    }
    .blurb-image-caption {
      margin: 0;
      font-size: 10px;
      line-height: 1.3;
      font-style: italic;
      text-align: center;
    }
    .blurb-surfaces {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 8px;
    }
    .blurb-card {
      display: grid;
      gap: 6px;
      padding: 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .blurb-card-label {
      margin: 0;
      font-size: 9px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      opacity: 0.72;
    }
    .blurb-card-title {
      margin: 0;
      font-size: 13px;
      font-weight: 650;
      line-height: 1.25;
    }
    .blurb-card-body {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .blurb-gui {
      display: grid;
      gap: 8px;
      padding: 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .blurb-gui-on-body {
      margin-top: 8px;
    }
    .blurb-gui-cluster {
      display: grid;
      gap: 8px;
    }
    .blurb-gui-label {
      margin: 0;
      font-size: 9px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      opacity: 0.72;
    }
    .blurb-field,
    .blurb-textarea,
    .blurb-button {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      margin: 0;
      padding: 6px 8px;
      border: 2px solid transparent;
      border-radius: 4px;
      background-color: transparent;
      color: inherit;
      font-size: 11px;
      line-height: 1.3;
      box-sizing: border-box;
      box-shadow: none;
    }
    .blurb-textarea {
      min-height: 44px;
      resize: none;
    }
    .blurb-button {
      width: auto;
      justify-self: start;
      padding: 5px 10px;
      font-weight: 600;
    }
    .blurb-slider {
      width: 100%;
      margin: 2px 0;
    }
    .blurb-heading-scale {
      display: grid;
      gap: 6px;
      padding: 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .blurb-h3,
    .blurb-h4,
    .blurb-h5,
    .blurb-h6 {
      margin: 0;
      font-weight: 650;
      line-height: 1.3;
    }
    .blurb-h3 {
      font-size: 15px;
    }
    .blurb-h4 {
      font-size: 13px;
    }
    .blurb-h5 {
      font-size: 12px;
    }
    .blurb-h6 {
      font-size: 11px;
      letter-spacing: 0.02em;
    }
    .blurb-article-link,
    .blurb-heading-link {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .blurb-video-thumb {
      position: relative;
      overflow: hidden;
      border-radius: 4px;
      aspect-ratio: 4 / 3;
      background: linear-gradient(145deg, #1e293b, #0f172a);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .blurb-video-thumb::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 30% 35%, rgba(148, 163, 184, 0.35), transparent 45%),
        linear-gradient(160deg, rgba(56, 189, 248, 0.2), transparent 55%);
    }
    .blurb-video-thumb-badge {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.35);
      pointer-events: none;
    }
    .blurb-video-thumb-badge::after {
      content: '';
      position: absolute;
      left: 11px;
      top: 8px;
      border-style: solid;
      border-width: 6px 0 6px 10px;
      border-color: transparent transparent transparent rgba(255, 255, 255, 0.9);
    }
    .blurb-video-label {
      position: absolute;
      left: 6px;
      bottom: 5px;
      margin: 0;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.45);
      color: rgba(255, 255, 255, 0.85);
      font-size: 9px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      pointer-events: none;
    }
    @media (max-width: 640px) {
      .blurb-top,
      .blurb-surfaces {
        grid-template-columns: minmax(0, 1fr);
      }
      .blurb-figure {
        width: 100%;
      }
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
  }

  render() {
    const colors = buildPalette(
      this.baseColor,
      this.scheme,
      this.themeMode,
      this.themeIntensity,
      this.surfaceSaturation,
      this.textSaturation
    );
    return html`
      <div class="theme-preview">
        <div
          class="blurb"
          style="
            background: ${colors.background};
            color: ${colors.text};
            border-color: ${colors.border};
          "
          aria-label="Live theme preview"
        >
          <p
            class="blurb-nav"
            style="
              font-family: ${UI};
              border-color: ${colors.border};
              background-image: url('${NAV_BG_SRC}');
            "
          >
            <span class="blurb-nav-link" style="color: ${colors.navLink}">Home</span>
            <span class="blurb-nav-link" style="color: ${colors.navLink}">Topics</span>
            <span class="blurb-nav-link" style="color: ${colors.navLink}">About</span>
          </p>
          <div class="blurb-top">
            <div class="blurb-copy">
              <p class="blurb-kicker" style="font-family: ${UI}; color: ${colors.mutedKicker}">
                Caption / kicker
              </p>
              <p class="blurb-title" style="font-family: ${UI}; color: ${colors.headingLarge}">
                <span class="blurb-heading-link">Headline</span>
              </p>
              <p class="blurb-subhead" style="font-family: ${UI}; color: ${colors.link}">
                Subheading for section hierarchy
              </p>
              <p class="blurb-body" style="font-family: ${UI}; color: ${colors.text}">
                Body text on the page canvas. Tone sets Light through Dark surfaces; scheme hues
                paint accents, links, and chrome.
              </p>
              <p class="blurb-caption" style="font-family: ${UI}; color: ${colors.mutedAsideNotes}">
                Caption text for asides, timestamps, and supporting notes.
              </p>
              <p class="blurb-meta">
                <span class="blurb-link" style="font-family: ${UI}; color: ${colors.linkBare}">Sample link</span>
                <code
                  class="blurb-code"
                  style="
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                    background: ${colors.surfaceContainers};
                    border: 1px solid ${colors.border};
                    color: ${colors.textOnSurfaceContainers};
                  "
                  >code.sample()</code
                >
              </p>
            </div>
            <figure class="blurb-figure">
              <span class="blurb-image-wrap">
                <img class="blurb-image" src=${SAMPLE_IMAGE_SRC} alt="" width="160" height="120" />
              </span>
              <figcaption
                class="blurb-image-caption"
                style="font-family: ${UI}; color: ${colors.mutedPhotoCaption}"
              >
                Sample photo caption
              </figcaption>
              <div class="blurb-video-thumb" aria-hidden="true">
                <span class="blurb-video-thumb-badge"></span>
                <p class="blurb-video-label">Paused</p>
              </div>
            </figure>
          </div>
          <div class="blurb-surfaces">
            <div
              class="blurb-card"
              style="
                background: ${colors.surfaceContainers};
                border-color: ${colors.border};
                color: ${colors.textOnSurfaceContainers};
              "
            >
              <p class="blurb-card-label" style="font-family: ${UI}">Surface: Containers</p>
              <p
                class="blurb-card-title"
                style="font-family: ${UI}; color: ${colors.headingMediumOnSurfaceContainers}"
              >
                <span
                  class="blurb-article-link"
                  style="color: ${colors.linkArticleOnSurfaceContainers}"
                  >Card title</span
                >
              </p>
              <p class="blurb-card-body" style="font-family: ${UI}">
                Larger regions like cards and dialogs.
              </p>
              ${this._gui(colors, 'surfaceContainers')}
            </div>
            <div
              class="blurb-gui"
              style="
                background: ${colors.backgroundSecondary};
                border-color: ${colors.border};
                color: ${colors.textOnBackgroundSecondary};
              "
            >
              <p class="blurb-gui-label" style="font-family: ${UI}">BG:Secondary</p>
              ${this._gui(colors, 'backgroundSecondary')}
            </div>
          </div>
          <div
            class="blurb-gui blurb-gui-on-body"
            style="
              background: transparent;
              border-color: ${colors.border};
              color: ${colors.text};
            "
          >
            <p class="blurb-gui-label" style="font-family: ${UI}">BG:Primary · body</p>
            ${this._gui(colors, 'background')}
          </div>
          <div class="blurb-heading-scale" style="border-color: ${colors.border}">
            <p class="blurb-card-label" style="font-family: ${UI}">Heading scale</p>
            <h3 class="blurb-h3" style="font-family: ${UI}; color: ${colors.headingMedium}">
              H3 section heading
            </h3>
            <h4 class="blurb-h4" style="font-family: ${UI}; color: ${colors.headingMedium}">
              H4 subsection heading
            </h4>
            <h5 class="blurb-h5" style="font-family: ${UI}; color: ${colors.headingSmall}">
              H5 supporting heading
            </h5>
            <h6 class="blurb-h6" style="font-family: ${UI}; color: ${colors.headingSmall}">
              H6 fine heading
            </h6>
          </div>
        </div>
      </div>
    `;
  }

  _gui(colors, parent) {
    const suffix =
      parent === 'backgroundSecondary'
        ? 'OnBackgroundSecondary'
        : parent === 'surfaceContainers'
          ? 'OnSurfaceContainers'
          : '';
    const fillOf = (role) => colors[`${role}${suffix}`] || colors[role];
    const borderOf = (role) =>
      colors[`${role}Border${suffix}`] || colors[`${role}Border`] || colors.border;
    const textOn = (role) => {
      const pascal = role.charAt(0).toUpperCase() + role.slice(1);
      return colors[`textOn${pascal}${suffix}`] || colors[`textOn${pascal}`] || colors.text;
    };
    return html`
      <div class="blurb-gui-cluster">
        <input
          class="blurb-field"
          type="text"
          readonly
          tabindex="-1"
          value="Text input"
          style="
            font-family: ${UI};
            background-color: ${fillOf('guiInput')};
            border: 2px solid ${borderOf('guiInput')};
            color: ${textOn('guiInput')};
            outline-color: ${colors.focus};
          "
        />
        <textarea
          class="blurb-textarea"
          readonly
          tabindex="-1"
          style="
            font-family: ${UI};
            background-color: ${fillOf('guiTextarea')};
            border: 2px solid ${borderOf('guiTextarea')};
            color: ${textOn('guiTextarea')};
            outline-color: ${colors.focus};
          "
        >Text area</textarea>
        <input
          class="blurb-slider"
          type="range"
          tabindex="-1"
          value="60"
          style="accent-color: ${colors.guiSlider}; outline-color: ${colors.focus};"
        />
        <button
          type="button"
          class="blurb-button"
          tabindex="-1"
          style="
            font-family: ${UI};
            background-color: ${fillOf('guiButton')};
            border: 2px solid ${borderOf('guiButton')};
            color: ${textOn('guiButton')};
          "
        >
          Button
        </button>
      </div>
    `;
  }
}

customElements.define('color-studio-preview', LivePreview);
