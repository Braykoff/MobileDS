import { NTConnection, NTConnectionEvents } from "./NTComms";
import { NTTopic } from "./NTData";
import { useEvent } from "../EventHooks";

/** Hook on the NT connection status. */
export function useNTConnected(connection: NTConnection): boolean {
  return useEvent<boolean>(
    connection,
    NTConnectionEvents.ConnectionStatusChanged,
    connection.isConnected
  );
}

/** Hook on the NT table update event. The value returned is the last update's local timestamp. */
export function useNTTableUpdated(connection: NTConnection): number {
  return useEvent<number>(
    connection,
    NTConnectionEvents.TableUpdated,
    Date.now
  );
}

/** Hook on an NT Topic update event. The value returned is the last update's server timestamp. */
export function useNTTopicUpdated(connection: NTConnection, topic: NTTopic): number {
  return useEvent<number>(
    connection,
    NTConnectionEvents.TopicUpdated + topic.fullName,
    () => topic.lastUpdate
  );
}
