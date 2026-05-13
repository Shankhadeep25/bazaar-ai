import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  productIds: string[];
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 min TTL
    index: { expires: 0 }, // TTL index — auto-deletes expired docs
  },
  lastActiveAt: { type: Date, default: Date.now },
  productIds: { type: [String], default: [] },
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
