import { test, expect, setTheme } from './fixtures.mjs';

// The editor works whatever the admin theme, including one without any CSS,
// regions or libraries (test_super_empty_theme).
for (const theme of ['Claro', 'Stark', 'Olivero', 'test super empty theme']) {
  test(`works with ${theme} as the admin theme`, async ({ drupal, editor }) => {
    await drupal.loginAsAdmin();
    await setTheme(editor.page, theme);

    await editor.goto('/node/add/article');
    await editor.insertBlock('Paragraph');
    const paragraph = editor.canvas.locator('[data-type="core/paragraph"]');
    await paragraph.click();
    await editor.page.keyboard.type('Hello');
    await expect(paragraph).toHaveText('Hello');
  });
}
