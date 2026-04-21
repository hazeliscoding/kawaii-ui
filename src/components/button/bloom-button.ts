import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './bloom-button.css?inline';

export type BloomButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type BloomButtonSize = 'sm' | 'md' | 'lg';
export type BloomButtonType = 'button' | 'submit' | 'reset';

/**
 * A kawaii Y2K gel-style button.
 *
 * @element bloom-button
 *
 * @slot - Button label content.
 * @slot icon-left - Icon rendered before the label.
 * @slot icon-right - Icon rendered after the label.
 *
 * @fires bloom-click - Fired when the button is clicked (unless disabled or loading). `event.detail.originalEvent` carries the underlying `MouseEvent`.
 *
 * @cssprop [--bloom-pink-500] - Primary variant color (see tokens.css for the full kawaii palette).
 */
@customElement('bloom-button')
export class BloomButton extends LitElement {
  static formAssociated = true;

  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String, reflect: true }) variant: BloomButtonVariant = 'primary';
  @property({ type: String, reflect: true }) size: BloomButtonSize = 'md';
  @property({ type: String }) type: BloomButtonType = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true, attribute: 'full-width' }) fullWidth = false;

  private readonly _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  private _handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const form = this.form;
    if (form) {
      if (this.type === 'submit') {
        form.requestSubmit();
      } else if (this.type === 'reset') {
        form.reset();
      }
    }

    this.dispatchEvent(
      new CustomEvent('bloom-click', {
        detail: { originalEvent: event },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const classes = {
      'bloom-btn': true,
      [`bloom-btn--${this.variant}`]: true,
      [`bloom-btn--${this.size}`]: true,
      'bloom-btn--loading': this.loading,
      'bloom-btn--full-width': this.fullWidth,
    };

    const isDisabled = this.disabled || this.loading;

    return html`
      <button
        part="button"
        class=${classMap(classes)}
        type=${this.type}
        ?disabled=${isDisabled}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this._handleClick}
      >
        ${this.loading
          ? html`
              <span class="bloom-btn__spinner" aria-hidden="true">
                <span class="bloom-btn__spinner-dot"></span>
                <span class="bloom-btn__spinner-dot"></span>
                <span class="bloom-btn__spinner-dot"></span>
              </span>
            `
          : nothing}
        <span class="bloom-btn__icon bloom-btn__icon--left" part="icon icon-left">
          <slot name="icon-left"></slot>
        </span>
        <span class="bloom-btn__label" part="label">
          <slot></slot>
        </span>
        <span class="bloom-btn__icon bloom-btn__icon--right" part="icon icon-right">
          <slot name="icon-right"></slot>
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-button': BloomButton;
  }

  interface HTMLElementEventMap {
    'bloom-click': CustomEvent<{ originalEvent: MouseEvent }>;
  }
}
