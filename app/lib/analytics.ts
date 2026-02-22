import posthog from 'posthog-js';
import type { PostHog } from 'posthog-js';

let client: PostHog | null = null;

export function initAnalytics(): PostHog | null {
  if (typeof window === 'undefined') return null;
  if (client) return client;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;
  if (!key) return null;

  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
  });

  client = posthog;
  return client;
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  posthog.capture(name, props);
}

export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return;
  posthog.identify(userId, traits);
}

export function resetAnalytics() {
  if (typeof window === 'undefined') return;
  posthog.reset();
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;
  posthog.capture('$pageview', { $current_url: window.origin + path });
}
