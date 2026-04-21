import { LitElement, html, css, unsafeCSS, nothing, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './bloom-compat-ring.css?inline';

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * A kawaii circular progress ring for 0–100 compatibility / affinity scores.
 *
 * @element bloom-compat-ring
 *
 * @slot empty - Content rendered when `score` is not set (or `null`). Overrides the default placeholder copy.
 *
 * @cssprop [--bloom-compat-ring-size=140px] - SVG outer size.
 */
@customElement('bloom-compat-ring')
export class BloomCompatRing extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  /** Score 0–100. Leave null/undefined (or set to `-1`) to render the empty slot. */
  @property({ type: Number }) score: number | null = null;

  /** Big label under the ring (e.g. "Kindred spirits"). */
  @property({ type: String }) label = '';

  /** Smaller context line under the label (e.g. "Based on 12 shared ratings"). */
  @property({ type: String }) context = '';

  private get _hasScore(): boolean {
    return typeof this.score === 'number' && this.score >= 0;
  }

  private _ringColor(): string {
    const s = this.score ?? 0;
    if (s >= 80) return 'var(--bloom-lime-400, #6ed628)';
    if (s >= 50) return 'var(--bloom-yellow-400, #ffe61a)';
    return 'var(--bloom-pink-400, #ff5da0)';
  }

  private _ringDashoffset(): number {
    if (!this._hasScore) return RING_CIRCUMFERENCE;
    const clamped = Math.min(100, Math.max(0, this.score as number));
    return RING_CIRCUMFERENCE * (1 - clamped / 100);
  }

  override render() {
    if (!this._hasScore) {
      return html`
        <div class="compat-ring__placeholder" part="placeholder">
          <slot name="empty">
            <p>Rate more titles together to unlock a compatibility score.</p>
          </slot>
        </div>
      `;
    }

    const score = this.score as number;
    const strokeColor = this._ringColor();
    const dashoffset = this._ringDashoffset();

    return html`
      <div class="compat-ring" part="ring">
        <svg
          class="compat-ring__svg"
          part="svg"
          viewBox="0 0 140 140"
          role="img"
          aria-label=${`Compatibility score: ${Math.round(score)} out of 100`}
        >
          ${svg`
            <circle class="compat-ring__track" cx="70" cy="70" r="${RING_RADIUS}" />
            <circle
              class="compat-ring__fill"
              cx="70"
              cy="70"
              r="${RING_RADIUS}"
              stroke=${strokeColor}
              stroke-dasharray=${RING_CIRCUMFERENCE}
              stroke-dashoffset=${dashoffset}
            />
            <text class="compat-ring__score" x="70" y="70">${Math.round(score)}</text>
          `}
        </svg>
        ${this.label ? html`<p class="compat-ring__label" part="label">${this.label}</p>` : nothing}
        ${this.context
          ? html`<p class="compat-ring__context" part="context">${this.context}</p>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-compat-ring': BloomCompatRing;
  }
}
