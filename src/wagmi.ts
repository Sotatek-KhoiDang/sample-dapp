import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { mainnet, sepolia, polygonAmoy } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia, polygonAmoy],
    connectors: [metaMask()],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [polygonAmoy.id]: http(),
    },
  });
}
export const config = getConfig()
declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
