import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeRemaining,
  classifyAttentionLevel,
  calculateGemScore,
  filterAndSortWatches,
  convertToUsd,
  buildEbayLiveSearchUrl,
} from './gemEvaluator.ts';
import type { WatchListing } from './gemEvaluator.ts';

test('formatTimeRemaining handles upcoming time and urgent threshold', () => {
  const now = 1700000000000;
  // 1 hour and 30 minutes in the future
  const futureIso = new Date(now + 90 * 60 * 1000).toISOString();
  const res = formatTimeRemaining(futureIso, now);

  assert.equal(res.isEnded, false);
  assert.equal(res.hours, 1);
  assert.equal(res.minutes, 30);
  assert.equal(res.isUrgent, true); // < 3 hours is urgent
  assert.equal(res.text, '1h 30m');
});

test('formatTimeRemaining handles ended auction', () => {
  const now = 1700000000000;
  const pastIso = new Date(now - 1000).toISOString();
  const res = formatTimeRemaining(pastIso, now);

  assert.equal(res.isEnded, true);
  assert.equal(res.totalSeconds, 0);
  assert.equal(res.text, 'Ended');
});

test('classifyAttentionLevel detects zero bids urgent and unnoticed buy-it-now', () => {
  // Auction ending in 1 hour with 0 bids
  const level1 = classifyAttentionLevel('auction', 0, 3600, 50);
  assert.equal(level1, 'zero_bids_urgent');

  // Auction with 2 bids ending in 2 hours
  const level2 = classifyAttentionLevel('auction', 2, 7200, 40);
  assert.equal(level2, 'low_attention');

  // Auction with 15 bids
  const level3 = classifyAttentionLevel('auction', 15, 3600, 10);
  assert.equal(level3, 'high_attention');

  // Buy it now with 45% discount
  const levelBin = classifyAttentionLevel('buy_it_now', 0, 0, 45);
  assert.equal(levelBin, 'unnoticed_bin');
});

test('calculateGemScore awards bonuses for overlooked status, high discount, and prestige caliber', () => {
  const now = 1700000000000;
  // Ending in 1 hour with 0 bids, Valjoux 7734 caliber, 55% discount
  const gem = calculateGemScore({
    listingType: 'auction',
    currentPriceUsd: 220,
    estimatedValueUsd: 550,
    bidsCount: 0,
    endTimeIso: new Date(now + 3600 * 1000).toISOString(),
    brand: 'Nivada Grenchen',
    caliber: 'Valjoux 7734',
    misspelledOrObscure: true,
    isPrivateSeller: true,
    countryCode: 'CH',
    nowMs: now,
  });

  assert.ok(gem.score >= 85, `Gem score was ${gem.score}, expected >= 85`);
  assert.ok(gem.reasons.some((r) => r.includes('Zero bids')));
  assert.ok(gem.reasons.some((r) => r.includes('Valjoux 7734')));
  assert.ok(gem.reasons.some((r) => r.includes('Swiss provenance')));
});

test('convertToUsd accurately computes foreign currency conversions', () => {
  assert.equal(convertToUsd(100, 'EUR'), 108);
  assert.equal(convertToUsd(100, 'CHF'), 113);
  assert.equal(convertToUsd(100, 'USD'), 100);
});

test('filterAndSortWatches correctly filters by search, country, and sorts by gem score', () => {
  const mockWatches: WatchListing[] = [
    {
      id: 'w1',
      title: 'Vintage Omega Geneve Cal 601',
      brand: 'Omega',
      summary: '1968 classic Swiss manual dress watch',
      listingType: 'auction',
      currentPriceUsd: 310,
      originalPrice: 280,
      originalCurrency: 'EUR',
      estimatedValueUsd: 650,
      bidsCount: 1,
      endTime: new Date(Date.now() + 7200 * 1000).toISOString(),
      seller: { username: 'swiss_collector', feedbackScore: 420, feedbackPercent: 100 },
      location: { city: 'Geneva', country: 'Switzerland', countryCode: 'CH', shipsTo: 'Europe', shippingCostUsd: 18 },
      specs: { movement: 'Manual Wind', caliber: 'Omega Cal. 601', caseDiameter: '35mm', caseMaterial: 'Stainless Steel', yearEstimate: '1968' },
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d',
      galleryUrls: [],
      ebayUrl: 'https://www.ebay.ch/itm/123',
      ebayItemNumber: '123',
      ebayDomain: 'ebay.ch',
      gemScore: 88,
      gemReasons: ['Swiss estate'],
      attentionLevel: 'low_attention',
      dateAdded: new Date().toISOString(),
    },
    {
      id: 'w2',
      title: 'GUB Glashutte Spezimatic 26 Rubis',
      brand: 'Glashütte',
      summary: 'Vintage GDR Saxon watchmaker icon',
      listingType: 'buy_it_now',
      currentPriceUsd: 180,
      originalPrice: 165,
      originalCurrency: 'EUR',
      estimatedValueUsd: 380,
      bidsCount: 0,
      endTime: new Date(Date.now() + 86400 * 1000).toISOString(),
      seller: { username: 'dresden_vintage', feedbackScore: 190, feedbackPercent: 99.2 },
      location: { city: 'Dresden', country: 'Germany', countryCode: 'DE', shipsTo: 'Europe', shippingCostUsd: 12 },
      specs: { movement: 'Automatic', caliber: 'GUB Spezimatic', caseDiameter: '36mm', caseMaterial: 'Gold Plated', yearEstimate: '1974' },
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
      galleryUrls: [],
      ebayUrl: 'https://www.ebay.de/itm/456',
      ebayItemNumber: '456',
      ebayDomain: 'ebay.de',
      gemScore: 92,
      gemReasons: ['GUB icon'],
      attentionLevel: 'unnoticed_bin',
      dateAdded: new Date().toISOString(),
    },
  ];

  // Test country filtering
  const swissOnly = filterAndSortWatches(mockWatches, { originCountry: 'CH' });
  assert.equal(swissOnly.length, 1);
  assert.equal(swissOnly[0].brand, 'Omega');

  // Test search query
  const queryResult = filterAndSortWatches(mockWatches, { searchQuery: 'Spezimatic' });
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].brand, 'Glashütte');

  // Test sorting by gem score descending
  const sorted = filterAndSortWatches(mockWatches, {}, 'gem_score');
  assert.equal(sorted[0].id, 'w2'); // 92 > 88
});

test('buildEbayLiveSearchUrl generates valid search URLs without 404 item errors', () => {
  const swissAuctionUrl = buildEbayLiveSearchUrl({
    domain: 'ebay.ch',
    keywords: 'Omega Geneve 601',
    listingType: 'auction',
    sort: 'ending_soonest',
    maxPrice: 600,
  });

  assert.ok(swissAuctionUrl.startsWith('https://www.ebay.ch/sch/i.html?'));
  assert.ok(swissAuctionUrl.includes('_nkw=Omega%20Geneve%20601'));
  assert.ok(swissAuctionUrl.includes('LH_Auction=1'));
  assert.ok(swissAuctionUrl.includes('_sop=1'));
  assert.ok(swissAuctionUrl.includes('_udhi=600'));

  const binGermanUrl = buildEbayLiveSearchUrl({
    domain: 'ebay.de',
    keywords: 'Glashuette Spezimatic',
    listingType: 'buy_it_now',
    sort: 'newly_listed',
  });

  assert.ok(binGermanUrl.startsWith('https://www.ebay.de/sch/i.html?'));
  assert.ok(binGermanUrl.includes('LH_BIN=1'));
  assert.ok(binGermanUrl.includes('_sop=10'));
});

