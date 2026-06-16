import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://blogor.com';

  try {
    // Fetch all published post slugs and timestamps
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    });

    const postUrls = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      ...postUrls,
    ];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    // Fallback sitemap containing home page only
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
    ];
  }
}
