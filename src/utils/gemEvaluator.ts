/**
 * Horological Gem Evaluation Engine
 * Pure logic for scoring Swiss & Glashütte wristwatch deals on eBay European portals.
 */

export type ListingType = 'auction' | 'buy_it_now';

export type AttentionLevel = 'zero_bids_urgent' | 'low_attention' | 'standard' | 'high_attention' | 'unnoticed_bin';

export type MovementType = 'Manual Wind' | 'Automatic' | 'Chronograph' | 'Quartz' | 'Tuning Fork';

export interface WatchSpecification {
  movement: MovementType;
  caliber?: string;
  caseDiameter: string;
  lugWidth?: string;
  caseMaterial: string;
  crystal?: string;
  yearEstimate: string;
  referenceNumber?: string;
}

export interface WatchListing {
  id: string;
  title: string;
  brand: string;
  summary: string;
  listingType: ListingType;
  currentPriceUsd: number;
  originalPrice: number;
  originalCurrency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  estimatedValueUsd: number;
  bidsCount: number;
  endTime: string; // ISO string for auctions, or creation time for Buy It Now
  seller: {
    username: string;
    feedbackScore: number;
    feedbackPercent: number;
    isTopRated?: boolean;
    isPrivateSeller?: boolean;
  };
  location: {
    city: string;
    country: string;
    countryCode: 'CH' | 'DE' | 'FR' | 'IT' | 'AT' | 'UK' | 'ES' | 'BE';
    shipsTo: string;
    shippingCostUsd: number;
  };
  specs: WatchSpecification;
  imageUrl: string;
  galleryUrls: string[];
  ebayUrl: string;
  ebayLiveSearchUrl: string;
  ebaySearchQuery: string;
  ebayItemNumber: string;
  ebayDomain: 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it' | 'ebay.co.uk';
  gemScore: number; // 0 - 100
  gemReasons: string[];
  attentionLevel: AttentionLevel;
  misspelledOrObscure?: boolean;
  dateAdded: string;
}

export function buildEbayLiveSearchUrl(options: {
  domain: 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it' | 'ebay.co.uk';
  keywords: string;
  listingType?: 'auction' | 'buy_it_now' | 'all';
  maxPrice?: number;
  sort?: 'ending_soonest' | 'newly_listed' | 'best_match';
}): string {
  const query = encodeURIComponent(options.keywords.trim());
  let url = `https://www.${options.domain}/sch/i.html?_nkw=${query}`;

  if (options.listingType === 'auction') {
    url += '&LH_Auction=1';
  } else if (options.listingType === 'buy_it_now') {
    url += '&LH_BIN=1';
  }

  if (options.sort === 'ending_soonest' || !options.sort) {
    url += '&_sop=1'; // Ending soonest
  } else if (options.sort === 'newly_listed') {
    url += '&_sop=10'; // Newly listed
  } else if (options.sort === 'best_match') {
    url += '&_sop=12';
  }

  if (options.maxPrice && options.maxPrice > 0) {
    url += `&_udhi=${options.maxPrice}`;
  }

  return url;
}

export interface FilterOptions {
  searchQuery?: string;
  brand?: string;
  originCountry?: string; // 'ALL' or specific country code
  listingType?: 'all' | 'auction' | 'buy_it_now';
  maxPriceUsd?: number;
  minGemScore?: number;
  movementType?: string; // 'ALL' or specific
  onlyZeroOrLowBids?: boolean;
  onlyUrgentEnding?: boolean; // ends within 4 hours
}

export type SortField = 'gem_score' | 'ending_soonest' | 'price_low' | 'price_high' | 'discount_high' | 'bids_lowest';

/**
 * Currency conversion constants (approximate standard rates)
 */
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  CHF: 1.13,
  GBP: 1.29,
};

export function convertToUsd(amount: number, currency: 'EUR' | 'CHF' | 'GBP' | 'USD'): number {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return Math.round(amount * rate);
}

export function convertFromUsd(amountUsd: number, targetCurrency: 'EUR' | 'CHF' | 'GBP' | 'USD'): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return Math.round(amountUsd / rate);
}

/**
 * Calculates remaining time in seconds and returns formatted status
 */
