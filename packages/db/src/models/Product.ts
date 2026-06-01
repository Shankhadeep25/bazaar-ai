import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  productId: string;
  source: 'amazon' | 'flipkart';
  title: string;
  price_inr: number;
  rating: number;
  review_count: number;
  specs: Map<string, string>;
  affiliate_url: string;
  image_url: string;
  raw_text: string;
  category: string;
  reviews: string[];
  embeddedAt: Date | null;
  chunkIds: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, enum: ['amazon', 'flipkart'] },
    title: { type: String, required: true },
    price_inr: { type: Number, required: true },
    rating: { type: Number, required: true },
    review_count: { type: Number, default: 0 },
    specs: { type: Map, of: String, default: {} },
    affiliate_url: { type: String, required: true },
    image_url: { type: String, default: '' },
    raw_text: { type: String, default: '' },
    category: { type: String, required: true },
    reviews: { type: [String], default: [] },
    embeddedAt: { type: Date, default: null },
    chunkIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
