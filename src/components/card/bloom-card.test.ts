import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './bloom-card.js';
import type { BloomCard } from './bloom-card.js';

describe('bloom-card', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  it('renders the default slot as body content', async () => {
    container.innerHTML = `<bloom-card>Hello</bloom-card>`;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    expect(el.textContent?.trim()).toBe('Hello');
    expect(el.shadowRoot!.querySelector('.bloom-card__body')).toBeTruthy();
  });

  it('defaults to variant="default" and hoverable=true', async () => {
    container.innerHTML = `<bloom-card>X</bloom-card>`;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    const card = el.shadowRoot!.querySelector('.bloom-card');
    expect(card?.classList.contains('bloom-card--default')).toBe(true);
    expect(card?.classList.contains('bloom-card--hoverable')).toBe(true);
  });

  it('renders a sparkle-border when highlighted', async () => {
    container.innerHTML = `<bloom-card variant="highlighted">X</bloom-card>`;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-card__sparkle-border')).toBeTruthy();
  });

  it('reflects has-header attribute when header slot has content', async () => {
    container.innerHTML = `
      <bloom-card>
        <h3 slot="header">Title</h3>
        Body
      </bloom-card>
    `;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    await nextFrame();
    await el.updateComplete;
    expect(el.hasAttribute('has-header')).toBe(true);
  });

  it('does not set has-header when header slot is empty', async () => {
    container.innerHTML = `<bloom-card>Body only</bloom-card>`;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    await nextFrame();
    expect(el.hasAttribute('has-header')).toBe(false);
    expect(el.hasAttribute('has-footer')).toBe(false);
  });

  it('reflects has-footer attribute when footer slot has content', async () => {
    container.innerHTML = `
      <bloom-card>
        Body
        <div slot="footer">Footer</div>
      </bloom-card>
    `;
    const el = container.querySelector('bloom-card') as BloomCard;
    await el.updateComplete;
    await nextFrame();
    await el.updateComplete;
    expect(el.hasAttribute('has-footer')).toBe(true);
  });
});
