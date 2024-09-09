"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { mainnet } from "wagmi/chains";

import { config } from "@/configs/wagmi-config";

const queryClient = new QueryClient();

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={mainnet}
          theme={
            resolvedTheme === "dark"
              ? darkTheme({
                  accentColor: "white",
                  accentColorForeground: "#24292F",
                })
              : lightTheme({
                  accentColor: "#24292F",
                  accentColorForeground: "white",
                })
          }
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
