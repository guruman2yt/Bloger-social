import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const NETWORK_RATES = {
  adsense: { cpm: 5.5, cpc: 0.45 },
  addstra: { cpm: 2.2, cpc: 0.15 },
  monetag: { cpm: 3.5, cpc: 0.28 },
  simulated: { cpm: 4.8, cpc: 0.35 },
};

export async function POST(request: NextRequest) {
  try {
    const { type, network } = await request.json();

    if (!type || !network || !Object.keys(NETWORK_RATES).includes(network)) {
      return NextResponse.json({ error: 'Invalid payload parameters' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const rates = NETWORK_RATES[network as keyof typeof NETWORK_RATES];

    // Calculate delta changes
    const isImpression = type === 'impression';
    const isClick = type === 'click';

    const impressionDelta = isImpression ? 1 : 0;
    const clickDelta = isClick ? 1 : 0;

    // Revenue contribution
    // Impression revenue = CPM / 1000
    // Click revenue = CPC
    let revenueDelta = 0;
    if (isImpression) {
      revenueDelta = rates.cpm / 1000;
    } else if (isClick) {
      revenueDelta = rates.cpc;
    }

    // Perform atomic upsert in SQLite
    const updatedMetric = await prisma.adMetric.upsert({
      where: {
        date_network: {
          date: today,
          network,
        },
      },
      update: {
        impressions: { increment: impressionDelta },
        clicks: { increment: clickDelta },
        revenue: { increment: revenueDelta },
      },
      create: {
        date: today,
        network,
        impressions: impressionDelta,
        clicks: clickDelta,
        revenue: revenueDelta,
      },
    });

    // Make sure we round the stored revenue to 4 decimal places to avoid float precision creep
    if (updatedMetric.revenue) {
      await prisma.adMetric.update({
        where: { id: updatedMetric.id },
        data: {
          revenue: Math.round(updatedMetric.revenue * 10000) / 10000,
        },
      });
    }

    return NextResponse.json({ success: true, metric: updatedMetric });
  } catch (error) {
    console.error('Error logging ad tracking metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
