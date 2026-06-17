import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Increment the views in database
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true }
    });

    return NextResponse.json({ success: true, views: updatedPost.views });
  } catch (error: any) {
    console.error('Failed to increment post view count:', error);
    return NextResponse.json({ error: error.message || 'Failed to increment view count' }, { status: 500 });
  }
}
