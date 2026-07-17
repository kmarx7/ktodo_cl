/**
 * Master switch for the premium / monetization layer.
 *
 * `false` = free-first launch: Calendar + due-date reminders are available to
 * everyone, and all premium UI (paywall, tab-bar lock badge, Settings upgrade
 * row) is hidden.
 *
 * Flip to `true` once the in-app purchase product is registered and live in the
 * App-in-Toss console — that re-enables the paywall and premium gating with no
 * other code changes.
 */
export const MONETIZATION_ENABLED = false;
