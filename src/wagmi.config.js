import { configureChains, createConfig } from '@wagmi/core';
import { sepolia } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask';

const { chains, publicClient } = configureChains(
  [sepolia],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains })
  ],
  publicClient,
}); 