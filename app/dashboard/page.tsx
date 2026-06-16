'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock, ArrowRight, BarChart3, ListCollapse, PlusCircle,
  DollarSign, Eye, MousePointer, Percent, Newspaper, MessageSquare,
  Trash2, Edit, Save, X, Globe, FileEdit, RefreshCw, Sparkles, Cpu, Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MonetizationSection from '@/components/MonetizationSection';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  published: boolean;
  views: number;
  readTime: number;
  author: string;
}

interface ChartDay {
  date: string;
  revenue: number;
  impressions: number;
  clicks: number;
  adsense: number;
  addstra: number;
  monetag: number;
  simulated: number;
  ctr: number;
}

export default function Dashboard() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard active view state
  const [activeTab, setActiveTab] = useState<'analytics' | 'posts' | 'editor' | 'ai-automation' | 'ad-settings'>('analytics');

  // Data loading states
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    blog: { postsCount: 0, commentsCount: 0, viewsCount: 0 },
    ads: { impressions: 0, clicks: 0, revenue: 0, averageCtr: 0 }
  });
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'impressions' | 'clicks' | 'ctr'>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState<{ category: string; views: number; count: number }[]>([]);
  const [contentRecommendations, setContentRecommendations] = useState<{ topic: string; category: string; expectedCpc: number; volume: string }[]>([]);

  // Editor states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorSlug, setEditorSlug] = useState('');
  const [editorSummary, setEditorSummary] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCover, setEditorCover] = useState('');
  const [editorCategory, setEditorCategory] = useState('Development');
  const [editorPublished, setEditorPublished] = useState(false);
  const [editorAuthor, setEditorAuthor] = useState('Admin');
  const [editorError, setEditorError] = useState('');
  const [editorSuccess, setEditorSuccess] = useState(false);

  // AI Generator States
  const [aiTopic, setAiTopic] = useState('');
  const [aiSearchWeb, setAiSearchWeb] = useState(true);
  const [aiPublished, setAiPublished] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState<string[]>([]);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);

  // Bulk Generator States
  const [aiMode, setAiMode] = useState<'single' | 'bulk'>('single');
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkTopics, setBulkTopics] = useState<{ topic: string; category: string; expectedCpc: number; volume: string; reason: string; selected?: boolean }[]>([]);
  const [bulkDiscovering, setBulkDiscovering] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState(0);

  // Ad Settings States
  const [adDensity, setAdDensity] = useState<'low' | 'balanced' | 'max-revenue'>('balanced');
  const [activeNetwork, setActiveNetwork] = useState<'adsense' | 'addstra' | 'monetag'>('adsense');
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [addstraScriptUrl, setAddstraScriptUrl] = useState('');
  const [monetagScriptUrl, setMonetagScriptUrl] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Check login on mount
  useEffect(() => {
    const session = sessionStorage.getItem('blogor_admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch dashboard data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats({
          blog: statsData.blogStats,
          ads: statsData.adStats
        });
        setChartData(statsData.chartData);
        setCategoryStats(statsData.categoryStats || []);
        setContentRecommendations(statsData.contentRecommendations || []);
      }

      // Fetch posts
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      if (postsRes.ok && postsData.success) {
        setPosts(postsData.posts);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/dashboard/settings');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdDensity(data.settings.adDensity);
        setActiveNetwork(data.settings.activeNetwork);
        setAdsEnabled(data.settings.adsEnabled === 'true');
        setAdsenseClientId(data.settings.adsenseClientId || '');
        setAddstraScriptUrl(data.settings.addstraScriptUrl || '');
        setMonetagScriptUrl(data.settings.monetagScriptUrl || '');
      }
    } catch (e) {
      console.error('Failed to load ad settings:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess(false);

    try {
      const response = await fetch('/api/dashboard/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adDensity,
          activeNetwork,
          adsEnabled: adsEnabled ? 'true' : 'false',
          adsenseClientId,
          addstraScriptUrl,
          monetagScriptUrl
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSettingsSuccess(true);
        confetti({
          particleCount: 40,
          spread: 30,
          origin: { y: 0.8 }
        });
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        setSettingsError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      setSettingsError('An error occurred during save.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('blogor_admin_session', 'true');
        setAuthError('');
        setPassword('');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setAuthError(data.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('An error occurred during authentication.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('blogor_admin_session');
  };

  // Quick edit slug generator
  useEffect(() => {
    if (!editingPostId) {
      const slugVal = editorTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setEditorSlug(slugVal);
    }
  }, [editorTitle, editingPostId]);

  // Handle post submit (Create or Update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim() || !editorSummary.trim() || !editorContent.trim() || !editorCategory) {
      setEditorError('Please fill out all required fields.');
      return;
    }

    setEditorError('');
    setEditorSuccess(false);

    const payload = {
      title: editorTitle,
      slug: editorSlug,
      summary: editorSummary,
      content: editorContent,
      coverImage: editorCover,
      category: editorCategory,
      published: editorPublished,
      author: editorAuthor
    };

    try {
      let response;
      if (editingPostId) {
        // Update
        response = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setEditorSuccess(true);
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });

        // Reset Editor
        resetEditorForm();
        fetchData();

        // Switch to posts list
        setTimeout(() => {
          setActiveTab('posts');
          setEditorSuccess(false);
        }, 1500);
      } else {
        setEditorError(data.error || 'Failed to save article.');
      }
    } catch (err) {
      console.error(err);
      setEditorError('An error occurred during save.');
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setEditorTitle(post.title);
    setEditorSlug(post.slug);
    setEditorSummary(post.summary);
    setEditorContent(post.content);
    setEditorCover(post.coverImage);
    setEditorCategory(post.category);
    setEditorPublished(post.published);
    setEditorAuthor(post.author);
    setEditorError('');
    setActiveTab('editor');
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        fetchData();
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting post.');
    }
  };

  const togglePublishStatus = async (post: Post) => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p)));
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetEditorForm = () => {
    setEditingPostId(null);
    setEditorTitle('');
    setEditorSlug('');
    setEditorSummary('');
    setEditorContent('');
    setEditorCover('');
    setEditorCategory('Development');
    setEditorPublished(false);
    setEditorAuthor('Admin');
    setEditorError('');
  };

  // Trigger topic-based blog generation
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      setAiError('Please enter a topic or heading.');
      return;
    }

    setAiGenerating(true);
    setAiError('');
    setAiSuccess(false);
    setAiProgress(['Initiating AI Blog Post Generator...']);

    // Set up progress indicators
    const addProgress = (msg: string) => {
      setAiProgress((prev) => [...prev, msg]);
    };

    setTimeout(() => addProgress(aiSearchWeb ? 'Searching Google & DuckDuckGo for up-to-date facts...' : 'Skipping search. Drafting from Gemini knowledge base...'), 1200);
    if (aiSearchWeb) {
      setTimeout(() => addProgress('Scraping content from top articles...'), 3200);
    }
    setTimeout(() => addProgress('Calling Gemini 2.5 Flash to synthesize facts and draft a 1,000+ word markdown article...'), aiSearchWeb ? 5500 : 2500);
    setTimeout(() => addProgress('Scraping a premium high-res matching cover image from Unsplash...'), aiSearchWeb ? 9000 : 5000);
    setTimeout(() => addProgress('Checking unique slug mappings and saving to database...'), aiSearchWeb ? 11500 : 7500);

    try {
      const response = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          searchWeb: aiSearchWeb,
          published: aiPublished
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAiProgress((prev) => [...prev, `✅ Post "${data.post.title}" generated and saved successfully!`]);
        setAiSuccess(true);
        setAiTopic('');
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 }
        });

        // Refresh dashboard statistics and posts
        fetchData();

        // Transition back to posts list after delay
        setTimeout(() => {
          setActiveTab('posts');
          setAiSuccess(false);
          setAiProgress([]);
        }, 2500);
      } else {
        setAiError(data.error || 'Failed to generate article.');
      }
    } catch (err) {
      console.error(err);
      setAiError('An unexpected connection error occurred.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Discover currently trending topics using Gemini
  const handleDiscoverTrends = async () => {
    setBulkDiscovering(true);
    setAiError('');
    setAiProgress(['Analyzing search engine trends for trending topics...']);
    try {
      const response = await fetch('/api/posts/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: bulkCount,
          category: bulkCategory
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBulkTopics(data.topics.map((t: any) => ({ ...t, selected: true })));
        setAiProgress(['Trending topics discovered successfully! Select which articles to write and click "Generate and Publish".']);
      } else {
        setAiError(data.error || 'Failed to discover trending topics.');
      }
    } catch (err) {
      console.error(err);
      setAiError('Connection error occurred while discovering trends.');
    } finally {
      setBulkDiscovering(false);
    }
  };

  // Run sequential post generation queue for all selected trending topics
  const handleBulkGenerate = async () => {
    const selected = bulkTopics.filter(t => t.selected);
    if (selected.length === 0) {
      setAiError('Please select at least one topic to generate.');
      return;
    }

    setBulkGenerating(true);
    setAiGenerating(true);
    setAiError('');
    setAiSuccess(false);
    setBulkProgress(0);
    setBulkCurrentIndex(0);
    setAiProgress([`Starting bulk generation of ${selected.length} articles...`]);

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      setBulkCurrentIndex(i + 1);
      setAiProgress((prev) => [...prev, `[Post ${i + 1}/${selected.length}] Researching & generating: "${item.topic}"...`]);

      try {
        const response = await fetch('/api/posts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: item.topic,
            searchWeb: aiSearchWeb,
            published: aiPublished
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setAiProgress((prev) => [...prev, `✅ [Post ${i + 1}/${selected.length}] Completed: "${data.post.title}"`]);

          // Confetti particle burst for each successful generation
          confetti({
            particleCount: 25,
            spread: 35,
            origin: { y: 0.8 }
          });
        } else {
          setAiProgress((prev) => [...prev, `❌ [Post ${i + 1}/${selected.length}] Failed: "${item.topic}" - ${data.error || 'Unknown error'}`]);
        }
      } catch (err) {
        setAiProgress((prev) => [...prev, `❌ [Post ${i + 1}/${selected.length}] Connection error for: "${item.topic}"`]);
      }

      setBulkProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    setAiProgress((prev) => [...prev, `🎉 Bulk post generation completed! Generated ${selected.length} articles.`]);
    setAiSuccess(true);
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Refresh dashboard statistics and post list
    fetchData();

    // Reset and return to post manager list after delay
    setTimeout(() => {
      setActiveTab('posts');
      setAiSuccess(false);
      setBulkGenerating(false);
      setAiGenerating(false);
      setBulkTopics([]);
      setAiProgress([]);
    }, 4000);
  };

  // Trigger manual daily automation RSS check
  const handleTriggerCron = async () => {
    setAiGenerating(true);
    setAiError('');
    setAiSuccess(false);
    setAiProgress(['Executing automated daily RSS check...', 'Parsing feeds: TechCrunch, Vercel Blog, CSS-Tricks...']);

    try {
      const response = await fetch('/api/cron/generate', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setAiProgress((prev) => [
          ...prev,
          `Mode: ${data.mode}`,
          `Source Link: ${data.source}`,
          `✅ Generated post: "${data.post.title}" successfully!`
        ]);
        setAiSuccess(true);
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });
        fetchData();
        setTimeout(() => {
          setActiveTab('posts');
          setAiSuccess(false);
          setAiProgress([]);
        }, 3000);
      } else {
        setAiError(data.error || 'Failed to run daily automation.');
      }
    } catch (err) {
      console.error(err);
      setAiError('An error occurred during manual cron trigger.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Rendering Helper: Custom responsive dark SVG Line Chart
  const renderSvgChart = () => {
    if (chartData.length === 0) return null;

    // Get max value of selected metric to dynamically scale graph height
    const vals = chartData.map((d) => d[chartMetric]);
    const maxVal = Math.max(...vals, 1);

    const chartHeight = 200;
    const chartWidth = 700;
    const padding = 20;

    // Generate path points
    const points = chartData.map((d, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
      const ratio = d[chartMetric] / maxVal;
      const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area fill path D
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const areaD = `${pathD} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${chartHeight - padding} Z`;

    const getMetricLabel = (val: number) => {
      if (chartMetric === 'revenue') return `$${val.toFixed(2)}`;
      if (chartMetric === 'ctr') return `${val.toFixed(2)}%`;
      return val.toLocaleString();
    };

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[600px] h-[220px]">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" />

          {/* Fill Area */}
          <path d={areaD} fill="url(#chartGlow)" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#05030a"
                stroke={i === points.length - 1 ? '#a855f7' : '#6366f1'}
                strokeWidth="2.5"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill="#6366f1"
                className="opacity-0 hover:opacity-20 transition-opacity duration-200"
              />
              {/* Tooltip on hover */}
              <title>{`${p.date}: ${getMetricLabel(p[chartMetric])}`}</title>
            </g>
          ))}

          {/* Dates labels */}
          {points.filter((_, idx) => idx % 3 === 0).map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={chartHeight - 4}
              fill="#555"
              fontSize="9"
              textAnchor="middle"
              className="font-medium"
            >
              {p.date.substring(5)}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // 1. Render Password Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#05030a]">
        <div className="w-full max-w-md rounded-3xl border border-[rgba(99,102,241,0.15)] bg-[rgba(17,12,28,0.4)] backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">

          <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-indigo-600/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-purple-600/10 blur-2xl" />

          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 mb-4 animate-float">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Gate</h2>
            <p className="mt-2 text-xs text-gray-400">Please enter administrator security credentials to manage Blogor posts and monetization stats.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Security Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-medium text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-300"
            >
              <span>Verify Access</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Render Logged-in Dashboard UI
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-[#05030a]">

      {/* Dashboard Top Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Control Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">Admin</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Configure articles, monitor RPM, and view dynamic CPM/CPC yields.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            title="Refresh metrics data"
            className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500 bg-red-950/20 text-red-300 text-xs font-semibold tracking-wider uppercase transition-all duration-300"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Aggregate Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">

        {/* Earnings */}
        <div className="col-span-2 p-5 rounded-2xl border border-[rgba(99,102,241,0.15)] bg-gradient-to-tr from-indigo-950/20 to-transparent shadow-lg text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Estimated Earnings</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white">
            ${stats.ads.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-indigo-400/80 block mt-1">Lifetime total accrued</span>
        </div>

        {/* Impressions */}
        <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.25)] text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Impressions</span>
            <Eye className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-white">
            {stats.ads.impressions.toLocaleString()}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">Total ad renders</span>
        </div>

        {/* Clicks */}
        <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.25)] text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Ad Clicks</span>
            <MousePointer className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-white">
            {stats.ads.clicks.toLocaleString()}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">Sponsor leads clicks</span>
        </div>

        {/* CTR */}
        <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.25)] text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Average CTR</span>
            <Percent className="h-4 w-4 text-pink-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-white">
            {stats.ads.averageCtr}%
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">Click to view ratio</span>
        </div>

        {/* Post Views */}
        <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.25)] text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Blog Views</span>
            <Newspaper className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-white">
            {stats.blog.viewsCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">Total page view pings</span>
        </div>

      </div>

      {/* View Switch Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.05)] mb-8 gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === 'analytics'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics Graphs</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === 'posts'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <ListCollapse className="h-4 w-4" />
          <span>Post Manager ({posts.length})</span>
        </button>

        <button
          onClick={() => {
            resetEditorForm();
            setActiveTab('editor');
          }}
          className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === 'editor' && !editingPostId
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Article</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-automation')}
          className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === 'ai-automation'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Automation</span>
        </button>

        <button
          onClick={() => setActiveTab('ad-settings')}
          className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === 'ad-settings'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Settings className="h-4 w-4" />
          <span>Ad Settings</span>
        </button>
      </div>

      {/* Main Tab Panels content */}

      {/* Panel 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.2)] p-6">

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical performance (Last 14 Days)</h3>

              <div className="flex flex-wrap gap-1">
                {(['revenue', 'impressions', 'clicks', 'ctr'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${chartMetric === m
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-indigo-950/10 border-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="py-4">
              {renderSvgChart()}
            </div>
          </div>

          {/* Relocated Monetization & Ads Analytics Hub */}
          <MonetizationSection realStats={stats.ads} />

          {/* Content Reach & Traffic Optimization Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {/* Category Performance Card */}
            <div className="p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.2)] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-indigo-400" />
                <span>Category Performance (Reach & Views)</span>
              </h4>
              <div className="space-y-4">
                {categoryStats.length === 0 ? (
                  <p className="text-xs text-gray-500">No category views recorded yet.</p>
                ) : (
                  categoryStats.map((c, i) => {
                    const maxViews = Math.max(...categoryStats.map(stat => stat.views), 1);
                    const percent = Math.round((c.views / maxViews) * 100);
                    return (
                      <div key={i} className="text-xs text-left">
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-white">{c.category}</span>
                          <span className="text-gray-400">{c.views.toLocaleString()} views ({c.count} posts)</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Traffic Recommendations Card */}
            <div className="p-6 rounded-2xl border border-[rgba(99,102,241,0.15)] bg-gradient-to-tr from-indigo-950/20 to-[rgba(17,12,28,0.2)] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-pink-500" />
                <span>SEO Traffic Gap Analysis (Target Keywords)</span>
              </h4>
              <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                These high-CPC commercial topics are not currently covered in your posts. Draft these next to gain high organic search traffic:
              </p>
              <div className="space-y-2.5">
                {contentRecommendations.length === 0 ? (
                  <p className="text-xs text-emerald-400 font-semibold">🎉 All top-priority high-traffic topics are already written!</p>
                ) : (
                  contentRecommendations.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-gray-950/60 border border-[rgba(255,255,255,0.03)] flex justify-between items-center text-xs gap-3">
                      <div className="text-left">
                        <div className="font-bold text-white leading-snug line-clamp-1">{r.topic}</div>
                        <span className="text-[9px] font-semibold text-gray-500 mt-1 uppercase block tracking-wider">{r.category} • Vol: {r.volume}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 block">${r.expectedCpc.toFixed(2)} CPC</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditorTitle(r.topic);
                            setEditorCategory(r.category);
                            setActiveTab('editor');
                          }}
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline mt-0.5 block"
                        >
                          Draft Post
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Daily Cron Schedule batch workflow banner */}
            <div className="col-span-1 md:col-span-2 p-5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-gray-950/30 text-xs text-left leading-relaxed">
              <h5 className="font-bold text-white mb-2 uppercase tracking-wide text-[10px] text-indigo-300">Schedule-Based Daily Batch Workflow (10 Articles / Day Setup)</h5>
              <p className="text-gray-400 mb-3">
                To automate the publication of these gap recommendations (e.g. posting 10 articles daily targeting these keywords), connect a cron job to trigger the generation endpoint periodically. The system automatically pulls the top missing keywords, researches original details, and publishes them.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-500 text-[11px] font-mono p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-xl">
                <div>
                  <div className="text-white font-bold mb-1">⏱️ Recommended Cron Schedule:</div>
                  <div>Every 2.4 Hours (10 Posts / Day)</div>
                  <div className="text-indigo-300 font-bold mt-1.5">🔗 Target Trigger URL:</div>
                  <div className="text-white truncate">/api/cron/generate?secret=your_secret</div>
                </div>
                <div>
                  <div className="text-white font-bold mb-1">📈 Projected Optimization Impact:</div>
                  <div>Estimated Volume: +35,000 Pageviews/Month</div>
                  <div>Target Average CPM: $7.80</div>
                  <div>Estimated Projected Revenue: +$273.00/Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informational Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Display CPM Yield Matrix</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">CPM (yield per 1,000 ad loads) and CPC (yield per click) settings in use for ad tracking endpoints:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.03)]"><span className="text-indigo-300 font-semibold">Google AdSense</span><span>$5.50 CPM / $0.45 CPC</span></div>
                <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.03)]"><span className="text-emerald-300 font-semibold">Monetag Network</span><span>$3.50 CPM / $0.28 CPC</span></div>
                <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.03)]"><span className="text-pink-300 font-semibold">Addstra Partners</span><span>$2.20 CPM / $0.15 CPC</span></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] text-left flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Monetization Checklist</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Ensure layout fits Google policy and has responsive components:</p>
                <ul className="mt-3 space-y-2 text-[11px] text-gray-500">
                  <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Keep ads.txt at the root public folder.</li>
                  <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Ad slots must match verified ID configurations.</li>
                  <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Lazy load images to keep Core Web Vitals at 95+.</li>
                </ul>
              </div>
              <a href="/" className="mt-6 flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                <span>View Live Site</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: Post Manager List */}
      {activeTab === 'posts' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.2)] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Views</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)] text-xs">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white max-w-sm truncate">
                      {post.title}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {post.category}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => togglePublishStatus(post)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-all ${post.published
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50'
                          : 'bg-yellow-950/20 text-yellow-500 border-yellow-500/10 hover:border-yellow-500/40'
                          }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-gray-400 flex items-center space-x-1.5 mt-1 border-0">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{post.views}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(post)}
                        title="Edit Article"
                        className="inline-flex p-1.5 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-indigo-400 hover:bg-indigo-950/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete Article"
                        className="inline-flex p-1.5 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-red-400 hover:bg-red-950/20 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel 3: Write / Edit Post Editor */}
      {activeTab === 'editor' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.2)] p-6 text-left">

          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileEdit className="h-4.5 w-4.5 text-indigo-400" />
              <span>{editingPostId ? 'Edit Article' : 'Write New Article'}</span>
            </h3>

            <button
              onClick={() => {
                resetEditorForm();
                setActiveTab('posts');
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSavePost} className="space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Article Title *</label>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="e.g. Mastering Tailwind CSS"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">SEO Slug / URL *</label>
                <input
                  type="text"
                  value={editorSlug}
                  onChange={(e) => setEditorSlug(e.target.value)}
                  placeholder="e.g. mastering-tailwind-css"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            {/* Cover image & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  value={editorCover}
                  onChange={(e) => setEditorCover(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Category * (e.g. Health, Tech, Travel)</label>
                <input
                  type="text"
                  value={editorCategory}
                  onChange={(e) => setEditorCategory(e.target.value)}
                  placeholder="e.g. Travel"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Author Name</label>
              <input
                type="text"
                value={editorAuthor}
                onChange={(e) => setEditorAuthor(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Article Summary * (SEO Meta Description)</label>
              <textarea
                value={editorSummary}
                onChange={(e) => setEditorSummary(e.target.value)}
                placeholder="Write a concise article summary for search engines snippet listing..."
                rows={2}
                maxLength={200}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Content body */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Content Body * (Supports Plain Text & Markdown HTML headings)</label>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Start writing the blog post body..."
                rows={12}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 p-4 text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                required
              />
            </div>

            {/* Published Status Toggle */}
            <div className="flex items-center space-x-3 bg-indigo-950/10 border border-[rgba(255,255,255,0.03)] p-4 rounded-xl max-w-xs">
              <input
                type="checkbox"
                id="published"
                checked={editorPublished}
                onChange={(e) => setEditorPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="published" className="text-xs font-semibold text-gray-300 select-none cursor-pointer flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span>Publish Article (make public)</span>
              </label>
            </div>

            {editorError && <p className="text-xs text-red-400 font-medium">{editorError}</p>}
            {editorSuccess && <p className="text-xs text-emerald-400 font-medium">Article saved successfully! Redirecting...</p>}

            {/* Actions buttons */}
            <div className="flex justify-end gap-3 border-t border-[rgba(255,255,255,0.05)] pt-5">
              <button
                type="button"
                onClick={() => {
                  resetEditorForm();
                  setActiveTab('posts');
                }}
                className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white text-xs font-semibold tracking-wide transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-indigo-600/15 transition-all duration-300"
              >
                <Save className="h-4 w-4" />
                <span>Save Article</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Panel 4: AI Automation Control */}
      {activeTab === 'ai-automation' && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Topic Generator Form */}
            <div className="lg:col-span-2 rounded-3xl border border-[rgba(99,102,241,0.15)] bg-[rgba(17,12,28,0.3)] p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-indigo-600/5 blur-2xl" />

              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span>AI Automated Post Creator</span>
              </h3>

              {/* Mode Selection Tabs */}
              <div className="flex bg-gray-950/80 p-1 rounded-xl border border-gray-800/50 mb-6 max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAiMode('single');
                    setAiError('');
                    setAiProgress([]);
                  }}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${aiMode === 'single'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                    }`}
                  disabled={aiGenerating || bulkDiscovering}
                >
                  Single Post
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiMode('bulk');
                    setAiError('');
                    setAiProgress([]);
                  }}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${aiMode === 'bulk'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                    }`}
                  disabled={aiGenerating || bulkDiscovering}
                >
                  Bulk Creator
                </button>
              </div>

              {aiMode === 'single' ? (
                <>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Provide a heading or topic. The system will search DuckDuckGo, extract contents from top search links to gather up-to-date details, and utilize Gemini to generate a valuable, publication-ready technical post.
                  </p>

                  <form onSubmit={handleAIGenerate} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Article Heading / Topic</label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. Next.js 16 compiler features and performance guide"
                        className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/15 px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                        disabled={aiGenerating}
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 py-2">
                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={aiSearchWeb}
                          onChange={(e) => setAiSearchWeb(e.target.checked)}
                          className="rounded border-[rgba(99,102,241,0.15)] bg-indigo-950/30 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                          disabled={aiGenerating}
                        />
                        <span>Scrape web search for up-to-date facts (Recommended)</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={aiPublished}
                          onChange={(e) => setAiPublished(e.target.checked)}
                          className="rounded border-[rgba(99,102,241,0.15)] bg-indigo-950/30 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                          disabled={aiGenerating}
                        />
                        <span>Publish immediately (visible to public)</span>
                      </label>
                    </div>

                    {aiError && (
                      <p className="text-xs text-red-400 font-semibold">{aiError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={aiGenerating}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/40 py-3 text-xs font-semibold tracking-wide text-white shadow-lg shadow-indigo-600/10 transition-all duration-300"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{aiGenerating ? 'Generating...' : 'Research & Generate Blog Post'}</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    Auto-detect global trends across diverse categories. Choose the focus category, select the desired quantity, discover highly projected keywords, and run the sequential article generator.
                  </p>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">Focus Category</label>
                        <select
                          value={bulkCategory}
                          onChange={(e) => setBulkCategory(e.target.value)}
                          className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-gray-900 border-0 px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                          disabled={bulkDiscovering || bulkGenerating}
                        >
                          <option value="all">Auto-Detect Global Trends (All Categories)</option>
                          <option value="Technology">Technology Focus</option>
                          <option value="Health">Health Focus</option>
                          <option value="Finance">Finance Focus</option>
                          <option value="Travel">Travel Focus</option>
                          <option value="Lifestyle">Lifestyle Focus</option>
                          <option value="Development">Development Focus</option>
                          <option value="SEO">SEO Focus</option>
                          <option value="Science">Science Focus</option>
                          <option value="Space">Space Focus</option>
                          <option value="Sports">Sports Focus</option>
                          <option value="Gaming">Gaming Focus</option>
                          <option value="Business">Business Focus</option>
                          <option value="RelationShips">RelationShips Focus</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">
                          <span>Article Suggestions Quantity</span>
                          <span className="text-indigo-400 font-mono font-bold">{bulkCount} Posts</span>
                        </div>
                        <div className="px-1 py-1">
                          <input
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={bulkCount}
                            onChange={(e) => setBulkCount(Number(e.target.value))}
                            className="w-full h-1.5 rounded-lg bg-gray-800 accent-indigo-500 cursor-pointer"
                            disabled={bulkDiscovering || bulkGenerating}
                          />
                          <div className="flex justify-between text-[9px] text-gray-600 mt-1 font-semibold">
                            <span>2</span>
                            <span>4</span>
                            <span>6</span>
                            <span>8</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 py-1 border-t border-[rgba(255,255,255,0.03)] pt-3">
                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={aiSearchWeb}
                          onChange={(e) => setAiSearchWeb(e.target.checked)}
                          className="rounded border-[rgba(99,102,241,0.15)] bg-indigo-950/30 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                          disabled={bulkGenerating}
                        />
                        <span>Research fact checks before generating</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={aiPublished}
                          onChange={(e) => setAiPublished(e.target.checked)}
                          className="rounded border-[rgba(99,102,241,0.15)] bg-indigo-950/30 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                          disabled={bulkGenerating}
                        />
                        <span>Publish generated posts directly</span>
                      </label>
                    </div>

                    {/* Discovered Trends Preview Table */}
                    {bulkTopics.length > 0 && (
                      <div className="mt-6 border-t border-[rgba(255,255,255,0.05)] pt-4 text-left">
                        <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">
                          Discovered Trending Topics Queue
                        </h4>
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {bulkTopics.map((t, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-950/40 border border-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.05)] transition-all flex items-start justify-between gap-3 text-xs">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!t.selected}
                                  onChange={(e) => {
                                    const updated = [...bulkTopics];
                                    updated[idx].selected = e.target.checked;
                                    setBulkTopics(updated);
                                  }}
                                  className="mt-1.5 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0 cursor-pointer h-4.5 w-4.5"
                                  disabled={bulkGenerating}
                                />
                                <div className="text-left">
                                  <div className="font-bold text-white leading-snug">{t.topic}</div>
                                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">{t.reason}</p>
                                  <span className="text-[9px] font-semibold text-gray-500 mt-1 uppercase block tracking-wider">{t.category} • Vol: {t.volume}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 block">${t.expectedCpc.toFixed(2)} CPC</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <p className="text-xs text-red-400 font-semibold">{aiError}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                      <button
                        type="button"
                        onClick={handleDiscoverTrends}
                        disabled={bulkDiscovering || bulkGenerating}
                        className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-indigo-500/30 hover:border-indigo-500 bg-indigo-950/10 hover:bg-indigo-950/20 py-3 text-xs font-semibold tracking-wider text-indigo-300 uppercase transition-all duration-300 disabled:opacity-50"
                      >
                        <Globe className="h-4 w-4" />
                        <span>{bulkDiscovering ? 'Analyzing Trends...' : '1. Discover Trending Topics'}</span>
                      </button>

                      {bulkTopics.length > 0 && (
                        <button
                          type="button"
                          onClick={handleBulkGenerate}
                          disabled={bulkDiscovering || bulkGenerating}
                          className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-semibold tracking-wider text-white uppercase shadow-lg shadow-indigo-600/10 transition-all duration-300 disabled:opacity-50"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>2. Generate & Publish Selected</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Progress Feedback Log / Progress Bar */}
              {aiProgress.length > 0 && (
                <div className="mt-6 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-indigo-950/10 text-left">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Generation Progress Log</span>

                  {/* Progress Bar (Visible in Bulk Generation) */}
                  {bulkGenerating && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">Queue status: Post {bulkCurrentIndex} of {bulkTopics.filter(t => t.selected).length}</span>
                        <span className="text-indigo-400 font-bold">{bulkProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${bulkProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 font-mono text-[10px] text-gray-400 max-h-[150px] overflow-y-auto pr-1">
                    {aiProgress.map((prog, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">»</span>
                        <span>{prog}</span>
                      </p>
                    ))}
                  </div>

                  {(aiGenerating || bulkDiscovering) && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span>{bulkDiscovering ? 'Querying global search logs...' : 'AI writer is generating article content...'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Daily Cron Configuration Info */}
            <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] p-6 text-left flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <span>Daily Scheduler</span>
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Blogor includes a built-in endpoint configured to check RSS news feeds daily, fetch trending posts, re-write them with Gemini, and publish automatically.
                </p>

                <div className="p-3.5 rounded-xl bg-indigo-950/10 border border-[rgba(99,102,241,0.15)] text-[10.5px] text-gray-400 mb-6 space-y-2">
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-1.5">
                    <span className="font-semibold text-purple-300">Target feeds:</span>
                    <span>TechCrunch, Vercel, CSS-Tricks</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-1.5">
                    <span className="font-semibold text-purple-300">Cron Target URL:</span>
                    <span className="font-mono text-white text-[9.5px]">/api/cron/generate</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-normal pt-1">
                    To automate, connect your deployed URL to a free cron provider (like <a href="https://cron-job.org" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">cron-job.org</a> or Vercel Crons) set to run every 24 hours.
                  </div>
                </div>
              </div>

              <button
                onClick={handleTriggerCron}
                disabled={aiGenerating}
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-purple-500/30 hover:border-purple-500 bg-purple-950/10 hover:bg-purple-950/20 py-2.5 text-xs font-semibold tracking-wider text-purple-300 uppercase transition-all duration-300"
              >
                <Cpu className="h-4 w-4" />
                <span>Run Daily RSS Check Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Panel 5: Ad Settings Panel */}
      {activeTab === 'ad-settings' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(17,12,28,0.2)] p-6 text-left max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">
            <Settings className="h-5 w-5 text-indigo-400" />
            <span>Global Ad Settings Configuration</span>
          </h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Configure how advertisements are displayed on the public pages. These preferences apply instantly to all readers globally.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-6">

            {/* Toggle Switch: Global Ads Enable */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] bg-indigo-950/10">
              <div>
                <label className="text-xs font-bold text-white block">Enable Display Advertisements</label>
                <span className="text-[10px] text-gray-500 block mt-0.5">Toggle all banner ad elements on/off across the site</span>
              </div>
              <input
                type="checkbox"
                checked={adsEnabled}
                onChange={(e) => setAdsEnabled(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Selector 1: Active Ad Network */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">Primary Ad Integration Network</label>
              <select
                value={activeNetwork}
                onChange={(e) => setActiveNetwork(e.target.value as any)}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/20 px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="adsense">Google AdSense Integration</option>
                <option value="monetag">Monetag Native Ads</option>
                <option value="addstra">Adsterra Display Banners</option>
              </select>
            </div>

            {/* Text inputs for credentials with Connection Badges */}
            <div className="space-y-4 p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] bg-indigo-950/5">
              <h4 className="text-xs font-bold text-white mb-2">Publisher Credentials</h4>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400">Google AdSense Client ID</label>
                  {adsenseClientId.trim() !== '' && adsenseClientId !== 'ca-pub-xxxxxxxxxxxxxxxx' ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">🟢 Connected</span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">⚫ Disconnected</span>
                  )}
                </div>
                <input
                  type="text"
                  value={adsenseClientId}
                  onChange={(e) => setAdsenseClientId(e.target.value)}
                  placeholder="e.g. ca-pub-1234567890123456"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/20 px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400">Adsterra Script URL</label>
                  {addstraScriptUrl.trim() !== '' && addstraScriptUrl !== '//adsterra.com/sites/xyz/banner.js' ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">🟢 Connected</span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">⚫ Disconnected</span>
                  )}
                </div>
                <input
                  type="text"
                  value={addstraScriptUrl}
                  onChange={(e) => setAddstraScriptUrl(e.target.value)}
                  placeholder="e.g. //www.highperformanceformat.com/xyz/invoke.js"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/20 px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-400">Monetag Script URL</label>
                  {monetagScriptUrl.trim() !== '' && monetagScriptUrl !== 'https://cdn.monetag.io/ads.js' ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">🟢 Connected</span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">⚫ Disconnected</span>
                  )}
                </div>
                <input
                  type="text"
                  value={monetagScriptUrl}
                  onChange={(e) => setMonetagScriptUrl(e.target.value)}
                  placeholder="e.g. https://alwingulla.com/act/files/micro.tag.min.js"
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/20 px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Selector 2: Ad Density Selector (Ad Preferences Control) */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2.5">Global Article Ad Density</label>
              <div className="grid grid-cols-1 gap-3">

                {/* Low Density Option */}
                <button
                  type="button"
                  onClick={() => setAdDensity('low')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 ${adDensity === 'low'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow shadow-indigo-500/10'
                    : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="text-xs font-bold">Low Density (Reader Focus)</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Places only 1 ad in articles, disables sidebars</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-500">-50% Yield</span>
                </button>

                {/* Balanced Density Option */}
                <button
                  type="button"
                  onClick={() => setAdDensity('balanced')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 ${adDensity === 'balanced'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow shadow-indigo-500/10'
                    : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <div>
                      <div className="text-xs font-bold">Balanced Density (Default)</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Optimized mix of article, sidebar, and layout ads</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 font-mono">Normal</span>
                </button>

                {/* Max Revenue Density Option */}
                <button
                  type="button"
                  onClick={() => setAdDensity('max-revenue')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 ${adDensity === 'max-revenue'
                    ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-pink-950/40 border-pink-500/40 text-white shadow-lg shadow-pink-500/5'
                    : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                    <div>
                      <div className="text-xs font-bold text-pink-400">Max Revenue Mode (Aggressive)</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Injects ads every 2 blocks, enables corner pop-ups & sticky ads</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-950/60 border border-pink-500/30 text-pink-400 animate-pulse">+180% Yield</span>
                </button>

              </div>
            </div>

            {settingsError && <p className="text-xs text-red-400 font-medium text-center">{settingsError}</p>}
            {settingsSuccess && <p className="text-xs text-emerald-400 font-medium text-center">Settings saved and applied globally! 🎉</p>}

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 border-t border-[rgba(255,255,255,0.05)] pt-5">
              <button
                type="submit"
                disabled={settingsLoading}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/40 text-white text-xs font-semibold tracking-wide shadow-lg shadow-indigo-600/15 transition-all duration-300 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{settingsLoading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
