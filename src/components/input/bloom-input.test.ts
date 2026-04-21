import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './bloom-input.js';
import type { BloomInput } from './bloom-input.js';

describe('bloom-input', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders the label when provided', async () => {
    container.innerHTML = `<bloom-input label="Name"></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    const label = el.shadowRoot!.querySelector('label');
    expect(label?.textContent?.trim()).toContain('Name');
  });

  it('renders a required star when required', async () => {
    container.innerHTML = `<bloom-input label="Name" required></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-input__required')).toBeTruthy();
  });

  it('reflects typed value to the "value" property and fires bloom-input', async () => {
    container.innerHTML = `<bloom-input></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-input', handler);

    const field = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    field.value = 'hello';
    field.dispatchEvent(new Event('input'));

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail as { value: string };
    expect(detail.value).toBe('hello');
    expect(el.value).toBe('hello');
  });

  it('fires bloom-change on native change', async () => {
    container.innerHTML = `<bloom-input></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-change', handler);

    const field = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    field.value = 'final';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('change'));

    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders hint when no error', async () => {
    container.innerHTML = `<bloom-input hint="Your display name"></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    const hint = el.shadowRoot!.querySelector('.bloom-input__hint');
    expect(hint?.textContent?.trim()).toBe('Your display name');
  });

  it('renders error instead of hint when both are set', async () => {
    container.innerHTML = `<bloom-input hint="h" error="Required"></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-input__error')?.textContent?.trim()).toBe(
      'Required',
    );
    expect(el.shadowRoot!.querySelector('.bloom-input__hint')).toBeNull();
  });

  it('applies size variants', async () => {
    container.innerHTML = `<bloom-input size="lg"></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-input--lg')).toBeTruthy();
  });

  it('disables the underlying field', async () => {
    container.innerHTML = `<bloom-input disabled></bloom-input>`;
    const el = container.querySelector('bloom-input') as BloomInput;
    await el.updateComplete;
    const field = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(field.disabled).toBe(true);
  });

  it('resets value when its form is reset (if form association is supported)', async () => {
    container.innerHTML = `
      <form>
        <bloom-input value="start"></bloom-input>
      </form>
    `;
    const el = container.querySelector('bloom-input') as BloomInput;
    const form = container.querySelector('form')!;
    await el.updateComplete;

    if (el.form !== form) return; // jsdom coverage varies
    form.reset();
    await el.updateComplete;
    expect(el.value).toBe('');
  });
});
