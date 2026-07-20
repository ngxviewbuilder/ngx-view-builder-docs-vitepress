// gtag.js itself loads unconditionally from every page (see the static
// bootstrap script in .vitepress/config.mts `head`) — that's the pattern
// Google's own docs and every working gtag.js setup use, and loading the
// library alone sends nothing and sets no cookie. What's gated on consent
// here is the actual reporting: analytics_storage stays 'denied' and no
// `config` call ever names GA_ID until setConsent(true) runs, so no
// measurement request reaches Google before that.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = 'G-7TCV06WH0J';
const CONSENT_KEY = 'nvb-analytics-consent';

function isLocalHost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
}

function hasConsent(): boolean {
  return getStoredConsent() === 'granted';
}

let reportingEnabled = false;

function enableReporting(): void {
  if (isLocalHost() || reportingEnabled || typeof window.gtag !== 'function') return;
  reportingEnabled = true;
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  // Pageviews are reported explicitly via trackPageView (below) instead of
  // GA4's automatic one — this SPA never reloads on navigation, so the
  // automatic pageview would only ever see the very first page of a visit.
  window.gtag('config', GA_ID, { send_page_view: false });
  trackPageView(window.location.pathname + window.location.search);
}

export function getStoredConsent(): 'granted' | 'denied' | null {
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function setConsent(granted: boolean): void {
  window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  if (granted) enableReporting();
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !reportingEnabled || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// The single source of pageview events (GA4's automatic one is disabled
// above): called once when reporting first turns on, and again from the
// router's onAfterRouteChange hook on every subsequent SPA navigation.
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || !reportingEnabled || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Global listeners for events that have no component to hook into. */
export function setupAnalytics(): void {
  if (hasConsent()) enableReporting();
  trackCodeCopy();
  trackLocalSearch();
}

// VitePress renders a `button.copy` in every code block; copies signal which
// snippets people actually use.
function trackCodeCopy(): void {
  window.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement | null)?.closest?.('button.copy');
      if (!button) return;
      const block = button.closest('div[class*="language-"]');
      const language = Array.from(block?.classList ?? [])
        .find((cls) => cls.startsWith('language-'))
        ?.slice('language-'.length);
      trackEvent('copy_code', { language: language ?? '(unknown)' });
    },
    { capture: true },
  );
}

// The local search modal is rendered lazily and never changes the URL, so GA4
// site-search measurement can't see it. Debounce typing and report the final
// query as the standard GA4 `search` event.
function trackLocalSearch(): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastTerm = '';
  window.addEventListener(
    'input',
    (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.id !== 'localsearch-input') return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const term = input.value.trim();
        if (term.length < 2 || term === lastTerm) return;
        lastTerm = term;
        trackEvent('search', { search_term: term });
      }, 1200);
    },
    { capture: true },
  );
}
