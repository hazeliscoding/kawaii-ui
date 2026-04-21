import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './bloom-theme-toggle.css?inline';

export type BloomTheme = 'light' | 'dark';

const STORAGE_KEY = 'bloom-theme';

/**
 * A round kawaii toggle that flips between light and dark themes by setting
 * `data-theme` on `document.documentElement` and persisting the choice to
 * `localStorage`. Also respects `prefers-color-scheme` on first mount.
 *
 * @element bloom-theme-toggle
 *
 * @fires bloom-theme-change - Fired with `{ theme: 'light' | 'dark' }` in `detail` when the theme changes.
 */
@customElement('bloom-theme-toggle')
export class BloomThemeToggle extends LitElement {
  static override styles = css`
    ${unsafeCSS(styles)}
  `;

  /** Override the storage key used to persist the theme. Set to empty string to disable persistence. */
  @property({ type: String, attribute: 'storage-key' }) storageKey = STORAGE_KEY;

  /** Override the element whose `data-theme` attribute is updated. Defaults to `document.documentElement`. */
  @property({ attribute: false }) target: HTMLElement | null = null;

  @state() private _theme: BloomTheme = 'light';

  override connectedCallback(): void {
    super.connectedCallback();
    const el = this._targetElement();
    const stored = this.storageKey ? this._readStored() : null;
    const existing = el?.getAttribute('data-theme') as BloomTheme | null;
    const preferred = this._prefersDark() ? 'dark' : 'light';
    this._theme = stored ?? existing ?? preferred;
    this._applyTheme(this._theme, { persist: false, fire: false });
  }

  private _targetElement(): HTMLElement | null {
    return this.target ?? document.documentElement;
  }

  private _prefersDark(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private _readStored(): BloomTheme | null {
    if (typeof window === 'undefined' || !('localStorage' in window)) return null;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw === 'dark' || raw === 'light' ? raw : null;
    } catch {
      return null;
    }
  }

  private _writeStored(value: BloomTheme): void {
    if (typeof window === 'undefined' || !('localStorage' in window)) return;
    try {
      window.localStorage.setItem(this.storageKey, value);
    } catch {
      /* quota / security / private mode — silently skip */
    }
  }

  private _applyTheme(
    theme: BloomTheme,
    opts: { persist: boolean; fire: boolean } = { persist: true, fire: true },
  ): void {
    this._theme = theme;
    const el = this._targetElement();
    if (el) el.setAttribute('data-theme', theme);
    if (opts.persist && this.storageKey) this._writeStored(theme);
    if (opts.fire) {
      this.dispatchEvent(
        new CustomEvent('bloom-theme-change', {
          detail: { theme },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** Public API: toggle between light and dark. */
  toggle(): void {
    this._applyTheme(this._theme === 'dark' ? 'light' : 'dark');
  }

  /** Public API: force a specific theme. */
  setTheme(theme: BloomTheme): void {
    this._applyTheme(theme);
  }

  get theme(): BloomTheme {
    return this._theme;
  }

  private _handleClick = (): void => this.toggle();

  override render() {
    const isDark = this._theme === 'dark';
    return html`
      <button
        class="bloom-theme-toggle"
        part="button"
        type="button"
        aria-label=${isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed=${isDark ? 'true' : 'false'}
        @click=${this._handleClick}
      >
        <span class="bloom-theme-toggle__icon" part="icon" aria-hidden="true"
          >${isDark ? '☀' : '☾'}</span
        >
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bloom-theme-toggle': BloomThemeToggle;
  }

  interface HTMLElementEventMap {
    'bloom-theme-change': CustomEvent<{ theme: BloomTheme }>;
  }
}
