import { createContext, useState, useCallback, useMemo } from '@wordpress/element';

export const SdcSlotContext = createContext({
  targets: {},
  registerTarget: () => {},
  unregisterTarget: () => {},
  slotDefinitions: {},
});

/**
 * Provider that manages portal target registration for SDC slots.
 *
 * Uses state (not refs) so that target registration triggers re-renders,
 * allowing sdc/slot blocks to discover their portal targets.
 */
export function SdcSlotProvider({ children, slotDefinitions = {} }) {
  const [targets, setTargets] = useState({});

  const registerTarget = useCallback((slotName, node) => {
    setTargets((prev) => ({ ...prev, [slotName]: node }));
  }, []);

  const unregisterTarget = useCallback((slotName) => {
    setTargets((prev) => {
      const next = { ...prev };
      delete next[slotName];
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ targets, registerTarget, unregisterTarget, slotDefinitions }),
    [targets, registerTarget, unregisterTarget, slotDefinitions],
  );

  return (
    <SdcSlotContext.Provider value={contextValue}>
      {children}
    </SdcSlotContext.Provider>
  );
}
