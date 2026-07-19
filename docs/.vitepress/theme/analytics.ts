// GA4 loads only after explicit visitor consent (GDPR): nothing is requested
// from Google, and no cookie is set, until setConsent(true) runs. The single
// localStorage flag this reads/writes is itself consent-neutral bookkeeping
// (it only remembers the visitor's choice), not a tracking cookie.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-7TCV06WH0J';
const CONSENT_KEY = 'nvb-analytics-consent';

function isLocalHost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
}

function loadGoogleAnalytics(): void {
  if (isLocalHost() || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function getStoredConsent(): 'granted' | 'denied' | null {
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function setConsent(granted: boolean): void {
  window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  if (granted) loadGoogleAnalytics();
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/** Global listeners for events that have no component to hook into. */
export function setupAnalytics(): void {
  if (getStoredConsent() === 'granted') loadGoogleAnalytics();
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
