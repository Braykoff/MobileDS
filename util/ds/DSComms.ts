import { CustomEventEmitter } from "../CustomEventEmitter";
import { UDPSocket } from "./UDPSocket";
import { TCPSocket } from "./TCPSocket";
import { RobotStateData } from "./RobotState";
import { DSEvents } from "./DSEvents";
import { Alert } from "react-native";
import { BatteryState, getBatteryLevelAsync, getBatteryStateAsync } from "expo-battery";

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

  /** Enables/disables the robot, checking if safe to enable first */
  public async setEnabled(enabled: boolean) {
    if (enabled === this.state.enabled) { return; }

    if (enabled) {
      // Safety check
      const batLevel = await getBatteryLevelAsync();
      const batState = await getBatteryStateAsync();

      if (!this.isConnected()) {
        // No connection
        Alert.alert(
          "Unable to enable", 
          `Please check you connection to the robot.\n(UDP connection is ` +
          `${this.socketUDP.getIsConnected() ? "good" : "bad"}, TCP connection is ` +
          `${this.socketTCP.getIsSocketOpen() ? "good" : "bad"})`
        );
        return;
      } else if (batLevel !== -1 && batLevel < 0.1 && batState !== BatteryState.CHARGING) {
        // Battery too low and not charging
        Alert.alert(
          "Unable to enable", 
          "Phone battery must be at least 10% while not charging."
        );
        return;
      } else if (batLevel !== -1 && batLevel < 0.05 && batState === BatteryState.CHARGING) {
        // Battery too low and charging
        Alert.alert(
          "Unable to enable", 
          "Phone battery must be at least 5% while charging."
        );
        return;
      }
    }

    this.state.enabled = enabled;
    this.events.emit(DSEvents.RobotEnabledStateChanged, "DSConnection.setEnabled");
  }

  /** Returns if both the UDP and TCP sockets are connected */
  public isConnected() {
    return this.socketUDP.getIsConnected() && this.socketTCP.getIsSocketOpen();
  }

  /** Disconnects and closes the sockets */
  public disconnect() {
    this.state.enabled = false; // Disable

    // Close sockets
    this.socketUDP.disconnect();
    this.socketTCP.disconnect();

    // Emit state change
    this.events.emit(DSEvents.RobotEnabledStateChanged, "DSConnection.disconnect");
    this.events.removeAllListeners();
  }
}

/** The current DSConnection instance */
var DSConnectionInstance: DSConnection | null = null;

/** DSConnection instance getter */
export function getCurrentDSConnection(): DSConnection | null { return DSConnectionInstance; }

/** DSConnection instance setter */
export function setCurrentDSConnection(ds: DSConnection) { DSConnectionInstance = ds; }