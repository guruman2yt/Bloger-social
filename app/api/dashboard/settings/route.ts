import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_SETTINGS = {
  adDensity: 'balanced',
  activeNetwork: 'adsense',
  adsEnabled: 'true',
  adsenseClientId: '',
  addstraScriptUrl: '',
  monetagScriptUrl: ''
};

export async function GET() {
  try {
    const dbSettings = await prisma.setting.findMany();
    const settingsObj: Record<string, string> = { ...DEFAULT_SETTINGS };
    
    dbSettings.forEach((s: any) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      adDensity, 
      activeNetwork, 
      adsEnabled,
      adsenseClientId = '',
      addstraScriptUrl = '',
      monetagScriptUrl = ''
    } = await request.json();

    // Validate adDensity
    if (adDensity && !['low', 'balanced', 'max-revenue'].includes(adDensity)) {
      return NextResponse.json({ success: false, error: 'Invalid ad density value' }, { status: 400 });
    }

    // Validate activeNetwork
    if (activeNetwork && !['adsense', 'addstra', 'monetag'].includes(activeNetwork)) {
      return NextResponse.json({ success: false, error: 'Invalid active network value' }, { status: 400 });
    }

    // Validate adsEnabled
    if (adsEnabled && !['true', 'false'].includes(adsEnabled)) {
      return NextResponse.json({ success: false, error: 'Invalid adsEnabled value' }, { status: 400 });
    }

    const updates = [
      prisma.setting.upsert({
        where: { key: 'adDensity' },
        update: { value: adDensity },
        create: { key: 'adDensity', value: adDensity }
      }),
      prisma.setting.upsert({
        where: { key: 'activeNetwork' },
        update: { value: activeNetwork },
        create: { key: 'activeNetwork', value: activeNetwork }
      }),
      prisma.setting.upsert({
        where: { key: 'adsEnabled' },
        update: { value: adsEnabled },
        create: { key: 'adsEnabled', value: adsEnabled }
      }),
      prisma.setting.upsert({
        where: { key: 'adsenseClientId' },
        update: { value: adsenseClientId },
        create: { key: 'adsenseClientId', value: adsenseClientId }
      }),
      prisma.setting.upsert({
        where: { key: 'addstraScriptUrl' },
        update: { value: addstraScriptUrl },
        create: { key: 'addstraScriptUrl', value: addstraScriptUrl }
      }),
      prisma.setting.upsert({
        where: { key: 'monetagScriptUrl' },
        update: { value: monetagScriptUrl },
        create: { key: 'monetagScriptUrl', value: monetagScriptUrl }
      })
    ];

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Ad settings updated successfully.',
      settings: { 
        adDensity, 
        activeNetwork, 
        adsEnabled,
        adsenseClientId,
        addstraScriptUrl,
        monetagScriptUrl
      }
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
