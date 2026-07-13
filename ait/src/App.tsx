import { Top } from "@toss/tds-mobile";
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
import { AlarmWatcher } from "@/components/AlarmWatcher";
import { InAppPurchasePage } from "@/pages/InAppPurchasePage";

function ScreenBody({ screen }: { screen: Exclude<Screen, "iap"> }) {
  if (screen === "home") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <HomeCards />
      </div>
    );
  }
  if (screen === "calendar") return <CalendarView />;
  if (screen === "settings") return <SettingsView />;
  // Remaining screens are the four item categories.
  return <ListPage type={screen} showAmount={ITEM_TYPE_HAS_AMOUNT[screen]} />;
}

function App() {
  const screen = useNav((state) => state.screen);
  const go = useNav((state) => state.go);
  const t = useT();

  // The in-app-purchase flow is a standalone screen with its own TDS header.
  if (screen === "iap") {
    return (
      <>
        <InAppPurchasePage onBack={() => go("settings")} />
        <AlarmWatcher />
      </>
    );
  }

  return (
    <>
      {screen === "home" ? (
        <Top title={<Top.TitleParagraph size={22}>{t("app.name")}</Top.TitleParagraph>} />
      ) : (
        <HeaderBar screen={screen} />
      )}

      <main className="flex min-h-0 flex-1 flex-col">
        <ScreenBody screen={screen} />
      </main>

      <TabBar />
      <UndoToast />
      <AlarmWatcher />
    </>
  );
}

export default App;
