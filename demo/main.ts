import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '../src/styles/animations.css';
import '../src/styles/utilities.css';
import './demo.css';

// Side-effect imports — each file registers its custom element via
// @customElement(). Importing them directly (instead of through the
// re-exporting barrel at src/index.ts) prevents Rollup from tree-shaking
// the registrations out of the demo bundle.
import '../src/components/button/bloom-button.ts';
import '../src/components/badge/bloom-badge.ts';
import '../src/components/avatar/bloom-avatar.ts';
import '../src/components/card/bloom-card.ts';
import '../src/components/input/bloom-input.ts';
import '../src/components/theme-toggle/bloom-theme-toggle.ts';
import '../src/components/modal/bloom-modal.ts';
import '../src/components/compat-ring/bloom-compat-ring.ts';

// ---------- Click counter (Events section) ----------
const target = document.getElementById('clickTarget');
const output = document.getElementById('clickOutput');
let clickCount = 0;
target?.addEventListener('bloom-click', () => {
  clickCount += 1;
  if (output) output.textContent = String(clickCount);
});

// ---------- Form submission (Forms section) ----------
const form = document.getElementById('demoForm') as HTMLFormElement | null;
const formOutput = document.getElementById('formOutput');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  if (formOutput) {
    formOutput.textContent = `✓ Submitted: name="${data.get('name') ?? ''}" · anime="${data.get('anime') ?? ''}"`;
  }
});
form?.addEventListener('reset', () => {
  if (formOutput) formOutput.textContent = 'Form was reset';
});

// ---------- Dark mode toggle (topbar) ----------
// The topbar icon stays in sync with `<bloom-theme-toggle>` anywhere on the
// page — both update `document.documentElement[data-theme]` and dispatch
// bloom-theme-change. We listen globally and mirror the state.
const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement | null;
const applyThemeToggleLabel = () => {
  if (!themeToggle) return;
  const isDark = document.documentElement.dataset['theme'] === 'dark';
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
};
applyThemeToggleLabel();
themeToggle?.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset['theme'] = html.dataset['theme'] === 'dark' ? 'light' : 'dark';
  applyThemeToggleLabel();
});
document.addEventListener('bloom-theme-change', () => applyThemeToggleLabel());

// ---------- Modal demo ----------
const openModalBtn = document.getElementById('openModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const demoModal = document.getElementById('demoModal') as
  | (HTMLElement & { open: boolean; show(): void; hide(): void })
  | null;

openModalBtn?.addEventListener('bloom-click', () => {
  if (demoModal) demoModal.open = true;
});
cancelModalBtn?.addEventListener('bloom-click', () => {
  if (demoModal) demoModal.open = false;
});
demoModal?.addEventListener('bloom-close', () => {
  demoModal.open = false;
});


// ---------- Theme playground (Theming section) ----------
type ThemePreset = 'kawaii' | 'sunset' | 'ocean' | 'forest';

const presets: Record<ThemePreset, Record<string, string>> = {
  kawaii: {},
  sunset: {
    '--bloom-gradient-gel-pink': 'linear-gradient(180deg, #ffe29a 0%, #ff6b9d 60%, #c04e8c 100%)',
    '--bloom-pink-600': '#c04e8c',
    '--bloom-gradient-gel-blue': 'linear-gradient(180deg, #ffd6a5 0%, #ff9a3c 60%, #cc6600 100%)',
    '--bloom-blue-600': '#cc6600',
    '--bloom-gradient-gel-lilac': 'linear-gradient(180deg, #ffbdb5 0%, #ff6b6b 60%, #c94141 100%)',
    '--bloom-lilac-600': '#c94141',
  },
  ocean: {
    '--bloom-gradient-gel-pink': 'linear-gradient(180deg, #a8dadc 0%, #457b9d 60%, #1d3557 100%)',
    '--bloom-pink-600': '#1d3557',
    '--bloom-gradient-gel-blue': 'linear-gradient(180deg, #b4f0ff 0%, #5bc0eb 60%, #2e86ab 100%)',
    '--bloom-blue-600': '#2e86ab',
    '--bloom-gradient-gel-lilac': 'linear-gradient(180deg, #c8b6ff 0%, #7371fc 60%, #4338ca 100%)',
    '--bloom-lilac-600': '#4338ca',
  },
  forest: {
    '--bloom-gradient-gel-pink': 'linear-gradient(180deg, #d8f3dc 0%, #52b788 60%, #1b4332 100%)',
    '--bloom-pink-600': '#1b4332',
    '--bloom-gradient-gel-blue': 'linear-gradient(180deg, #caf0f8 0%, #00b4d8 60%, #023e8a 100%)',
    '--bloom-blue-600': '#023e8a',
    '--bloom-gradient-gel-lilac': 'linear-gradient(180deg, #fff3b0 0%, #e09f3e 60%, #9e2a2b 100%)',
    '--bloom-lilac-600': '#9e2a2b',
  },
};

const themeTarget = document.getElementById('themeTarget');
const themeChoices = document.querySelectorAll<HTMLButtonElement>('[data-theme-preset]');

const applyPreset = (preset: ThemePreset) => {
  if (!themeTarget) return;
  themeTarget.removeAttribute('style');
  const style = themeTarget.style;
  style.padding = '0';
  style.minHeight = '0';
  style.background = 'none';
  style.display = 'flex';
  style.flexWrap = 'wrap';
  style.gap = 'var(--bloom-space-3)';
  style.justifyContent = 'center';

  for (const [key, value] of Object.entries(presets[preset])) {
    themeTarget.style.setProperty(key, value);
  }

  themeChoices.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset['themePreset'] === preset);
  });
};

themeChoices.forEach((btn) => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset['themePreset'] as ThemePreset | undefined;
    if (preset) applyPreset(preset);
  });
});

// ---------- Active sidebar link on scroll ----------
const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>('.sidebar__link');
const sections = Array.from(sidebarLinks)
  .map((a) => {
    const id = a.getAttribute('href')?.slice(1);
    return id ? document.getElementById(id) : null;
  })
  .filter((el): el is HTMLElement => el !== null);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sidebarLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' },
);

sections.forEach((s) => observer.observe(s));
