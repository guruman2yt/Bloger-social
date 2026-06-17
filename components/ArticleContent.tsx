'use client';

import React, { useState, useEffect } from 'react';
import AdUnit from './AdUnit';
import { Copy, Check, ChevronRight, Coins, X } from 'lucide-react';

interface ArticleContentProps {
  postId: string;
  content: string;
  adDensity: 'low' | 'balanced' | 'max-revenue';
  activeNetwork: 'adsense' | 'addstra' | 'monetag';
  adsEnabled: boolean;
  adsenseClientId?: string;
  addstraScriptUrl?: string;
  monetagScriptUrl?: string;
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'code' | 'list' | 'p';
  content: string;
  lang?: string;
  id?: string;
}

// Helper function to parse inline markdown tags (bold, italic, inline code, and links)
function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Convert __bold__ to **bold** and _italic_ to *italic*
  let processed = text;
  processed = processed.replace(/__(.*?)__/g, '**$1**');
  processed = processed.replace(/_(.*?)_/g, '*$1*');

  // Tokenize based on common markdown tags
  const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)/g;
  const parts = processed.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link matching: [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            {match[1]}
          </a>
        );
      }
    }

    // Bold matching: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic matching: *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-gray-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code matching: `text`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/10 text-indigo-300 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  }).filter(Boolean) as React.ReactNode[];
}

