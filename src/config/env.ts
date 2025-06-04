import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production'], {
    message: 'You need to specify an environment in your .env file',
  }),
  PORT: z.string().optional().default('3000'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('debug'),
  ETHERSCAN_API_KEY: z
    .string()
    .min(1, { message: 'ETHERSCAN_API_KEY is required in your .env file' }),
});

const parsedEnv = envSchema.parse(process.env);

export default parsedEnv;
