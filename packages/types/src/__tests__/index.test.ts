import { describe, expect, it } from 'vitest';

import { SHARED_TYPES_VERSION, type Empty } from '../index';

describe('@conduit/types', () => {
  it('exposes SHARED_TYPES_VERSION', () => {
    expect(SHARED_TYPES_VERSION).toBe('0.1.0');
  });

  it('allows Empty type to be assigned an empty record', () => {
    const empty: Empty = {};
    expect(Object.keys(empty)).toHaveLength(0);
  });
});
