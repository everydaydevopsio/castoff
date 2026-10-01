import { describe, expect, it, jest } from '@jest/globals';

// main.ts is the file action.yml points at. Nothing else imports it, so
// without this test the entry wiring sits outside the coverage gate.
describe('action entry point', () => {
  it('runs the action once on import', async () => {
    jest.resetModules();
    const run = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    jest.unstable_mockModule('./index.js', () => ({ run }));

    await import('./main.js');

    expect(run).toHaveBeenCalledTimes(1);
  });
});
