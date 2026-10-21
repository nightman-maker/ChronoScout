import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEbayKeyset,
  maskEbayKey,
  getEbayEndpoints,
  generateDockerEnv,
  generateDockerComposeEnv,
  SUPPORTED_MARKETPLACES,
} from './ebayKeyset.ts';

test('validateEbayKeyset reports errors on empty or short inputs', () => {
  const emptyRes = validateEbayKeyset({});
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.clientId);
  assert.ok(emptyRes.errors.clientSecret);

  const shortRes = validateEbayKeyset({
    clientId: 'abc',
    clientSecret: '123',
    environment: 'PRODUCTION',
    marketplaceId: 'EBAY_DE',
  });
  assert.equal(shortRes.isValid, false);
  assert.ok(shortRes.errors.clientId);
  assert.ok(shortRes.errors.clientSecret);
});

test('validateEbayKeyset succeeds with valid production inputs', () => {
  const validRes = validateEbayKeyset({
    clientId: 'MyName-ChronoSc-PRD-12345678-abcdef12',
    clientSecret: 'PRD-12345678abcdef12-1234-1234-1234-abcd',
    environment: 'PRODUCTION',
    marketplaceId: 'EBAY_DE',
  });
  assert.equal(validRes.isValid, true);
  assert.equal(Object.keys(validRes.errors).length, 0);
});

test('validateEbayKeyset rejects invalid environment or marketplace', () => {
  const invalidRes = validateEbayKeyset({
    clientId: 'MyName-ChronoSc-PRD-12345678-abcdef12',
    clientSecret: 'PRD-12345678abcdef12-1234-1234-1234-abcd',
    environment: 'INVALID_ENV' as any,
    marketplaceId: 'EBAY_MARS' as any,
  });
  assert.equal(invalidRes.isValid, false);
  assert.ok(invalidRes.errors.environment);
  assert.ok(invalidRes.errors.marketplaceId);
});

test('maskEbayKey masks characters securely', () => {
  assert.equal(maskEbayKey(''), 'Not configured');
  assert.equal(maskEbayKey(undefined), 'Not configured');
  assert.equal(maskEbayKey('1234567'), '••••••••');
  assert.equal(maskEbayKey('PRD-12345678-abcdef12'), 'PRD-••••••••ef12');
});

test('getEbayEndpoints switches between Sandbox and Production', () => {
  const prod = getEbayEndpoints('PRODUCTION');
  assert.equal(prod.oauthTokenUrl, 'https://api.ebay.com/identity/v1/oauth2/token');
  assert.equal(prod.browseApiUrl, 'https://api.ebay.com/buy/browse/v1/item_summary/search');

  const sandbox = getEbayEndpoints('SANDBOX');
  assert.equal(sandbox.oauthTokenUrl, 'https://api.sandbox.ebay.com/identity/v1/oauth2/token');
  assert.equal(sandbox.browseApiUrl, 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search');
});

test('generateDockerEnv formats .env correctly', () => {
  const env = generateDockerEnv({
    clientId: 'test-app-id',
    clientSecret: 'test-cert-id',
    environment: 'PRODUCTION',
    marketplaceId: 'EBAY_CH',
  });
  assert.ok(env.includes('EBAY_CLIENT_ID="test-app-id"'));
  assert.ok(env.includes('EBAY_CLIENT_SECRET="test-cert-id"'));
  assert.ok(env.includes('EBAY_MARKETPLACE="EBAY_CH"'));
});

test('generateDockerComposeEnv formats compose environment block', () => {
  const yaml = generateDockerComposeEnv({
    clientId: 'test-app-id',
    clientSecret: 'test-cert-id',
    environment: 'SANDBOX',
    marketplaceId: 'EBAY_DE',
    devId: 'dev-1234',
  });
  assert.ok(yaml.includes('- EBAY_CLIENT_ID=test-app-id'));
  assert.ok(yaml.includes('- EBAY_ENVIRONMENT=SANDBOX'));
  assert.ok(yaml.includes('- EBAY_DEV_ID=dev-1234'));
});

test('SUPPORTED_MARKETPLACES contains key European hubs', () => {
  const ids = SUPPORTED_MARKETPLACES.map((m) => m.id);
  assert.ok(ids.includes('EBAY_DE'));
  assert.ok(ids.includes('EBAY_CH'));
  assert.ok(ids.includes('EBAY_FR'));
  assert.ok(ids.includes('EBAY_IT'));
});
