import { jest } from '@jest/globals';

describe('mode module', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('defaults to dynamic mode', () => {
    delete process.env.DATA_MODE;
    const mode = require('../../../src/lib/config/mode');
    const cfg = mode.getDataMode();
    expect(cfg.mode).toBe('dynamic');
    expect(cfg.isDynamic).toBe(true);
    expect(cfg.isStatic).toBe(false);
  });

  test('accepts static mode', () => {
    process.env.DATA_MODE = 'static';
    const mode = require('../../../src/lib/config/mode');
    const cfg = mode.getDataMode();
    expect(cfg.mode).toBe('static');
    expect(cfg.isStatic).toBe(true);
    expect(cfg.isDynamic).toBe(false);
  });
});
