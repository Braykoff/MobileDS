import { useEffect, useState } from "react";
import { NTConnection, NTConnectionEvents } from "./NTComms";
import { NTTopic } from "./NTData";

/** Hook on the NT connection status. */
export function useNTConnected(connection: NTConnection): boolean {
  const [isConnected, setIsConnected] = useState(connection.isConnected());

  useEffect(() => {
    // Add listener
    const listener = connection.events.addListener(NTConnectionEvents.ConnectionStatusChanged, () => {
      setIsConnected(connection.isConnected());
    });

    // Remove listener on unmount
    return () => {
      listener.remove();
    }
  }, [connection]);

  return isConnected;
}

/** Hook on the NT table update event. The value returned is the last update's local timestamp. */
export function useNTTableUpdated(connection: NTConnection) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Add listener
    const listener = connection.events.addListener(NTConnectionEvents.TableUpdated, () => {
      setLastUpdate(Date.now());
    });

    // Remove listeners on unmount
    return () => {
      listener.remove();
    }
  }, [connection]);

  return lastUpdate;
}

/** Hook on an NT Topic update event. The value returned is the last update's server timestamp. */
export function useNTTopicUpdated(connection: NTConnection, topic: NTTopic) {
  const [lastUpdate, setLastUpdate] = useState(topic.lastUpdate);

  useEffect(() => {
    // Add listener
    const listener = connection.events.addListener(NTConnectionEvents.TopicUpdated + topic.fullName, () => {
      setLastUpdate(topic.lastUpdate);
    });

    // Remove listeners on unmount
    return () => {
      listener.remove();
    }
  }, [connection, topic.fullName, topic.lastUpdate]);

  return lastUpdate;
}
