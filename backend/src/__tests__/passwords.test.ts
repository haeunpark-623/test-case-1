import { describe, expect, it } from 'vitest';

import { comparePassword, hashPassword } from '../lib/passwords';

describe('passwords lib (bcryptjs cost=12)', () => {
  it('hashPassword produces bcrypt-shaped output', async () => {
    const hash = await hashPassword('test1234');
    expect(hash).toMatch(/^\$2[aby]?\$\d+\$[./A-Za-z0-9]{53}$/);
  });

  it('comparePassword returns true for the correct password', async () => {
    const hash = await hashPassword('correct-horse');
    await expect(comparePassword('correct-horse', hash)).resolves.toBe(true);
  });

  it('comparePassword returns false for a wrong password', async () => {
    const hash = await hashPassword('correct-horse');
    await expect(comparePassword('wrong-pw', hash)).resolves.toBe(false);
  });
});
