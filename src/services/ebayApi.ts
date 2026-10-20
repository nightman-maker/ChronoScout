/**
 * eBay Browse API Connector Service
 * Implements official OAuth2 Application Token and Item Summary Search for European Marketplaces.
 */

import { transformEbayItemSummary } from '../utils/ebayParser.ts';
import type { WatchListing } from '../utils/gemEvaluator.ts';

let cachedToken: { accessToken: string; expiresAtMs: number } | null = null;

/**
 * Retrieves an OAuth 2.0 Application Access Token from eBay Identity API
 */
export async function getEbayAppToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAtMs - 60000) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('eBay token fetch failed:', response.status, errText);
      return null;
    }

    const data = await response.json();
    cachedToken = {
      accessToken: data.access_token,
      expiresAtMs: Date.now() + (data.expires_in || 7200) * 1000,
    };

    return cachedToken.accessToken;
  } catch (err: any) {
    console.error('eBay OAuth error:', err.message);
    return null;
  }
}

/**
 * Searches active European watch listings on eBay Browse API
 */
export async function fetchLiveEbayWatches(options: {
  clientId: string;
  clientSecret: string;
  marketplaceId?: string; // 'EBAY_DE' | 'EBAY_CH' | 'EBAY_FR' | 'EBAY_IT'
  query?: string;
  limit?: number;
}): Promise<WatchListing[]> {
  const token = await getEbayAppToken(options.clientId, options.clientSecret);
  if (!token) return [];

  const marketplace = options.marketplaceId || 'EBAY_DE';
  const domainMap: Record<string, 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it'> = {
    EBAY_DE: 'ebay.de',
    EBAY_CH: 'ebay.ch',
    EBAY_FR: 'ebay.fr',
    EBAY_IT: 'ebay.it',
  };
  const targetDomain = domainMap[marketplace] || 'ebay.de';

  const searchQuery = options.query || '(Omega, Glashütte, Spezimatic, Zenith, Longines, Universal Genève, Certina) Armbanduhr';
  const encodedQuery = encodeURIComponent(searchQuery);

  // Filter: AUCTION or FIXED_PRICE, exclude broken/parts
  const filterParam = encodeURIComponent('buyingOptions:{AUCTION|FIXED_PRICE},itemLocationCountry:{DE|CH|FR|IT|AT}');
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodedQuery}&filter=${filterParam}&sort=endingSoonest&limit=${options.limit || 25}`;

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
    console.error('eBay fetch error:', err.message);
    return [];
  }
}
