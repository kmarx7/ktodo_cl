import { HomeCards } from "@/components/HomeCards";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <HomeCards />
    </div>
  );
}
