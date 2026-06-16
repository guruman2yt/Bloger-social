import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, summary, content, coverImage, category, published, readTime, author } = body;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (published !== undefined) updateData.published = published;
    if (author !== undefined) updateData.author = author;
    
    if (readTime !== undefined) {
      updateData.readTime = Number(readTime);
    } else if (content !== undefined) {
      // Auto-recalculate read time if content changed but readTime wasn't specified
      updateData.readTime = Math.max(1, Math.round(content.split(/\s+/).length / 200));
    }

    if (slug !== undefined && slug !== post.slug) {
      // Check if the new slug is unique
      const existingSlug = await prisma.post.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug is already in use.' }, { status: 400 });
      }
      updateData.slug = slug;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
