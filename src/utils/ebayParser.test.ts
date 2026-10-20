import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectBrandFromTitle,
  detectMovementFromTitle,
  transformEbayItemSummary,
  estimateMarketBaseline,
} from './ebayParser.ts';

test('detectBrandFromTitle identifies horology brands from realistic eBay titles', () => {
  assert.equal(detectBrandFromTitle('Vintage Omega Seamaster Automatic Cal 565'), 'Omega');
  assert.equal(detectBrandFromTitle('GUB Glashütte Spezimatic Kaliber 75 DDR'), 'Glashütte');
  assert.equal(detectBrandFromTitle('Alte Armbanduhr Glashuette Bison defekt?'), 'Glashütte');
  assert.equal(detectBrandFromTitle('Rare Universal Geneve Polerouter Microtor'), 'Universal Genève');
  assert.equal(detectBrandFromTitle('Zenith Stellina Handaufzug Stahl'), 'Zenith');
  assert.equal(detectBrandFromTitle('Vintage Swiss Chronograph Valjoux 7733'), 'Swiss Vintage');
});

test('detectMovementFromTitle identifies chronograph, automatic, manual', () => {
  assert.equal(detectMovementFromTitle('Chronographe Suisse Landeron 48'), 'Chronograph');
  assert.equal(detectMovementFromTitle('Vintage Omega Automatik Herrenuhr'), 'Automatic');
  assert.equal(detectMovementFromTitle('Certina Handaufzug 17 Steine'), 'Manual Wind');
});

test('estimateMarketBaseline provides realistic collector baseline', () => {
  assert.equal(estimateMarketBaseline('Omega', 'Chronograph', 500), 1800);
  assert.equal(estimateMarketBaseline('Glashütte', 'Automatic', 200), 480);
});

test('transformEbayItemSummary produces clean scored WatchListing', () => {
  const now = 1700000000000;
  const rawItem = {
    itemId: 'v1|285749102844|0',
    title: 'Vintage Omega Geneve Cal 601 Stahl Handaufzug 1968',
    currentBidPrice: {
      value: '180.00',
      currency: 'EUR',
    },
    itemLocation: {
      city: 'Munich',
      country: 'DE',
    },
    image: {
      imageUrl: 'https://i.ebayimg.com/images/g/sample/s-l1600.jpg',
    },
    buyingOptions: ['AUCTION'],
    bidCount: 0,
    itemEndDate: new Date(now + 3600 * 1000).toISOString(),
    seller: {
      username: 'bavaria_vintage',
      feedbackPercentage: '100.0',
      feedbackScore: 250,
    },
    itemWebUrl: 'https://www.ebay.de/itm/285749102844',
  };

  const watch = transformEbayItemSummary(rawItem, 'ebay.de', now);

  assert.equal(watch.id, 'ebay-285749102844');
  assert.equal(watch.brand, 'Omega');
  assert.equal(watch.listingType, 'auction');
  assert.equal(watch.bidsCount, 0);
  assert.equal(watch.ebayItemNumber, '285749102844');
  assert.ok(watch.gemScore >= 70);
  assert.ok(watch.ebayUrl.includes('ebay.de'));
});
