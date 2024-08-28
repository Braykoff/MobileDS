import { useEffect, useState } from "react";
import { DSConnection } from "./DSComms";
import { DSEvents } from "./DSEvents";

/** Hooks on the DS's UDP and TCP socket connection states. */
export function useDSConnected(connection: DSConnection): boolean {
  const [isConnected, setIsConnected] = useState(connection.isConnected());

  useEffect(() => {
    // Add listener
    const listener = connection.events.addListener(DSEvents.SocketConnectionChanged, () => {
      setIsConnected(connection.isConnected());
    });

    // Remove listeners on unmount
    return () => {
      listener.remove();
    }
  }, [connection]);

  return isConnected;
}
