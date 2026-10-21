/**
 * eBay Browse API Connector Service
 * Implements official OAuth2 Application Token and Item Summary Search for European Marketplaces.
 * Supports both Production and Sandbox environments with live connection diagnostics.
 */

import { transformEbayItemSummary } from '../utils/ebayParser.ts';
import { getEbayEndpoints } from '../utils/ebayKeyset.ts';
import type { WatchListing } from '../utils/gemEvaluator.ts';

let cachedToken: {
  accessToken: string;
  expiresAtMs: number;
  environment: 'PRODUCTION' | 'SANDBOX';
  clientId: string;
} | null = null;

/**
 * Invalidate cached token (e.g. after updating keyset)
 */
export function invalidateEbayTokenCache() {
  cachedToken = null;
}

/**
 * Retrieves an OAuth 2.0 Application Access Token from eBay Identity API
 */
export async function getEbayAppToken(
  clientId: string,
  clientSecret: string,
  environment: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION'
): Promise<string | null> {
  const cleanClientId = clientId.trim();
  const cleanClientSecret = clientSecret.trim();

  if (
    cachedToken &&
    cachedToken.environment === environment &&
    cachedToken.clientId === cleanClientId &&
    Date.now() < cachedToken.expiresAtMs - 60000
  ) {
    return cachedToken.accessToken;
  }

  const { oauthTokenUrl } = getEbayEndpoints(environment);
  const credentials = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString('base64');

  try {
    const response = await fetch(oauthTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`eBay OAuth token fetch failed [${environment}]: ${response.status}`, errText);
      return null;
    }

    const data = await response.json();
    cachedToken = {
      accessToken: data.access_token,
      expiresAtMs: Date.now() + (data.expires_in || 7200) * 1000,
      environment,
      clientId: cleanClientId,
    };

    return cachedToken.accessToken;
  } catch (err: any) {
    console.error(`eBay OAuth connection error [${environment}]:`, err?.message || err);
    return null;
  }
}

/**
 * Tests credentials against eBay Identity OAuth endpoint and returns diagnostics
 */
export async function testEbayConnection(params: {
  clientId: string;
  clientSecret: string;
  devId?: string;
  environment?: 'PRODUCTION' | 'SANDBOX';
}): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
  statusCode?: number;
  expiresIn?: number;
}> {
  const startTime = Date.now();
  const environment = params.environment || 'PRODUCTION';
  const cleanClientId = params.clientId.trim();
  const cleanClientSecret = params.clientSecret.trim();

  if (!cleanClientId || !cleanClientSecret) {
    return {
      success: false,
      message: 'Both App ID (Client ID) and Cert ID (Client Secret) are required.',
      latencyMs: 0,
    };
  }

  const { oauthTokenUrl } = getEbayEndpoints(environment);
  const credentials = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString('base64');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(oauthTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      // Store in cache for immediate use
      cachedToken = {
        accessToken: data.access_token,
        expiresAtMs: Date.now() + (data.expires_in || 7200) * 1000,
        environment,
        clientId: cleanClientId,
      };

      return {
        success: true,
        message: `Authenticated with eBay OAuth ${environment}! App token generated (valid for ${Math.round(
          (data.expires_in || 7200) / 60
        )} minutes).`,
        latencyMs,
        statusCode: response.status,
        expiresIn: data.expires_in,
      };
    }

    const errorBody = await response.text();
    let parsedError = errorBody;
    try {
      const jsonErr = JSON.parse(errorBody);
      parsedError = jsonErr.error_description || jsonErr.error || errorBody;
    } catch {
      // keep raw text
    }

    let helpfulHint = '';
    if (response.status === 400 || response.status === 401) {
      if (parsedError.toLowerCase().includes('invalid_client')) {
        helpfulHint =
          ' Check that your App ID and Cert ID match your eBay Developer Portal keys exactly, and verify you selected the matching Environment (Production vs Sandbox).';
      }
    }

    return {
      success: false,
      message: `eBay OAuth returned HTTP ${response.status}: ${parsedError}.${helpfulHint}`,
      latencyMs,
      statusCode: response.status,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out after 10 seconds contacting eBay servers.',
        latencyMs,
      };
    }
    return {
      success: false,
      message: `Network error connecting to eBay Identity API: ${err?.message || err}`,
      latencyMs,
    };
  }
}

/**
 * Searches active European watch listings on eBay Browse API
 */
export async function fetchLiveEbayWatches(options: {
  clientId: string;
  clientSecret: string;
  environment?: 'PRODUCTION' | 'SANDBOX';
  marketplaceId?: string; // 'EBAY_DE' | 'EBAY_CH' | 'EBAY_FR' | 'EBAY_IT'
  query?: string;
  limit?: number;
}): Promise<WatchListing[]> {
  const environment = options.environment || 'PRODUCTION';
  const token = await getEbayAppToken(options.clientId, options.clientSecret, environment);
  if (!token) return [];

  const marketplace = options.marketplaceId || 'EBAY_DE';
  const domainMap: Record<string, 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it'> = {
    EBAY_DE: 'ebay.de',
    EBAY_CH: 'ebay.ch',
    EBAY_FR: 'ebay.fr',
    EBAY_IT: 'ebay.it',
  };
  const targetDomain = domainMap[marketplace] || 'ebay.de';

  const searchQuery =
    options.query ||
    '(Omega, Glashütte, Spezimatic, Zenith, Longines, Universal Genève, Certina) Armbanduhr';
  const encodedQuery = encodeURIComponent(searchQuery);

  // Filter: AUCTION or FIXED_PRICE, exclude broken/parts
  const filterParam = encodeURIComponent(
    'buyingOptions:{AUCTION|FIXED_PRICE},itemLocationCountry:{DE|CH|FR|IT|AT}'
  );
  const { browseApiUrl } = getEbayEndpoints(environment);
  const url = `${browseApiUrl}?q=${encodedQuery}&filter=${filterParam}&sort=endingSoonest&limit=${
    options.limit || 25
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplace,
        'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country%3DDE',
      },
    });

    if (!res.ok) {
      console.warn('eBay Browse API search error:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    if (!data.itemSummaries || !Array.isArray(data.itemSummaries)) {
      return [];
    }

    const now = Date.now();
    return data.itemSummaries.map((item: any) =>
      transformEbayItemSummary(item, targetDomain, now)
    );
  } catch (err: any) {
    console.error('eBay fetch error:', err?.message || err);
    return [];
  }
}
