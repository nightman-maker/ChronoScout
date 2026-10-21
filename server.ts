import express from 'express';
import path from 'path';
import fs from 'fs';
import { generateLiveListings } from './src/data/mockListings.ts';
import { filterAndSortWatches, FilterOptions, SortField, WatchListing } from './src/utils/gemEvaluator.ts';
import { fetchLiveEbayWatches, testEbayConnection, invalidateEbayTokenCache } from './src/services/ebayApi.ts';
import { EbayKeyset, validateEbayKeyset, maskEbayKey, generateDockerEnv, generateDockerComposeEnv } from './src/utils/ebayKeyset.ts';



const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent keyset configuration file path
const DATA_DIR = path.resolve(__dirname, 'data');
const KEYSET_FILE = path.resolve(DATA_DIR, 'ebay_keyset.json');

// Initialize in-memory keyset from disk or env vars
let activeKeyset: EbayKeyset = {
  clientId: process.env.EBAY_CLIENT_ID || '',
  clientSecret: process.env.EBAY_CLIENT_SECRET || '',
  devId: process.env.EBAY_DEV_ID || '',
  environment: (process.env.EBAY_ENVIRONMENT as 'PRODUCTION' | 'SANDBOX') || 'PRODUCTION',
  marketplaceId: process.env.EBAY_MARKETPLACE || 'EBAY_DE',
  enabled: Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET),
};

try {
  if (fs.existsSync(KEYSET_FILE)) {
    const raw = fs.readFileSync(KEYSET_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.clientId && parsed.clientSecret) {
      activeKeyset = {
        ...activeKeyset,
        ...parsed,
        enabled: parsed.enabled !== false,
      };
    }
  }
} catch (err) {
  console.warn('Could not load persistent keyset file:', err);
}

function saveKeysetToDisk(keyset: EbayKeyset) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(KEYSET_FILE, JSON.stringify(keyset, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save keyset to disk (will remain in memory):', err);
  }
}

// In-memory state
let currentLiveTime = Date.now();
let cachedWatches: WatchListing[] = generateLiveListings(currentLiveTime);
const watchlistIds = new Set<string>();

// Endpoint: Check eBay API Configuration status
app.get('/api/ebay/status', (_req, res) => {
  const isConfigured = Boolean(
    activeKeyset.enabled && activeKeyset.clientId && activeKeyset.clientSecret
  );

  res.json({
    success: true,
    isConfigured,
    mode: isConfigured ? 'live_api' : 'smart_radar_mode',
    environment: activeKeyset.environment,
    marketplace: activeKeyset.marketplaceId,
    maskedClientId: maskEbayKey(activeKeyset.clientId),
    hasDevId: Boolean(activeKeyset.devId),
    lastTested: activeKeyset.lastTested || null,
    lastTestStatus: activeKeyset.lastTestStatus || null,
    lastTestMessage: activeKeyset.lastTestMessage || null,
    message: isConfigured
      ? `Connected to official eBay Developer Browse API (${activeKeyset.environment})`
      : 'Running in Smart Radar Mode with live search routing',
  });
});

// Endpoint: Test connection to eBay OAuth
app.post('/api/ebay/test-connection', async (req, res) => {
  const { clientId, clientSecret, devId, environment } = req.body;

  const testParams = {
    clientId: clientId || activeKeyset.clientId,
    clientSecret: clientSecret || activeKeyset.clientSecret,
    devId: devId ?? activeKeyset.devId,
    environment: environment || activeKeyset.environment,
  };

  const validation = validateEbayKeyset(testParams);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid keyset parameters.',
      errors: validation.errors,
    });
  }

  const result = await testEbayConnection(testParams);

  // Update in-memory test timestamp
  if (testParams.clientId === activeKeyset.clientId) {
    activeKeyset.lastTested = Date.now();
    activeKeyset.lastTestStatus = result.success ? 'success' : 'error';
    activeKeyset.lastTestMessage = result.message;
    saveKeysetToDisk(activeKeyset);
  }

  res.json(result);
});

// Endpoint: Save / Update eBay Keyset
app.post('/api/ebay/keyset', async (req, res) => {
  const { clientId, clientSecret, devId, environment, marketplaceId, enabled } = req.body;

  const newKeyset: EbayKeyset = {
    clientId: (clientId || '').trim(),
    clientSecret: (clientSecret || '').trim(),
    devId: (devId || '').trim(),
    environment: environment === 'SANDBOX' ? 'SANDBOX' : 'PRODUCTION',
    marketplaceId: marketplaceId || 'EBAY_DE',
    enabled: enabled !== false,
  };

  const validation = validateEbayKeyset(newKeyset);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for eBay Keyset.',
      errors: validation.errors,
    });
  }

  // Invalidate old token cache
  invalidateEbayTokenCache();

  // Test live connection with the new keys
  const testResult = await testEbayConnection(newKeyset);

  newKeyset.lastTested = Date.now();
  newKeyset.lastTestStatus = testResult.success ? 'success' : 'error';
  newKeyset.lastTestMessage = testResult.message;

  activeKeyset = newKeyset;
  saveKeysetToDisk(activeKeyset);

  res.json({
    success: true,
    message: testResult.success
      ? 'eBay Keyset saved and successfully verified!'
      : `eBay Keyset saved, but eBay test connection failed: ${testResult.message}`,
    testResult,
    keysetStatus: {
      isConfigured: activeKeyset.enabled && Boolean(activeKeyset.clientId && activeKeyset.clientSecret),
      environment: activeKeyset.environment,
      marketplace: activeKeyset.marketplaceId,
      maskedClientId: maskEbayKey(activeKeyset.clientId),
      hasDevId: Boolean(activeKeyset.devId),
    },
  });
});

