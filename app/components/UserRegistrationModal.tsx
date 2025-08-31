import { useState } from 'react';
import { BACKEND_URL } from '@/lib/constant';
import toast from 'react-hot-toast';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onUserRegistered: (userData: any) => void;
}

export const UserRegistrationModal = ({
  isOpen,
  onClose,
  walletAddress,
  onUserRegistered
}: UserRegistrationModalProps) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);

    try {
      // Remove trailing slash if it exists
      const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
      console.log('🔗 Attempting to register at:', `${baseUrl}/api/user/create-or-update`);

      const response = await fetch(`${baseUrl}/api/user/create-or-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          walletAddress,
          username: username.trim(),
          timestamp: new Date().toISOString() // Add timestamp to prevent caching
        }),
      });

      console.log('📡 Registration response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Registration response data:', result);

        if (result.success) {
          toast.success(result.isNewUser ? 'User registered successfully!' : 'Username updated successfully!');
          onUserRegistered(result.user);
          onClose();
        } else {
          console.error('❌ Registration failed:', result);
          toast.error(result.error || 'Failed to register user. Please try again.');
        }
      } else {
        let errorMessage = 'Failed to register user. Please try again.';
        try {
          const errorData = await response.json();
          console.error('❌ Registration error:', errorData);
          if (errorData.error === 'Username already taken') {
            errorMessage = 'Username already taken. Please choose another one.';
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Network error during registration:', error);
      toast.error('Connection failed. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="bg-gray-900 border border-yellow-400 rounded-lg p-6 w-96 max-w-[90vw] relative"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <h2 className="text-yellow-400 text-xl font-bold mb-4 text-center">
        Welcome to AvaShooter!
      </h2>
      
      <p className="text-gray-300 text-sm mb-4 text-center">
        Please choose a username to complete your registration.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <label htmlFor="username" className="block text-yellow-400 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 relative z-10"
            placeholder="Enter your username"
            maxLength={20}
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="flex-1 px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-400 text-center">
        Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </div>
    </div>
  );
};
