import { useNav, type Screen } from "@/lib/nav";
import { useT } from "@/lib/i18n";
import { ITEM_TYPE_HAS_AMOUNT } from "@/types/item";
import { HeaderBar } from "@/components/HeaderBar";
import { TabBar } from "@/components/TabBar";
import { HomeCards } from "@/components/HomeCards";
import { ListPage } from "@/components/ListPage";
import { CalendarView } from "@/components/CalendarView";
import { SettingsView } from "@/components/SettingsView";
import { UndoToast } from "@/components/UndoToast";
import { EditItemSheet } from "@/components/EditItemSheet";
import { UpcomingAnniversaries } from "@/components/UpcomingAnniversaries";
import { RememberScreen } from "@/components/RememberScreen";
import { AnniversaryEditSheet } from "@/components/AnniversaryEditSheet";
import { Paywall } from "@/components/Paywall";
import { InAppPurchasePage } from "@/pages/InAppPurchasePage";
import { usePremiumStore } from "@/lib/premiumStore";
import { MONETIZATION_ENABLED } from "@/lib/features";

function ScreenBody({ screen }: { screen: Exclude<Screen, "iap"> }) {
  const isPremium = usePremiumStore((state) => state.isPremium);
  // When monetization is off (free-first launch) the Calendar is free for all.
  const canUseCalendar = !MONETIZATION_ENABLED || isPremium;

  if (screen === "home") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <HomeCards />
        <UpcomingAnniversaries />
      </div>
    );
  }
  // Calendar (and its due-date reminders) is a premium feature when monetized.
  if (screen === "calendar") return canUseCalendar ? <CalendarView /> : <Paywall />;
  if (screen === "settings") return <SettingsView />;
  if (screen === "remember") return <RememberScreen />;
  // Remaining screens are the four item categories.
  return <ListPage type={screen} showAmount={ITEM_TYPE_HAS_AMOUNT[screen]} />;
}

function App() {
  const screen = useNav((state) => state.screen);
  const go = useNav((state) => state.go);
  const t = useT();

  // The in-app-purchase flow is a standalone screen with its own TDS header.
  if (screen === "iap") {
    return <InAppPurchasePage onBack={() => go("settings")} />;
  }

  return (
    <>
      {screen === "home" ? (
        <header className="flex shrink-0 items-center px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {t("app.name")}
          </h1>
        </header>
      ) : (
        <HeaderBar screen={screen} />
      )}

      <main className="flex min-h-0 flex-1 flex-col">
        <ScreenBody screen={screen} />
      </main>

      <TabBar />
      <UndoToast />
      <EditItemSheet />
      <AnniversaryEditSheet />
    </>
  );
}

export default App;
