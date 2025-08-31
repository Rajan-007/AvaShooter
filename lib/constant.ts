export const BACKEND_URL = "http://localhost:5001";

// Utility functions for wallet address management
export const getStoredWalletAddress = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('walletAddress');
  }
  return null;
};

export const setStoredWalletAddress = (address: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('walletAddress', address);
    console.log('💾 Wallet address stored:', address);
  }
};

export const removeStoredWalletAddress = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('walletAddress');
    console.log('🗑️ Wallet address removed from storage');
  }
};    