'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BACKEND_URL } from '@/lib/constant';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [roomsPlayed, setRoomsPlayed] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stakingHistory, setStakingHistory] = useState([]);
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

      // Fetch rooms played
      const roomsResponse = await fetch(`${BACKEND_URL}/api/user/rooms-played/${address}`);
      if (roomsResponse.ok) {
        const rooms = await roomsResponse.json();
        setRoomsPlayed(rooms);
      }

      // Fetch leaderboard data
      const leaderboardResponse = await fetch(`${BACKEND_URL}/api/leaderboard/wallet/${address}`);
      if (leaderboardResponse.ok) {
        const leaderboard = await leaderboardResponse.json();
        setLeaderboardData(leaderboard);
      }

      // Fetch staking history
      const stakingResponse = await fetch(`${BACKEND_URL}/api/stake/history/${address}`);
      if (stakingResponse.ok) {
        const staking = await stakingResponse.json();
        setStakingHistory(staking);
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
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'rooms' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Rooms Played ({roomsPlayed.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'leaderboard' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Leaderboard ({leaderboardData.length})
          </button>
                     <button
             onClick={() => setActiveTab('staking')}
             className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
               activeTab === 'staking' 
                 ? 'bg-yellow-500 text-black' 
                 : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
             }`}
           >
             Staking History ({stakingHistory.length})
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

          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Rooms Played</h2>
              {roomsPlayed.length > 0 ? (
                <div className="space-y-4">
                  {roomsPlayed.map((room, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-yellow-400">Room: {room.roomId}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.users.some(u => u.walletAddress === address && u.iswinner) 
                            ? 'bg-green-600' 
                            : 'bg-gray-600'
                        }`}>
                          {room.users.some(u => u.walletAddress === address && u.iswinner) ? 'Winner' : 'Participant'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Players:</p>
                          <div className="space-y-1 mt-1">
                            {room.users.map((user, userIndex) => (
                              <p key={userIndex} className="flex items-center">
                                <span className={user.walletAddress === address ? 'text-yellow-400 font-semibold' : ''}>
                                  {user.username}
                                </span>
                                {user.iswinner && <span className="ml-2 text-green-400">👑</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400">Game Time:</p>
                          <p className="mt-1">{formatTime(room.gameTime || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Players:</p>
                          <p className="mt-1">{room.users.length}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No rooms played yet</p>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Leaderboard Entries</h2>
              {leaderboardData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-3 text-yellow-400">Room ID</th>
                        <th className="text-left p-3 text-yellow-400">Username</th>
                        <th className="text-left p-3 text-yellow-400">Score</th>
                        <th className="text-left p-3 text-yellow-400">Kills</th>
                        <th className="text-left p-3 text-yellow-400">Game Time</th>
                        <th className="text-left p-3 text-yellow-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((entry, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="p-3">{entry.roomId}</td>
                          <td className="p-3 font-semibold">{entry.username}</td>
                          <td className="p-3 text-green-400">{entry.score}</td>
                          <td className="p-3 text-red-400">{entry.kills}</td>
                          <td className="p-3">{formatTime(entry.gameTime || 0)}</td>
                          <td className="p-3 text-gray-400">{formatDate(entry.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center">No leaderboard entries yet</p>
              )}
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Staking History</h2>
              {stakingHistory.length > 0 ? (
                <div className="space-y-4">
                  {stakingHistory.map((stake, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-yellow-400">
                            Stake Amount: {stake.amount} STK
                          </p>
                          <p className="text-gray-400 text-sm">
                            Date: {formatDate(stake.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">Staked</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No staking history available</p>
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
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Available Contract Functions</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-400">Create Room</h4>
                        <p className="text-gray-400 text-sm">POST /api/avalanche/rooms</p>
                        <p className="text-gray-400 text-xs">Creates a new room with IPFS data storage</p>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-400">Update Room</h4>
                        <p className="text-gray-400 text-sm">PUT /api/avalanche/rooms/:id</p>
                        <p className="text-gray-400 text-xs">Updates room data with new IPFS link</p>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-red-400">Delete Room</h4>
                        <p className="text-gray-400 text-sm">DELETE /api/avalanche/rooms/:id</p>
                        <p className="text-gray-400 text-xs">Removes room from blockchain</p>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-semibold text-yellow-400">Get Room</h4>
                        <p className="text-gray-400 text-sm">GET /api/avalanche/rooms/:id</p>
                        <p className="text-gray-400 text-xs">Retrieves room data from blockchain</p>
                      </div>
                      
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-purple-400">Get Owner</h4>
                        <p className="text-gray-400 text-sm">GET /api/avalanche/owner</p>
                        <p className="text-gray-400 text-xs">Gets the contract owner address</p>
                      </div>
                    </div>
                  </div>

                  {/* IPFS Integration Info */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">IPFS Integration</h3>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">
                        Room data is stored on IPFS (InterPlanetary File System) and referenced on the Avalanche blockchain.
                        This provides decentralized, permanent storage for game room information.
                      </p>
                      <div className="bg-gray-800 p-3 rounded text-xs font-mono">
                        <p className="text-green-400">IPFS Hash Format: ipfs://Qm...</p>
                        <p className="text-blue-400">Blockchain Reference: Room ID → IPFS Hash</p>
                      </div>
                    </div>
                  </div>

                                     {/* Recent Rooms */}
                   {avalancheData.rooms.length > 0 && (
                     <div className="bg-gray-700 p-4 rounded-lg">
                       <h3 className="text-lg font-semibold mb-3 text-yellow-400">Recent Rooms ({avalancheData.rooms.length})</h3>
                       <div className="space-y-3 max-h-60 overflow-y-auto">
                         {avalancheData.rooms.slice(0, 10).map((room, index) => (
                           <div key={index} className="bg-gray-800 p-3 rounded border-l-4 border-green-500">
                             <div className="flex justify-between items-start">
                               <div>
                                 <p className="font-semibold text-green-400">Room: {room.roomId}</p>
                                 <p className="text-xs text-gray-400">IPFS: {room.ipfsHash}</p>
                                 <p className="text-xs text-gray-400">Block: {room.blockNumber}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-gray-400">{formatDate(room.createdAt)}</p>
                                 <span className={`px-2 py-1 rounded text-xs ${
                                   room.status === 'confirmed' ? 'bg-green-600' : 
                                   room.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
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
                     <div className="bg-gray-700 p-4 rounded-lg">
                       <h3 className="text-lg font-semibold mb-3 text-yellow-400">Recent Transactions ({avalancheData.transactions.length})</h3>
                       <div className="space-y-3 max-h-60 overflow-y-auto">
                         {avalancheData.transactions.slice(0, 10).map((tx, index) => (
                           <div key={index} className="bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                             <div className="flex justify-between items-start">
                               <div>
                                 <p className="font-semibold text-blue-400">{tx.operation.toUpperCase()}</p>
                                 <p className="text-xs text-gray-400">TX: {tx.txHash.substring(0, 10)}...</p>
                                 {tx.roomId && <p className="text-xs text-gray-400">Room: {tx.roomId}</p>}
                                 <p className="text-xs text-gray-400">Gas: {tx.gasUsed || 'N/A'}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                                 <span className={`px-2 py-1 rounded text-xs ${
                                   tx.status === 'confirmed' ? 'bg-green-600' : 
                                   tx.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
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
                   <div className="bg-gray-700 p-4 rounded-lg">
                     <h3 className="text-lg font-semibold mb-3 text-yellow-400">Network Information</h3>
                     <div className="space-y-2">
                       <p className="text-gray-400 text-sm">
                         <span className="text-yellow-400">Network:</span> Avalanche Fuji Testnet
                       </p>
                       <p className="text-gray-400 text-sm">
                         <span className="text-yellow-400">Blockchain:</span> Smart contract manages room metadata
                       </p>
                       <p className="text-gray-400 text-sm">
                         <span className="text-yellow-400">Storage:</span> IPFS for decentralized data storage
                       </p>
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