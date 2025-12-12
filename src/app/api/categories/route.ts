import { categoryRepo } from '@/repositories/db/categoryRepository';
import { NextResponse } from 'next/server';

// Prevent this route from being statically exported during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await categoryRepo.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
