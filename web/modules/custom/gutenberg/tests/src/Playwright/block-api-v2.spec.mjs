import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures.mjs';

const BLOCK_NAME = 'gutenberg-test/card-v2';
const CLASS_NAME = 'wp-block-gutenberg-test-card-v2';
const blockJson = JSON.parse(
  readFileSync(
    new URL(
      '../../modules/gutenberg_test_block_api_v2/blocks/card-v2/block.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

// The editor canvas is always an iframe, so API v2 blocks are rendered in it
// like API v3 blocks, and must work there.
test('edits, saves and renders an API v2 block', async ({
  drupal,
  page,
  editor,
  consoleMessages,
}) => {
  await drupal.loginAsAdmin();
  await editor.goto('/node/add/article');
  const block = editor.canvas.locator(`.${CLASS_NAME}`);

  await test.step('registers the block with API version 2', async () => {
    const type = await page.evaluate(
      (name) => window.wp.blocks.getBlockType(name),
      BLOCK_NAME,
    );
    expect(type.apiVersion).toBe(2);
    expect(type.supports).toEqual(blockJson.supports);
    expect(
      consoleMessages.some(
        (message) =>
          message.type === 'warning' &&
          message.text.includes('Block with API version 2 or lower') &&
          message.text.includes(BLOCK_NAME),
      ),
    ).toBe(true);
    await expect(page.locator('iframe[name="editor-canvas"]')).toHaveCount(1);
  });

  let clientId;

  await test.step('inserts the block in the iframed canvas', async () => {
    await editor.insertBlock('Card (API v2)');
    await expect(block).toHaveClass(/block-editor-block-list__block/);
    clientId = await block.getAttribute('data-block');
    expect(
      await page.evaluate(
        (id) =>
          window.wp.data
            .select('core/block-editor')
            .getBlock(id)
            .innerBlocks.map((innerBlock) => innerBlock.name),
        clientId,
      ),
    ).toEqual(['core/paragraph']);

    // The libraries-edit stylesheet applies in the canvas.
    await expect(block).toHaveCSS('border-radius', '12px');
    await expect(block).toHaveCSS('padding-top', '24px');

    // The block isn't in the main document, so API v2 code that looks it up
    // with the global document doesn't find it.
    expect(
      await page.evaluate(
        (id) => !!document.querySelector(`[data-block="${id}"]`),
        clientId,
      ),
    ).toBe(false);
  });

  await test.step('edits the rich text and inner blocks', async () => {
    await block.locator(`.${CLASS_NAME}__title`).click();
    await page.keyboard.type('Hello v2');
    await block.locator(`.${CLASS_NAME}__subhead`).click();
    await page.keyboard.type('A legacy card');
    await block
      .locator(`.${CLASS_NAME}__body [data-type="core/paragraph"]`)
      .click();
    await page.keyboard.type('Body text');
    expect(
      await page.evaluate((id) => {
        const { attributes, innerBlocks } = window.wp.data
          .select('core/block-editor')
          .getBlock(id);
        return {
          title: attributes.title,
          subhead: attributes.subhead,
          body: innerBlocks[0].attributes.content.toString(),
        };
      }, clientId),
    ).toEqual({
      title: 'Hello v2',
      subhead: 'A legacy card',
      body: 'Body text',
    });
  });

  const markup =
    `<div class="${CLASS_NAME} alignwide is-style-outlined has-text-color has-background" id="card-v2-test" style="color:#222222;background-color:#ffeecc;padding-top:40px;padding-bottom:40px;font-size:20px">` +
    `<h3 class="${CLASS_NAME}__title">Hello v2</h3>` +
    `<p class="${CLASS_NAME}__subhead">A legacy card</p>` +
    `<div class="${CLASS_NAME}__body"><!-- wp:paragraph -->`;

  await test.step('applies and serializes the block supports', async () => {
    await page.evaluate(
      (id) =>
        window.wp.data.dispatch('core/block-editor').updateBlockAttributes(id, {
          anchor: 'card-v2-test',
          className: 'is-style-outlined',
          align: 'wide',
          style: {
            color: { background: '#ffeecc', text: '#222222' },
            spacing: { padding: { top: '40px', bottom: '40px' } },
            typography: { fontSize: '20px' },
          },
        }),
      clientId,
    );
    await expect(block).toHaveCSS('padding-top', '40px');
    await expect(block).toHaveCSS('background-color', 'rgb(255, 238, 204)');
    await expect(block).toHaveCSS('border-top-width', '2px');

    const content = await editor.content();
    expect(content).toContain(markup);
    expect(await editor.invalidBlocks(content)).toEqual([]);
  });

  await test.step('saves the node and renders the block', async () => {
    // The title field is in the sidebar tab of the entity.
    await page.getByRole('tab', { name: 'Article' }).click();
    await page.locator('#edit-title-0-value').fill('Card v2 test');
    await page.locator('#edit-submit').click();
    await page.waitForURL(/\/node\/\d+$/);

    // The frontend renders the markup, with the libraries-view stylesheet.
    const card = page.locator(`#card-v2-test.${CLASS_NAME}`);
    await expect(card.locator('h3')).toHaveText('Hello v2');
    await expect(card.locator(`.${CLASS_NAME}__body p`)).toHaveText(
      'Body text',
    );
    await expect(card).toHaveCSS('border-radius', '12px');
    await expect(card).toHaveCSS('border-top-width', '2px');
    await expect(card).toHaveCSS('background-color', 'rgb(255, 238, 204)');
    await expect(card).toHaveCSS('font-size', '20px');
  });

  await test.step('keeps the block valid when edited again', async () => {
    await editor.goto(`${new URL(page.url()).pathname}/edit`);
    expect(
      await page.locator('textarea[name="body[0][value]"]').inputValue(),
    ).toContain(markup);
    await expect(block).toBeVisible();
    expect(await editor.invalidBlocks()).toEqual([]);
    expect(
      await page.evaluate((name) => {
        const { attributes } = window.wp.data
          .select('core/block-editor')
          .getBlocks()
          .find((candidate) => candidate.name === name);
        return {
          title: attributes.title,
          anchor: attributes.anchor,
          align: attributes.align,
          className: attributes.className,
        };
      }, BLOCK_NAME),
    ).toEqual({
      title: 'Hello v2',
      anchor: 'card-v2-test',
      align: 'wide',
      className: 'is-style-outlined',
    });
    await expect(editor.canvas.locator('.block-editor-warning')).toHaveCount(0);
  });
});
