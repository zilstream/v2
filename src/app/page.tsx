import { HeroSection } from "@/components/hero-section";
import { LivePairsSection } from "@/components/live-pairs-section";

export default function HomePage() {
  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <HeroSection />
      <LivePairsSection />
    </main>
  );
}
