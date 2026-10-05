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
 * Sets the Gutenberg experience options of the Article content type.
 *
 * @param {Object} page    The page, logged in as an admin.
 * @param {Object} options The checkboxes to set, by label.
 */
async function setArticleOptions(page, options) {
  await page.goto('/admin/structure/types/manage/article');
  await page.getByRole('link', { name: 'Gutenberg experience' }).click();
  for (const [label, checked] of Object.entries(options)) {
    await page.getByLabel(label).setChecked(checked);
  }
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'has been updated',
  );
}

test('places the title in the content', async ({ drupal, page, editor }) => {
  await drupal.loginAsAdmin();
  await setDefaultTheme(page, 'Gutenberg Base');
  await setArticleOptions(page, { 'Show the title in the editor': true });

  await editor.goto('/node/add/article');
  const canvasTitle = editor.canvas.getByRole('textbox', { name: 'Add title' });
  await expect(canvasTitle).toBeVisible();

  // The entity title block takes the place of the canvas title.
  await editor.insertBlock('Title');
  const block = editor.canvas.locator('[data-type="drupal/entity-title"]');
  await expect(block).toBeVisible();
  await expect(canvasTitle).toHaveCount(0);
  await block.click();
  await page.keyboard.type('Campaign');
  await save(page);
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'Campaign has been created.',
  );

  // The block renders the title, and the theme no longer renders it above
  // the content.
  const nodePath = new URL(page.url()).pathname;
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1.wp-block-drupal-entity-title')).toHaveText(
    'Campaign',
  );
  await expect(page.locator('.node__title')).toHaveCount(0);

  // Without the block, the canvas title is back, with the title.
  await editor.goto(`${nodePath}/edit`);
  await expect(block).toHaveText('Campaign');
  await expect(canvasTitle).toHaveCount(0);
  await block.click();
  await editor.clickBlockOptionsMenuItem('Delete');
  await expect(canvasTitle).toHaveText('Campaign');
  await save(page);
  await expect(page.locator('.node__title')).toHaveText('Campaign');
});

test('syncs the title with the title field', async ({
  page,
  drupal,
  editor,
}) => {
  await drupal.loginAsAdmin();

  // The title is in the sidebar, not in the canvas.
  await editor.goto('/node/add/article');
  const field = page.locator('#edit-title-0-value');
  await field.fill('Sidebar title');

  await editor.insertBlock('Title');
  const block = editor.canvas.locator('[data-type="drupal/entity-title"]');
  await expect(block).toHaveText('Sidebar title');

  await block.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('Block title');
  await expect(field).toHaveValue('Block title');

  // Selecting the block showed the block settings in the sidebar.
  await page.getByRole('tab', { name: 'Article' }).click();
  await field.fill('Field title');
  await expect(block).toHaveText('Field title');

  await save(page);
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'Field title has been created.',
  );
});

test('reports an empty title on the block', async ({
  page,
  drupal,
  editor,
}) => {
  await drupal.loginAsAdmin();
  await setArticleOptions(page, { 'Show the title in the editor': true });

  await editor.goto('/node/add/article');
  await editor.insertBlock('Title');
  await save(page);

  await expect(page.locator('.components-notice.is-error')).toContainText(
    'Title field is required.',
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.wp.data.select('core/block-editor').getSelectedBlock()?.name,
      ),
    )
    .toBe('drupal/entity-title');
});

test('field blocks do not place the title', async ({
  page,
  drupal,
  editor,
}) => {
  await drupal.loginAsAdmin();
  await setArticleOptions(page, { 'Place fields in the content': true });

  await editor.goto('/node/add/article');
  const variations = await page.evaluate(() =>
    window.wp.blocks
      .getBlockVariations('drupal/field')
      .map((variation) => variation.name),
  );
  expect(variations).not.toContain('title');
  expect(variations.length).toBeGreaterThan(0);
  await expect(page.locator('#edit-title-0-value')).not.toHaveAttribute(
    'data-gutenberg-field-widget',
  );
});
