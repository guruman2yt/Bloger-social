import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, summary, content, coverImage, category, published, readTime, author } = body;

    if (!title || !summary || !content || !category) {
      return NextResponse.json({ error: 'Title, summary, content, and category are required fields.' }, { status: 400 });
    }

    // Auto-generate slug if not provided
    const baseSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug is unique
    const existingPost = await prisma.post.findUnique({
      where: { slug: baseSlug },
    });

    if (existingPost) {
      return NextResponse.json({ error: 'An article with this slug or title already exists.' }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        slug: baseSlug,
        summary,
        content,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60',
        category,
        published: published ?? false,
        readTime: Number(readTime) || Math.max(1, Math.round(content.split(/\s+/).length / 200)),
        author: author || 'Admin',
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
