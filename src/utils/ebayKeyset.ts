/**
 * eBay Keyset Management & Validation Utilities
 */

export interface EbayKeyset {
  clientId: string;      // App ID
  clientSecret: string;  // Cert ID
  devId?: string;        // Dev ID (optional)
  environment: 'PRODUCTION' | 'SANDBOX';
  marketplaceId: string; // e.g. EBAY_DE, EBAY_CH, EBAY_FR, EBAY_IT, EBAY_GB, EBAY_US
  enabled: boolean;
  lastTested?: number;
  lastTestStatus?: 'success' | 'error';
  lastTestMessage?: string;
}

export const SUPPORTED_MARKETPLACES = [
  { id: 'EBAY_DE', name: 'Germany (ebay.de)', currency: 'EUR', domain: 'ebay.de', note: 'Largest EU vintage & mechanical market' },
  { id: 'EBAY_CH', name: 'Switzerland (ebay.ch)', currency: 'CHF', domain: 'ebay.ch', note: 'Epicenter for genuine Swiss horology' },
  { id: 'EBAY_AT', name: 'Austria (ebay.at)', currency: 'EUR', domain: 'ebay.at', note: 'Central European collector listings' },
  { id: 'EBAY_FR', name: 'France (ebay.fr)', currency: 'EUR', domain: 'ebay.fr', note: 'French & Swiss vintage wristwatches' },
  { id: 'EBAY_IT', name: 'Italy (ebay.it)', currency: 'EUR', domain: 'ebay.it', note: 'High volume vintage chronographs' },
  { id: 'EBAY_GB', name: 'United Kingdom (ebay.co.uk)', currency: 'GBP', domain: 'ebay.co.uk', note: 'British vintage military & luxury' },
  { id: 'EBAY_US', name: 'United States (ebay.com)', currency: 'USD', domain: 'ebay.com', note: 'Global marketplace' },
];

/**
 * Validates the eBay Keyset input
 */
export function validateEbayKeyset(keyset: Partial<EbayKeyset>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const clientId = (keyset.clientId || '').trim();
  const clientSecret = (keyset.clientSecret || '').trim();
  const environment = keyset.environment || 'PRODUCTION';
  const marketplaceId = keyset.marketplaceId || 'EBAY_DE';

  if (!clientId) {
    errors.clientId = 'App ID (Client ID) is required.';
  } else if (clientId.length < 5) {
    errors.clientId = 'App ID appears too short (eBay App IDs are typically 15-40 characters).';
  }

  if (!clientSecret) {
    errors.clientSecret = 'Cert ID (Client Secret) is required.';
  } else if (clientSecret.length < 8) {
    errors.clientSecret = 'Cert ID appears too short (eBay Cert IDs are typically 25-45 characters).';
  }

  if (environment !== 'PRODUCTION' && environment !== 'SANDBOX') {
    errors.environment = 'Environment must be either PRODUCTION or SANDBOX.';
  }

  const validMarketplace = SUPPORTED_MARKETPLACES.some((m) => m.id === marketplaceId);
  if (!validMarketplace) {
    errors.marketplaceId = `Marketplace ${marketplaceId} is not supported.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Masks a sensitive eBay credential for safe display in UI
 */
export function maskEbayKey(key?: string): string {
  if (!key) return 'Not configured';
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * Resolves eBay OAuth & Browse API base endpoints based on environment
 */
export function getEbayEndpoints(environment: 'PRODUCTION' | 'SANDBOX') {
  if (environment === 'SANDBOX') {
    return {
      oauthTokenUrl: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      browseApiUrl: 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search',
      portalDomain: 'sandbox.ebay.com',
    };
  }
  return {
    oauthTokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
    browseApiUrl: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
    portalDomain: 'ebay.com',
  };
}

/**
 * Generates Docker .env variables snippet
 */
export function generateDockerEnv(keyset: Partial<EbayKeyset>): string {
  return [
    `# eBay Developer Keyset (ChronoScout Live Feed)`,
    `EBAY_CLIENT_ID="${keyset.clientId || 'YOUR_APP_ID'}"`,
    `EBAY_CLIENT_SECRET="${keyset.clientSecret || 'YOUR_CERT_ID'}"`,
    keyset.devId ? `EBAY_DEV_ID="${keyset.devId}"` : `# EBAY_DEV_ID=""`,
    `EBAY_ENVIRONMENT="${keyset.environment || 'PRODUCTION'}"`,
    `EBAY_MARKETPLACE="${keyset.marketplaceId || 'EBAY_DE'}"`,
  ].join('\n');
}

/**
 * Generates Docker Compose environment block snippet
 */
export function generateDockerComposeEnv(keyset: Partial<EbayKeyset>): string {
  return `    environment:
      - NODE_ENV=production
      - PORT=3000
      - EBAY_CLIENT_ID=${keyset.clientId || 'your_client_id_here'}
      - EBAY_CLIENT_SECRET=${keyset.clientSecret || 'your_client_secret_here'}
      - EBAY_ENVIRONMENT=${keyset.environment || 'PRODUCTION'}
      - EBAY_MARKETPLACE=${keyset.marketplaceId || 'EBAY_DE'}${
        keyset.devId ? `\n      - EBAY_DEV_ID=${keyset.devId}` : ''
      }`;
}
