import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import styles from './bloom-modal.css?inline';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'bloom-button:not([disabled])',
  'bloom-input:not([disabled])',
].join(',');

/**
 * A kawaii overlay dialog with focus trap, Escape-to-close, and body scroll
 * lock. The consumer owns the `open` attribute — the modal dispatches
 * `bloom-close` whenever the user asks to close (close button, backdrop,
 * Escape key) and the consumer sets `open=false`.
 *
 * @element bloom-modal
 *
 * @slot header - Modal title / header content. Rendered in the top bar.
 * @slot - Default slot: main body content.
 * @slot footer - Footer content, typically action buttons.
 *
 * @fires bloom-close - Fired when the user initiates a close via button, backdrop, or Escape. `event.detail.reason` is `'close-button' | 'backdrop' | 'escape'`.
 * @fires bloom-open - Fired after the modal has mounted and focus has moved inside.
 *
 * @cssprop [--bloom-modal-width=32rem] - Maximum dialog width.
 */
@customElement('bloom-modal')
export class BloomModal extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  /** Close when clicking on the backdrop. */
  @property({ type: Boolean, attribute: 'close-on-backdrop-click' })
  closeOnBackdropClick = true;

  /** Close when pressing Escape. */
  @property({ type: Boolean, attribute: 'close-on-escape' })
  closeOnEscape = true;

  @state() private _hasHeader = false;
  @state() private _hasFooter = false;

  @query('.bloom-modal__dialog') private _dialog?: HTMLElement;

  private _previouslyFocused: HTMLElement | null = null;
  private _previousBodyOverflow = '';
  private _keydownHandler = (e: KeyboardEvent): void => this._onKeydown(e);

  override updated(changed: Map<string, unknown>): void {
    this.toggleAttribute('has-header', this._hasHeader);
    this.toggleAttribute('has-footer', this._hasFooter);

    if (changed.has('open')) {
      // Only fire open / close side effects on real transitions — not on the
      // initial render where `open` defaults to false.
      const previous = changed.get('open') as boolean | undefined;
      if (this.open && !previous) this._onOpen();
      else if (!this.open && previous) this._onClose();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unbind();
    this._restoreBodyScroll();
  }

  private _onOpen(): void {
    this._previouslyFocused = (document.activeElement as HTMLElement) ?? null;
    this._previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._keydownHandler, true);

    // Move focus inside the dialog after render.
    requestAnimationFrame(() => {
      const focusable = this._collectFocusable();
      if (focusable.length > 0) focusable[0]?.focus();
      else this._dialog?.focus();
      this.dispatchEvent(new CustomEvent('bloom-open', { bubbles: true, composed: true }));
    });
  }

  private _onClose(): void {
    this._unbind();
    this._restoreBodyScroll();
    if (this._previouslyFocused) {
      try {
        this._previouslyFocused.focus();
      } catch {
        /* element may have been removed */
      }
      this._previouslyFocused = null;
    }
  }

  private _unbind(): void {
    document.removeEventListener('keydown', this._keydownHandler, true);
  }

  private _restoreBodyScroll(): void {
    document.body.style.overflow = this._previousBodyOverflow;
  }

  private _collectFocusable(): HTMLElement[] {
    if (!this._dialog) return [];
    const shadowFocusable = Array.from(
      this._dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    // Light DOM slotted descendants
    const lightFocusable = Array.from(this.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return [...shadowFocusable, ...lightFocusable].filter((el) => !el.hasAttribute('aria-hidden'));
  }

  private _onKeydown(event: KeyboardEvent): void {
    if (!this.open) return;

    if (event.key === 'Escape' && this.closeOnEscape) {
      event.preventDefault();
      this._requestClose('escape');
      return;
    }

    if (event.key === 'Tab') {
      const focusable = this._collectFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active =
        (this.shadowRoot?.activeElement as HTMLElement | null) ??
        (document.activeElement as HTMLElement | null);

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  private _requestClose(reason: 'close-button' | 'backdrop' | 'escape'): void {
    this.dispatchEvent(
      new CustomEvent('bloom-close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onBackdropClick = (e: MouseEvent): void => {
    if (!this.closeOnBackdropClick) return;
    // Only close when the backdrop itself was clicked, not bubbled from the dialog.
    if (e.target === e.currentTarget) {
      this._requestClose('backdrop');
    }
  };

  private _onCloseClick = (): void => this._requestClose('close-button');

  private _onSlotChange(slotName: 'header' | 'footer', e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const has = slot.assignedNodes({ flatten: true }).some((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      if (n.nodeType === Node.TEXT_NODE) return !!n.textContent?.trim();
      return false;
    });
    if (slotName === 'header') this._hasHeader = has;
    else this._hasFooter = has;
  }

  /** Public API: open the modal. */
  show(): void {
    this.open = true;
  }

  /** Public API: close the modal. */
  hide(): void {
    this.open = false;
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <div class="bloom-modal__backdrop" part="backdrop" @click=${this._onBackdropClick}>
        <div
          class="bloom-modal__dialog"
          part="dialog"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <div class="bloom-modal__header" part="header">
            <div class="bloom-modal__header-slot">
              <slot
                name="header"
                @slotchange=${(e: Event) => this._onSlotChange('header', e)}
              ></slot>
            </div>
            <button
              class="bloom-modal__close"
              part="close"
              type="button"
              aria-label="Close dialog"
              @click=${this._onCloseClick}
            >
              ×
            </button>
          </div>
          <div class="bloom-modal__body" part="body">
            <slot></slot>
          </div>
          <div class="bloom-modal__footer" part="footer">
            <slot name="footer" @slotchange=${(e: Event) => this._onSlotChange('footer', e)}></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-modal': BloomModal;
  }

  interface HTMLElementEventMap {
    'bloom-close': CustomEvent<{ reason: 'close-button' | 'backdrop' | 'escape' }>;
    'bloom-open': CustomEvent<Record<string, never>>;
  }
}
