import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear database
  console.log('🗑️ Cleaning database...');
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.adMetric.deleteMany({});

  // 2. Create posts
  console.log('✍️ Seeding posts...');
  const posts = [
    {
      title: 'Mastering Next.js 14 App Router: A Comprehensive Performance Guide',
      slug: 'mastering-nextjs-14-app-router-performance',
      summary: 'Learn how server components, streaming, and caching strategies in Next.js 14 App Router can speed up your application and maximize Core Web Vitals scores.',
      content: `Next.js 14 has redefined full-stack React development with the App Router. By migrating from the Pages Router, developers unlock native support for React Server Components (RSC), Suspense-driven streaming, and advanced data caching mechanisms.

### Why Server Components Matter
Traditional Client-Side Rendering (CSR) forces browsers to download, parse, and execute huge bundles of JavaScript before showing any meaningful content. With React Server Components, the initial HTML is generated directly on the server, drastically reducing the First Contentful Paint (FCP) time.

Furthermore, server components keep their dependencies on the server. If you use a heavy markdown parser or utility library, it stays on the backend, shrinking your client bundle to zero bytes for that component.

### Leveraging Suspense and Streaming
Instead of waiting for the entire page to render on the server, you can stream content chunk-by-chunk using React's \\\`<Suspense>\\\`. This allows the header and post layouts to show up instantly while slower data-fetching elements (like comments or related posts) stream in as they finish loading.

### Advanced Caching Strategies
Next.js offers a powerful caching layer built on top of the native fetch API:
1. **Request Memoization:** Dedupes identical fetch requests across a single render pass.
2. **Data Cache:** Persists fetched data across multiple user requests.
3. **Full Route Cache:** Automatically caches HTML and RSC payloads for static routes.

To make client-side page transitions feel instantaneous, make sure you use dynamic routes properly and export 'unstable_instant' when appropriate for rapid navigation paths.

By combining these concepts, your blog will achieve perfect lighthouse scores, making search engine indexing (SEO) and user interaction incredibly smooth.`,
      coverImage: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60',
      category: 'Development',
      published: true,
      readTime: 6,
      author: 'Alex River',
      views: 0,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      title: 'The Complete Tailwind CSS Gradients Playbook',
      slug: 'complete-tailwind-css-gradients-playbook',
      summary: 'Elevate your web design using multi-layered dynamic color gradients, text backgrounds, and animated grid backgrounds with Tailwind CSS classes.',
      content: `Design is what grabs your users first. A premium website utilizes typography, harmonious color schemes, and subtle background textures to establish a professional look. Tailwind CSS makes implementing these complex design patterns surprisingly simple.

### Dynamic Linear Gradients
Tailwind CSS provides built-in support for linear gradients. You can easily define gradients by chaining classes like:
\\\`\\\`\\\`html
<div class="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500"></div>
\\\`\\\`\\\`
This creates a beautiful left-to-right gradient blending purple, blue, and pink.

### Text Gradient Masking
Make your headings stand out by applying gradients directly to text. Combine background gradient classes with \\\`bg-clip-text\\\` and \\\`text-transparent\\\`:
\\\`\\\`\\\`html
<h1 class="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
  Premium Design
</h1>
\\\`\\\`\\\`
This technique creates a high-end typography effect seen on premium SaaS marketing pages.

### Hover Transitions & Micro-Animations
Static layouts feel lifeless. Add soft transitions to your interactive elements to make them responsive. For example, hover-scale effects combined with drop-shadow glows:
\\\`\\\`\\\`html
<button class="bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 px-6 py-3 rounded-xl text-white font-medium">
  Get Started
</button>
\\\`\\\`\\\`

Using these design cues, Blogor establishes a visually rich and immersive user interface that captivates visitors instantly, keeping bounce rates low and ad click rates high.`,
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60',
      category: 'Design',
      published: true,
      readTime: 4,
      author: 'Sophia Vance',
      views: 0,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      title: '5 High-CPM Ad Networks for Tech & Niche Blogs in 2026',
      slug: 'high-cpm-ad-networks-tech-blogs-2026',
      summary: 'An analytical comparison of Google AdSense, Addstra, Monetag, and affiliate payouts for low to medium traffic tech blogs.',
      content: `Monetizing a blog requires selecting the right network partners. While Google AdSense remains the industry standard, combining display networks with native ad formats can double your earnings.

### 1. Google AdSense (The Gold Standard)
- **Strengths:** High contextual relevance, clean ads, reliable payouts.
- **CPM range:** $1.00 - $12.00 depending on audience location.
- **Best for:** High-intent search traffic and tier-1 countries (US, UK, CA, AU).

### 2. Addstra (Fast Payouts)
- **Strengths:** Immediate approval, weekly payouts, accepts lower traffic.
- **CPM range:** $0.50 - $4.00.
- **Best for:** Dynamic multi-device layouts.

### 3. Monetag (Advanced Monetization)
- **Strengths:** Excellent multi-channel tag system, high mobile fill rates.
- **CPM range:** $1.50 - $6.00.
- **Best for:** Global audiences and mobile-first traffic.

### Best Practices for Layout Optimization
Place your ads where users spend the most time, but never compromise the user experience:
1. **Header Banner:** Standard 728x90 layout centered above the fold.
2. **In-Article Native Ads:** Injected after every 300-500 words. These have the highest Click-Through Rate (CTR) since users read them inline.
3. **Sidebar Sticky Banner:** Stays visible as users scroll down long articles, maximizing viewability metrics.

By rotating ad tags and testing placements, you can maximize your revenue potential without alienating your audience.`,
      coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60',
      category: 'Monetization',
      published: true,
      readTime: 5,
      author: 'Marcus Chen',
      views: 0,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      title: 'Ultimate SEO & SEM Checklist for Next.js Developers',
      slug: 'seo-sem-checklist-nextjs-developers',
      summary: 'How to configure dynamic page metadata, OpenGraph tags, sitemaps, JSON-LD schema, and structured rich snippets to dominate search engines.',
      content: `Building a beautiful website is only half the battle. If search engines can't crawl your site or index your content, you won't get traffic. Modern Search Engine Optimization (SEO) and Search Engine Marketing (SEM) require both technical and structural optimizations.

### 1. Static Metadata API
Next.js provides a robust Metadata API to configure your HTML header. By using the dynamic metadata generator, you can serve unique Page Titles, descriptions, and Canonical URLs:
\\\`\\\`\\\`typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: \\\`\\\${post.title} | Blogor\\\`,
    description: post.summary,
    alternates: {
      canonical: \\\`https://blogor.com/blog/\\\${post.slug}\\\`
    }
  }
}
\\\`\\\`\\\`

### 2. Schema.org JSON-LD Structured Data
Structured data helps Google understand the context of your page. Injecting a \\\`BlogPosting\\\` schema allows search engines to show rich cards (carousel thumbnails, author icons, publication dates) in search results.

### 3. XML Sitemap & Robots crawling
Next.js supports generating sitemaps automatically. By exporting a default sitemap function, search bots can immediately discover newly published posts. Accompany this with a \\\`robots.txt\\\` file detailing allowed routes.

### 4. SEM Conversion Layouts
For paid landing pages, focus on:
- High page speed scores (minimizing JS execution).
- Clear headings matching search keywords.
- Dynamic responsive layouts with zero layout shifts (CLS).

Integrating this checklist into your development cycle guarantees your site is fully search-engine ready from day one.`,
      coverImage: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&auto=format&fit=crop&q=60',
      category: 'SEO',
      published: true,
      readTime: 7,
      author: 'Sarah Jenkins',
      views: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      title: 'Draft Article: Designing for the Modern Web',
      slug: 'designing-for-the-modern-web-draft',
      summary: 'An exploration of modern minimalist interfaces, dark mode preferences, and responsive design systems.',
      content: 'This is a draft post. It is not published yet, so it should only be visible inside the Admin Dashboard manager.',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
      category: 'Design',
      published: false,
      readTime: 3,
      author: 'Sophia Vance',
      views: 0,
      createdAt: new Date(),
    }
  ];

  for (const post of posts) {
    const createdPost = await prisma.post.create({
      data: post,
    });
    console.log(`✅ Seeded post: "${createdPost.title}"`);

    // Add comments to published posts
    if (createdPost.published) {
      await prisma.comment.createMany({
        data: [
          {
            postId: createdPost.id,
            authorName: 'John Doe',
            content: 'This is an incredibly detailed guide. Thanks for sharing!',
            createdAt: new Date(createdPost.createdAt.getTime() + 1 * 60 * 60 * 1000),
          },
          {
            postId: createdPost.id,
            authorName: 'Emily Smith',
            content: 'Great layout! I loved the illustrations and code snippets.',
            createdAt: new Date(createdPost.createdAt.getTime() + 5 * 60 * 60 * 1000),
          }
        ]
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
