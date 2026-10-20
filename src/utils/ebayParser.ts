/**
 * eBay Browse API Data Transformer
 * Transforms raw eBay REST API item summaries into scored ChronoScout watch listings.
 */

import {
  calculateGemScore,
  classifyAttentionLevel,
  convertToUsd,
  buildEbayLiveSearchUrl,
} from './gemEvaluator.ts';
import type { WatchListing, MovementType } from './gemEvaluator.ts';

export interface RawEbayItemSummary {
  itemId: string;
  title: string;
  price?: {
    value: string;
    currency: string;
  };
  currentBidPrice?: {
    value: string;
    currency: string;
  };
  itemLocation?: {
    city?: string;
    country?: string;
  };
  image?: {
    imageUrl?: string;
  };
  thumbnailImages?: Array<{ imageUrl?: string }>;
  buyingOptions?: string[]; // e.g. ['AUCTION'] or ['FIXED_PRICE']
  bidCount?: number;
  itemEndDate?: string;
  seller?: {
    username?: string;
    feedbackPercentage?: string;
    feedbackScore?: number;
  };
  shippingOptions?: Array<{
    shippingCost?: {
      value: string;
      currency: string;
    };
  }>;
  itemWebUrl?: string;
}

/**
 * Detects horological brand from title
 */
export function detectBrandFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('omega') || t.includes('omga')) return 'Omega';
  if (t.includes('glashütte') || t.includes('glashuette') || t.includes('gub')) return 'Glashütte';
  if (t.includes('zenith')) return 'Zenith';
  if (t.includes('longines') || t.includes('longins')) return 'Longines';
  if (t.includes('universal genève') || t.includes('universal geneve') || t.includes('polerouter')) return 'Universal Genève';
  if (t.includes('certina')) return 'Certina';
  if (t.includes('enicar') || t.includes('sherpa')) return 'Enicar';
  if (t.includes('tissot') || t.includes('tisso')) return 'Tissot';
  if (t.includes('doxa')) return 'Doxa';
  if (t.includes('nomos')) return 'Nomos Glashütte';
  if (t.includes('nivada')) return 'Nivada Grenchen';
  if (t.includes('eterna')) return 'Eterna';
  if (t.includes('roamer')) return 'Roamer';
  if (t.includes('cyma')) return 'Cyma';
  return 'Swiss Vintage';
}

/**
 * Detects movement type
 */
export function detectMovementFromTitle(title: string): MovementType {
  const t = title.toLowerCase();
  if (t.includes('chronograph') || t.includes('chronographe') || t.includes('valjoux') || t.includes('lemania') || t.includes('landeron')) {
    return 'Chronograph';
  }
  if (t.includes('automatik') || t.includes('automatic') || t.includes('spezimatic') || t.includes('microtor') || t.includes('rotor')) {
    return 'Automatic';
  }
  return 'Manual Wind';
}

/**
 * Estimates baseline collector market value
 */
export function estimateMarketBaseline(brand: string, movement: MovementType, currentPriceUsd: number): number {
  let baseline = 450;
  if (brand === 'Omega') baseline = movement === 'Chronograph' ? 1800 : movement === 'Automatic' ? 750 : 600;
  else if (brand === 'Glashütte') baseline = movement === 'Automatic' ? 480 : 380;
  else if (brand === 'Universal Genève') baseline = movement === 'Automatic' ? 1500 : 800;
  else if (brand === 'Zenith') baseline = 750;
  else if (brand === 'Longines') baseline = 650;
  else if (brand === 'Tissot' && movement === 'Chronograph') baseline = 1200;
  else if (movement === 'Chronograph') baseline = 950;

  return Math.max(baseline, Math.round(currentPriceUsd * 1.4));
}

/**
 * Transforms an eBay REST item summary into a ChronoScout WatchListing
 */
