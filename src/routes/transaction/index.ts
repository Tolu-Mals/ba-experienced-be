import { Router, type Request, type Response } from 'express';
import axios from 'axios';
import { z } from 'zod'; // Add Zod import
import env from '@/config/env';
import { fromZodError } from 'zod-validation-error';
import type { EtherscanTransaction } from './schema';

const router = Router();

const BASE_ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const querySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  direction: z.enum(['all', 'incoming', 'outgoing']).optional().default('all'),
});

router.get('/', async (req: Request, res: Response) => {
  const parseResult = querySchema.safeParse(req.query);
  if (!parseResult.success) {
    const errorMessage = fromZodError(parseResult.error);
    res.status(400).json({
      message: errorMessage,
    });
    return;
  }

  const { address, direction } = parseResult.data;

  try {
    const response = await axios.get(BASE_ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: env.ETHERSCAN_API_KEY,
      },
    });

    let transactions: EtherscanTransaction[] = response.data.result || [];

    if (direction === 'incoming') {
      transactions = transactions.filter(
        (tx: EtherscanTransaction) =>
          tx.to?.toLowerCase() === address.toLowerCase(),
      );
    } else if (direction === 'outgoing') {
      transactions = transactions.filter(
        (tx: EtherscanTransaction) =>
          tx.from?.toLowerCase() === address.toLowerCase(),
      );
    }

    transactions = transactions.slice(0, 5);

    res.status(200).json({ transactions });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

export default router;
