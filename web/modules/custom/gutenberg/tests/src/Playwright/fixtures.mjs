import { expect } from '@playwright/test';
import { isolatedPerTestSnapshot } from '@drupal/playwright';

/**
 * Makes Claro the admin theme, and creates the Article content type with
 * Gutenberg.
 *
 * Runs once per worker, after the modules are installed. Each test starts
 * from a snapshot of the site taken after it.
 *
 * @param {Object} context        The setup context.
 * @param {Object} context.drupal The Drupal helper of @drupal/playwright.
 * @param {Object} context.page   The page.
 */
async function setupGutenberg({ drupal, page }) {
  // The fixture logs out before the setup, despite its documentation.
  await drupal.loginAsAdmin();

  // Edit content with Claro, like most sites. The editor sidebar shows the
  // node form meta pane of the admin theme.
  await page.goto('/admin/appearance');
  await page.locator('a[title="Install Claro theme"]').click();
  await page
    .getByLabel('Administration theme', { exact: true })
    .selectOption('claro');
  await page.getByRole('button', { name: 'Save configuration' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'The configuration options have been saved.',
  );

  await drupal.applyRecipe('core/recipes/article_content_type');
  await page.goto('/admin/structure/types/manage/article');
  await page.getByRole('link', { name: 'Gutenberg experience' }).click();
  await page.getByLabel('Enable Gutenberg experience').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'has been updated',
  );
}

/**
 * Makes a theme the default and the admin theme.
 *
 * @param {Object} page The page, logged in as an admin.
 * @param {string} name The name of the theme.
 */
export async function setTheme(page, name) {
  await page.goto('/admin/appearance');
  const install = page.locator(`a[title="Install ${name} as default theme"]`);
  const setDefault = page.locator(`a[title="Set ${name} as default theme"]`);
  if (await install.count()) {
    await install.click();
  } else if (await setDefault.count()) {
    await setDefault.click();
  }
  await page
    .getByLabel('Administration theme', { exact: true })
    .selectOption({ label: name });
  await page.getByRole('button', { name: 'Save configuration' }).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    'The configuration options have been saved.',
  );
}

/**
 * Makes a theme the default theme, keeping the admin theme.
 *
 * @param {Object} page The page, logged in as an admin.
 * @param {string} name The name of the theme.
 */
export async function setDefaultTheme(page, name) {
  await page.goto('/admin/appearance');
  await page.locator(`a[title="Install ${name} as default theme"]`).click();
  await expect(page.locator('[data-drupal-messages]')).toContainText(
    `show the selected ${name} theme by default`,
  );
}

/**
 * Helpers for the Gutenberg editor of the node form.
 */
export class Editor {
  constructor(page) {
    this.page = page;
    this.canvas = page.frameLocator('iframe[name="editor-canvas"]');
  }

  /**
   * Opens a node form and waits for the editor.
   *
   * @param {string} path The path of the node form.
   */
  async goto(path) {
    await this.page.goto(path);
    // The class is added once the editor is initialized.
    await this.page
      .locator('.gutenberg-full-editor.ready')
      .waitFor({ state: 'attached' });
    await this.page.locator('iframe[name="editor-canvas"]').waitFor();
    // Close the welcome guide.
    const guide = this.page.locator('.components-modal__screen-overlay');
    if (await guide.isVisible()) {
      await this.page.keyboard.press('Escape');
      await guide.waitFor({ state: 'detached' });
    }
  }

  /**
   * Inserts a block with the inserter search.
   *
   * @param {string} title The title of the block.
   */
  async insertBlock(title) {
    const toggle = this.page.locator('.editor-document-tools__inserter-toggle');
    await toggle.click();
    await this.page.getByRole('searchbox').first().fill(title);
    await this.page.getByRole('option', { name: title }).click();
    await toggle.click();
  }

  /**
   * Returns the titles of the blocks the inserter offers.
   */
  async inserterBlockTitles() {
    const toggle = this.page.locator('.editor-document-tools__inserter-toggle');
    await toggle.click();
    const items = this.page.locator(
      '.block-editor-inserter__block-list .block-editor-block-types-list__list-item',
    );
    await items.first().waitFor();
    // The inserter renders the categories one by one.
    let count = 0;
    await expect
      .poll(
        async () => {
          const previous = count;
          count = await items.count();
          return count === previous;
        },
        { intervals: [500] },
      )
      .toBe(true);
    const titles = (await items.allTextContents())
      .map((title) => title.trim())
      .filter(Boolean);
    await toggle.click();
    return titles;
  }

  /**
   * Selects a block, like a click on it that a test can't make reliably.
   *
   * @param {string} clientId The client ID of the block, its data-block.
   */
  selectBlock(clientId) {
    return this.page.evaluate(
      (id) => window.wp.data.dispatch('core/block-editor').selectBlock(id),
      clientId,
    );
  }

  /**
   * Clicks an item of the Options menu of the selected block.
   *
   * @param {string} name The name of the menu item.
   */
  async clickBlockOptionsMenuItem(name) {
    // The block toolbar is hidden while typing, until the mouse moves.
    await this.page.mouse.move(50, 50);
    await this.page.mouse.move(100, 100);
    await this.page
      .getByRole('toolbar', { name: 'Block tools' })
      .getByRole('button', { name: 'Options' })
      .click();
    await this.page.getByRole('menuitem', { name }).click();
  }

  /**
   * Returns the names of the invalid blocks, including inner blocks.
   *
   * @param {string} [content] Content to parse. Defaults to the editor blocks.
   */
  invalidBlocks(content) {
    return this.page.evaluate((html) => {
      const flatten = (blocks) =>
        blocks.flatMap((block) => [block, ...flatten(block.innerBlocks)]);
      const blocks =
        html === undefined
          ? window.wp.data.select('core/block-editor').getBlocks()
          : window.wp.blocks.parse(html);
      return flatten(blocks)
        .filter((block) => !block.isValid)
        .map((block) => block.name);
    }, content);
  }

  /**
   * Returns the serialized content of the editor.
   */
  content() {
    return this.page.evaluate(() =>
      window.wp.data.select('core/editor').getEditedPostContent(),
    );
  }
}

// Worker options are the same for all tests, so that the workers, and the site
// installed by each of them, are shared by all spec files.
export const test = isolatedPerTestSnapshot.extend({
  enableTestExtensions: [true, { option: true, scope: 'worker' }],
  // Gutenberg, and the modules and test modules used by the specs.
  modules: [
    ['gutenberg', 'media', 'gutenberg_test_block_api_v2'],
    { option: true, scope: 'worker' },
  ],
  setup: [
    async ({}, use) => {
      await use(setupGutenberg);
    },
    { scope: 'worker' },
  ],
  // Messages logged by the page. A test fails if the page had a JS error, like
  // with WebDriverTestBase.
  consoleMessages: [
    async ({ page }, use) => {
      const messages = [];
      page.on('console', (message) =>
        messages.push({ type: message.type(), text: message.text() }),
      );
      page.on('pageerror', (error) =>
        messages.push({ type: 'pageerror', text: error.message }),
      );
      await use(messages);
      const errors = messages.filter(
        ({ type, text }) =>
          type === 'pageerror' ||
          (type === 'error' && !text.startsWith('Failed to load resource')),
      );
      expect(errors, 'JS errors').toEqual([]);
    },
    { auto: true },
  ],
  editor: async ({ page }, use) => {
    await use(new Editor(page));
  },
});

export { expect };
