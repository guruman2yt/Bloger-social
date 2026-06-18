/**
 * Global configurations for Ad Networks
 * To activate ads, set NEXT_PUBLIC_ADS_ENABLED=true in your .env file
 */
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

export const ACTIVE_AD_NETWORK = (process.env.NEXT_PUBLIC_ACTIVE_AD_NETWORK || 'simulated') as 'adsense' | 'addstra' | 'monetag' | 'simulated';


export const ADS_CONFIG = {
  // Google AdSense Configurations
  adsense: {
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-xxxxxxxxxxxxxxxx',
  },
  
  // Addstra Configurations
  addstra: {
    popunderUrl: process.env.NEXT_PUBLIC_ADDSTRA_POPUNDER_URL || '',
    nativeBannerUrl: process.env.NEXT_PUBLIC_ADDSTRA_NATIVE_BANNER_URL || '',
    nativeBannerContainerId: process.env.NEXT_PUBLIC_ADDSTRA_NATIVE_BANNER_CONTAINER_ID || '',
    smartlinkUrl: process.env.NEXT_PUBLIC_ADDSTRA_SMARTLINK_URL || '',
    socialBarUrl: process.env.NEXT_PUBLIC_ADDSTRA_SOCIAL_BAR_URL || '',
    banner728x90Key: process.env.NEXT_PUBLIC_ADDSTRA_BANNER_728X90_KEY || '',
    banner300x250Key: process.env.NEXT_PUBLIC_ADDSTRA_BANNER_300X250_KEY || '',
  },

  // Monetag Configurations
  monetag: {
    scriptUrl: process.env.NEXT_PUBLIC_MONETAG_SCRIPT_URL || 'https://cdn.monetag.io/ads.js',
  }
};
