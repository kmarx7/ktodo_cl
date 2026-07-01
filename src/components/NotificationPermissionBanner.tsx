"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

export function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("alarm-banner-dismissed") === "1";
    const supported = typeof window !== "undefined" && "Notification" in window;
    // Reads browser-only APIs (localStorage, Notification) unavailable during SSR,
    // so this can only be resolved after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(supported && !dismissed && Notification.permission === "default");
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem("alarm-banner-dismissed", "1");
    setVisible(false);
  }

  async function enable() {
    await Notification.requestPermission();
    dismiss();
  }

  return (
    <div className="flex shrink-0 items-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
      <BellRing size={14} className="shrink-0" />
      <span className="flex-1">Turn on notifications to get reminders while the app is open</span>
      <button type="button" onClick={enable} className="shrink-0 touch-manipulation rounded bg-amber-900 px-2 py-1 text-white dark:bg-amber-200 dark:text-amber-900">
        Enable
      </button>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="shrink-0 touch-manipulation">
        <X size={14} />
      </button>
    </div>
  );
}
