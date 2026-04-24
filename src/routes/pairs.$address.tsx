import { createFileRoute } from "@tanstack/react-router";
import { PairDetailView } from "@/components/pair-detail-view";
import {
  fetchPairByAddress,
  fetchPairEvents,
  fetchTokenByAddress,
} from "@/lib/zilstream";

export const Route = createFileRoute("/pairs/$address")({
  loader: async ({ params }) => {
    const pair = await fetchPairByAddress(params.address);
    const [eventsResponse, token0, token1] = await Promise.all([
      fetchPairEvents(params.address),
      fetchTokenByAddress(pair.token0),
      fetchTokenByAddress(pair.token1),
    ]);
    return { pair, events: eventsResponse.data, tokens: [token0, token1] };
  },
  component: PairEventsPage,
});

function PairEventsPage() {
  const { pair, events, tokens } = Route.useLoaderData();

  return (
    <PairDetailView
      key={pair.address}
      initialPair={pair}
      events={events}
      tokens={tokens}
    />
  );
}
