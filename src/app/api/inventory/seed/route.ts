import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Property from '@/models/Property';
import { inventory } from '@/lib/inventory';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Clear existing
    await Property.deleteMany({});
    
    // Insert all
    for (const prop of inventory) {
      await Property.create({
        name: prop.name,
        location: prop.location,
        bhk: prop.bhk,
        price: prop.price,
        description: prop.description,
        images: prop.images,
        features: prop.features
      });
    }
    
    return NextResponse.json({ success: true, seededCount: inventory.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
