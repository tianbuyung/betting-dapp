import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

type Transports = {
  [key: number]: ReturnType<typeof http>;
};

const chains = [
  mainnet,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
] as const;

const transports: Transports = {
  [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_URL_TRANSPORT),
};

if (process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true") {
  transports[sepolia.id] = http(process.env.NEXT_PUBLIC_SEPOLIA_URL_TRANSPORT);
}

export const config = getDefaultConfig({
  appName: "encodeClub App",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
  chains,
  transports,
  ssr: true,
});
