import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { prisma } from "@/lib/db";
import { ADS_ENABLED, ACTIVE_AD_NETWORK, ADS_CONFIG } from "@/lib/ads-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#05030a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://blogor.com"),
  title: {
    default: "Blogor | Premium Web Development, Design & Monetization Hub",
    template: "%s | Blogor",
  },
  description: "Explore high-performance engineering articles, dynamic design blueprints, sitemaps, JSON-LD structured schemas, and revenue-maximizing ad integration guidelines.",
  keywords: ["Next.js", "React", "Tailwind CSS", "SEO", "SEM Optimization", "Web Development", "Ad Revenue", "Google AdSense", "Monetag", "Addstra"],
  authors: [{ name: "Blogor Team" }],
  openGraph: {
    title: "Blogor | Premium Web Development, Design & Monetization Hub",
    description: "Explore high-performance engineering articles, dynamic design blueprints, sitemaps, JSON-LD structured schemas, and revenue-maximizing ad integration guidelines.",
    url: "https://blogor.com",
    siteName: "Blogor",
    images: [
      {
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=630&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Blogor Premium Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogor | Premium Web Development, Design & Monetization Hub",
    description: "Explore high-performance engineering articles, dynamic design blueprints, sitemaps, JSON-LD structured schemas, and revenue-maximizing ad integration guidelines.",
    images: ["https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=630&auto=format&fit=crop&q=80"],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let adsEnabled = ADS_ENABLED;
  let activeNetwork = ACTIVE_AD_NETWORK;

  try {
    const dbSettings = await prisma.setting.findMany();
    dbSettings.forEach((s) => {
      if (s.key === "adsEnabled") adsEnabled = s.value === "true";
      if (s.key === "activeNetwork") activeNetwork = s.value as any;
    });
  } catch (error) {
    console.error("Failed to fetch settings in RootLayout:", error);
  }

  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#05030a] text-[#f3f4f6]">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        
        {/* Global Adsterra (Addstra) scripts for Popunder and Social Bar */}
        {adsEnabled && activeNetwork === "addstra" && isProduction && (
          <>
            {ADS_CONFIG.addstra.popunderUrl && (
              <Script
                src={ADS_CONFIG.addstra.popunderUrl}
                strategy="afterInteractive"
              />
            )}
            {ADS_CONFIG.addstra.socialBarUrl && (
              <Script
                src={ADS_CONFIG.addstra.socialBarUrl}
                strategy="afterInteractive"
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}
