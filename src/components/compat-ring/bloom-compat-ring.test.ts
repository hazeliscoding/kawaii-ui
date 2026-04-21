import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './bloom-compat-ring.js';
import type { BloomCompatRing } from './bloom-compat-ring.js';

describe('bloom-compat-ring', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const getEl = () => container.querySelector('bloom-compat-ring') as BloomCompatRing;

  it('renders placeholder when no score is set', async () => {
    container.innerHTML = `<bloom-compat-ring></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.compat-ring__placeholder')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('svg')).toBeNull();
  });

  it('renders SVG when score is set', async () => {
    container.innerHTML = `<bloom-compat-ring score="72"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.compat-ring__placeholder')).toBeNull();
  });

  it('rounds and renders the score text', async () => {
    container.innerHTML = `<bloom-compat-ring score="87.6"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    const text = el.shadowRoot!.querySelector('.compat-ring__score');
    expect(text?.textContent?.trim()).toBe('88');
  });

  it('applies green stroke for score >= 80', async () => {
    container.innerHTML = `<bloom-compat-ring score="90"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.compat-ring__fill') as SVGCircleElement;
    expect(fill.getAttribute('stroke')).toMatch(/lime/);
  });

  it('applies yellow stroke for 50–79', async () => {
    container.innerHTML = `<bloom-compat-ring score="65"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.compat-ring__fill') as SVGCircleElement;
    expect(fill.getAttribute('stroke')).toMatch(/yellow/);
  });

  it('applies pink stroke below 50', async () => {
    container.innerHTML = `<bloom-compat-ring score="30"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.compat-ring__fill') as SVGCircleElement;
    expect(fill.getAttribute('stroke')).toMatch(/pink/);
  });

  it('renders label and context when set', async () => {
    container.innerHTML = `<bloom-compat-ring score="70" label="Kindred" context="9 shared"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.compat-ring__label')?.textContent?.trim()).toBe(
      'Kindred',
    );
    expect(el.shadowRoot!.querySelector('.compat-ring__context')?.textContent?.trim()).toBe(
      '9 shared',
    );
  });

  it('clamps scores above 100', async () => {
    container.innerHTML = `<bloom-compat-ring score="150"></bloom-compat-ring>`;
    const el = getEl();
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.compat-ring__fill') as SVGCircleElement;
    // at 100% the dashoffset should be 0 (full ring)
    expect(fill.getAttribute('stroke-dashoffset')).toBe('0');
  });
});
