import { PairDetailView } from "@/components/pair-detail-view";
import {
  fetchPairByAddress,
  fetchPairEvents,
  fetchTokens,
} from "@/lib/zilstream";

export default async function PairEventsPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: pairAddress } = await params;

  const [eventsResponse, pair, tokensResponse] = await Promise.all([
    fetchPairEvents(pairAddress),
    fetchPairByAddress(pairAddress),
    fetchTokens(),
  ]);

  const { data: events } = eventsResponse;

  return (
    <PairDetailView
      initialPair={pair}
      events={events}
      tokens={tokensResponse.data}
    />
  );
}
