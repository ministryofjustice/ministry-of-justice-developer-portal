const COOKIE_CONSENT_NAME = 'moj_cookie_consent';
// This module provides functions to manage cookie consent state, including getting and setting the consent value, checking if consent is accepted or rejected, and listening for changes in consent state. It uses a custom event to notify listeners of changes in cookie consent.
export type CookieConsentValue = 'accepted' | 'rejected';

function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getCookieConsent(): CookieConsentValue | null {
  if (!isClient()) {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_NAME}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.split('=')[1];
  return value === 'accepted' || value === 'rejected' ? (value as CookieConsentValue) : null;
}

const COOKIE_CONSENT_CHANGE_EVENT = 'cookieConsentChange'

export function setCookieConsent(value: CookieConsentValue) {
  if (!isClient()) {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365; // 1 year
  const secureFlag = window.location.protocol === 'https:' ? '; secure' : '';

  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }))
}

export function isCookieConsentAccepted() {
  return getCookieConsent() === 'accepted';
}

export function isCookieConsentRejected() {
  return getCookieConsent() === 'rejected';
}

export function onCookieConsentChange(
  callback: (value: CookieConsentValue) => void,
) {
  if (!isClient()) {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsentValue>
    callback(customEvent.detail)
  }

  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, listener)

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, listener)
  }
}
