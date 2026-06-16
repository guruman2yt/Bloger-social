'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Mail, Send, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribed(true);
    setEmail('');
    
    // Premium feedback: trigger confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.9 }
    });

    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="border-t border-[rgba(99,102,241,0.1)] bg-[#030107] pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand & About */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Blogor</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-400">
              A high-performance publication dedicated to full-stack engineering, interface design, search optimization, and digital monetization strategies.
            </p>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Topics</h3>
            <ul className="mt-4 space-y-2">
              {['Development', 'Design', 'Monetization', 'SEO'].map((category) => (
                <li key={category}>
                  <Link 
                    href={`/#blog-section`} 
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Stay Updated</h3>
            <p className="mt-2 text-xs text-gray-400">Get optimization checklists and code recipes in your inbox.</p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <div className="relative rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/10 p-1 flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  required
                  disabled={subscribed}
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className={`flex items-center justify-center rounded-lg px-3 py-2 transition-all duration-300 ${
                    subscribed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
                  }`}
                >
                  {subscribed ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.05)] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Blogor. All rights reserved. Created for premium monetization and SEO performance.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/public/ads.txt" className="hover:underline">Ads.txt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
