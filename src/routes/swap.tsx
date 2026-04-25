import { createFileRoute } from "@tanstack/react-router";
import { DexSwap } from "@/components/dex-swap";
import { fetchTokens } from "@/lib/zilstream";

export const Route = createFileRoute("/swap")({
  loader: async () => {
    const { data: tokens } = await fetchTokens();
    return { tokens };
  },
  head: () => ({
    meta: [
      { title: "Swap - ZilStream" },
      { name: "description", content: "Swap tokens on ZilStream" },
    ],
  }),
  component: SwapPage,
});

function SwapPage() {
  const { tokens } = Route.useLoaderData();

  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-screen-lg flex-col items-center justify-center gap-8 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Swap</h1>
        <p className="text-muted-foreground">Trade tokens instantly</p>
      </div>
      <DexSwap initialTokens={tokens} />
    </div>
  );
}
