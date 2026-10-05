import { test, expect, setDefaultTheme } from './fixtures.mjs';

/**
 * Saves the node form with the Save button of the editor header.
 *
 * @param {Object} page The page, on the node form.
 */
async function save(page) {
  await page
    .locator('.drupal-form-actions')
    .getByRole('button', { name: 'Save', exact: true })
    .click();
}

/**
 * The "Overlay the site header" option of the Cover block of the base theme.
 *
 * @see themes/gutenberg_base/js/cover-header-overlay.js
 */
test('overlays the site header on a cover that starts the content', async ({
  drupal,
  page,
  editor,
}) => {
  await drupal.loginAsAdmin();
  await setDefaultTheme(page, 'Gutenberg Base');
  // The layout of visitors is checked at the end. The test site grants
  // anonymous users nothing.
  await drupal.addPermissions({
    role: 'anonymous',
    permissions: ['access content'],
  });

  await editor.goto('/node/add/article');
  await page.locator('#edit-title-0-value').fill('Hero');
  const cover = editor.canvas.locator('[data-type="core/cover"]');
  const toggle = page.getByLabel('Overlay the site header');

  // The option shows for a cover that starts the content.
  await editor.insertBlock('Cover');
  // The placeholder of the cover offers the colors of the theme.
  await cover.getByRole('button', { name: 'Contrast', exact: true }).click();
  await expect(cover.locator('[data-type="core/paragraph"]')).toBeVisible();
  // A duotone filter renders an SVG before the cover on the page, which the
  // layout must not mistake for the first block.
  await page.evaluate(
    (id) =>
      window.wp.data.dispatch('core/block-editor').updateBlockAttributes(id, {
        style: { color: { duotone: 'var:preset|duotone|grayscale' } },
      }),
    await cover.getAttribute('data-block'),
  );
  await editor.selectBlock(await cover.getAttribute('data-block'));
  await expect(page.getByRole('button', { name: 'Site header' })).toBeVisible();
  await toggle.check();
  // The canvas shows a placeholder of the header, with an editor-only class.
  await expect(cover).toHaveClass(/has-header-overlay/);

  // Not for a cover that is not first. The paragraph is moved and removed
  // with the block editor store: the block toolbar does not show for a block
  // selected without the mouse.
  await editor.insertBlock('Paragraph');
  const paragraph = editor.canvas.locator(
    '.is-root-container > [data-type="core/paragraph"]',
  );
  const paragraphId = await paragraph.getAttribute('data-block');
  await page.evaluate(
    (id) => window.wp.data.dispatch('core/block-editor').moveBlocksUp([id]),
    paragraphId,
  );
  await editor.selectBlock(await cover.getAttribute('data-block'));
  await expect(toggle).toHaveCount(0);
  await expect(cover).not.toHaveClass(/has-header-overlay/);
  await page.evaluate(
    (id) => window.wp.data.dispatch('core/block-editor').removeBlocks([id]),
    paragraphId,
  );
  await editor.selectBlock(await cover.getAttribute('data-block'));
  await expect(toggle).toBeChecked();

  // The title goes in the cover, so that no page header band renders above
  // the content.
  await cover.locator('[data-type="core/paragraph"]').click();
  await page.keyboard.type('/Title');
  // The slash inserter lists the Title block first, selected. The name of
  // the option starts with its icon.
  await expect(
    editor.canvas.getByRole('option', { name: /Title$/ }).first(),
  ).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(cover.locator('[data-type="drupal/entity-title"]')).toHaveText(
    'Hero',
  );

  await save(page);
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'Hero has been created.',
  );
  const nodePath = new URL(page.url()).pathname;
  await expect(page.locator('body')).toHaveClass(/has-header-overlay/);
  await expect(page.locator('.page-header')).toHaveCount(0);
  await expect(page.locator('.layout-content > svg')).toHaveCount(1);
  await expect(page.locator('h1.wp-block-drupal-entity-title')).toHaveText(
    'Hero',
  );

  // Visitors get the cover under a translucent header. Editors see the
  // message and the local tasks above the content, which keep the plain
  // layout.
  await drupal.logout();
  await page.goto(nodePath);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const block = document.querySelector(
          '.layout-content > .wp-block-cover',
        );
        return {
          coverTop: Math.round(block.getBoundingClientRect().top),
          headerBottom: Math.round(header.getBoundingClientRect().bottom),
          background: getComputedStyle(header).backgroundColor,
        };
      }),
    )
    .toEqual({
      coverTop: 0,
      headerBottom: 100,
      background: expect.stringContaining('0.7'),
    });
  // Once scrolled, the header is opaque again. The page of the test is
  // shorter than the viewport: a lower one makes it scroll.
  await page.setViewportSize({ width: 1440, height: 400 });
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
  await expect(page.locator('.site-header')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
});