export function formatTimeRemaining(endTimeIso: string, nowMs: number = Date.now()): {
  text: string;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isEnded: boolean;
  totalSeconds: number;
} {
  const targetMs = new Date(endTimeIso).getTime();
  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) {
    return {
      text: 'Ended',
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isEnded: true,
      totalSeconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let text = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    text = `${days}d ${remHours}h`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else {
    text = `${minutes}m ${seconds}s`;
  }

  // Urgent if ending within 3 hours
  const isUrgent = totalSeconds < 3 * 3600;

  return {
    text,
    hours,
    minutes,
    seconds,
    isUrgent,
    isEnded: false,
    totalSeconds,
  };
}

/**
 * Evaluates attention level for a listing
 */
export function classifyAttentionLevel(
  listingType: ListingType,
  bidsCount: number,
  totalSecondsRemaining: number,
  discountPercent: number
): AttentionLevel {
  if (listingType === 'buy_it_now') {
    return discountPercent >= 35 ? 'unnoticed_bin' : 'standard';
  }

  // Auctions
  if (bidsCount === 0 && totalSecondsRemaining < 4 * 3600) {
    return 'zero_bids_urgent';
  }
  if (bidsCount <= 3 && totalSecondsRemaining < 6 * 3600) {
    return 'low_attention';
  }
  if (bidsCount > 12) {
    return 'high_attention';
  }
  return 'standard';
}

/**
 * Calculates a Gem Score (0-100) reflecting value, rarity, and overlooked status
 */
export function calculateGemScore(listing: {
  listingType: ListingType;
  currentPriceUsd: number;
  estimatedValueUsd: number;
  bidsCount: number;
  endTimeIso: string;
  brand: string;
  caliber?: string;
  misspelledOrObscure?: boolean;
  isPrivateSeller?: boolean;
  countryCode: string;
  nowMs?: number;
}): { score: number; reasons: string[]; discountPercent: number } {
  let score = 50; // base score
  const reasons: string[] = [];
  const nowMs = listing.nowMs || Date.now();

  // 1. Discount vs Market Value (up to +30 points)
  const discount = Math.round(
    ((listing.estimatedValueUsd - listing.currentPriceUsd) / listing.estimatedValueUsd) * 100
  );

  if (discount >= 60) {
    score += 25;
    reasons.push(`Massive value: ~${discount}% under market baseline`);
  } else if (discount >= 40) {
    score += 18;
    reasons.push(`Strong value: ~${discount}% below estimated market value`);
  } else if (discount >= 20) {
    score += 10;
    reasons.push(`Good price: ~${discount}% below market`);
  } else if (discount < 0) {
    score -= 15;
  }

  // 2. Auction Overlooked Status / Timing (up to +25 points)
  if (listing.listingType === 'auction') {
    const time = formatTimeRemaining(listing.endTimeIso, nowMs);

    if (!time.isEnded) {
      if (listing.bidsCount === 0) {
        if (time.totalSeconds < 2 * 3600) {
          score += 25;
          reasons.push(`Zero bids with under 2h remaining (${time.text})`);
        } else if (time.totalSeconds < 6 * 3600) {
          score += 20;
          reasons.push(`Unnoticed: 0 bids with ${time.text} left`);
        } else if (time.totalSeconds < 24 * 3600) {
          score += 12;
          reasons.push(`No bids yet (${time.text} left)`);
        }
      } else if (listing.bidsCount <= 2 && time.totalSeconds < 4 * 3600) {
        score += 15;
        reasons.push(`Only ${listing.bidsCount} bids near finish (${time.text})`);
      } else if (listing.bidsCount >= 15) {
        score -= 12;
      }
    } else {
      score = 0;
      reasons.push('Auction ended');
    }
  } else {
    // Buy It Now
    if (discount >= 45) {
      score += 20;
      reasons.push('Immediate steal Buy It Now price');
    } else if (discount >= 30) {
      score += 12;
      reasons.push('Attractive Buy It Now discount');
    }
  }

  // 3. Movement Caliber Prestige (up to +15 points)
  const prestigeCalibers = [
    'Valjoux 7733',
    'Valjoux 7734',
    'Valjoux 72',
    'Lemania 1873',
    'Venus 175',
    'Landeron 48',
    'Landeron 248',
    'GUB 69.1',
    'GUB Spezimatic',
    'GUB Spezichron',
    'ETA 2824',
    'ETA 2892',
    'Omega Cal. 565',
    'Omega Cal. 601',
    'Zenith 2542',
    'Longines 30L',
    'Certina 25-651',
  ];

  if (listing.caliber && prestigeCalibers.some((c) => listing.caliber?.toLowerCase().includes(c.toLowerCase()))) {
    score += 14;
    reasons.push(`Coveted caliber: ${listing.caliber}`);
  }

  // 4. Misspelled or Poorly Formatted Listing Title (+10 points)
  if (listing.misspelledOrObscure) {
    score += 10;
    reasons.push('Buried/misspelled listing title (lower competition)');
  }

  // 5. Origin Bonus (Switzerland & Germany direct local estate finds)
  if (listing.countryCode === 'CH') {
    score += 6;
    reasons.push('Direct Swiss provenance');
  } else if (listing.countryCode === 'DE' && listing.brand.toLowerCase().includes('glash')) {
    score += 6;
    reasons.push('German Saxon horology origin (Glashütte)');
  }

  // 6. Private seller estate find bonus
  if (listing.isPrivateSeller) {
    score += 4;
    reasons.push('Private seller estate listing (no dealer markup)');
  }

  // Clamp score 0 to 100
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    reasons,
    discountPercent: Math.max(0, discount),
  };
}

