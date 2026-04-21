import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './bloom-input.css?inline';

export type BloomInputSize = 'sm' | 'md' | 'lg';

let bloomInputNextId = 0;

/**
 * A kawaii form-associated text input with label, hint, error, and
 * prefix/suffix slots.
 *
 * @element bloom-input
 *
 * @slot prefix - Leading icon or adornment.
 * @slot suffix - Trailing icon or adornment.
 *
 * @fires bloom-input - Fired on every keystroke. `event.detail.value` is the current value.
 * @fires bloom-change - Fired when the input loses focus after a value change (matches native `change`).
 */
@customElement('bloom-input')
export class BloomInput extends LitElement {
  static formAssociated = true;

  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) type = 'text';
  @property({ type: String, reflect: true }) size: BloomInputSize = 'md';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) error = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) autocomplete = 'off';
  @property({ type: String }) name = '';
  @property({ type: String }) value = '';

  @state() private _focused = false;
  @state() private _hasPrefix = false;
  @state() private _hasSuffix = false;

  @query('input') private _field!: HTMLInputElement;

  private readonly _inputId = `bloom-input-${++bloomInputNextId}`;
  private readonly _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncFormValue();
    this._syncValidity();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('value') || changed.has('required') || changed.has('disabled')) {
      this._syncFormValue();
      this._syncValidity();
    }
    this.toggleAttribute('has-prefix', this._hasPrefix);
    this.toggleAttribute('has-suffix', this._hasSuffix);
  }

  private _syncFormValue(): void {
    // jsdom doesn't implement ElementInternals.setFormValue yet — guard so tests pass.
    if (typeof this._internals.setFormValue !== 'function') return;
    this._internals.setFormValue(this.value);
  }

  private _syncValidity(): void {
    if (typeof this._internals.setValidity !== 'function') return;
    if (!this.required || this.disabled) {
      this._internals.setValidity({});
      return;
    }
    if (!this.value) {
      this._internals.setValidity(
        { valueMissing: true },
        'Please fill out this field.',
        this._field,
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.dispatchEvent(
      new CustomEvent('bloom-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleChange = (): void => {
    this.dispatchEvent(
      new CustomEvent('bloom-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleFocus = (): void => {
    this._focused = true;
  };

  private _handleBlur = (): void => {
    this._focused = false;
  };

  private _onSlotChange(which: 'prefix' | 'suffix', e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const has = slot.assignedNodes({ flatten: true }).some((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      if (n.nodeType === Node.TEXT_NODE) return !!n.textContent?.trim();
      return false;
    });
    if (which === 'prefix') this._hasPrefix = has;
    else this._hasSuffix = has;
  }

  /** Forms API: the form the input belongs to (via ElementInternals). */
  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /** Native validation check. */
  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  /** Native report-validity (shows browser's validation message). */
  reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  /** Focus the underlying `<input>`. */
  override focus(options?: FocusOptions): void {
    this._field?.focus(options);
  }

  /** Blur the underlying `<input>`. */
  override blur(): void {
    this._field?.blur();
  }

  formResetCallback(): void {
    this.value = '';
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  override render() {
    const wrapperClasses = {
      'bloom-input': true,
      [`bloom-input--${this.size}`]: true,
      'bloom-input--error': !!this.error,
      'bloom-input--disabled': this.disabled,
      'bloom-input--focused': this._focused,
    };

    const describedById = this.error
      ? `${this._inputId}-error`
      : this.hint
        ? `${this._inputId}-hint`
        : undefined;

    return html`
      <div class=${classMap(wrapperClasses)} part="wrapper">
        ${this.label
          ? html`
              <label for=${this._inputId} class="bloom-input__label" part="label">
                ${this.label}
                ${this.required
                  ? html`<span class="bloom-input__required" aria-hidden="true">*</span>`
                  : nothing}
              </label>
            `
          : nothing}

        <div class="bloom-input__field-wrapper" part="field-wrapper">
          <span class="bloom-input__prefix" part="prefix">
            <slot name="prefix" @slotchange=${(e: Event) => this._onSlotChange('prefix', e)}></slot>
          </span>
          <input
            class="bloom-input__field"
            part="field"
            id=${this._inputId}
            name=${this.name || this._inputId}
            type=${this.type}
            placeholder=${this.placeholder}
            autocomplete=${this.autocomplete}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            aria-invalid=${this.error ? 'true' : 'false'}
            aria-describedby=${ifDefined(describedById)}
            .value=${this.value}
            @input=${this._handleInput}
            @change=${this._handleChange}
            @focus=${this._handleFocus}
            @blur=${this._handleBlur}
          />
          <span class="bloom-input__suffix" part="suffix">
            <slot name="suffix" @slotchange=${(e: Event) => this._onSlotChange('suffix', e)}></slot>
          </span>
        </div>

        ${this.hint && !this.error
          ? html`<p class="bloom-input__hint" part="hint" id="${this._inputId}-hint">
              ${this.hint}
            </p>`
          : nothing}
        ${this.error
          ? html`<p
              class="bloom-input__error"
              part="error"
              id="${this._inputId}-error"
              role="alert"
            >
              ${this.error}
            </p>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-input': BloomInput;
  }

  interface HTMLElementEventMap {
    'bloom-input': CustomEvent<{ value: string }>;
    'bloom-change': CustomEvent<{ value: string }>;
  }
}
