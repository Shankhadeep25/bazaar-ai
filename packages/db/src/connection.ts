// ─── MongoDB Connection ──────────────────────────────────────────────────────

import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsense';

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('[MongoDB] Connected successfully');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[MongoDB] Disconnected');
}

export function isDBConnected(): boolean {
  return isConnected;
}
