import { jest } from '@jest/globals';

describe('env module', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('provides APP_PUBLIC defaults', () => {
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_URL;
    const env = require('../../../src/lib/config/env');
    expect(env.APP_PUBLIC.name).toBeDefined();
    expect(env.APP_PUBLIC.url).toBeDefined();
    expect(env.APP_PUBLIC.version).toBeDefined();
  });

  test('feature flags parse booleans', () => {
    process.env.NEXT_PUBLIC_ENABLE_SEARCH = 'false';
    const env = require('../../../src/lib/config/env');
    expect(env.FEATURE_FLAGS_PUBLIC.ENABLE_SEARCH).toBe(false);
  });
});
