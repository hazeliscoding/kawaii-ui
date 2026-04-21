import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './bloom-avatar.css?inline';
import stackStyles from './bloom-avatar-stack.css?inline';

export type BloomAvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type BloomAvatarStatus = 'online' | 'offline' | 'watching' | 'none';

/**
 * A circular kawaii avatar with decorative ring, initials fallback, and
 * optional status indicator.
 *
 * @element bloom-avatar
 */
@customElement('bloom-avatar')
export class BloomAvatar extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String }) src = '';
  @property({ type: String }) alt = '';
  @property({ type: String }) name = '';
  @property({ type: String, reflect: true }) size: BloomAvatarSize = 'md';
  @property({ type: String, reflect: true }) status: BloomAvatarStatus = 'none';

  private get _initials(): string {
    const n = this.name.trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    if (parts.length >= 2) {
      return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
    }
    return parts[0]!.substring(0, 2).toUpperCase();
  }

  override render() {
    const classes = {
      'bloom-avatar': true,
      [`bloom-avatar--${this.size}`]: true,
    };

    const statusClass = `bloom-avatar__status--${this.status}`;

    return html`
      <div class=${classMap(classes)} part="avatar">
        <div class="bloom-avatar__frame" part="frame">
          ${this.src
            ? html`<img
                class="bloom-avatar__image"
                part="image"
                src=${this.src}
                alt=${this.alt || this.name || 'User avatar'}
                loading="lazy"
              />`
            : html`<span class="bloom-avatar__initials" part="initials" aria-hidden="true"
                >${this._initials}</span
              >`}
        </div>
        ${this.status !== 'none'
          ? html`<span
              class="bloom-avatar__status ${statusClass}"
              part="status"
              role="status"
              aria-label=${this.status}
            ></span>`
          : nothing}
      </div>
    `;
  }
}

/**
 * A horizontally overlapping group of `bloom-avatar` children.
 *
 * @element bloom-avatar-stack
 *
 * @slot - Place one or more `bloom-avatar` children inside.
 */
@customElement('bloom-avatar-stack')
export class BloomAvatarStack extends LitElement {
  static override styles = css`
    ${unsafeCSS(stackStyles)}
  `;

  @property({ type: String, attribute: 'aria-label' }) override ariaLabel = 'User group';

  override render() {
    return html`
      <div class="bloom-avatar-stack" role="group" aria-label=${this.ariaLabel ?? 'User group'}>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-avatar': BloomAvatar;
    'bloom-avatar-stack': BloomAvatarStack;
  }
}
