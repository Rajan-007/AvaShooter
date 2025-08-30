import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import BtnTemp from '../assets/btn-template.svg';
import { IoIosWallet } from "react-icons/io";
import { BACKEND_URL } from '@/lib/constant';

interface UserData {
    _id: string,
    walletAddress: string,
    __v: number,
    isStaked: boolean,
    kills: number,
    score: number,
    username: string
}

export const CustomWallet = ({
  setShowModal,
  setPendingWalletAddress,
  setFetchedUserData
}: {
  setShowModal: (value: boolean) => void;
  setPendingWalletAddress: (address: string | null) => void;
  setFetchedUserData: (data: UserData | null) => void;
}) => {
  // Track connection status in component state
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check local storage on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  // Update localStorage when wallet connection changes
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else if (!isWalletConnected && localStorage.getItem('walletAddress')) {
      localStorage.removeItem('walletAddress');
      setFetchedUserData(null)
    }
  }, [isWalletConnected, walletAddress, setFetchedUserData]);

  useEffect(() => {
    const checkAndSetupUser = async () => {
      if (!walletAddress) return;

      try {
        const response = await fetch(`${BACKEND_URL}/api/user/${walletAddress}`);

        if (response.status === 404) {
          // Show modal instead of prompt
          setPendingWalletAddress(walletAddress);
          setShowModal(true);
        } else if (response.ok) {
          const data = await response.json();
          setFetchedUserData(data);
          console.log("👤 User exists:", data);
        } else {
          console.error("❌ Unexpected error:", await response.text());
        }
      } catch (error) {
        console.error("❌ Error checking/setting up user:", error);
      }
    };

    if (isWalletConnected) {
      checkAndSetupUser();
    }
  }, [walletAddress, isWalletConnected]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        
        // Update our component state when RainbowKit connection state changes
        // This is safe to do in the render function as it doesn't directly use hooks
        if (connected !== isWalletConnected) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => {
            setIsWalletConnected(connected ?? false);
            if (connected && account) {
              setWalletAddress(account.address);
            } else {
              setWalletAddress(null);
            }
          }, 0);
        }

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <div
                    className="relative flex flex-col items-center justify-center -mt-1 hover:cursor-pointer hover:scale-105 transition duration-300"
                    onClick={openConnectModal}
                  >
                    <Image
                      src={BtnTemp}
                      alt="Button Template"
                      width={60}
                      height={60}
                      className="align-middle"
                    />
                    <div className="absolute flex flex-col items-center justify-center">
                      <IoIosWallet className="text-yellow-400 text-2xl" />
                      <span className="text-yellow-400 font-bold text-xs text-center relative bottom-2 mt-2">
                        WALLET
                      </span>
                    </div>
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-3 p-2 rounded-xl bg-gray-900 border border-yellow-400 text-yellow-300 shadow-md">
                  {/* Chain info */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-full hover:bg-yellow-500/30 transition"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        src={chain.iconUrl}
                        alt={chain.name ?? 'Chain icon'}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-sm font-semibold">{chain.name}</span>
                  </button>

                  {/* Account info */}
                  <button
                    onClick={openAccountModal}
                    className="px-3 py-1 rounded-md hover:bg-yellow-500/10 transition"
                  >
                    <div className="text-sm font-medium">
                      {account.displayName}
                    </div>
                    {account.displayBalance && (
                      <div className="text-xs text-yellow-400">
                        {account.displayBalance}
                      </div>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};