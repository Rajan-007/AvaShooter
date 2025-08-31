import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import BtnTemp from '../assets/btn-template.svg';
import { IoIosWallet } from "react-icons/io";
import { BACKEND_URL, getStoredWalletAddress, setStoredWalletAddress, removeStoredWalletAddress } from '@/lib/constant';
import toast from 'react-hot-toast';
import { UserRegistrationModal } from './UserRegistrationModal';

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
  setFetchedUserData
}: {
  setFetchedUserData: (data: UserData | null) => void;
}) => {
  // Track connection status in component state
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [isCheckingUser, setIsCheckingUser] = useState<boolean>(false);

  // Check local storage on component mount and set wallet address
  useEffect(() => {
    const storedAddress = getStoredWalletAddress();
    if (storedAddress) {
      setWalletAddress(storedAddress);
      console.log('📱 Retrieved wallet address from localStorage:', storedAddress);
    }
  }, []);

  // Store wallet address in localStorage immediately when available
  useEffect(() => {
    if (walletAddress) {
      setStoredWalletAddress(walletAddress);
    }
  }, [walletAddress]);

  // Update localStorage when wallet connection changes
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      setStoredWalletAddress(walletAddress);
    } else if (!isWalletConnected && getStoredWalletAddress()) {
      removeStoredWalletAddress();
      setFetchedUserData(null);
      setShowRegistrationModal(false); // Hide modal when wallet disconnects
    }
  }, [isWalletConnected, walletAddress, setFetchedUserData]);

  // Fetch user data when wallet is connected
  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress || !isWalletConnected) {
        // Reset modal state when wallet is not connected
        setShowRegistrationModal(false);
        return;
      }

      setIsCheckingUser(true);

      try {
        // Remove trailing slash if it exists and add the path
        const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        console.log('🔗 Attempting to connect to:', `${baseUrl}/api/user/connect`);

        const response = await fetch(`${baseUrl}/api/user/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            walletAddress,
            timestamp: new Date().toISOString() // Add timestamp to prevent caching
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Response data:', data);
          
          if (data.user) {
            // User exists, set the data
            setFetchedUserData(data.user);
            console.log("👤 Existing user data fetched:", data.user);
            setShowRegistrationModal(false);
          } else if (data.isNewUser && data.needsUsername) {
            // New user needs to provide username
            console.log("🆕 New user needs username");
            setFetchedUserData(null);
            setShowRegistrationModal(true);
          } else {
            console.log("❓ Unexpected response format:", data);
            setFetchedUserData(null);
            setShowRegistrationModal(false); // Don't show modal for unexpected responses
          }
        } else {
          const errorText = await response.text();
          console.error("❌ Server error:", response.status, errorText);
          if (response.status === 404) {
            // If user not found, show registration modal
            console.log("👋 New user - showing registration");
            setShowRegistrationModal(true);
          } else {
            toast.error(`Server error: ${response.status}. Please try again.`);
            setShowRegistrationModal(false); // Don't show modal for server errors
          }
          setFetchedUserData(null);
        }
      } catch (error) {
        console.error("❌ Error checking user status:", error);
        toast.error("Connection failed. Please check your internet connection and try again.");
        setFetchedUserData(null);
        setShowRegistrationModal(false); // Don't show modal for network errors
      } finally {
        setIsCheckingUser(false);
      }
    };

    fetchUserData();
  }, [walletAddress, isWalletConnected, setFetchedUserData]);

  // Cleanup effect to reset modal state when component unmounts
  useEffect(() => {
    return () => {
      setShowRegistrationModal(false);
      setIsCheckingUser(false);
    };
  }, []);

  // Handle user registration success
  const handleUserRegistered = (userData: UserData) => {
    setFetchedUserData(userData);
    setShowRegistrationModal(false);
  };

  return (
    <>
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
                        {isCheckingUser ? 'Checking...' : account.displayName}
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

      {/* User Registration Modal */}
      {walletAddress && isWalletConnected && showRegistrationModal && (
        <UserRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          walletAddress={walletAddress}
          onUserRegistered={handleUserRegistered}
        />
      )}
    </>
  );
};