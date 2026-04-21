import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './bloom-card.css?inline';

export type BloomCardVariant = 'default' | 'highlighted';

/**
 * A kawaii / Y2K content card with optional animated sparkle border and
 * slottable header / footer regions.
 *
 * @element bloom-card
 *
 * @slot - Default slot: card body content.
 * @slot header - Card header. A gradient accent line renders above it when present.
 * @slot footer - Card footer. A subtle top border separates it from the body.
 */
@customElement('bloom-card')
export class BloomCard extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String, reflect: true }) variant: BloomCardVariant = 'default';
  @property({ type: Boolean, reflect: true }) hoverable = true;

  /** Internal: does the header slot have assigned content? Reflected to attribute for styling. */
  @state() private _hasHeader = false;
  /** Internal: does the footer slot have assigned content? */
  @state() private _hasFooter = false;

  override willUpdate(): void {
    this.toggleAttribute('has-header', this._hasHeader);
    this.toggleAttribute('has-footer', this._hasFooter);
  }

  private _onSlotChange(slotName: 'header' | 'footer', e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const hasAssigned = slot.assignedNodes({ flatten: true }).some((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      if (n.nodeType === Node.TEXT_NODE) return !!n.textContent?.trim();
      return false;
    });
    if (slotName === 'header') this._hasHeader = hasAssigned;
    else this._hasFooter = hasAssigned;
  }

  override render() {
    const classes = {
      'bloom-card': true,
      [`bloom-card--${this.variant}`]: true,
      'bloom-card--hoverable': this.hoverable,
      'bloom-card--has-header': this._hasHeader,
      'bloom-card--has-footer': this._hasFooter,
    };

    return html`
      <article class=${classMap(classes)} part="card">
        ${this.variant === 'highlighted'
          ? html`<div class="bloom-card__sparkle-border" part="sparkle" aria-hidden="true"></div>`
          : nothing}
        <div class="bloom-card__inner" part="inner">
          <header class="bloom-card__header" part="header">
            <slot name="header" @slotchange=${(e: Event) => this._onSlotChange('header', e)}></slot>
          </header>
          <div class="bloom-card__body" part="body">
            <slot></slot>
          </div>
          <footer class="bloom-card__footer" part="footer">
            <slot name="footer" @slotchange=${(e: Event) => this._onSlotChange('footer', e)}></slot>
          </footer>
        </div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-card': BloomCard;
  }
}
