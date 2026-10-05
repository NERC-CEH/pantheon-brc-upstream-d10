import { test, expect } from './fixtures.mjs';

test('shows the summary in More Settings without other fields', async ({
  drupal,
  page,
  editor,
}) => {
  await drupal.loginAsAdmin();
  // Basic page has no other field than the body, which displays its summary.
  await drupal.applyRecipe('core/recipes/page_content_type');
  await page.goto('/admin/structure/types/manage/page');
  await page.getByRole('link', { name: 'Gutenberg experience' }).click();
  await page.getByLabel('Enable Gutenberg experience').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'has been updated',
  );

  await editor.goto('/node/add/page');
  // The resize handle covers the middle of the toggle.
  await page.getByRole('button', { name: 'More Settings' }).press('Enter');
  const summary = page
    .locator('.edit-post-meta-boxes-area')
    .getByRole('textbox', { name: 'Summary' });
  await expect(summary).toBeVisible();
  await summary.fill('The summary');
  await page.locator('#edit-title-0-value').fill('Page with a summary');
  await page
    .locator('.drupal-form-actions')
    .getByRole('button', { name: 'Save', exact: true })
    .click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'Page with a summary has been created.',
  );

  await editor.goto(`${new URL(page.url()).pathname}/edit`);
  await expect(summary).toHaveValue('The summary');
});
