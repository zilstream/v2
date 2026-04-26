import { createContext, useContext } from "react";

const WalletReadyContext = createContext(false);

export function WalletReadyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletReadyContext.Provider value={true}>
      {children}
    </WalletReadyContext.Provider>
  );
}

export function useWalletReady() {
  return useContext(WalletReadyContext);
}
