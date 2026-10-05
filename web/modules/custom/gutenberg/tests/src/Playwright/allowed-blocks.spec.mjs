import { test, expect } from './fixtures.mjs';

// Blocks that can't be disallowed.
const ALWAYS_ALLOWED = [
  'Paragraph',
  'Heading',
  'List',
  // Variations registered with their blocks.
  'Stretchy Paragraph',
  'Stretchy Heading',
  // Registered by the module.
  'Field',
  'Title',
  // Registered by a test module.
  'Card (API v2)',
];

const PARAGRAPH = 'allowed_blocks_core[core/paragraph]';
const MEDIA = 'allowed_drupal_blocks_media[drupalmedia/drupal-media-entity]';

const CASES = [
  { title: 'without', allow: [PARAGRAPH], offered: [], mediaOptions: 0 },
  {
    title: 'with',
    allow: [PARAGRAPH, MEDIA],
    offered: ['Media'],
    mediaOptions: 1,
  },
];

/**
 * Unchecks all the blocks of the Gutenberg settings of the content type form.
 *
 * Also disallows the blocks added in the future, unlike a list of blocks.
 *
 * @param {Object} page The page, on the content type form.
 */
async function disallowAllBlocks(page) {
  const settings = page.locator(
    'details[data-drupal-selector="edit-gutenberg"]',
  );
  await settings
    .locator('details')
    .evaluateAll((elements) =>
      elements.forEach((element) => (element.open = true)),
    );
  for (const checkbox of await settings
    .locator('details input[type="checkbox"]')
    .all()) {
    if ((await checkbox.isChecked()) && (await checkbox.isEnabled())) {
      await checkbox.uncheck();
    }
  }
}

for (const { title, allow, offered, mediaOptions } of CASES) {
  test(`only offers the allowed blocks, ${title} the media block`, async ({
    drupal,
    page,
    editor,
  }) => {
    await drupal.loginAsAdmin();
    await page.goto('/admin/structure/types/manage/article');
    await page.getByRole('link', { name: 'Gutenberg experience' }).click();
    await disallowAllBlocks(page);
    for (const name of allow) {
      await page.locator(`input[name="${name}"]`).check();
    }
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-drupal-messages]')).toContainText(
      'has been updated',
    );

    await editor.goto('/node/add/article');
    const expected = [...ALWAYS_ALLOWED, ...offered];
    const titles = await editor.inserterBlockTitles();
    expect(
      titles.filter((blockTitle) => !expected.includes(blockTitle)),
    ).toEqual([]);
    expect(titles).toEqual(expect.arrayContaining(['Paragraph', ...offered]));

    // The inserter search finds the media block only when it's allowed.
    await page.locator('.editor-document-tools__inserter-toggle').click();
    await page.getByRole('searchbox').first().fill('Media');
    await expect(page.getByRole('option', { name: 'Media' })).toHaveCount(
      mediaOptions,
    );
  });
}