export default function ArticleContent({ 
  postId,
  content, 
  adDensity, 
  activeNetwork, 
  adsEnabled,
  adsenseClientId,
  addstraScriptUrl,
  monetagScriptUrl
}: ArticleContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showFloatingAd, setShowFloatingAd] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');

  // 0. Client-Side views increment
  useEffect(() => {
    if (postId) {
      fetch(`/api/posts/${postId}/view`, { method: 'POST' }).catch((err) => {
        console.warn('Failed to increment views asynchronously:', err);
      });
    }
  }, [postId]);

  // 1. Markdown Parser (Line-by-Line Compiler)
  const parseMarkdown = (text: string): Block[] => {
    // Normalize newlines and resolve double-escaped newlines
    const normalizedText = text
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n');
    const lines = normalizedText.split('\n');
    const blocks: Block[] = [];
    let currentBlock: string[] = [];
    let inCode = false;
    let codeLang = '';

    const commitBlock = () => {
      if (currentBlock.length === 0) return;
      const rawContent = currentBlock.join('\n').trim();
      if (rawContent) {
        if (inCode) {
          blocks.push({ type: 'code', content: rawContent, lang: codeLang });
        } else if (rawContent.startsWith('### ')) {
          const cleanText = rawContent.replace(/^###\s+/, '');
          const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          blocks.push({ type: 'h3', content: cleanText, id });
        } else if (rawContent.startsWith('## ')) {
          const cleanText = rawContent.replace(/^##\s+/, '');
          const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          blocks.push({ type: 'h2', content: cleanText, id });
        } else if (rawContent.startsWith('# ')) {
          const cleanText = rawContent.replace(/^#\s+/, '');
          const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          blocks.push({ type: 'h1', content: cleanText, id });
        } else if (rawContent.startsWith('* ') || rawContent.startsWith('- ') || /^\d+\.\s/.test(rawContent)) {
          blocks.push({ type: 'list', content: rawContent });
        } else {
          blocks.push({ type: 'p', content: rawContent });
        }
      }
      currentBlock = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCode) {
          commitBlock();
          inCode = false;
          codeLang = '';
        } else {
          commitBlock();
          inCode = true;
          codeLang = line.replace('```', '').trim() || 'javascript';
        }
        continue;
      }

      if (inCode) {
        currentBlock.push(line);
      } else {
        const trimmed = line.trim();
        const isLineList = trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
        const isCurrentBlockList = currentBlock.length > 0 && (
          currentBlock[0].trim().startsWith('* ') ||
          currentBlock[0].trim().startsWith('- ') ||
          /^\d+\.\s/.test(currentBlock[0].trim())
        );

        if (trimmed === '') {
          commitBlock();
        } else if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          commitBlock();
          currentBlock.push(line);
          commitBlock();
        } else if (isLineList) {
          if (!isCurrentBlockList) {
            commitBlock();
          }
          currentBlock.push(line);
        } else {
          if (isCurrentBlockList) {
            commitBlock();
          }
          currentBlock.push(line);
        }
      }
    }
    commitBlock();
    return blocks;
  };

  const blocks = parseMarkdown(content);
  const headings = blocks.filter(b => b.type === 'h2' || b.type === 'h3') as Required<Pick<Block, 'id' | 'content' | 'type'>>[];

  // 2. Floating Bottom-Right Ad for Max Revenue Mode
  useEffect(() => {
    if (adDensity !== 'max-revenue' || !adsEnabled) {
      setShowFloatingAd(false);
      return;
    }
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowFloatingAd(true);
      } else {
        setShowFloatingAd(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [adDensity, adsEnabled]);

  // 3. Highlight active table-of-contents heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveHeading(visible.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 4. Dynamic Ad Injector
  const renderBlocksWithDynamicAds = () => {
    const renderedElements: React.ReactNode[] = [];
    let pCount = 0;

    blocks.forEach((block, index) => {
      let element: React.ReactNode = null;
      const key = `block-${index}`;

      if (block.type === 'h1') {
        element = <h1 key={key} id={block.id} className="text-3xl font-extrabold text-white mt-12 mb-6 scroll-mt-24">{renderInlineMarkdown(block.content)}</h1>;
      } else if (block.type === 'h2') {
        element = <h2 key={key} id={block.id} className="text-2xl font-bold text-white mt-10 mb-5 pb-2 border-b border-[rgba(255,255,255,0.06)] scroll-mt-24">{renderInlineMarkdown(block.content)}</h2>;
      } else if (block.type === 'h3') {
        element = <h3 key={key} id={block.id} className="text-xl font-bold text-white mt-8 mb-4 scroll-mt-24">{renderInlineMarkdown(block.content)}</h3>;
      } else if (block.type === 'p') {
        pCount++;
        element = <p key={key} className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">{renderInlineMarkdown(block.content)}</p>;
      } else if (block.type === 'list') {
        const listItems = block.content.split('\n').map((li, liIdx) => {
          const cleanLi = li.replace(/^(\*\s*|-\s*|\d+\.\s*)/, '').trim();
          return <li key={liIdx} className="mb-2 text-gray-300">{renderInlineMarkdown(cleanLi)}</li>;
        });
        const isOrdered = /^\d+\.\s/.test(block.content);
        element = isOrdered ? (
          <ol key={key} className="list-decimal pl-6 mb-6 text-sm sm:text-base space-y-1">{listItems}</ol>
        ) : (
          <ul key={key} className="list-disc pl-6 mb-6 text-sm sm:text-base space-y-1">{listItems}</ul>
        );
      } else if (block.type === 'code') {
        element = (
          <div key={key} className="my-8 rounded-2xl bg-[#0b0812] border border-[rgba(99,102,241,0.15)] overflow-hidden font-mono text-xs sm:text-sm shadow-xl relative group">
            <div className="bg-[rgba(17,12,28,0.6)] px-4 py-2.5 border-b border-[rgba(99,102,241,0.1)] flex justify-between items-center text-gray-400">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">{block.lang}</span>
              <button
                onClick={() => copyToClipboard(block.content, index)}
                className="flex items-center space-x-1.5 hover:text-indigo-400 active:scale-95 transition-all text-xs"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 overflow-x-auto text-gray-300 leading-relaxed font-mono">
              <code>{block.content}</code>
            </pre>
          </div>
        );
      }

      renderedElements.push(element);

      // Ad Injection Points based on active settings
      if (adsEnabled && (block.type === 'p' || block.type === 'code' || block.type === 'list')) {
        if (adDensity === 'low') {
          if (pCount === 4) {
            renderedElements.push(
              <AdUnit 
                key={`ad-injected-low-${index}`} 
                slot="in-article-mid" 
                format="horizontal" 
                adsEnabled={adsEnabled} 
                network={activeNetwork}
                adsenseClientId={adsenseClientId}
                addstraScriptUrl={addstraScriptUrl}
                monetagScriptUrl={monetagScriptUrl}
              />
            );
          }
        } else if (adDensity === 'balanced') {
          if (pCount === 3) {
            renderedElements.push(
              <AdUnit 
                key={`ad-injected-bal-1-${index}`} 
                slot="in-article-mid" 
                format="horizontal" 
                adsEnabled={adsEnabled} 
                network={activeNetwork}
                adsenseClientId={adsenseClientId}
                addstraScriptUrl={addstraScriptUrl}
                monetagScriptUrl={monetagScriptUrl}
              />
            );
          }
          if (pCount === 7) {
            renderedElements.push(
              <AdUnit 
                key={`ad-injected-bal-2-${index}`} 
                slot="in-article-low" 
                format="horizontal" 
                adsEnabled={adsEnabled} 
                network={activeNetwork}
                adsenseClientId={adsenseClientId}
                addstraScriptUrl={addstraScriptUrl}
                monetagScriptUrl={monetagScriptUrl}
              />
            );
          }
        } else if (adDensity === 'max-revenue') {
          if (pCount > 0 && pCount % 2 === 0) {
            renderedElements.push(
              <AdUnit 
                key={`ad-injected-max-${pCount}-${index}`} 
                slot={`in-article-max-${pCount}`} 
                format="horizontal" 
                adsEnabled={adsEnabled} 
                network={activeNetwork}
                adsenseClientId={adsenseClientId}
                addstraScriptUrl={addstraScriptUrl}
                monetagScriptUrl={monetagScriptUrl}
              />
            );
          }
        }
      }
    });

    return renderedElements;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative mt-8">
      {/* Article Content Body (Responsive & SEO Optimized) */}
      <div className="w-full lg:w-2/3 border border-[rgba(255,255,255,0.03)] bg-[rgba(17,12,28,0.15)] rounded-3xl p-6 sm:p-10 shadow-xl">
        
        {/* NEW: Article Top Ad Slot */}
        {adsEnabled && (
          <div className="mb-8">
            <AdUnit 
              slot="article-top" 
              format="horizontal" 
              adsEnabled={adsEnabled} 
              network={activeNetwork}
              adsenseClientId={adsenseClientId}
              addstraScriptUrl={addstraScriptUrl}
              monetagScriptUrl={monetagScriptUrl}
            />
          </div>
        )}

        {adsEnabled && adDensity === 'max-revenue' && (
          <div className="mb-6">
            <AdUnit 
              slot="article-header-premium" 
              format="horizontal" 
              adsEnabled={adsEnabled} 
              network={activeNetwork}
              adsenseClientId={adsenseClientId}
              addstraScriptUrl={addstraScriptUrl}
              monetagScriptUrl={monetagScriptUrl}
            />
          </div>
        )}

        <div className="article-body-text">{renderBlocksWithDynamicAds()}</div>

        {/* NEW: Article Bottom Ad Slot */}
        {adsEnabled && (
          <div className="mt-8">
            <AdUnit 
              slot="article-bottom" 
              format="horizontal" 
              adsEnabled={adsEnabled} 
              network={activeNetwork}
              adsenseClientId={adsenseClientId}
              addstraScriptUrl={addstraScriptUrl}
              monetagScriptUrl={monetagScriptUrl}
            />
          </div>
        )}
      </div>

      {/* Sticky Sidebar (Table of Contents & Sidebar Banners) */}
      <aside className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">
        
        {/* NEW: Sidebar Top Ad Slot */}
        {adsEnabled && (
          <div className="flex justify-center p-2 border border-[rgba(255,255,255,0.03)] bg-[rgba(17,12,28,0.1)] rounded-2xl overflow-hidden shadow">
            <AdUnit 
              slot="article-sidebar-top" 
              format="vertical" 
              adsEnabled={adsEnabled} 
              network={activeNetwork}
              adsenseClientId={adsenseClientId}
              addstraScriptUrl={addstraScriptUrl}
              monetagScriptUrl={monetagScriptUrl}
            />
          </div>
        )}

        {/* Widget 1: Table of Contents (Premium UX & SEO Navigation) */}
        {headings.length > 0 && (
          <div className="p-6 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(17,12,28,0.15)] shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-[rgba(255,255,255,0.05)] pb-2">
              Table of Contents
            </h4>
            <nav className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {headings.map((h, hIdx) => (
                <button
                  key={hIdx}
                  onClick={() => scrollToSection(h.id)}
                  className={`w-full text-left flex items-start text-xs transition-colors py-0.5 ${
                    h.type === 'h3' ? 'pl-4 text-gray-400 hover:text-white' : 'text-gray-300 hover:text-white font-medium'
                  } ${activeHeading === h.id ? 'text-indigo-400! font-semibold' : ''}`}
                >
                  <ChevronRight className={`h-3.5 w-3.5 mr-1 shrink-0 mt-0.5 transition-transform ${
                    activeHeading === h.id ? 'translate-x-0.5 text-indigo-400' : 'text-gray-600'
                  }`} />
                  <span className="line-clamp-1">{h.content}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Widget 2: Sticky Sidebar Ad Unit (Revenue Booster) */}
        {adsEnabled && adDensity !== 'low' && (
          <div className="flex justify-center p-2 border border-[rgba(255,255,255,0.03)] bg-[rgba(17,12,28,0.1)] rounded-2xl overflow-hidden shadow">
            <AdUnit 
              slot="sidebar-sticky" 
              format="vertical" 
              adsEnabled={adsEnabled} 
              network={activeNetwork}
              adsenseClientId={adsenseClientId}
              addstraScriptUrl={addstraScriptUrl}
              monetagScriptUrl={monetagScriptUrl}
            />
          </div>
        )}
      </aside>

      {/* Floating Corner Ad for Max Revenue Mode */}
      {showFloatingAd && adsEnabled && adDensity === 'max-revenue' && (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] rounded-2xl bg-[#0b0812]/95 border border-pink-500/30 p-4 shadow-2xl backdrop-blur-md animate-fade-in-slide">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-pink-400 flex items-center gap-1 uppercase tracking-widest">
              <Coins className="h-3 w-3" />
              <span>Premium Sponsor</span>
            </span>
            <button
              onClick={() => setShowFloatingAd(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <AdUnit 
            slot="floating-corner" 
            format="auto" 
            adsEnabled={adsEnabled} 
            network={activeNetwork}
            adsenseClientId={adsenseClientId}
            addstraScriptUrl={addstraScriptUrl}
            monetagScriptUrl={monetagScriptUrl}
          />
        </div>
      )}
    </div>
  );
}