export function transformEbayItemSummary(
  item: RawEbayItemSummary,
  marketplaceDomain: 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it' = 'ebay.de',
  nowMs: number = Date.now()
): WatchListing {
  const rawPrice = item.currentBidPrice?.value || item.price?.value || '100';
  const priceVal = parseFloat(rawPrice) || 100;
  const currency = (item.currentBidPrice?.currency || item.price?.currency || 'EUR') as 'EUR' | 'CHF' | 'GBP' | 'USD';
  const priceUsd = convertToUsd(priceVal, currency);

  const brand = detectBrandFromTitle(item.title);
  const movement = detectMovementFromTitle(item.title);
  const isAuction = item.buyingOptions?.includes('AUCTION') ?? true;
  const listingType = isAuction ? 'auction' : 'buy_it_now';
  const bidsCount = item.bidCount || 0;
  const endTime = item.itemEndDate || new Date(nowMs + 3600 * 1000).toISOString();

  const estimatedValueUsd = estimateMarketBaseline(brand, movement, priceUsd);

  // Provenance
  const countryCode = (item.itemLocation?.country?.toUpperCase() || (marketplaceDomain === 'ebay.ch' ? 'CH' : 'DE')) as any;
  const city = item.itemLocation?.city || (countryCode === 'CH' ? 'Switzerland' : 'Germany');

  // Gem evaluation
  const { score, reasons, discountPercent } = calculateGemScore({
    listingType,
    currentPriceUsd: priceUsd,
    estimatedValueUsd,
    bidsCount,
    endTimeIso: endTime,
    brand,
    countryCode,
    nowMs,
  });

  const diffSec = Math.max(0, Math.floor((new Date(endTime).getTime() - nowMs) / 1000));
  const attentionLevel = classifyAttentionLevel(listingType, bidsCount, diffSec, discountPercent);

  // Extract clean numerical item ID from v1|...|0 format
  const cleanItemId = item.itemId.includes('|') ? item.itemId.split('|')[1] : item.itemId;

  // Real eBay link
  const ebayUrl = item.itemWebUrl || `https://www.${marketplaceDomain}/itm/${cleanItemId}`;
  const searchQuery = `${brand} ${movement}`;
  const ebayLiveSearchUrl = buildEbayLiveSearchUrl({
    domain: marketplaceDomain,
    keywords: searchQuery,
    listingType,
    maxPrice: Math.round(priceVal * 1.5),
    sort: isAuction ? 'ending_soonest' : 'newly_listed',
  });

  return {
    id: `ebay-${cleanItemId}`,
    title: item.title,
    brand,
    summary: `Active European eBay listing located in ${city}, ${countryCode}. ${movement} vintage wristwatch.`,
    listingType,
    currentPriceUsd: priceUsd,
    originalPrice: priceVal,
    originalCurrency: currency,
    estimatedValueUsd,
    bidsCount,
    endTime,
    seller: {
      username: item.seller?.username || 'ebay_seller',
      feedbackScore: item.seller?.feedbackScore || 100,
      feedbackPercent: parseFloat(item.seller?.feedbackPercentage || '100'),
      isTopRated: (item.seller?.feedbackScore || 0) > 200,
    },
    location: {
      city,
      country: countryCode === 'CH' ? 'Switzerland' : countryCode === 'DE' ? 'Germany' : 'Europe',
      countryCode,
      shipsTo: 'Europe, Switzerland',
      shippingCostUsd: item.shippingOptions?.[0]?.shippingCost?.value
        ? convertToUsd(parseFloat(item.shippingOptions[0].shippingCost.value), currency)
        : 15,
    },
    specs: {
      movement,
      caseDiameter: 'Vintage Standard',
      caseMaterial: 'Stainless Steel / Plated',
      yearEstimate: 'Vintage',
    },
    imageUrl: item.image?.imageUrl || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      item.image?.imageUrl || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    ],
    ebayUrl,
    ebayLiveSearchUrl,
    ebaySearchQuery: searchQuery,
    ebayItemNumber: cleanItemId,
    ebayDomain: marketplaceDomain,
    gemScore: score,
    gemReasons: reasons,
    attentionLevel,
    dateAdded: new Date(nowMs).toISOString(),
  };
}
