import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { load } from '../src/load';

describe('unit test', () => {
  const testRoot = join(process.cwd(), `test-env-${new Date().toString()}`);

  beforeEach(() => {
    mkdirSync(testRoot, { recursive: true });
  });

  afterEach(() => {
    rmSync(testRoot, { recursive: true, force: true });
  });

  it('should load variables from .env', () => {
    writeFileSync(join(testRoot, '.env'), 'VAR1=from-env\nVAR2=from-env');

    const result = load(testRoot);
    expect(result).toEqual({
      VAR1: 'from-env',
      VAR2: 'from-env',
    });
  });

  it('should override variables with .env.NODE_ENV', () => {
    process.env.NODE_ENV = 'test';
    writeFileSync(join(testRoot, '.env'), 'VAR1=from-env\nVAR2=from-env');
    writeFileSync(join(testRoot, '.env.test'), 'VAR2=from-env-test\nVAR3=from-env-test');

    const result = load(testRoot);
    expect(result).toEqual({
      VAR2: 'from-env-test',
      VAR3: 'from-env-test',
      VAR1: 'from-env',
    });
  });

  it('should override variables with .env.local', () => {
    process.env.NODE_ENV = 'test';
    writeFileSync(join(testRoot, '.env'), 'VAR1=from-env\nVAR2=from-env');
    writeFileSync(join(testRoot, '.env.test'), 'VAR2=from-env-test\nVAR3=from-env-test');
    writeFileSync(join(testRoot, '.env.local'), 'VAR3=from-env-local\nVAR4=from-env-local');

    const result = load(testRoot);
    expect(result).toEqual({
      VAR3: 'from-env-local',
      VAR4: 'from-env-local',
      VAR2: 'from-env-test',
      VAR1: 'from-env',
    });
  });

  it('should not override existing variables', () => {
    process.env.NODE_ENV = 'production';
    writeFileSync(join(testRoot, '.env'), 'VAR=from-env');
    writeFileSync(join(testRoot, '.env.production'), 'VAR=from-env-production');
    writeFileSync(join(testRoot, '.env.local'), 'VAR=from-env-local');

    const result = load(testRoot);
    expect(result).toEqual({
      VAR: 'from-env-local',
    });
  });

  it('should handle missing files gracefully', () => {
    process.env.NODE_ENV = 'staging';
    writeFileSync(join(testRoot, '.env'), 'VAR=from-env');
    const result = load(testRoot);
    expect(result).toEqual({
      VAR: 'from-env',
    });
  });
});
