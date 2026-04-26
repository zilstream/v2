import { type ComponentType, useEffect, useState } from "react";

type WalletStackComponent = ComponentType<{ children: React.ReactNode }>;

export function DeferredWallet({ children }: { children: React.ReactNode }) {
  const [Stack, setStack] = useState<WalletStackComponent | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      import("./wallet-stack").then(({ WalletStack }) => {
        if (!cancelled) setStack(() => WalletStack);
      });
    };

    const ric = (
      globalThis as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    ).requestIdleCallback;

    if (ric) {
      const handle = ric(load, { timeout: 2000 });
      return () => {
        cancelled = true;
        (
          globalThis as {
            cancelIdleCallback?: (handle: number) => void;
          }
        ).cancelIdleCallback?.(handle);
      };
    }

    const handle = setTimeout(load, 1);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, []);

  if (Stack) return <Stack>{children}</Stack>;
  return <>{children}</>;
}
