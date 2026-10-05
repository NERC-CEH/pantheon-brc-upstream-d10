import { test, expect } from './fixtures.mjs';

test('creates a reusable block from a block', async ({
  drupal,
  page,
  editor,
}) => {
  await drupal.loginAsAdmin();
  await editor.goto('/node/add/article');
  await editor.insertBlock('Paragraph');
  const paragraph = editor.canvas.locator('[data-type="core/paragraph"]');
  await paragraph.click();
  await page.keyboard.type('Reusable content');

  // Create a synced pattern from the block.
  await editor.clickBlockOptionsMenuItem('Create pattern');
  const dialog = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('textbox', { name: 'Name' }) });
  await dialog.getByLabel('Name').fill('Test reusable block');
  await dialog.getByRole('button', { name: 'Add' }).click();

  // The block is replaced by the reusable block.
  await expect(editor.canvas.locator('[data-type="core/block"]')).toContainText(
    'Reusable content',
  );

  // It is saved as a reusable block.
  await page.goto('/admin/content/patterns');
  await expect(page.getByRole('main')).toContainText('Test reusable block');
});
