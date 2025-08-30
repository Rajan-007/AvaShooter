import express, { Request, Response } from 'express';
import {

    addStakingData,
    getStakingData,
    getUserStakeStatus,

    getRoom,
    getRoomsPlayedWithUsernames,
    
    getUser,
    setupUser,

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

} from '../controllers/userController';


const router = express.Router();

// User routes
router.post('/user/setup', setupUser);
router.get('/user/:walletAddress', getUser);
// router.post('/room/join', joinRoom);
router.get('/room/:roomId', getRoom);
router.post('/stake/history/add', addStakingData);
router.get('/stake/history/:walletAddress', getStakingData);
router.post('/user/update-score', updateUserScore);
router.post('/stake', updateStakedStatus);
router.get('/user/is-staked/:walletAddress', getUserStakeStatus);
router.get('/user/update-currentroom', updateCurrentRoom);
router.get('/user/rooms-played/:walletAddress', getRoomsPlayedWithUsernames);

// Leaderboard routes
router.post('/leaderboard/add', addLeaderboardEntry);
router.get('/leaderboard/wallet/:walletAddress', getLeaderboardByWallet);
router.get('/leaderboard/room/:roomId', getLeaderboardByRoom);




// Room routes
router.get('/rooms/available', fetchAvailableRooms);
router.post('/rooms/create', async (req, res, next) => {
    try {
        await createRoom(req, res);
    } catch (err) {
        next(err);
    }
});
router.get('/rooms/:roomId', async (req, res, next) => {
    try {
        await getRoomDetails(req, res);
    } catch (err) {
        next(err);
    }
});

router.post('/rooms/make-winner', async (req, res, next) => {
    try {
        await makeWinner(req, res);
    } catch (err) {
        next(err);
    }
});

router.post('/room/join', async (req, res, next) => {
    try {
        await joinRoom(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;