import { createFileRoute } from "@tanstack/react-router";
import { ClosingBanner } from "@/components/closing-banner";
import { LivePairsSection } from "@/components/live-pairs-section";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <ClosingBanner />
      <LivePairsSection />
    </main>
  );
}
