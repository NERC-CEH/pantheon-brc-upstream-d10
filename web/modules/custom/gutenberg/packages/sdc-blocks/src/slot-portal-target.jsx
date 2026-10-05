import { useRef, useEffect, useContext } from '@wordpress/element';
import { SdcSlotContext } from './sdc-slot-context';

/**
 * Renders a div at the correct slot position within the component HTML
 * and registers it as a portal target for the matching sdc/slot block.
 */
export function SlotPortalTarget({ slotName }) {
  const ref = useRef(null);
  const { registerTarget, unregisterTarget } = useContext(SdcSlotContext);

  useEffect(() => {
    if (ref.current) {
      registerTarget(slotName, ref.current);
    }
    return () => unregisterTarget(slotName);
  }, [slotName, registerTarget, unregisterTarget]);

  return <div ref={ref} className="sdc-slot-portal-target" data-sdc-slot-name={slotName} />;
}
