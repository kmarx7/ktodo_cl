/**
 * iOS Safari does not implement navigator.vibrate, so this is a no-op there.
 * Treat haptics as an Android-only enhancement, never as required feedback.
 */
export function tapFeedback(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}
