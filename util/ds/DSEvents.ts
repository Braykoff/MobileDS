// These are here to prevent require cycles

/** Events emitted by the DSConnection's Event Emitter. The first argument will be the event
 * invoker, for debugging. */
export const DSEvents = {
  SocketConnectionChanged: "socketConnectionChanged",
  RobotEStopChanged: "robotEstopChanged",
  RobotStateChanged: "robotStateChanged"
}
