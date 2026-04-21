import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './bloom-badge.css?inline';

export type BloomBadgeColor = 'pink' | 'blue' | 'green' | 'lilac' | 'yellow' | 'neutral';
export type BloomBadgeSize = 'sm' | 'md';

/**
 * A kawaii pill-shaped status badge.
 *
 * @element bloom-badge
 *
 * @slot - Badge label content.
 */
@customElement('bloom-badge')
export class BloomBadge extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String, reflect: true }) color: BloomBadgeColor = 'pink';
  @property({ type: String, reflect: true }) size: BloomBadgeSize = 'md';
  @property({ type: Boolean, reflect: true }) dot = false;

  override render() {
    const classes = {
      'bloom-badge': true,
      [`bloom-badge--${this.color}`]: true,
      [`bloom-badge--${this.size}`]: true,
    };

    return html`
      <span class=${classMap(classes)} part="badge">
        ${this.dot
          ? html`<span class="bloom-badge__dot" part="dot" aria-hidden="true"></span>`
          : ''}
        <span class="bloom-badge__label" part="label">
          <slot></slot>
        </span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-badge': BloomBadge;
  }
}
