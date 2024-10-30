 import express from 'express';
import { addTransaction, getTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/add', addTransaction);  
router.get('/:userId', getTransactions); 

export default router;