/**
 * Filter and sort watch listings
 */
export function filterAndSortWatches(
  watches: WatchListing[],
  filters: FilterOptions,
  sortBy: SortField = 'gem_score',
  nowMs: number = Date.now()
): WatchListing[] {
  return watches
    .filter((w) => {
      // Exclude ended auctions
      if (w.listingType === 'auction') {
        const time = formatTimeRemaining(w.endTime, nowMs);
        if (time.isEnded) return false;
      }

      // Search query across title, brand, caliber, summary
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          w.title.toLowerCase().includes(q) ||
          w.brand.toLowerCase().includes(q) ||
          (w.specs.caliber && w.specs.caliber.toLowerCase().includes(q)) ||
          w.summary.toLowerCase().includes(q) ||
          w.location.city.toLowerCase().includes(q) ||
          w.location.country.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Brand filter
      if (filters.brand && filters.brand !== 'ALL') {
        if (w.brand.toLowerCase() !== filters.brand.toLowerCase()) {
          return false;
        }
      }

      // Origin Country
      if (filters.originCountry && filters.originCountry !== 'ALL') {
        if (w.location.countryCode !== filters.originCountry) {
          return false;
        }
      }

      // Listing Type
      if (filters.listingType && filters.listingType !== 'all') {
        if (w.listingType !== filters.listingType) {
          return false;
        }
      }

      // Max Price
      if (filters.maxPriceUsd !== undefined && filters.maxPriceUsd > 0) {
        if (w.currentPriceUsd > filters.maxPriceUsd) {
          return false;
        }
      }

      // Min Gem Score
      if (filters.minGemScore !== undefined && filters.minGemScore > 0) {
        if (w.gemScore < filters.minGemScore) {
          return false;
        }
      }

      // Movement Type
      if (filters.movementType && filters.movementType !== 'ALL') {
        if (w.specs.movement !== filters.movementType) {
          return false;
        }
      }

      // Zero or Low bids filter
      if (filters.onlyZeroOrLowBids) {
        if (w.listingType === 'auction' && w.bidsCount > 3) {
          return false;
        }
      }

      // Urgent ending (< 4 hours)
      if (filters.onlyUrgentEnding) {
        if (w.listingType !== 'auction') return false;
        const time = formatTimeRemaining(w.endTime, nowMs);
        if (time.totalSeconds > 4 * 3600) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'gem_score':
          return b.gemScore - a.gemScore;
        case 'ending_soonest': {
          const timeA = new Date(a.endTime).getTime();
          const timeB = new Date(b.endTime).getTime();
          // Put auctions ending first, then buy it now
          if (a.listingType === 'auction' && b.listingType !== 'auction') return -1;
          if (b.listingType === 'auction' && a.listingType !== 'auction') return 1;
          return timeA - timeB;
        }
        case 'price_low':
          return a.currentPriceUsd - b.currentPriceUsd;
        case 'price_high':
          return b.currentPriceUsd - a.currentPriceUsd;
        case 'discount_high': {
          const discA = ((a.estimatedValueUsd - a.currentPriceUsd) / a.estimatedValueUsd);
          const discB = ((b.estimatedValueUsd - b.currentPriceUsd) / b.estimatedValueUsd);
          return discB - discA;
        }
        case 'bids_lowest':
          return a.bidsCount - b.bidsCount;
        default:
          return b.gemScore - a.gemScore;
      }
    });
}
