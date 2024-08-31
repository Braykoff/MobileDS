import { useEffect, useState } from "react";
import { CustomEventEmitter } from "./CustomEventEmitter";

/** Interface for objects that have a CustomEventEmitter */
interface ObjectWithEvents {
  events: CustomEventEmitter
}

/** Hooks to an event of an event emitter. */
export function useEvent<T>(parent: ObjectWithEvents, event: string, getter: () => T): T {
  const [currentValue, setNewValue] = useState(getter());

  useEffect(() => {
    // Add listener
    const listener = parent.events.addListener(event, () => {
      setNewValue(getter());
    });

    // Remove listeners on unmount
    return () => {
      listener.remove();
    }
  }, [parent, event, getter]);

  return currentValue;
}
