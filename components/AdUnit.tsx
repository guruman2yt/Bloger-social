'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Star, Sparkles, Tag } from 'lucide-react';
import { ADS_ENABLED, ACTIVE_AD_NETWORK, ADS_CONFIG } from '@/lib/ads-config';
import Script from 'next/script';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical';
  responsive?: boolean;
  network?: 'adsense' | 'addstra' | 'monetag';
  adsEnabled?: boolean;
  adsenseClientId?: string;
  addstraScriptUrl?: string;
  monetagScriptUrl?: string;
}

const MOCK_ADS = [
  {
    title: 'HostingPro Ultra Cloud',
    description: 'Deploy Next.js applications in seconds on a global edge infrastructure. Experience 99.99% uptime and auto-scaling.',
    cta: 'Get 3 Months Free',
    url: 'https://vercel.com',
    color: 'from-blue-600/20 via-indigo-600/10 to-transparent',
    borderColor: 'border-blue-500/25 hover:border-blue-500/50',
    tag: 'Premium Hosting',
    rating: 4.9,
    reviewsCount: 3820,
    promoCode: 'HOSTOR25',
    badge: 'Best Choice'
  },
  {
    title: 'ShieldVPN Dev Edition',
    description: 'Protect credentials and secure database transactions. Dedicated server nodes optimized for low latency development.',
    cta: 'Protect Workspace Now',
    url: 'https://nordvpn.com',
    color: 'from-purple-600/20 via-pink-600/10 to-transparent',
    borderColor: 'border-purple-500/25 hover:border-purple-500/50',
    tag: 'Security & VPN',
    rating: 4.8,
    reviewsCount: 1940,
    promoCode: 'SHIELD30',
    badge: 'Security Rated'
  },
  {
    title: 'Fullstack Next.js Bootcamp',
    description: 'Master streaming SSR, React Server Actions, dynamic sitemaps, and advanced ad layouts. Lifetime content updates.',
    cta: 'Claim 80% Discount',
    url: 'https://react.dev',
    color: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    borderColor: 'border-emerald-500/25 hover:border-emerald-500/50',
    tag: 'Developer Courses',
    rating: 4.95,
    reviewsCount: 4110,
    promoCode: 'DEVBUILD80',
    badge: 'Bestseller'
  }
];

