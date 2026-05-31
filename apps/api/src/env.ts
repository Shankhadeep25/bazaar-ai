import dotenv from 'dotenv';
// This file is imported first in index.ts to ensure env vars are loaded before any other imports
dotenv.config({ path: '../../.env' });
