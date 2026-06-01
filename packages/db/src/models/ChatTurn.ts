import mongoose, { Schema, Document } from 'mongoose';

export interface IChatTurn extends Document {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent: string;
  retrievedChunkIds: string[];
  products?: any[];
}

const ChatTurnSchema = new Schema<IChatTurn>({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  intent: { type: String, default: '' },
  retrievedChunkIds: { type: [String], default: [] },
  products: { type: [Schema.Types.Mixed], default: undefined },
});

// Compound index for efficient session history queries
ChatTurnSchema.index({ sessionId: 1, timestamp: 1 });

export const ChatTurn = mongoose.model<IChatTurn>('ChatTurn', ChatTurnSchema);
