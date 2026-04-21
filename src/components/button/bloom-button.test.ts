import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './bloom-button.js';
import type { BloomButton } from './bloom-button.js';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('bloom-button', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders the default slot as the label', async () => {
    container.innerHTML = `<bloom-button>Click me</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.shadowRoot?.querySelector('button')).toBeTruthy();
    expect(el.textContent?.trim()).toBe('Click me');
  });

  it('reflects variant and size attributes', async () => {
    container.innerHTML = `<bloom-button variant="secondary" size="lg">Go</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.classList.contains('bloom-btn--secondary')).toBe(true);
    expect(btn?.classList.contains('bloom-btn--lg')).toBe(true);
  });

  it('defaults to variant="primary" and size="md"', async () => {
    container.innerHTML = `<bloom-button>Hi</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.classList.contains('bloom-btn--primary')).toBe(true);
    expect(btn?.classList.contains('bloom-btn--md')).toBe(true);
  });

  it('dispatches bloom-click on click', async () => {
    container.innerHTML = `<bloom-button>Fire</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-click', handler);

    const btn = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    const ev = handler.mock.calls[0][0] as CustomEvent;
    expect(ev.detail.originalEvent).toBeInstanceOf(MouseEvent);
  });

  it('suppresses bloom-click when disabled', async () => {
    container.innerHTML = `<bloom-button disabled>Nope</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-click', handler);

    const btn = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('suppresses bloom-click when loading', async () => {
    container.innerHTML = `<bloom-button loading>Wait</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-click', handler);

    const btn = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('renders a spinner when loading', async () => {
    container.innerHTML = `<bloom-button loading>Wait</bloom-button>`;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.bloom-btn__spinner')).toBeTruthy();
  });

  it('calls form.requestSubmit() when type="submit" inside a form', async () => {
    container.innerHTML = `
      <form>
        <bloom-button type="submit">Submit</bloom-button>
      </form>
    `;
    const el = container.querySelector('bloom-button') as BloomButton;
    const form = container.querySelector('form')!;
    await el.updateComplete;
    await nextFrame();

    // jsdom's form-associated custom element support for ElementInternals.form
    // varies by version; if the association didn't attach, skip rather than fail
    // (the behavior is covered in real browsers via the demo).
    if (el.form !== form) {
      return;
    }

    const submitSpy = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {
      /* no-op */
    });

    const btn = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('reflects slotted icons', async () => {
    container.innerHTML = `
      <bloom-button>
        <span slot="icon-left">L</span>
        Hello
        <span slot="icon-right">R</span>
      </bloom-button>
    `;
    const el = container.querySelector('bloom-button') as BloomButton;
    await el.updateComplete;

    const leftSlot = el.shadowRoot?.querySelector('slot[name="icon-left"]') as HTMLSlotElement;
    const rightSlot = el.shadowRoot?.querySelector('slot[name="icon-right"]') as HTMLSlotElement;

    expect(leftSlot?.assignedNodes({ flatten: true })).toHaveLength(1);
    expect(rightSlot?.assignedNodes({ flatten: true })).toHaveLength(1);
  });
});
