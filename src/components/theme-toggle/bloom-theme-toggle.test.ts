import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './bloom-theme-toggle.js';
import type { BloomThemeToggle } from './bloom-theme-toggle.js';

describe('bloom-theme-toggle', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.clear();
  });

  const getEl = () => container.querySelector('bloom-theme-toggle') as BloomThemeToggle;

  it('sets data-theme on the root when constructed', async () => {
    container.innerHTML = `<bloom-theme-toggle></bloom-theme-toggle>`;
    const el = getEl();
    await el.updateComplete;
    expect(document.documentElement.getAttribute('data-theme')).toMatch(/^(light|dark)$/);
  });

  it('toggles between light and dark on click', async () => {
    container.innerHTML = `<bloom-theme-toggle></bloom-theme-toggle>`;
    const el = getEl();
    await el.updateComplete;

    const before = el.theme;
    const btn = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
    btn.click();
    await el.updateComplete;

    expect(el.theme).not.toBe(before);
    expect(document.documentElement.getAttribute('data-theme')).toBe(el.theme);
  });

  it('persists to localStorage and dispatches bloom-theme-change', async () => {
    container.innerHTML = `<bloom-theme-toggle></bloom-theme-toggle>`;
    const el = getEl();
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('bloom-theme-change', handler);

    el.toggle();
    await el.updateComplete;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem('bloom-theme')).toBe(el.theme);
  });

  it('restores from localStorage on mount', async () => {
    window.localStorage.setItem('bloom-theme', 'dark');
    container.innerHTML = `<bloom-theme-toggle></bloom-theme-toggle>`;
    const el = getEl();
    await el.updateComplete;

    expect(el.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme() forces a specific value', async () => {
    container.innerHTML = `<bloom-theme-toggle></bloom-theme-toggle>`;
    const el = getEl();
    await el.updateComplete;

    el.setTheme('light');
    await el.updateComplete;
    expect(el.theme).toBe('light');

    el.setTheme('dark');
    await el.updateComplete;
    expect(el.theme).toBe('dark');
  });
});
