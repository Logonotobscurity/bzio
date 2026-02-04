import { NextResponse } from 'next/server';
import { getAllBrands } from '@/services/brandService';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
