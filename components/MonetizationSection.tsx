'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Eye, TrendingUp, BarChart2, ShieldAlert, Zap, Layers, Globe } from 'lucide-react';

interface MonetizationSectionProps {
  realStats?: {
    impressions: number;
    clicks: number;
    revenue: number;
    averageCtr: number;
  };
}

export default function MonetizationSection({ realStats }: MonetizationSectionProps) {
  const [pageviews, setPageviews] = useState<number>(25000);
  const [cpm, setCpm] = useState<number>(4.50);
  const [selectedNetwork, setSelectedNetwork] = useState<'adsense' | 'monetag' | 'addstra'>('adsense');

  // Calculate earnings based on pageviews & CPM
  const dailyEarnings = (pageviews * cpm) / 1000;
  const monthlyEarnings = dailyEarnings * 30;
  const yearlyEarnings = dailyEarnings * 365;

  const networkDetails = {
    adsense: {
      name: 'Google AdSense',
      avgCpm: '$4.50 - $12.00',
      fillRate: '99%',
      minPayout: '$100',
      difficulty: 'High approval barrier, strict guidelines',
      ctr: '0.8% - 2.5%'
    },
    monetag: {
      name: 'Monetag',
      avgCpm: '$3.00 - $8.50',
      fillRate: '100%',
      minPayout: '$5',
      difficulty: 'Instant approval, excellent mobile monetization',
      ctr: '1.2% - 4.0%'
    },
    addstra: {
      name: 'Adsterra',
      avgCpm: '$2.00 - $7.00',
      fillRate: '100%',
      minPayout: '$100',
      difficulty: 'Fast approval, accepts popunder and social bar ads',
      ctr: '1.5% - 5.5%'
    }
  };

  return (
    <section id="monetization-section" className="mt-24 max-w-5xl mx-auto scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
          Revenue Optimization
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
          Monetization & Ads Analytics Hub
        </h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
          Analyze traffic potential, compare premium networks, and automatically calculate projected publisher earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Live Revenue Calculator */}
        <div className="p-6 rounded-3xl border border-[rgba(99,102,241,0.15)] bg-[rgba(17,12,28,0.25)] backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-6">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs uppercase tracking-wider">Earnings Projection Calculator</span>
            </div>

            {/* Slider 1: Pageviews */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Daily Pageviews</span>
                <span className="text-indigo-400 font-mono font-bold">{pageviews.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={pageviews}
                onChange={(e) => setPageviews(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-gray-800 accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>1K</span>
                <span>100K</span>
                <span>250K</span>
                <span>500K</span>
              </div>
            </div>

            {/* Slider 2: CPM */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-300">Target Page CPM</span>
                <span className="text-emerald-400 font-mono font-bold">${cpm.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="30.00"
                step="0.10"
                value={cpm}
                onChange={(e) => setCpm(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-gray-800 accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>$0.50</span>
                <span>$10.00</span>
                <span>$20.00</span>
                <span>$30.00</span>
              </div>
            </div>
          </div>

          {/* Earnings Display Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
            <div className="text-center bg-gray-950/40 p-3 rounded-2xl border border-[rgba(255,255,255,0.02)]">
              <span className="text-[10px] text-gray-500 font-medium block">Daily Est.</span>
              <span className="text-sm font-extrabold text-white mt-1 block font-mono">
                ${dailyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-center bg-gray-950/40 p-3 rounded-2xl border border-[rgba(255,255,255,0.02)]">
              <span className="text-[10px] text-gray-500 font-medium block">Monthly Est.</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-1 block font-mono">
                ${monthlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="text-center bg-indigo-950/10 p-3 rounded-2xl border border-indigo-500/10">
              <span className="text-[10px] text-indigo-400 font-bold block">Yearly Est.</span>
              <span className="text-sm font-extrabold text-indigo-300 mt-1 block font-mono animate-pulse">
                ${yearlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Network Performance Metrics */}
        <div className="p-6 rounded-3xl border border-[rgba(255,255,255,0.03)] bg-[rgba(17,12,28,0.15)] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-5">
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs uppercase tracking-wider">Ad Networks Comparison</span>
            </div>

            {/* Network Selector Tabs */}
            <div className="flex bg-gray-950/80 p-1.5 rounded-xl border border-gray-800/50 mb-6">
              {(Object.keys(networkDetails) as Array<keyof typeof networkDetails>).map((net) => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    selectedNetwork === net
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {net === 'adsense' ? 'AdSense' : net === 'monetag' ? 'Monetag' : 'Adsterra'}
                </button>
              ))}
            </div>

            {/* Selected Network Stats */}
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-2 text-xs">
                <span className="text-gray-400 font-medium">Average CPM Range</span>
                <span className="text-white font-semibold font-mono">{networkDetails[selectedNetwork].avgCpm}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-2 text-xs">
                <span className="text-gray-400 font-medium">Fill Rate</span>
                <span className="text-emerald-400 font-semibold font-mono">{networkDetails[selectedNetwork].fillRate}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-2 text-xs">
                <span className="text-gray-400 font-medium">Average CTR Rate</span>
                <span className="text-white font-semibold font-mono">{networkDetails[selectedNetwork].ctr}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-2 text-xs">
                <span className="text-gray-400 font-medium">Minimum Payout</span>
                <span className="text-white font-semibold font-mono">{networkDetails[selectedNetwork].minPayout}</span>
              </div>
              <div className="text-xs pt-1.5">
                <span className="text-gray-500 font-medium block">Approval & Eligibility:</span>
                <span className="text-gray-300 mt-1 block leading-relaxed">{networkDetails[selectedNetwork].difficulty}</span>
              </div>
            </div>
          </div>

          {/* Live Network Performance Indicator */}
          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>System Live Performance:</span>
            </span>
            <span className="font-mono text-gray-400">
              {realStats ? realStats.impressions.toLocaleString() : 0} Imp • {realStats ? realStats.clicks.toLocaleString() : 0} Clicks • ${realStats ? realStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} Rev
            </span>
          </div>
        </div>
      </div>

      {/* SEM & SEO Ad Optimization Best Practices (SEO + SEM Highly Optimized) */}
      <div className="mt-8 p-6 rounded-3xl border border-[rgba(255,255,255,0.02)] bg-gradient-to-r from-gray-950/20 to-[rgba(17,12,28,0.1)]">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Zap className="h-4.5 w-4.5 text-indigo-400" />
          <span>SEO & SEM Ad Revenue Best Practices Checklist</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-400 leading-relaxed">
          <div className="flex gap-2.5">
            <div className="p-1.5 h-7 w-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Verify Ads.txt Integration</h4>
              <p>Host a valid `ads.txt` in your public root folder. Search engines and ad brokers crawler-verify this to prevent ad fraud and unlock high CPM bids.</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="p-1.5 h-7 w-7 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Optimize Core Web Vitals (CLS)</h4>
              <p>Reserve absolute layout spaces for ad banner blocks to prevent layout shifts when ads lazy load. This keeps UX top-tier and prevents Google SEO penalties.</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="p-1.5 h-7 w-7 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Leverage SEM Campaigns</h4>
              <p>Use search engine marketing (SEM) campaigns target-optimized for high-CPC commercial landing page keywords to drive maximum ad-clicking page traffic.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
