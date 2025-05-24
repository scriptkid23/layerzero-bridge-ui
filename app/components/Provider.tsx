"use client";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bscTestnet, mainnet, polygon, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, polygon, bscTestnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bscTestnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
