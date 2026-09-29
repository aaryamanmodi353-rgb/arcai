import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  name: string;
  location: string;
  bhk: string;
  price: string;
  description: string;
  images: string[];
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  bhk: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  features: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
