export const CLOSING_TITLE = "ZilStream is closing down";
export const CLOSING_BODY =
  "Exploits on Zilliqa have drained pools and bridged funds. There is no clean way to recover the chain, which leaves the ledger inherently broken. It is no longer safe to trade, provide liquidity, or bridge on Zilliqa, so ZilStream is shutting down.";
export const CLOSING_THANKS =
  "Thank you to everyone who used ZilStream over the years.";

export function ClosingBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),transparent_60%)]" />
      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-balance font-semibold text-2xl leading-tight sm:text-3xl">
          {CLOSING_TITLE}
        </h1>
        <p className="text-pretty text-foreground/80 text-lg leading-relaxed">
          {CLOSING_BODY}
        </p>
        <p className="text-foreground/80 text-lg">{CLOSING_THANKS}</p>
      </div>
    </section>
  );
}
