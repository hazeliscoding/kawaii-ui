import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './bloom-avatar.js';
import type { BloomAvatar, BloomAvatarStack } from './bloom-avatar.js';

describe('bloom-avatar', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders initials from a single-word name', async () => {
    container.innerHTML = `<bloom-avatar name="Sakura"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    const initials = el.shadowRoot!.querySelector('.bloom-avatar__initials');
    expect(initials?.textContent?.trim()).toBe('SA');
  });

  it('renders initials from a two-word name', async () => {
    container.innerHTML = `<bloom-avatar name="Naruto Uzumaki"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    const initials = el.shadowRoot!.querySelector('.bloom-avatar__initials');
    expect(initials?.textContent?.trim()).toBe('NU');
  });

  it('renders ? when no name is provided', async () => {
    container.innerHTML = `<bloom-avatar></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    const initials = el.shadowRoot!.querySelector('.bloom-avatar__initials');
    expect(initials?.textContent?.trim()).toBe('?');
  });

  it('renders an image when src is set, hiding initials', async () => {
    container.innerHTML = `<bloom-avatar src="/me.png" name="Hazel"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/me.png');
    expect(el.shadowRoot!.querySelector('.bloom-avatar__initials')).toBeNull();
  });

  it('applies size modifier class', async () => {
    container.innerHTML = `<bloom-avatar size="lg" name="A"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-avatar--lg')).toBeTruthy();
  });

  it('shows a status dot when status is not "none"', async () => {
    container.innerHTML = `<bloom-avatar status="online" name="A"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-avatar__status--online')).toBeTruthy();
  });

  it('omits the status dot when status="none"', async () => {
    container.innerHTML = `<bloom-avatar status="none" name="A"></bloom-avatar>`;
    const el = container.querySelector('bloom-avatar') as BloomAvatar;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bloom-avatar__status')).toBeNull();
  });
});

describe('bloom-avatar-stack', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('slots child avatars', async () => {
    container.innerHTML = `
      <bloom-avatar-stack>
        <bloom-avatar name="A"></bloom-avatar>
        <bloom-avatar name="B"></bloom-avatar>
      </bloom-avatar-stack>
    `;
    const stack = container.querySelector('bloom-avatar-stack') as BloomAvatarStack;
    await stack.updateComplete;

    const slot = stack.shadowRoot!.querySelector('slot') as HTMLSlotElement;
    const assigned = slot.assignedElements();
    expect(assigned).toHaveLength(2);
    expect(assigned[0]?.tagName).toBe('BLOOM-AVATAR');
  });
});
