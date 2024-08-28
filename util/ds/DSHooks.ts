import { DSConnection } from "./DSComms";
import { DSEvents } from "./DSEvents";
import { useEvent } from "../EventHooks";

/** Hooks on the DS's UDP and TCP socket last connection state change timestamp. */
export function useDSConnected(connection: DSConnection): number {
  return useEvent<number>(
    connection, 
    DSEvents.SocketConnectionChanged, 
    Date.now
  );
}

/** Hooks on the estop state of the robot. */
export function useRobotEStopped(connection: DSConnection): boolean {
  return useEvent<boolean>(
    connection,
    DSEvents.RobotEStopChanged,
    () => connection.state.estop
  );
}
