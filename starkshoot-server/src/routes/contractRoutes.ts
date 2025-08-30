import express from 'express';
import { assignToMatch, setWinner } from '../controllers/contractController';

const router = express.Router();

router.post('/contract/assign', assignToMatch);
router.post('/contract/set-winner', setWinner);

export default router;