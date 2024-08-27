import { CustomEventEmitter } from "../CustomEventEmitter";
import { UDPSocket } from "./UDPSocket";
import { TCPSocket } from "./TCPSocket";
import { RobotStateData } from "./RobotState";

/** Events emitted by the event emitter in DSConnection */
export const DSConnectionEvents = {
  UDPSocketConnectionStatusChanged: "udpSocketConnectionChanged",
  TCPSocketConnectionStatusChanged: "tcpSocketConnectionChanged",
  RobotStateChanged: "robotStateChanged",
  JoystickIndexChanged: "joystickIndexChanged"
}

export class DSConnection {
  public readonly address: string
  public readonly socketUDP: UDPSocket;
  public readonly socketTCP: TCPSocket;

  public readonly events: CustomEventEmitter;

  public readonly state = new RobotStateData();

  public constructor(address: string) {
    // Create emitter
    this.events = new CustomEventEmitter(`DS (${address})`);

    this.address = address;

    // Open connections
    this.socketUDP = new UDPSocket(this);
    this.socketTCP = new TCPSocket(this);
  }

  /** Disconnects and closes the sockets */
  public disconnect() {
    this.state.enabled = false; // Disable

    // Close sockets
    this.socketUDP.disconnect();
    this.socketTCP.disconnect();

    // Emit state change
    this.events.emit(DSConnectionEvents.RobotStateChanged);
  }
}

/** The current DSConnection instance */
var DSConnectionInstance: DSConnection | null = null;

/** DSConnection instance getter */
export function getCurrentDSConnection(): DSConnection | null { return DSConnectionInstance; }

/** DSConnection instance setter */
export function setCurrentDSConnection(ds: DSConnection) { DSConnectionInstance = ds; }