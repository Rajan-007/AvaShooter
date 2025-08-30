import { Request, Response } from 'express';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { StakingHistory } from '../models/StakingHistory';
import { Leaderboard } from '../models/Leaderboard';
import { RequestHandler } from 'express';
import { CompletedRoom } from '../models/CompletedRooms';
// Update staked status
export const updateStakedStatus = async (req: Request, res: Response) => {
  const { walletAddress, isStaked } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      { isStaked },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stake status' });
  }
};

// POST /api/user/update-score
export const updateUserScore = async (req: Request, res: Response) => {
    const { walletAddress, kills, score } = req.body;
    try {
      // Find the user and update kills and score
      const user = await User.findOneAndUpdate(
        { walletAddress },
        { $set: { kills, score } },
        { new: true }
      );
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
  
      // Return the updated user
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update score and kills' });
    }
};  

export const setupUser = async (req: Request, res: Response) => {
    const { walletAddress, username } = req.body;
  
    if (!walletAddress || !username) {
        res.status(400).json({ error: 'walletAddress and username are required' });
    }
  
    try {
      // Check if the username is already used by another user
      const existingUsername = await User.findOne({ username });
      const existingWalletUser = await User.findOne({ walletAddress });
  
      if (existingUsername && (!existingWalletUser || existingUsername.walletAddress !== walletAddress)) {
        res.status(400).json({ error: 'Username already taken' });
      }
  
      // Upsert user
      const user = await User.findOneAndUpdate(
        { walletAddress },
        {
          $set: { username },
          $setOnInsert: { isStaked: false, kills: 0, score: 0, currentRoom: '' },
        },
        { new: true, upsert: true }
      );
  
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to setup user' });
    }
  };


export const updateCurrentRoom = async (req: Request, res: Response) => {
    const { walletAddress, currentRoom } = req.body;
  
    if (!walletAddress || !currentRoom) {
        res.status(400).json({ error: 'walletAddress and currentRoom are required' });
    }
  
    try {
      const user = await User.findOneAndUpdate(
        { walletAddress },
        { $set: { currentRoom } },
        { new: true }
      );
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'Current room updated successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update current room' });
    }
  };  

// GET /api/user/:walletAddress
export const getUser = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
};  

// POST /api/room/join
// export const joinRoom = async (req: Request, res: Response) => {
//     const { roomId, walletAddress } = req.body;
//     try {
//       const room = await Room.findOneAndUpdate(
//         { roomId },
//         { $addToSet: { users: walletAddress } },
//         { new: true, upsert: true }
//       );
//       res.json(room);
//     } catch (err) {
//       res.status(500).json({ error: 'Failed to join room' });
//     }
// };

// GET /api/room/:roomId
export const getRoom = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
      const room = await Room.findOne({ roomId });
      if (!room) res.status(404).json({ error: 'Room not found' });
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve room' });
    }
};

// POST /api/stake/history/add
export const addStakingData = async (req: Request, res: Response) => {
    const { walletAddress, amount } = req.body;
    try {
      const record = new StakingHistory({ walletAddress, amount });
      await record.save();
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save staking data' });
    }
};

// GET /api/stake/history/:walletAddress
export const getStakingData = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    try {
      const history = await StakingHistory.find({ walletAddress }).sort({ timestamp: -1 });
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve staking data' });
    }
};

// GET /api/user/rooms-played/:walletAddress
export const getRoomsPlayedWithUsernames = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      // Step 1: Find all rooms the user has joined
      const rooms = await Room.find({ users: walletAddress });
  
      if (!rooms || rooms.length === 0) {
        res.status(404).json({ error: 'No rooms found for this user' });
      }
  
      // Step 2: Collect all wallet addresses from those rooms
      const allWallets = new Set<string>();
      rooms.forEach(room => {
        room.users.forEach(user => allWallets.add(user));
      });
  
      // Step 3: Fetch usernames for those wallet addresses
      const walletList = Array.from(allWallets);
      const users = await User.find({ walletAddress: { $in: walletList } }, 'walletAddress username');
  
      // Step 4: Map walletAddress to username
      const addressToUsername: Record<string, string> = {};
      users.forEach(user => {
        addressToUsername[user.walletAddress] = user.username || 'Unknown';
      });
  
      // Step 5: Attach usernames to room users
      const enrichedRooms = rooms.map(room => ({
        roomId: room.roomId,
        users: room.users.map(addr => ({
          walletAddress: addr,
          username: addressToUsername[addr] || 'Unknown'
        }))
      }));
  
      res.json(enrichedRooms);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch rooms and usernames' });
    }
};

// GET /api/user/is-staked/:walletAddress
export const getUserStakeStatus = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      const user = await User.findOne({ walletAddress });
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ isStaked: user.isStaked });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve stake status' });
    }
};

// POST /api/leaderboard/add
export const addLeaderboardEntry = async (req: Request, res: Response) => {
    const { walletAddress, kills, score, roomId, username, gameTime } = req.body;
  
    try {
      const entry = new Leaderboard({ walletAddress, kills, score, roomId, username, gameTime });
      await entry.save();
      res.json(entry);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add leaderboard entry' });
    }
  };
  
  // GET /api/leaderboard/wallet/:walletAddress
  export const getLeaderboardByWallet = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      const entries = await Leaderboard.find({ walletAddress });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve leaderboard data by wallet address' });
    }
  };
  
  // GET /api/leaderboard/room/:roomId
  export const getLeaderboardByRoom = async (req: Request, res: Response) => {
    const { roomId } = req.params;
  
    try {
      const entries = await Leaderboard.find({ roomId });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve leaderboard data by room ID' });
    }
};


