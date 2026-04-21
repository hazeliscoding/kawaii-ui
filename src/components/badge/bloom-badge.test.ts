import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './bloom-badge.js';
import type { BloomBadge } from './bloom-badge.js';

describe('bloom-badge', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders slotted label', async () => {
    container.innerHTML = `<bloom-badge>Watching</bloom-badge>`;
    const el = container.querySelector('bloom-badge') as BloomBadge;
    await el.updateComplete;
    expect(el.textContent?.trim()).toBe('Watching');
  });

  it('defaults to pink/md', async () => {
    container.innerHTML = `<bloom-badge>X</bloom-badge>`;
    const el = container.querySelector('bloom-badge') as BloomBadge;
    await el.updateComplete;
    const badge = el.shadowRoot!.querySelector('.bloom-badge');
    expect(badge?.classList.contains('bloom-badge--pink')).toBe(true);
    expect(badge?.classList.contains('bloom-badge--md')).toBe(true);
  });

  it('applies color and size variants', async () => {
    container.innerHTML = `<bloom-badge color="lilac" size="sm">Go</bloom-badge>`;
    const el = container.querySelector('bloom-badge') as BloomBadge;
    await el.updateComplete;
    const badge = el.shadowRoot!.querySelector('.bloom-badge');
    expect(badge?.classList.contains('bloom-badge--lilac')).toBe(true);
    expect(badge?.classList.contains('bloom-badge--sm')).toBe(true);
  });

  it('renders a dot when dot attribute is set', async () => {
    container.innerHTML = `<bloom-badge dot>Online</bloom-badge>`;
    const el = container.querySelector('bloom-badge') as BloomBadge;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-badge__dot')).toBeTruthy();
  });

  it('omits the dot by default', async () => {
    container.innerHTML = `<bloom-badge>Plain</bloom-badge>`;
    const el = container.querySelector('bloom-badge') as BloomBadge;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-badge__dot')).toBeNull();
  });
});
