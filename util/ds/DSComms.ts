import { CustomEventEmitter } from "../CustomEventEmitter";
import { UDPSocket } from "./UDPSocket";
import { TCPSocket } from "./TCPSocket";
import { RobotStateData } from "./RobotState";
import { DSEvents } from "./DSEvents";

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
    this.socketUDP = new UDPSocket(this.address, this.state, this.events);
    this.socketTCP = new TCPSocket(this.address, this.state, this.events);
  }

  /** Returns if both the UDP and TCP sockets are connected */
  public isConnected() {
    return this.socketUDP.getIsSendingPackets() && this.socketTCP.getIsSocketOpen();
  }

  /** Disconnects and closes the sockets */
  public disconnect() {
    this.state.enabled = false; // Disable

    // Close sockets
    this.socketUDP.disconnect();
    this.socketTCP.disconnect();

    // Emit state change
    this.events.emit(DSEvents.RobotStateChanged);
    this.events.removeAllListeners();
  }
}

/** The current DSConnection instance */
var DSConnectionInstance: DSConnection | null = null;

/** DSConnection instance getter */
export function getCurrentDSConnection(): DSConnection | null { return DSConnectionInstance; }

/** DSConnection instance setter */
export function setCurrentDSConnection(ds: DSConnection) { DSConnectionInstance = ds; }