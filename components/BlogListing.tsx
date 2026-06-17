'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, Eye, ArrowRight, Layers } from 'lucide-react';
import AdUnit from './AdUnit';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  category: string;
  createdAt: Date;
  readTime: number;
  author: string;
  views: number;
}

interface BlogListingProps {
  initialPosts: Post[];
  categories: string[];
  adsEnabled?: boolean;
  network?: 'adsense' | 'addstra' | 'monetag';
  adsenseClientId?: string;
  addstraScriptUrl?: string;
  monetagScriptUrl?: string;
}

export default function BlogListing({ 
  initialPosts, 
  categories,
  adsEnabled,
  network,
  adsenseClientId,
  addstraScriptUrl,
  monetagScriptUrl
}: BlogListingProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter posts based on search input and selected category
  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full">
      {/* Search & Category Filter Controls */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[rgba(255,255,255,0.05)] pb-8">
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-indigo-950/10 border-[rgba(99,102,241,0.15)] text-gray-400 hover:border-indigo-500/30 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:max-w-xs rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/10 p-1 flex items-center">
          <Search className="h-4 w-4 text-gray-500 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of post cards */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[rgba(99,102,241,0.15)] bg-indigo-950/5">
          <Layers className="h-10 w-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No articles match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post, idx) => {
            const card = (
              <Link 
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-[rgba(99,102,241,0.1)] bg-[rgba(17,12,28,0.2)] hover:bg-[rgba(17,12,28,0.4)] overflow-hidden shadow-lg transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/5"
              >
                {/* Post Cover image */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-transparent to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#05030a]/80 backdrop-blur-md text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                {/* Card details */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Meta stats */}
                    <div className="flex items-center space-x-4 text-[10px] font-medium text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} min read</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views} views</span>
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="mt-2.5 text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-xs">
                    <span className="text-gray-400">By <span className="font-semibold text-gray-300">{post.author}</span></span>
                    
                    <span 
                      className="flex items-center space-x-1 text-indigo-400 group-hover:text-indigo-300 font-semibold group-hover:translate-x-0.5 transition-all"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );

            // Inject AdUnit after the 2nd card
            if (idx === 1) {
              return (
                <React.Fragment key={post.id}>
                  {card}
                  <div className="col-span-1 md:col-span-2 my-2">
                    <AdUnit 
                      slot="mid-listing" 
                      format="horizontal" 
                      adsEnabled={adsEnabled}
                      network={network}
                      adsenseClientId={adsenseClientId}
                      addstraScriptUrl={addstraScriptUrl}
                      monetagScriptUrl={monetagScriptUrl}
                    />
                  </div>
                </React.Fragment>
              );
            }

            // Inject AdUnit after the 5th card
            if (idx === 4) {
              return (
                <React.Fragment key={post.id}>
                  {card}
                  <div className="col-span-1 md:col-span-2 my-2">
                    <AdUnit 
                      slot="homepage-listing-low" 
                      format="horizontal" 
                      adsEnabled={adsEnabled}
                      network={network}
                      adsenseClientId={adsenseClientId}
                      addstraScriptUrl={addstraScriptUrl}
                      monetagScriptUrl={monetagScriptUrl}
                    />
                  </div>
                </React.Fragment>
              );
            }

            return card;
          })}
        </div>
      )}
    </div>
  );
}
