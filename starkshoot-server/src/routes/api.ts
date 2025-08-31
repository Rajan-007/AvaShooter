import express, { Request, Response, NextFunction } from 'express';
import {

    addStakingData,
    getStakingData,
    getUserStakeStatus,

    getRoom,
    getRoomsPlayedWithUsernames,
    
    getUser,
    setupUser,
    handleWalletConnection,
    createOrUpdateUser,

    updateCurrentRoom,
    updateStakedStatus,
    updateUserScore,

    joinRoom,
    createRoom,
    fetchAvailableRooms,
    makeWinner,

    getLeaderboardByRoom,
    getLeaderboardByWallet,
    addLeaderboardEntry,

    getRoomDetails,
    startGame,
    handleGameStart,

} from '../controllers/userController';


import { transferTokens, getServerTokenBalance, findWalletContracts } from '../controllers/tokenController';


const router = express.Router();

// User routes
router.post('/user/setup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await setupUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/user/connect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handleWalletConnection(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/user/create-or-update', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createOrUpdateUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/user/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/room/:roomId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getRoom(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/stake/history/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addStakingData(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/stake/history/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getStakingData(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUserScore(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/stake', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateStakedStatus(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/user/is-staked/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserStakeStatus(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/user/update-currentroom', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateCurrentRoom(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/user/rooms-played/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getRoomsPlayedWithUsernames(req, res);
  } catch (err) {
    next(err);
  }
});

// Leaderboard routes
router.post('/leaderboard/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addLeaderboardEntry(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard/wallet/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getLeaderboardByWallet(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard/room/:roomId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getLeaderboardByRoom(req, res);
  } catch (err) {
    next(err);
  }
});



// Room routes
router.get('/rooms/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fetchAvailableRooms(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/rooms/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createRoom(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/rooms/:roomId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getRoomDetails(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/rooms/make-winner', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await makeWinner(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/rooms/start-game', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await startGame(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/user/game-start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handleGameStart(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/room/join', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await joinRoom(req, res);
  } catch (err) {
    next(err);
  }
});

// Token routes
router.post('/tokens/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await transferTokens(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/tokens/server-balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getServerTokenBalance(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/tokens/find-contracts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await findWalletContracts(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;