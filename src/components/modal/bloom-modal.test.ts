import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './bloom-modal.js';
import type { BloomModal } from './bloom-modal.js';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('bloom-modal', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.style.overflow = '';
  });

  const getEl = () => container.querySelector('bloom-modal') as BloomModal;

  it('does not render a dialog when open is false', async () => {
    container.innerHTML = `<bloom-modal>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-modal__dialog')).toBeNull();
  });

  it('renders a dialog when open is set', async () => {
    container.innerHTML = `<bloom-modal open>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-modal__dialog')).toBeTruthy();
  });

  it('locks body scroll when opened and restores it when closed', async () => {
    document.body.style.overflow = 'auto';
    container.innerHTML = `<bloom-modal>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;

    el.show();
    await el.updateComplete;
    expect(document.body.style.overflow).toBe('hidden');

    el.hide();
    await el.updateComplete;
    expect(document.body.style.overflow).toBe('auto');
  });

  it('dispatches bloom-close with reason when close button is clicked', async () => {
    container.innerHTML = `<bloom-modal open>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-close', handler);

    const closeBtn = el.shadowRoot!.querySelector('.bloom-modal__close') as HTMLButtonElement;
    closeBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.reason).toBe('close-button');
  });

  it('dispatches bloom-close with reason="backdrop" when backdrop is clicked', async () => {
    container.innerHTML = `<bloom-modal open>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-close', handler);

    const backdrop = el.shadowRoot!.querySelector('.bloom-modal__backdrop') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.reason).toBe('backdrop');
  });

  it('does not close on backdrop click when close-on-backdrop-click is false', async () => {
    container.innerHTML = `<bloom-modal open close-on-backdrop-click="false">Body</bloom-modal>`;
    const el = getEl();
    el.closeOnBackdropClick = false;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-close', handler);

    const backdrop = el.shadowRoot!.querySelector('.bloom-modal__backdrop') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('dispatches bloom-close with reason="escape" on Escape keydown', async () => {
    container.innerHTML = `<bloom-modal open>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;
    await nextFrame();

    const handler = vi.fn();
    el.addEventListener('bloom-close', handler);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.reason).toBe('escape');
  });

  it('ignores Escape when close-on-escape is false', async () => {
    container.innerHTML = `<bloom-modal open>Body</bloom-modal>`;
    const el = getEl();
    el.closeOnEscape = false;
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-close', handler);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('show() / hide() toggle the open state', async () => {
    container.innerHTML = `<bloom-modal>Body</bloom-modal>`;
    const el = getEl();
    await el.updateComplete;

    el.show();
    await el.updateComplete;
    expect(el.open).toBe(true);

    el.hide();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('renders slotted header and footer', async () => {
    container.innerHTML = `
      <bloom-modal open>
        <h3 slot="header">Title</h3>
        Body
        <div slot="footer"><button>OK</button></div>
      </bloom-modal>
    `;
    const el = getEl();
    await el.updateComplete;
    await nextFrame();
    await el.updateComplete;

    expect(el.hasAttribute('has-header')).toBe(true);
    expect(el.hasAttribute('has-footer')).toBe(true);
  });
});