export default function AdUnit({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  network, 
  adsEnabled,
  adsenseClientId,
  addstraScriptUrl,
  monetagScriptUrl
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [mockAd, setMockAd] = useState<typeof MOCK_ADS[0] | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(true);
  const hasTrackedImpression = useRef(false);

  const activeNetwork = network || (ACTIVE_AD_NETWORK === 'simulated' ? 'adsense' : ACTIVE_AD_NETWORK) as 'adsense' | 'addstra' | 'monetag';
  
  // 1. Connection check: Verify network credentials exist and are not placeholder
  let isConnected = false;
  const clientVal = adsenseClientId !== undefined ? adsenseClientId : ADS_CONFIG.adsense.clientId;
  const addstraVal = addstraScriptUrl !== undefined ? addstraScriptUrl : ADS_CONFIG.addstra.scriptUrl;
  const monetagVal = monetagScriptUrl !== undefined ? monetagScriptUrl : ADS_CONFIG.monetag.scriptUrl;

  if (activeNetwork === 'adsense') {
    isConnected = !!clientVal && clientVal.trim() !== '' && clientVal !== 'ca-pub-xxxxxxxxxxxxxxxx';
  } else if (activeNetwork === 'addstra') {
    isConnected = !!addstraVal && addstraVal.trim() !== '' && addstraVal !== '//adsterra.com/sites/xyz/banner.js';
  } else if (activeNetwork === 'monetag') {
    isConnected = !!monetagVal && monetagVal.trim() !== '' && monetagVal !== 'https://cdn.monetag.io/ads.js';
  }

  const isEnabled = (adsEnabled !== undefined ? adsEnabled : ADS_ENABLED) && isConnected;

  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost');
    
    if (!isEnabled) return;

    // Select a random mock ad for localhost rendering
    const randomIndex = Math.floor(Math.random() * MOCK_ADS.length);
    setMockAd(MOCK_ADS[randomIndex]);

    // Track simulated ad impressions
    const trackImpression = async () => {
      if (hasTrackedImpression.current) return;
      hasTrackedImpression.current = true;
      
      try {
        await fetch('/api/ads/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'impression', slot, network: activeNetwork }),
        });
      } catch (e) {
        console.error('Failed to log ad impression:', e);
      }
    };

    trackImpression();
  }, [slot, activeNetwork, isEnabled]);

  const handleAdClick = async () => {
    if (!isEnabled) return;
    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click', slot, network: activeNetwork }),
      });
    } catch (e) {
      console.error('Failed to log ad click:', e);
    }
  };

  // 2. If ads are disabled or the selected network is not configured, show nothing
  if (!isEnabled) {
    return null;
  }

  // 3. In production, load actual ad network scripts
  if (!isLocalhost) {
    return (
      <div ref={adRef} className="ad-container my-6 flex justify-center w-full">
        {activeNetwork === 'adsense' && (
          <>
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientVal}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-client={clientVal}
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive={responsive}
            />
            <script dangerouslySetInnerHTML={{
              __html: `try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.error(e); }`
            }} />
          </>
        )}
        {activeNetwork === 'addstra' && (
          <>
            <Script
              src={addstraVal}
              strategy="afterInteractive"
            />
            <div id={`addstra-container-${slot}`} className="w-full text-center text-xs text-gray-500 py-4 border border-dashed border-gray-800">
              [Adsterra Banner: {slot}]
            </div>
          </>
        )}
        {activeNetwork === 'monetag' && (
          <>
            <Script
              src={monetagVal}
              strategy="afterInteractive"
            />
            <div id={`monetag-container-${slot}`} className="w-full text-center text-xs text-gray-500 py-4 border border-dashed border-gray-800">
              [Monetag Banner: {slot}]
            </div>
          </>
        )}
      </div>
    );
  }

  // 4. On localhost development, render a beautiful simulated banner indicating active connection status
  if (!mockAd) return null;

  const getLayoutStyles = () => {
    switch (format) {
      case 'horizontal':
        return 'flex-row min-h-[90px] w-full py-4 px-6 justify-between items-center text-left';
      case 'vertical':
        return 'flex-col min-h-[500px] w-[300px] p-6 text-center justify-between';
      default: // auto
        return 'flex-col sm:flex-row min-h-[180px] p-6 justify-between items-center gap-4 text-center sm:text-left';
    }
  };

  const getNetworkBadgeColor = () => {
    if (activeNetwork === 'adsense') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (activeNetwork === 'addstra') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const getNetworkName = () => {
    if (activeNetwork === 'adsense') return 'Google AdSense';
    if (activeNetwork === 'addstra') return 'Adsterra (Addstra)';
    return 'Monetag';
  };

  return (
    <div className="my-8 w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-1.5 px-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-yellow-500" />
          <span>Local Developer Preview</span>
        </span>
        <span className={`px-2 py-0.5 rounded border ${getNetworkBadgeColor()} font-bold`}>
          {getNetworkName()} (Active Link)
        </span>
      </div>
      
      <a
        href={mockAd.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
        className={`flex ${getLayoutStyles()} rounded-2xl border ${mockAd.borderColor} bg-gradient-to-br ${mockAd.color} hover:bg-indigo-950/20 shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group overflow-hidden relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        
        <div className={`flex flex-col ${format === 'horizontal' ? 'max-w-[70%]' : 'w-full'}`}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
              {mockAd.tag}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {slot} slot
            </span>
          </div>

          <h4 className="mt-2 text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors leading-tight">
            {mockAd.title}
          </h4>

          <div className="flex items-center justify-center sm:justify-start mt-1.5 space-x-2 text-[10px] text-gray-400">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold ml-1 text-white">{mockAd.rating}</span>
            </div>
            <span>•</span>
            <span>({mockAd.reviewsCount.toLocaleString()} reviews)</span>
          </div>

          <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-xl">
            {mockAd.description}
          </p>

          <div className="mt-3 flex items-center justify-center sm:justify-start gap-1 text-[10px] text-indigo-300 font-medium">
            <Tag className="h-3 w-3" />
            <span>Use Code: <span className="font-mono bg-indigo-950/50 border border-indigo-500/20 px-1.5 py-0.5 rounded text-white">{mockAd.promoCode}</span> for extra savings</span>
          </div>
        </div>

        <div className={`flex items-center justify-center shrink-0 ${format === 'vertical' ? 'w-full mt-4' : 'mt-0'}`}>
          <span className="flex items-center space-x-1.5 px-4.5 py-3 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide shadow-md shadow-indigo-600/10 group-hover:shadow-indigo-500/20 group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            <span>{mockAd.cta}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </a>
    </div>
  );
}
