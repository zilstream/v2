import { PairDetailView } from "@/components/pair-detail-view";
import {
  fetchPairByAddress,
  fetchPairEvents,
  fetchTokenByAddress,
} from "@/lib/zilstream";

export default async function PairEventsPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: pairAddress } = await params;

  const pair = await fetchPairByAddress(pairAddress);

  const [eventsResponse, token0, token1] = await Promise.all([
    fetchPairEvents(pairAddress),
    fetchTokenByAddress(pair.token0),
    fetchTokenByAddress(pair.token1),
  ]);

  const { data: events } = eventsResponse;

  return (
    <PairDetailView
      key={pair.address}
      initialPair={pair}
      events={events}
      tokens={[token0, token1]}
    />
  );
}
