import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { postId, authorName, content } = await request.json();

    if (!postId || !authorName || !content) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    // Create comment
    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorName: authorName.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
