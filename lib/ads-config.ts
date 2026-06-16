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
    scriptUrl: process.env.NEXT_PUBLIC_ADDSTRA_SCRIPT_URL || '//adsterra.com/sites/xyz/banner.js',
  },

  // Monetag Configurations
  monetag: {
    scriptUrl: process.env.NEXT_PUBLIC_MONETAG_SCRIPT_URL || 'https://cdn.monetag.io/ads.js',
  }
};