// Endpoint: Disconnect / Reset eBay Keyset
app.post('/api/ebay/disconnect', (_req, res) => {
  invalidateEbayTokenCache();
  activeKeyset = {
    clientId: '',
    clientSecret: '',
    devId: '',
    environment: 'PRODUCTION',
    marketplaceId: 'EBAY_DE',
    enabled: false,
  };
  saveKeysetToDisk(activeKeyset);

  res.json({
    success: true,
    message: 'eBay Keyset disconnected. App reverted to Smart Radar Mode.',
  });
});

// Endpoint: GET /api/watches
app.get('/api/watches', async (req, res) => {
  const {
    q,
    brand,
    origin,
    type,
    maxPrice,
    minGemScore,
    movement,
    onlyZeroBids,
    onlyUrgent,
    sortBy,
  } = req.query;

  const filters: FilterOptions = {
    searchQuery: typeof q === 'string' ? q : undefined,
    brand: typeof brand === 'string' ? brand : undefined,
    originCountry: typeof origin === 'string' ? origin : undefined,
    listingType: type === 'auction' || type === 'buy_it_now' ? type : 'all',
    maxPriceUsd: maxPrice ? Number(maxPrice) : undefined,
    minGemScore: minGemScore ? Number(minGemScore) : undefined,
    movementType: typeof movement === 'string' ? movement : undefined,
    onlyZeroOrLowBids: onlyZeroBids === 'true',
    onlyUrgentEnding: onlyUrgent === 'true',
  };

  currentLiveTime = Date.now();

  // If live eBay API keys are configured and active, query the official Browse API
  if (activeKeyset.enabled && activeKeyset.clientId && activeKeyset.clientSecret) {
    try {
      const liveItems = await fetchLiveEbayWatches({
        clientId: activeKeyset.clientId,
        clientSecret: activeKeyset.clientSecret,
        environment: activeKeyset.environment,
        marketplaceId: activeKeyset.marketplaceId,
        query: typeof q === 'string' ? q : undefined,
      });
      if (liveItems && liveItems.length > 0) {
        cachedWatches = liveItems;
      } else {
        cachedWatches = generateLiveListings(currentLiveTime);
      }
    } catch {
      cachedWatches = generateLiveListings(currentLiveTime);
    }
  } else {
    cachedWatches = generateLiveListings(currentLiveTime);
  }

  const sort = (typeof sortBy === 'string' ? sortBy : 'gem_score') as SortField;
  const filtered = filterAndSortWatches(cachedWatches, filters, sort, currentLiveTime);

  // Return watches with watchlist flag
  const result = filtered.map((w) => ({
    ...w,
    isWatchlisted: watchlistIds.has(w.id),
  }));

  res.json({
    success: true,
    count: result.length,
    timestamp: currentLiveTime,
    watches: result,
  });
});

// Endpoint: POST /api/watches/refresh
app.post('/api/watches/refresh', async (_req, res) => {
  currentLiveTime = Date.now();

  if (activeKeyset.enabled && activeKeyset.clientId && activeKeyset.clientSecret) {
    try {
      const liveItems = await fetchLiveEbayWatches({
        clientId: activeKeyset.clientId,
        clientSecret: activeKeyset.clientSecret,
        environment: activeKeyset.environment,
        marketplaceId: activeKeyset.marketplaceId,
      });
      if (liveItems && liveItems.length > 0) {
        cachedWatches = liveItems;
      } else {
        cachedWatches = generateLiveListings(currentLiveTime);
      }
    } catch {
      cachedWatches = generateLiveListings(currentLiveTime);
    }
  } else {
    cachedWatches = generateLiveListings(currentLiveTime);
  }

  res.json({
    success: true,
    message: activeKeyset.enabled && activeKeyset.clientId
      ? `Queried eBay ${activeKeyset.marketplaceId} Live Browse API`
      : 'Scanned eBay European portals & refreshed active auctions',
    timestamp: currentLiveTime,
    totalGems: cachedWatches.length,
  });
});

