import { useEffect, useState } from "react";
import { DSConnection } from "./DSComms";
import { DSEvents } from "./DSEvents";

/** Hooks on the DS's UDP and TCP socket last connection state change timestamp. */
export function useDSConnected(connection: DSConnection): number {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    // Add listener
    const listener = connection.events.addListener(DSEvents.SocketConnectionChanged, (invoker: string) => {
      setTimestamp(Date.now());
    });

    // Remove listeners on unmount
    return () => {
      listener.remove();
    }
  }, [connection]);

  return timestamp;
}
