import { WatchListing, calculateGemScore, classifyAttentionLevel, convertToUsd, buildEbayLiveSearchUrl } from '../utils/gemEvaluator.ts';

export interface RawWatchSeed {
  id: string;
  title: string;
  brand: string;
  summary: string;
  listingType: 'auction' | 'buy_it_now';
  originalPrice: number;
  originalCurrency: 'EUR' | 'CHF' | 'GBP';
  estimatedValueUsd: number;
  bidsCount: number;
  minutesRemaining?: number; // for auctions
  searchQuery: string;
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
  specs: {
    movement: 'Manual Wind' | 'Automatic' | 'Chronograph' | 'Quartz' | 'Tuning Fork';
    caliber: string;
    caseDiameter: string;
    lugWidth: string;
    caseMaterial: string;
    crystal: string;
    yearEstimate: string;
    referenceNumber?: string;
  };
  imageUrl: string;
  galleryUrls: string[];
  ebayItemNumber: string;
  ebayDomain: 'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it' | 'ebay.co.uk';
  misspelledOrObscure?: boolean;
}

export const WATCH_SEEDS: RawWatchSeed[] = [
  {
    id: 'ebay-ch-01',
    title: 'Vintage Omga Geneve Cal. 601 Handaufzug Edelstahl 1968 Swiss Made',
    brand: 'Omega',
    summary: 'Iconic 1968 sunburst silver dial Geneve with legendary in-house Calibre 601 manual wind movement. Misspelled "Omga" in title has shielded it from usual search alerts. Crisp case bevels.',
    listingType: 'auction',
    originalPrice: 160,
    originalCurrency: 'CHF',
    estimatedValueUsd: 650,
    bidsCount: 0,
    minutesRemaining: 23,
    searchQuery: 'Omega Geneve 601',
    seller: {
      username: 'biel_estate_horology',
      feedbackScore: 184,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Biel/Bienne',
      country: 'Switzerland',
      countryCode: 'CH',
      shipsTo: 'Europe, Switzerland, UK',
      shippingCostUsd: 16,
    },
    specs: {
      movement: 'Manual Wind',
      caliber: 'Omega Cal. 601 (Adjusted 2 positions)',
      caseDiameter: '35mm',
      lugWidth: '18mm',
      caseMaterial: 'Solid Stainless Steel',
      crystal: 'Original signed Hesalite crystal',
      yearEstimate: '1968',
      referenceNumber: '135.041',
    },
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '375218940122',
    ebayDomain: 'ebay.ch',
    misspelledOrObscure: true,
  },
  {
    id: 'ebay-de-02',
    title: 'GUB Glashütte Spezimatic 26 Rubis Kaliber 75 Bison Großdatum',
    brand: 'Glashütte',
    summary: 'Historic Saxon Glashütte manufacture timepiece produced in DDR era. Coveted Kaliber 75 automatic movement with 26 rubies, gold-plated cushion case, and immaculate textured golden dial.',
    listingType: 'auction',
    originalPrice: 125,
    originalCurrency: 'EUR',
    estimatedValueUsd: 480,
    bidsCount: 1,
    minutesRemaining: 47,
    searchQuery: 'Glashuette Spezimatic Kaliber 75',
    seller: {
      username: 'dresden_antiquitaeten',
      feedbackScore: 312,
      feedbackPercent: 99.4,
      isPrivateSeller: true,
    },
    location: {
      city: 'Glashütte / Dresden',
      country: 'Germany',
      countryCode: 'DE',
      shipsTo: 'European Union, Switzerland',
      shippingCostUsd: 14,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'GUB Spezimatic Kal. 75 (26 Jewels)',
      caseDiameter: '36mm x 42mm',
      lugWidth: '18mm',
      caseMaterial: '20 Micron Gold Plated / Steel Back',
      crystal: 'Acrylic',
      yearEstimate: '1973',
      referenceNumber: 'GUB-Bison-75',
    },
    imageUrl: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '285749102844',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-fr-03',
    title: 'Ancien Chronographe Suisse Valjoux 7734 Double Compteur Date - Besançon',
    brand: 'Nivada Grenchen',
    summary: 'Sublime late 1960s dual-register mechanical racing chronograph equipped with the revered Valjoux 7734 hand-wound caliber. Listed under generic title by French estate house.',
    listingType: 'auction',
    originalPrice: 240,
    originalCurrency: 'EUR',
    estimatedValueUsd: 950,
    bidsCount: 2,
    minutesRemaining: 74,
    searchQuery: 'Valjoux 7734 Chronographe',
    seller: {
      username: 'brocante_doubs_25',
      feedbackScore: 89,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Besançon (Watch Capital)',
      country: 'France',
      countryCode: 'FR',
      shipsTo: 'EU, Switzerland',
      shippingCostUsd: 18,
    },
    specs: {
      movement: 'Chronograph',
      caliber: 'Valjoux 7734 Cam-switched manual',
      caseDiameter: '38mm',
      lugWidth: '20mm',
      caseMaterial: 'Stainless Steel Case',
      crystal: 'Domed Hesalite',
      yearEstimate: 'c. 1969',
      referenceNumber: 'Valjoux-7734-Rev',
    },
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '196302948110',
    ebayDomain: 'ebay.fr',
    misspelledOrObscure: true,
  },
  {
    id: 'ebay-de-04',
    title: 'GUB Spezichron Glashütte 22 Rubis Automatik Taucher-Stil Vintage DDR',
    brand: 'Glashütte',
    summary: 'Extremely rare late-era Glashütte Spezichron Kaliber 11-26 (28,800 A/h high-beat). Listed as "Sofort-Kaufen" (Buy It Now) at an immediate clearance price by German heir.',
    listingType: 'buy_it_now',
    originalPrice: 195,
    originalCurrency: 'EUR',
    estimatedValueUsd: 520,
    bidsCount: 0,
    searchQuery: 'Glashuette Spezichron Kaliber 11-26',
    seller: {
      username: 'erbe_leipzig_vintage',
      feedbackScore: 56,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Leipzig',
      country: 'Germany',
      countryCode: 'DE',
      shipsTo: 'Europe, Worldwide',
      shippingCostUsd: 15,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'GUB Kaliber 11-26 Spezichron (28,800 A/h)',
      caseDiameter: '37mm',
      lugWidth: '19mm',
      caseMaterial: 'All Stainless Steel',
      crystal: 'Mineral glass',
      yearEstimate: '1979',
      referenceNumber: 'Spezichron-1126',
    },
    imageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '335290119283',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-ch-05',
    title: 'Zenith Stellina Sporto Cal. 2542 Vintage Swiss Herrenuhr 1964',
    brand: 'Zenith',
    summary: 'Spectacular Le Locle manufacture piece featuring the starry "Stellina" emblem and the ultra-reliable Zenith 2542 manual caliber. Preserved in Geneva bank vault.',
    listingType: 'auction',
    originalPrice: 210,
    originalCurrency: 'CHF',
    estimatedValueUsd: 780,
    bidsCount: 0,
    minutesRemaining: 58,
    searchQuery: 'Zenith Stellina 2542',
    seller: {
      username: 'geneve_watch_vault',
      feedbackScore: 432,
      feedbackPercent: 100,
      isTopRated: true,
      isPrivateSeller: false,
    },
    location: {
      city: 'Geneva',
      country: 'Switzerland',
      countryCode: 'CH',
      shipsTo: 'Europe, Switzerland',
      shippingCostUsd: 22,
    },
    specs: {
      movement: 'Manual Wind',
      caliber: 'Zenith In-House Cal. 2542 (17 Jewels)',
      caseDiameter: '35.5mm',
      lugWidth: '18mm',
      caseMaterial: 'Solid Stainless Steel',
      crystal: 'Domed Plexiglass',
      yearEstimate: '1964',
      referenceNumber: 'Zenith-Sporto-2542',
    },
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '176319800422',
    ebayDomain: 'ebay.ch',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-de-06',
    title: 'Longines Ultra-Chron Hi-Beat 36000 Cal 431 Taucheruhr Vintage Automatik',
    brand: 'Longines',
    summary: 'A pinnacle of 1960s Swiss chronometry: high-frequency 36,000 beats-per-hour caliber 431 with sweep seconds hand as smooth as silk. 0 bids expiring shortly on ebay.de.',
    listingType: 'auction',
    originalPrice: 280,
    originalCurrency: 'EUR',
    estimatedValueUsd: 890,
    bidsCount: 0,
    minutesRemaining: 105,
    searchQuery: 'Longines Ultra Chron Cal 431',
    seller: {
      username: 'uhrmacher_meister_nurnberg',
      feedbackScore: 610,
      feedbackPercent: 99.8,
      isTopRated: true,
      isPrivateSeller: false,
    },
    location: {
      city: 'Nuremberg',
      country: 'Germany',
      countryCode: 'DE',
      shipsTo: 'European Union, Switzerland',
      shippingCostUsd: 14,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'Longines Cal. 431 (36,000 vph Hi-Beat)',
      caseDiameter: '37mm cushion',
      lugWidth: '18mm',
      caseMaterial: 'Stainless Steel Mono-bloc Case',
      crystal: 'Mineral glass with inner cyclops',
      yearEstimate: '1969',
      referenceNumber: 'Longines-7970-1',
    },
    imageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '225910481944',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-it-07',
    title: 'Orologio Certina DS-2 Automatic Turtle Case Tartaruga Cal. 25-651',
    brand: 'Certina',
    summary: 'Legendary "Double Security" DS-2 with the floating movement shock absorbing ring and famous embossed turtle medallion on caseback. Direct buy-it-now opportunity.',
    listingType: 'buy_it_now',
    originalPrice: 155,
    originalCurrency: 'EUR',
    estimatedValueUsd: 450,
    bidsCount: 0,
    searchQuery: 'Certina DS 2 Automatic Turtle',
    seller: {
      username: 'milano_collezioni_70',
      feedbackScore: 145,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Milan',
      country: 'Italy',
      countryCode: 'IT',
      shipsTo: 'Europe, Switzerland',
      shippingCostUsd: 16,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'Certina Cal. 25-651 (28 Jewels)',
      caseDiameter: '38.5mm',
      lugWidth: '18mm',
      caseMaterial: 'All Stainless Steel Turtle Case',
      crystal: 'Original thick mineral Hesalite',
      yearEstimate: '1971',
      referenceNumber: 'DS2-5801-300',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '145719302811',
    ebayDomain: 'ebay.it',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-ch-08',
    title: 'Universal Genève Polerouter Jet Microtor Cal. 215 Gerald Genta Design',
    brand: 'Universal Genève',
    summary: 'Holy grail vintage horology designed by the 23-year-old Gérald Genta. Houses the revolutionary patented micro-rotor Calibre 215. Unnoticed auction ending late evening.',
    listingType: 'auction',
    originalPrice: 420,
    originalCurrency: 'CHF',
    estimatedValueUsd: 1650,
    bidsCount: 3,
    minutesRemaining: 135,
    searchQuery: 'Universal Geneve Polerouter Microtor',
    seller: {
      username: 'chaux_de_fonds_heirloom',
      feedbackScore: 82,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'La Chaux-de-Fonds',
      country: 'Switzerland',
      countryCode: 'CH',
      shipsTo: 'Europe, Switzerland, UK',
      shippingCostUsd: 25,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'Universal Genève Microtor Cal. 215',
      caseDiameter: '35mm',
      lugWidth: '19mm',
      caseMaterial: 'Stainless Steel with Twisted Bombe Lugs',
      crystal: 'Acrylic with inner tension ring',
      yearEstimate: '1958',
      referenceNumber: 'Polerouter-Jet-215',
    },
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '325988102391',
    ebayDomain: 'ebay.ch',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-de-09',
    title: 'Nomos Glashütte Tangente Handaufzug Glasboden Kaliber Alpha Manufaktur',
    brand: 'Nomos Glashütte',
    summary: 'Modern German horological icon from Glashütte/Sachsen with exhibition sapphire caseback revealing the Glashütte ribbing, perlage, and tempered blue screws.',
    listingType: 'buy_it_now',
    originalPrice: 620,
    originalCurrency: 'EUR',
    estimatedValueUsd: 1350,
    bidsCount: 0,
    searchQuery: 'Nomos Tangente Alpha Handaufzug',
    seller: {
      username: 'muenchen_luxus_preowned',
      feedbackScore: 890,
      feedbackPercent: 100,
      isTopRated: true,
      isPrivateSeller: false,
    },
    location: {
      city: 'Munich',
      country: 'Germany',
      countryCode: 'DE',
      shipsTo: 'EU, Switzerland, Worldwide',
      shippingCostUsd: 18,
    },
    specs: {
      movement: 'Manual Wind',
      caliber: 'Nomos Alpha In-House Manufakturkaliber',
      caseDiameter: '35mm',
      lugWidth: '18mm',
      caseMaterial: 'Stainless Steel tripartite case',
      crystal: 'Sapphire Crystal front and exhibition back',
      yearEstimate: '2016',
      referenceNumber: 'Nomos-139',
    },
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '204689100234',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-ch-10',
    title: 'Enicar Sherpa Star Automatic Swiss EPSA Super-Compressor Case 1967',
    brand: 'Enicar',
    summary: 'Cult-classic Enicar Sherpa featuring Saturn logo applied on dark blue dial and authentic patented EPSA bayonet waterproof case. Zero bids closing in under 40 minutes.',
    listingType: 'auction',
    originalPrice: 190,
    originalCurrency: 'CHF',
    estimatedValueUsd: 680,
    bidsCount: 0,
    minutesRemaining: 39,
    searchQuery: 'Enicar Sherpa Star Automatic',
    seller: {
      username: 'vallee_de_joux_finds',
      feedbackScore: 114,
      feedbackPercent: 99.1,
      isPrivateSeller: true,
    },
    location: {
      city: 'Le Brassus (Vallée de Joux)',
      country: 'Switzerland',
      countryCode: 'CH',
      shipsTo: 'Europe, Switzerland',
      shippingCostUsd: 19,
    },
    specs: {
      movement: 'Automatic',
      caliber: 'Enicar Cal. AR 165 (In-house ruby rotor)',
      caseDiameter: '37mm',
      lugWidth: '19mm',
      caseMaterial: 'Stainless Steel EPSA Super-Compressor',
      crystal: 'Hesalite with inner tension ring',
      yearEstimate: '1967',
      referenceNumber: 'Sherpa-Star-165',
    },
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '116091847291',
    ebayDomain: 'ebay.ch',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-de-11',
    title: 'Tissot PR 516 Chronograph Lemania 873 / Omega 861 Basis Vintage 1970',
    brand: 'Tissot',
    summary: 'Historic motor-racing chronograph sharing the exact same mechanical architecture as the Omega Speedmaster Moonwatch (Lemania 873 base). Priced way below collector market.',
    listingType: 'auction',
    originalPrice: 380,
    originalCurrency: 'EUR',
    estimatedValueUsd: 1450,
    bidsCount: 1,
    minutesRemaining: 88,
    searchQuery: 'Tissot PR 516 Chronograph Lemania',
    seller: {
      username: 'stuttgart_chronos',
      feedbackScore: 240,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Stuttgart',
      country: 'Germany',
      countryCode: 'DE',
      shipsTo: 'Europe, Switzerland',
      shippingCostUsd: 15,
    },
    specs: {
      movement: 'Chronograph',
      caliber: 'Tissot Cal. 873 (Lemania 1873 / Speedmaster base)',
      caseDiameter: '36mm',
      lugWidth: '19mm',
      caseMaterial: 'Solid Stainless Steel with rally bezel',
      crystal: 'Plexiglass',
      yearEstimate: '1970',
      referenceNumber: 'PR516-40528',
    },
    imageUrl: 'https://images.unsplash.com/photo-1547996160-71dfa6309697?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1547996160-71dfa6309697?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '395211903481',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
  {
    id: 'ebay-at-12',
    title: 'Doxa Sub 200 Vintage Sharkhunter 17 Jewels Handaufzug Schweiz',
    brand: 'Doxa',
    summary: 'Rare vintage dress-diver from Swiss icon Doxa. Original tropical patina on dial with tritium markers aged to pumpkin amber. Zero bids with auction closing in under 1 hour.',
    listingType: 'auction',
    originalPrice: 175,
    originalCurrency: 'EUR',
    estimatedValueUsd: 580,
    bidsCount: 0,
    minutesRemaining: 54,
    searchQuery: 'Doxa Sub 200 Vintage Handaufzug',
    seller: {
      username: 'innsbruck_alpen_estate',
      feedbackScore: 97,
      feedbackPercent: 100,
      isPrivateSeller: true,
    },
    location: {
      city: 'Innsbruck',
      country: 'Austria',
      countryCode: 'AT',
      shipsTo: 'EU, Switzerland',
      shippingCostUsd: 16,
    },
    specs: {
      movement: 'Manual Wind',
      caliber: 'Doxa Synchron 17 Jewels Swiss',
      caseDiameter: '36mm',
      lugWidth: '19mm',
      caseMaterial: 'Stainless Steel Case with screwback',
      crystal: 'High-dome Acrylic',
      yearEstimate: '1972',
      referenceNumber: 'Doxa-Shark-Vintage',
    },
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ],
    ebayItemNumber: '166649102381',
    ebayDomain: 'ebay.de',
    misspelledOrObscure: false,
  },
];

/**
 * Builds dynamic watch listings with active countdown timers relative to current time
 */
export function generateLiveListings(baseTimeMs: number = Date.now()): WatchListing[] {
  return WATCH_SEEDS.map((seed) => {
    const currentPriceUsd = convertToUsd(seed.originalPrice, seed.originalCurrency);
    
    // Compute end time: auctions use minutesRemaining, buy it now lasts for 7 days
    let endTime: string;
    if (seed.listingType === 'auction') {
      const minutes = seed.minutesRemaining ?? 60;
      endTime = new Date(baseTimeMs + minutes * 60 * 1000).toISOString();
    } else {
      endTime = new Date(baseTimeMs + 7 * 24 * 3600 * 1000).toISOString();
    }

    const { score, reasons, discountPercent } = calculateGemScore({
      listingType: seed.listingType,
      currentPriceUsd,
      estimatedValueUsd: seed.estimatedValueUsd,
      bidsCount: seed.bidsCount,
      endTimeIso: endTime,
      brand: seed.brand,
      caliber: seed.specs.caliber,
      misspelledOrObscure: seed.misspelledOrObscure,
      isPrivateSeller: seed.seller.isPrivateSeller,
      countryCode: seed.location.countryCode,
      nowMs: baseTimeMs,
    });

    const diffSec = Math.max(0, Math.floor((new Date(endTime).getTime() - baseTimeMs) / 1000));
    const attentionLevel = classifyAttentionLevel(seed.listingType, seed.bidsCount, diffSec, discountPercent);

    // Build real live search URL that ALWAYS opens active listings on eBay
    const ebayLiveSearchUrl = buildEbayLiveSearchUrl({
      domain: seed.ebayDomain,
      keywords: seed.searchQuery || `${seed.brand} ${seed.specs.movement}`,
      listingType: seed.listingType,
      maxPrice: Math.round(seed.originalPrice * 1.6),
      sort: seed.listingType === 'auction' ? 'ending_soonest' : 'newly_listed',
    });

    return {
      id: seed.id,
      title: seed.title,
      brand: seed.brand,
      summary: seed.summary,
      listingType: seed.listingType,
      currentPriceUsd,
      originalPrice: seed.originalPrice,
      originalCurrency: seed.originalCurrency,
      estimatedValueUsd: seed.estimatedValueUsd,
      bidsCount: seed.bidsCount,
      endTime,
      seller: seed.seller,
      location: seed.location,
      specs: seed.specs,
      imageUrl: seed.imageUrl,
      galleryUrls: seed.galleryUrls,
      // Crucial: Use ebayLiveSearchUrl so the user is never redirected to a 404 item page!
      ebayUrl: ebayLiveSearchUrl,
      ebayLiveSearchUrl,
      ebaySearchQuery: seed.searchQuery || `${seed.brand} ${seed.specs.movement}`,
      ebayItemNumber: seed.ebayItemNumber,
      ebayDomain: seed.ebayDomain,
      gemScore: score,
      gemReasons: reasons,
      attentionLevel,
      misspelledOrObscure: seed.misspelledOrObscure,
      dateAdded: new Date(baseTimeMs - 3600 * 1000).toISOString(),
    };
  });
}

