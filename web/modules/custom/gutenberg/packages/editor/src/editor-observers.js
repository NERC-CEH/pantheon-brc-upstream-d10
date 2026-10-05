/* global drupalSettings */

const startObserving = (domNode) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const element = Array.from(mutation.addedNodes).find(
        (node) =>
          node.getAttribute && node.getAttribute('name') === 'editor-canvas',
      );

      if (element) {
        element.addEventListener('load', () => {
          const doc = element.contentDocument || element.contentWindow.document;
          const rootContainer = doc.querySelector('.is-root-container');
          if (rootContainer) {
            rootContainer.classList.add(
              drupalSettings.gutenberg['theme-support']
                .extraRootContainerClassNames,
            );
          }
        });
      }
    });
  });

  observer.observe(domNode, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
  });

  return observer;
};

const element = document.querySelector('.gutenberg');
if (element) {
  startObserving(element);
}
