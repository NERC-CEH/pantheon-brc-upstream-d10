/**
 * ESM shim for react-autosize-textarea.
 *
 * The original CJS index.js uses `exports.__esModule = true` with
 * `exports.default = TextareaAutosize`. When webpack scope-hoists this inside
 * @wordpress/editor, the CJS→ESM default-export interop (__webpack_require__.n)
 * is lost, causing `import TextareaAutosize from 'react-autosize-textarea'`
 * to receive the module namespace object instead of the component.
 *
 * This shim re-exports the component as a proper ESM default export,
 * which webpack can inline correctly during scope hoisting.
 */
export { TextareaAutosize as default } from 'react-autosize-textarea/lib/TextareaAutosize';