// 1. Fetch available rooms
export const fetchAvailableRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find({
      gameEnded: false,
      $expr: { $lt: [{ $size: '$users' }, '$maxMembers'] }
    });

    const currentTime = new Date();
    const MINIMUM_PERCENTAGE = 0.3; // 30%

    const availableRooms = rooms.map(room => {
      let availableDuration = room.Duration;
      let meetsMinimumRequirement = true;
      
      if (room.gameStarted && room.startedAt) {
        const elapsedSeconds = Math.floor((currentTime.getTime() - room.startedAt.getTime()) / 1000);
        availableDuration = room.Duration - elapsedSeconds;
        const minimumDuration = room.Duration * MINIMUM_PERCENTAGE;
        
        meetsMinimumRequirement = availableDuration >= minimumDuration;
      }

      return {
        roomId: room.roomId,
        gameStarted: room.gameStarted,
        totalPlayers: room.maxMembers,
        users: room.users,
        playersInRoom: room.users.length,
        Duration: room.Duration, // Original duration
        AvailableDuration: availableDuration,
        meetsMinimumRequirement
      };
    }).filter(room => room.meetsMinimumRequirement)
      .map(({ meetsMinimumRequirement, ...rest }) => rest); // Remove the temporary field

    res.json(availableRooms);
    console.log('Available rooms:', availableRooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
};

/// 2. Create a new room
export const createRoom = async (req: Request, res: Response) => {
  const { roomId, Duration, maxMembers, creator } = req.body;

  try {
    // Check if room already exists
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      return res.status(400).json({ error: 'Room ID already exists' });
    }

    const newRoom = new Room({
      roomId,
      Duration,
      maxMembers: maxMembers || 6,
      users: [],
      creator,
      gameStarted: false,
      gameEnded: false
    });

    await newRoom.save();

    return res.json({
      success: true,
      roomId: newRoom.roomId,
      schemaId: newRoom._id,
      message: 'Room created successfully'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create room' });
  }
};

// 3. Join a room (updated version)
export const joinRoom = async (req: Request, res: Response) => {
  const { roomId, walletAddress } = req.body;
  console.log('Joining room:', roomId, 'for user:', walletAddress);

  try {
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.gameEnded) {
      return res.status(400).json({ error: 'Game has already ended' });
    }

    if (room.users.includes(walletAddress)) {
      return res.status(400).json({ error: 'User already in room' });
    }

    if (room.users.length >= room.maxMembers) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Add user to room
    room.users.push(walletAddress);
    room.gameStarted = true;
    if (!room.startedAt) {
      room.startedAt = new Date(); // Set startedAt only when the game starts
    }
    await room.save();

    // Calculate the correct currentRoomDuration
    let currentRoomDuration = room.Duration;

    if (room.gameStarted && room.startedAt) {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - room.startedAt.getTime()) / 1000);
      currentRoomDuration = Math.max(room.Duration - elapsedSeconds, 0); // Ensure no negative time
    }

    // Update user
    await User.updateOne(
      { walletAddress },
      {
        $set: {
          currentRoomId: roomId,
          currentRoomDuration
        }
      }
    );

    res.json({
      success: true,
      message: 'User successfully joined the room',
      room,
      assignedDuration: currentRoomDuration
    });
  } catch (err) {
    console.error('Error in joinRoom:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};


// 4. Get room details with usernames
export const getRoomDetails = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get user details for all users in the room
    const users = await User.find({ 
      walletAddress: { $in: room.users } 
    }, 'walletAddress username');

    const userDetails = users.map(user => ({
      walletAddress: user.walletAddress,
      username: user.username
    }));

    // Calculate remaining time if game has started
    let remainingTime = room.Duration;
    if (room.gameStarted && room.startedAt) {
      const elapsed = (new Date().getTime() - room.startedAt.getTime()) / 1000;
      remainingTime = Math.max(0, room.Duration - elapsed);
    }

    res.json({
      roomId: room.roomId,
      members: userDetails,
      duration: room.Duration,
      remainingTime,
      gameStarted: room.gameStarted,
      gameEnded: room.gameEnded,
      maxMembers: room.maxMembers,
      currentMembers: room.users.length,
      winner: room.winner
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get room details' });
  }
};

export const makeWinner = async (req: Request, res: Response) => {
  const { roomId, walletAddress } = req.body;

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if the winner is part of the room
    if (!room.users.includes(walletAddress)) {
      return res.status(400).json({ error: 'User not in this room' });
    }

    // Mark the winner and end the game
    room.winner = walletAddress;
    room.gameEnded = true;
    await room.save();

    // Move room to CompletedRoom collection
    const completedRoom = new CompletedRoom({
      roomId: room.roomId,
      users: room.users,
      Duration: room.Duration,
      gameStarted: room.gameStarted,
      gameEnded: room.gameEnded,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      maxMembers: room.maxMembers,
      creator: room.creator,
      winner: room.winner
    });

    await completedRoom.save();

    // Delete the room from the active Room collection
    await Room.deleteOne({ roomId });

    // Update all users: add to ParticipatedRooms and clear currentRoom info
    const userUpdates = room.users.map(async (userWallet) => {
      const isWinner = userWallet === walletAddress;

      await User.updateOne(
        { walletAddress: userWallet },
        {
          $set: {
            currentRoomId: '',
            currentRoomDuration: 0
          },
          $push: {
            ParticipatedRooms: {
              Room: room.roomId,
              iswinner: isWinner,
              gameTime: room.Duration
            }
          }
        }
      );
    });

    await Promise.all(userUpdates);

    res.json({
      success: true,
      message: 'Winner declared and room moved to completed successfully',
      completedRoom
    });
  } catch (err) {
    console.error('Error in makeWinner:', err);
    res.status(500).json({ error: 'Failed to declare winner and archive room' });
  }
};

