import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Setting } from '@prisma/client';
import CommentsSection from '@/components/CommentsSection';
import ArticleContent from '@/components/ArticleContent';
import { Calendar, Clock, Eye, ChevronLeft, ArrowRight, User } from 'lucide-react';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// Next.js 16 dynamic metadata generation
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `https://blogor.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
      images: [
        {
          url: post.coverImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;

  // 1. Fetch post details along with comments
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      comments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 2. Increment post view count in SQLite database
  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  // Fetch global settings from database
  const dbSettings = await prisma.setting.findMany();
  const settings = {
    adDensity: 'balanced' as 'low' | 'balanced' | 'max-revenue',
    activeNetwork: 'adsense' as 'adsense' | 'addstra' | 'monetag',
    adsEnabled: true,
    adsenseClientId: '',
    addstraScriptUrl: '',
    monetagScriptUrl: ''
  };
  dbSettings.forEach((s: Setting) => {
    if (s.key === 'adDensity') settings.adDensity = s.value as 'low' | 'balanced' | 'max-revenue';
    if (s.key === 'activeNetwork') settings.activeNetwork = s.value as 'adsense' | 'addstra' | 'monetag';
    if (s.key === 'adsEnabled') settings.adsEnabled = s.value === 'true';
    if (s.key === 'adsenseClientId') settings.adsenseClientId = s.value;
    if (s.key === 'addstraScriptUrl') settings.addstraScriptUrl = s.value;
    if (s.key === 'monetagScriptUrl') settings.monetagScriptUrl = s.value;
  });

  // 3. Fetch related articles in the same category
  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      category: post.category,
      NOT: { id: post.id },
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  // 4. Schema.org JSON-LD Structured Data for Article Rich Snippet
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.coverImage,
    datePublished: post.createdAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blogor',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100&h=100&auto=format&fit=crop&q=80',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://blogor.com/blog/${post.slug}`,
    },
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article className="min-h-screen py-10 bg-[#05030a]">
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Articles</span>
        </Link>

        {/* Article Cover Image */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-[rgba(99,102,241,0.15)] shadow-2xl mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-[#05030a]/20 to-transparent" />
        </div>

        {/* Heading & Meta Info */}
        <header className="mb-10 text-left">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">
            {post.category}
          </span>

          <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 border-y border-[rgba(255,255,255,0.05)] py-4 text-xs text-gray-400">
            <span className="flex items-center space-x-1.5 font-medium text-gray-300">
              <User className="h-4 w-4 text-indigo-400" />
              <span>By {post.author}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Eye className="h-4 w-4" />
              <span>{post.views + 1} views</span>
            </span>
          </div>
        </header>

        {/* Main Post Content & Dynamic Sidebar with Ad density control */}
        <ArticleContent 
          content={post.content} 
          adDensity={settings.adDensity} 
          activeNetwork={settings.activeNetwork} 
          adsEnabled={settings.adsEnabled} 
          adsenseClientId={settings.adsenseClientId}
          addstraScriptUrl={settings.addstraScriptUrl}
          monetagScriptUrl={settings.monetagScriptUrl}
        />

        {/* Dynamic Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-[rgba(255,255,255,0.05)] pt-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group p-5 rounded-2xl border border-[rgba(99,102,241,0.1)] bg-[rgba(17,12,28,0.2)] hover:bg-[rgba(17,12,28,0.4)] transition-all duration-300 hover:border-indigo-500/25 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 uppercase border border-indigo-500/10">
                      {related.category}
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500">
                    <span>{related.readTime} min read</span>
                    <span className="flex items-center space-x-1 text-indigo-400 font-medium">
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Discussion Section */}
        <CommentsSection postId={post.id} initialComments={post.comments} />

      </div>
    </article>
  );
}