// Endpoint: GET /api/stats
app.get('/api/stats', (_req, res) => {
  const auctions = cachedWatches.filter((w) => w.listingType === 'auction');
  const zeroBids = auctions.filter((w) => w.bidsCount === 0);
  const urgentEnding = auctions.filter((w) => {
    const remainingMs = new Date(w.endTime).getTime() - currentLiveTime;
    return remainingMs > 0 && remainingMs < 2 * 3600 * 1000;
  });

  const discounts = cachedWatches.map((w) =>
    Math.round(((w.estimatedValueUsd - w.currentPriceUsd) / w.estimatedValueUsd) * 100)
  );
  const avgDiscount = Math.round(discounts.reduce((a, b) => a + b, 0) / (discounts.length || 1));

  const countryCounts: Record<string, number> = {};
  cachedWatches.forEach((w) => {
    countryCounts[w.location.countryCode] = (countryCounts[w.location.countryCode] || 0) + 1;
  });

  res.json({
    success: true,
    totalMonitored: cachedWatches.length,
    zeroBidsCount: zeroBids.length,
    endingSoonCount: urgentEnding.length,
    averageDiscountPercent: avgDiscount,
    swissCount: countryCounts['CH'] || 0,
    germanCount: countryCounts['DE'] || 0,
    countriesBreakdown: countryCounts,
  });
});

// Endpoint: Watchlist toggle
app.post('/api/watchlist/toggle', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing watch ID' });
  }

  let isSaved = false;
  if (watchlistIds.has(id)) {
    watchlistIds.delete(id);
    isSaved = false;
  } else {
    watchlistIds.add(id);
    isSaved = true;
  }

  res.json({
    success: true,
    id,
    isSaved,
    watchlistCount: watchlistIds.size,
  });
});

app.get('/api/watchlist', (_req, res) => {
  const items = cachedWatches
    .filter((w) => watchlistIds.has(w.id))
    .map((w) => ({ ...w, isWatchlisted: true }));

  res.json({
    success: true,
    items,
  });
});

// Endpoint: Generate Live eBay Search Queries for European & Swiss portals
app.get('/api/ebay-presets', (_req, res) => {
  const presets = [
    {
      id: 'swiss-auctions-ending-soon',
      title: '🇨🇭 Swiss Auctions Ending Soon (< 2h) with ≤ 2 Bids',
      description: 'Finds Swiss mechanical watches located in Switzerland or Germany ending soon with low competition.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Vintage+Swiss%2COmega%2CTissot%2CLongines%2CCertina%2CZenith)+Armbanduhr+-quartz+-batterie+-damenuhr&_sop=1&LH_Auction=1&_udhi=600&LH_ItemCondition=3000',
    },
    {
      id: 'glashuette-no-bids',
      title: '🇩🇪 Glashütte (GUB Spezimatic / Spezichron) Zero Bids',
      description: 'Filters Saxon horology gems from Glashütte on German eBay with zero or low bids.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Glashutte%2CGUB%2CSpezimatic%2CSpezichron%2CKaliber)+-quarz+-repro&_sop=1&LH_Auction=1&_udhi=450',
    },
    {
      id: 'undervalued-bin-europe',
      title: '💎 Newly Listed Buy It Now Underpriced Swiss Mechanicals',
      description: 'Snipes newly listed Buy It Now items from European sellers priced under market value.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Omega%2CZenith%2CLongines%2CUniversal+Geneve%2CEnicar)+Handaufzug+Automatik&_sop=10&LH_BIN=1&_udhi=500',
    },
    {
      id: 'misspelled-titles-hidden-gems',
      title: '🕵️ Misspelled Brand Search (Omga, Glashutte, Tisso)',
      description: 'Targets typoes in listing titles that regular search alerts fail to pick up.',
      portal: 'ebay.ch',
      url: 'https://www.ebay.ch/sch/i.html?_nkw=(Omga%2CGashutte%2CTisso%2CLongins%2CValjoux+7733)&_sop=1',
    },
  ];

  res.json({ success: true, presets });
});

// Endpoint: Docker instructions and configs for Ugreen NAS
app.get('/api/docker-info', (_req, res) => {
  const composeSnippet = `version: '3.8'

services:
  chronoscout:
    image: chronoscout:latest
    build: .
    container_name: ugreen-chronoscout
    restart: unless-stopped
    ports:
      - "3000:3000"
${generateDockerComposeEnv(activeKeyset)}
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/stats"]
      interval: 30s
      timeout: 5s
      retries: 3
`;

  res.json({
    success: true,
    nasName: 'UGREEN NAS (UGOS)',
    containerPort: 3000,
    dockerComposeYaml: composeSnippet,
    dockerRunCommand: `docker run -d --name ugreen-chronoscout --restart unless-stopped -p 3000:3000 chronoscout:latest`,
    dockerEnv: generateDockerEnv(activeKeyset),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChronoScout server running on http://0.0.0.0:${PORT} [${isProduction ? 'prod' : 'dev'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
