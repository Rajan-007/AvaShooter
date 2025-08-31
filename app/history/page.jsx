'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BACKEND_URL } from '@/lib/constant';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [avalancheData, setAvalancheData] = useState({
    rooms: [],
    transactions: [],
    stats: null,
    owner: null,
    loading: false
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isConnected && address) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetch(`${BACKEND_URL}/api/user/${address}`);
      if (userResponse.ok) {
        const user = await userResponse.json();
        setUserData(user);
      }

      // Fetch Avalanche data
      await fetchAvalancheData();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvalancheData = async () => {
    setAvalancheData(prev => ({ ...prev, loading: true }));
    try {
      // Fetch contract owner
      const ownerResponse = await fetch(`${BACKEND_URL}/api/avalanche/owner`);
      if (ownerResponse.ok) {
        const ownerData = await ownerResponse.json();
        setAvalancheData(prev => ({ ...prev, owner: ownerData.owner }));
      }

      // Fetch all rooms from MongoDB
      const roomsResponse = await fetch(`${BACKEND_URL}/api/avalanche/rooms`);
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setAvalancheData(prev => ({ ...prev, rooms: roomsData.rooms }));
      }

      // Fetch all transactions from MongoDB
      const transactionsResponse = await fetch(`${BACKEND_URL}/api/avalanche/transactions`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setAvalancheData(prev => ({ ...prev, transactions: transactionsData.transactions }));
      }

      // Fetch blockchain statistics
      const statsResponse = await fetch(`${BACKEND_URL}/api/avalanche/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAvalancheData(prev => ({ ...prev, stats: statsData.stats }));
      }
    } catch (error) {
      console.error('Error fetching Avalanche data:', error);
      toast.error('Failed to load Avalanche data');
    } finally {
      setAvalancheData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Game History</h1>
          <div className="text-center text-gray-400">
            Please connect your wallet to view your game history.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Game History</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Game History</h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'profile' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('avalanche')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'avalanche' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Avalanche Blockchain
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Player Profile</h2>
              {userData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Basic Info</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Username:</span> {userData.username}</p>
                      <p><span className="text-gray-400">Wallet:</span> {userData.walletAddress}</p>
                      <p><span className="text-gray-400">Member Since:</span> {formatDate(userData.createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Current Status</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="text-gray-400">Staking Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${userData.isStaked ? 'bg-green-600' : 'bg-red-600'}`}>
                          {userData.isStaked ? 'Staked' : 'Not Staked'}
                        </span>
                      </p>
                      {userData.currentRoomId && (
                        <>
                          <p><span className="text-gray-400">Current Room:</span> {userData.currentRoomId}</p>
                          <p><span className="text-gray-400">Room Duration:</span> {formatTime(userData.currentRoomDuration)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">No profile data available</p>
              )}
            </div>
          )}



          {activeTab === 'avalanche' && (
            <div className="space-y-8">
              {/* Header with Icon */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Avalanche Blockchain</h2>
                <p className="text-gray-400">Decentralized Game Data & IPFS Storage</p>
              </div>
              
              {avalancheData.loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                  <p className="text-gray-400 font-medium">Loading blockchain data...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Blockchain Statistics Dashboard */}
                  {avalancheData.stats && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-yellow-400">Blockchain Statistics</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-green-500 transition-colors">
                          <div className="text-3xl font-bold text-green-400 mb-1">{avalancheData.stats.totalRooms}</div>
                          <div className="text-xs text-gray-400 font-medium">Total Rooms</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-blue-500 transition-colors">
                          <div className="text-3xl font-bold text-blue-400 mb-1">{avalancheData.stats.totalTransactions}</div>
                          <div className="text-xs text-gray-400 font-medium">Total TX</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-yellow-500 transition-colors">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{avalancheData.stats.confirmedTransactions}</div>
                          <div className="text-xs text-gray-400 font-medium">Confirmed</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-red-500 transition-colors">
                          <div className="text-3xl font-bold text-red-400 mb-1">{avalancheData.stats.pendingTransactions}</div>
                          <div className="text-xs text-gray-400 font-medium">Pending</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-purple-500 transition-colors">
                          <div className="text-3xl font-bold text-purple-400 mb-1">{avalancheData.stats.recentRooms}</div>
                          <div className="text-xs text-gray-400 font-medium">24h Rooms</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center hover:border-cyan-500 transition-colors">
                          <div className="text-3xl font-bold text-cyan-400 mb-1">{avalancheData.stats.recentTransactions}</div>
                          <div className="text-xs text-gray-400 font-medium">24h TX</div>
                        </div>
                      </div>
                    </div>
                  )}

                   {/* Contract Owner Info */}
                   <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                     <div className="flex items-center mb-4">
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                         <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <h3 className="text-xl font-bold text-yellow-400">Contract Information</h3>
                     </div>
                     <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                       <div className="flex items-center justify-between mb-3">
                         <span className="text-gray-400 font-medium">Contract Owner:</span>
                         <div className="flex items-center">
                           <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                           <span className="text-green-400 text-sm font-medium">Active</span>
                         </div>
                       </div>
                       <div className="bg-gray-900 p-3 rounded border border-gray-600">
                         <code className="text-sm text-blue-400 font-mono break-all">
                           {avalancheData.owner || 'Loading contract owner...'}
                         </code>
                       </div>
                       <p className="text-gray-400 text-sm mt-3">
                         This address owns the Avalanche smart contract that manages all room data on the blockchain.
                       </p>
                     </div>
                   </div>

                  {/* Avalanche Contract Features */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-yellow-400">Available Contract Functions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500 hover:border-blue-400 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-blue-400">Create Room</h4>
                        </div>
                        <p className="text-gray-400 text-sm font-mono mb-1">POST /api/avalanche/rooms</p>
                        <p className="text-gray-500 text-xs">Creates a new room with IPFS data storage</p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 hover:border-green-400 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-green-400">Update Room</h4>
                        </div>
                        <p className="text-gray-400 text-sm font-mono mb-1">PUT /api/avalanche/rooms/:id</p>
                        <p className="text-gray-500 text-xs">Updates room data with new IPFS link</p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500 hover:border-red-400 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-red-400">Delete Room</h4>
                        </div>
                        <p className="text-gray-400 text-sm font-mono mb-1">DELETE /api/avalanche/rooms/:id</p>
                        <p className="text-gray-500 text-xs">Removes room from blockchain</p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500 hover:border-yellow-400 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-yellow-400">Get Room</h4>
                        </div>
                        <p className="text-gray-400 text-sm font-mono mb-1">GET /api/avalanche/rooms/:id</p>
                        <p className="text-gray-500 text-xs">Retrieves room data from blockchain</p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500 hover:border-purple-400 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-purple-400">Get Owner</h4>
                        </div>
                        <p className="text-gray-400 text-sm font-mono mb-1">GET /api/avalanche/owner</p>
                        <p className="text-gray-500 text-xs">Gets the contract owner address</p>
                      </div>
                    </div>
                  </div>

                                     {/* IPFS Integration Info */}
                   <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                     <div className="flex items-center mb-6">
                       <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                         <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <h3 className="text-xl font-bold text-yellow-400">IPFS Integration</h3>
                     </div>
                     <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                       <p className="text-gray-300 text-sm leading-relaxed mb-4">
                         Room data is stored on <span className="text-emerald-400 font-semibold">IPFS (InterPlanetary File System)</span> and referenced on the Avalanche blockchain.
                         This provides decentralized, permanent storage for game room information with enhanced security and reliability.
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-gray-900 p-4 rounded border border-gray-600">
                           <div className="flex items-center mb-2">
                             <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                             <span className="text-green-400 font-mono text-sm">IPFS Hash Format</span>
                           </div>
                           <code className="text-xs text-gray-300 font-mono">ipfs://Qm...</code>
                         </div>
                         <div className="bg-gray-900 p-4 rounded border border-gray-600">
                           <div className="flex items-center mb-2">
                             <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                             <span className="text-blue-400 font-mono text-sm">Blockchain Reference</span>
                           </div>
                           <code className="text-xs text-gray-300 font-mono">Room ID → IPFS Hash</code>
                         </div>
                       </div>
                     </div>
                   </div>

                                     {/* Recent Rooms */}
                   {avalancheData.rooms.length > 0 && (
                     <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center">
                           <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                             </svg>
                           </div>
                           <h3 className="text-xl font-bold text-yellow-400">Recent Rooms</h3>
                         </div>
                         <div className="bg-gray-800 px-3 py-1 rounded-full">
                           <span className="text-sm text-gray-300">{avalancheData.rooms.length} total</span>
                         </div>
                       </div>
                       <div className="space-y-3 max-h-80 overflow-y-auto">
                         {avalancheData.rooms.slice(0, 10).map((room, index) => (
                           <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="flex items-center mb-2">
                                   <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                   <h4 className="font-semibold text-green-400">Room: {room.roomId}</h4>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                   <div className="bg-gray-900 p-2 rounded border border-gray-600">
                                     <span className="text-gray-400">IPFS Hash:</span>
                                     <p className="text-blue-400 font-mono truncate">{room.ipfsHash}</p>
                                   </div>
                                   <div className="bg-gray-900 p-2 rounded border border-gray-600">
                                     <span className="text-gray-400">Block:</span>
                                     <p className="text-yellow-400 font-mono">{room.blockNumber || 'N/A'}</p>
                                   </div>
                                 </div>
                               </div>
                               <div className="text-right ml-4">
                                 <p className="text-xs text-gray-400 mb-2">{formatDate(room.createdAt)}</p>
                                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                   room.status === 'confirmed' ? 'bg-green-600 text-white' : 
                                   room.status === 'pending' ? 'bg-yellow-600 text-black' : 'bg-red-600 text-white'
                                 }`}>
                                   {room.status}
                                 </span>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Recent Transactions */}
                   {avalancheData.transactions.length > 0 && (
                     <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center">
                           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <h3 className="text-xl font-bold text-yellow-400">Recent Transactions</h3>
                         </div>
                         <div className="bg-gray-800 px-3 py-1 rounded-full">
                           <span className="text-sm text-gray-300">{avalancheData.transactions.length} total</span>
                         </div>
                       </div>
                       <div className="space-y-3 max-h-80 overflow-y-auto">
                         {avalancheData.transactions.slice(0, 10).map((tx, index) => (
                           <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="flex items-center mb-2">
                                   <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                                   <h4 className="font-semibold text-blue-400">{tx.operation.toUpperCase()}</h4>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                   <div className="bg-gray-900 p-2 rounded border border-gray-600">
                                     <span className="text-gray-400">TX Hash:</span>
                                     <p className="text-purple-400 font-mono truncate">{tx.txHash.substring(0, 12)}...</p>
                                   </div>
                                   {tx.roomId && (
                                     <div className="bg-gray-900 p-2 rounded border border-gray-600">
                                       <span className="text-gray-400">Room:</span>
                                       <p className="text-green-400 font-mono">{tx.roomId}</p>
                                     </div>
                                   )}
                                   <div className="bg-gray-900 p-2 rounded border border-gray-600">
                                     <span className="text-gray-400">Gas Used:</span>
                                     <p className="text-yellow-400 font-mono">{tx.gasUsed || 'N/A'}</p>
                                   </div>
                                 </div>
                               </div>
                               <div className="text-right ml-4">
                                 <p className="text-xs text-gray-400 mb-2">{formatDate(tx.createdAt)}</p>
                                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                   tx.status === 'confirmed' ? 'bg-green-600 text-white' : 
                                   tx.status === 'pending' ? 'bg-yellow-600 text-black' : 'bg-red-600 text-white'
                                 }`}>
                                   {tx.status}
                                 </span>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Network Info */}
                   <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                     <div className="flex items-center mb-6">
                       <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                         <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <h3 className="text-xl font-bold text-yellow-400">Network Information</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                         <div className="flex items-center mb-2">
                           <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                           <span className="text-orange-400 font-semibold">Network</span>
                         </div>
                         <p className="text-gray-300 font-mono text-sm">Avalanche Fuji Testnet</p>
                       </div>
                       <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                         <div className="flex items-center mb-2">
                           <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                           <span className="text-blue-400 font-semibold">Blockchain</span>
                         </div>
                         <p className="text-gray-300 text-sm">Smart contract manages room metadata</p>
                       </div>
                       <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                         <div className="flex items-center mb-2">
                           <div className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></div>
                           <span className="text-emerald-400 font-semibold">Storage</span>
                         </div>
                         <p className="text-gray-300 text-sm">IPFS for decentralized data storage</p>
                       </div>
                     </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
} 