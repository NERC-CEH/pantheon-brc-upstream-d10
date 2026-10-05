import { test, expect } from './fixtures.mjs';

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

test('edits the title in the editor', async ({ drupal, page, editor }) => {
  await drupal.loginAsAdmin();
  // Registering components changes the editor stores before the editor is set
  // up, which used to clear the title the editor reads from the title field.
  await drupal.installModules(['sdc_test']);
  await page.goto('/admin/structure/types/manage/article');
  await page.getByRole('link', { name: 'Gutenberg experience' }).click();
  await page.getByLabel('Show the title in the editor').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'has been updated',
  );

  await editor.goto('/node/add/article');
  const title = editor.canvas.getByRole('textbox', { name: 'Add title' });
  await title.click();
  await page.keyboard.type('First title');
  await save(page);
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'First title has been created.',
  );

  // The edit form shows the saved title in the canvas.
  const edit = `${new URL(page.url()).pathname}/edit`;
  await editor.goto(edit);
  await expect(title).toHaveText('First title');
  await expect(page.locator('#edit-title-0-value')).toHaveValue('First title');

  await title.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('Second title');
  await save(page);
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'Second title has been updated.',
  );

  await editor.goto(edit);
  await expect(title).toHaveText('Second title');
});
