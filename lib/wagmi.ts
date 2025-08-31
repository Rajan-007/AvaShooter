import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  sepolia,
  somniaTestnet,
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AvaShooter Game',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    avalancheFuji, // Primary chain - Avalanche Fuji testnet
    sepolia,
    baseSepolia,
    somniaTestnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [somniaTestnet] : []),
  ],
  ssr: false,
});