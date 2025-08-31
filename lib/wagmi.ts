import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  somniaTestnet,
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AvaShooter Game',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    avalancheFuji,
    baseSepolia,
    somniaTestnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [avalancheFuji] : []),
  ],
  ssr: false,
});