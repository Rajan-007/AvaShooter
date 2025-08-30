import express from 'express';
import { assignToMatch, setWinner, createMatch } from '../controllers/contractController';

const router = express.Router();

router.post('/contract/assign', assignToMatch);
router.post('/contract/set-winner', setWinner);
router.post('/contract/create-match', createMatch);

export default router;