import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import BlogListing from '@/components/BlogListing';
import AdUnit from '@/components/AdUnit';
import { ArrowDown } from 'lucide-react';

export const revalidate = 60; // Incremental Static Regeneration (ISR) every 60 seconds

export default async function Home() {
  // 1. Fetch published posts sorted by date
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Extract distinct categories dynamically from active database posts
  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  // Find the featured (first/latest) post
  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
  dbSettings.forEach(s => {
    if (s.key === 'adDensity') settings.adDensity = s.value as any;
    if (s.key === 'activeNetwork') settings.activeNetwork = s.value as any;
    if (s.key === 'adsEnabled') settings.adsEnabled = s.value === 'true';
    if (s.key === 'adsenseClientId') settings.adsenseClientId = s.value;
    if (s.key === 'addstraScriptUrl') settings.addstraScriptUrl = s.value;
    if (s.key === 'monetagScriptUrl') settings.monetagScriptUrl = s.value;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      
      {/* 🚀 Top Ad Slot */}
      <AdUnit 
        slot="homepage-top" 
        format="horizontal" 
        adsEnabled={settings.adsEnabled}
        network={settings.activeNetwork}
        adsenseClientId={settings.adsenseClientId}
        addstraScriptUrl={settings.addstraScriptUrl}
        monetagScriptUrl={settings.monetagScriptUrl}
      />

      {/* Hero Header Area (SEO & SEM Optimized) */}
      <section className="text-center mt-12 mb-16 relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="h-72 w-72 rounded-full bg-purple-600/5 blur-3xl" />
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          The High-Performance Hub for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Digital Publications
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
          Welcome to <span className="text-indigo-400 font-semibold">Blogor</span>. Explore custom workflows, design blueprints, coding recipes, and optimizations for search visibility and site monetization.
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href="#blog-section"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-300"
          >
            <span>Read Articles</span>
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Featured Blog Post (Hero card) */}
      {featuredPost && (
        <section className="mb-16 max-w-5xl mx-auto">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Latest Publication</h2>
          
          <Link 
            href={`/blog/${featuredPost.slug}`}
            className="group flex flex-col lg:flex-row rounded-3xl border border-[rgba(99,102,241,0.15)] bg-[rgba(17,12,28,0.25)] hover:bg-[rgba(17,12,28,0.4)] overflow-hidden shadow-2xl transition-all duration-300 hover:border-indigo-500/40"
          >
            {/* Feature Cover image */}
            <div className="lg:w-1/2 aspect-video lg:aspect-auto min-h-[300px] relative overflow-hidden bg-gray-900">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="object-cover w-full h-full transform group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05030a]/20" />
            </div>

            {/* Feature Content detail */}
            <div className="lg:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">
                  {featuredPost.category}
                </span>

                <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
                  {featuredPost.title}
                </h3>
                
                <p className="mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-4">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-gray-400">
                  <span>{formatDate(featuredPost.createdAt)}</span>
                  <span>•</span>
                  <span>{featuredPost.readTime} min read</span>
                </div>
                
                <span className="flex items-center space-x-1.5 text-indigo-400 font-semibold group-hover:underline">
                  <span>Read Article</span>
                  <ArrowDown className="h-4 w-4 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Main Blog listings Section */}
      <section id="blog-section" className="mt-20 scroll-mt-20 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Recent Publications</h2>
            <p className="text-xs text-gray-400 mt-1">Browse our latest design, dev, and monetization guides.</p>
          </div>
        </div>

        <BlogListing 
          initialPosts={gridPosts} 
          categories={categories} 
          adsEnabled={settings.adsEnabled}
          network={settings.activeNetwork}
          adsenseClientId={settings.adsenseClientId}
          addstraScriptUrl={settings.addstraScriptUrl}
          monetagScriptUrl={settings.monetagScriptUrl}
        />
      </section>

      {/* 🚀 Footer Ad Slot */}
      <AdUnit 
        slot="homepage-bottom" 
        format="horizontal" 
        adsEnabled={settings.adsEnabled}
        network={settings.activeNetwork}
        adsenseClientId={settings.adsenseClientId}
        addstraScriptUrl={settings.addstraScriptUrl}
        monetagScriptUrl={settings.monetagScriptUrl}
      />

    </div>
  );
}
