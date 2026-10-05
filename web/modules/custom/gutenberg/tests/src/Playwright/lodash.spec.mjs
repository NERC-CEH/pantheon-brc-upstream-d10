import { test, expect } from './fixtures.mjs';

const lodashWarnings = (consoleMessages) =>
  consoleMessages.filter(
    ({ type, text }) => type === 'warning' && text.includes('window.lodash'),
  );

// The editor doesn't use lodash, but still loads it for custom blocks that use
// the global, which is deprecated.
test('loads the deprecated lodash global in the editor', async ({
  drupal,
  page,
  editor,
  consoleMessages,
}) => {
  await drupal.loginAsAdmin();
  await editor.goto('/node/add/article');

  await test.step('loads lodash without using it', async () => {
    expect(await page.evaluate(() => typeof window.lodash)).toBe('function');
    expect(lodashWarnings(consoleMessages)).toEqual([]);
  });

  await test.step('warns once per lodash function used', async () => {
    expect(
      await page.evaluate(() => {
        const { debounce } = window.lodash;
        return typeof debounce === 'function' && window.lodash.VERSION;
      }),
    ).toBe('4.17.21');
    expect(await page.evaluate(() => typeof window.lodash.debounce)).toBe(
      'function',
    );
    expect(
      await page.evaluate(() =>
        window
          .lodash([1, 2])
          .map((value) => value * 2)
          .value(),
      ),
    ).toEqual([2, 4]);

    const warnings = lodashWarnings(consoleMessages).map(({ text }) => text);
    expect(
      warnings.filter((text) => text.startsWith('window.lodash.debounce ')),
    ).toEqual([
      'window.lodash.debounce is deprecated since version 4.0.0 and will be removed from Drupal Gutenberg in version 5.0.0. Please use native JavaScript, or lodash bundled with your own scripts instead.',
    ]);
    expect(warnings).toContainEqual(
      expect.stringMatching(/^window\.lodash\.VERSION is deprecated/),
    );
    expect(warnings).toContainEqual(
      expect.stringMatching(/^window\.lodash\(\) is deprecated/),
    );
  });
});
