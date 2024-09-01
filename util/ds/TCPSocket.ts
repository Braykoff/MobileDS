import Socket from "react-native-tcp-socket/lib/types/Socket";
import TcpSocket from 'react-native-tcp-socket';
import { JoystickName } from "@/constants/Constants";
import { Buffer } from "buffer";
import { RobotStateData } from "./RobotState";
import { CustomEventEmitter } from "../CustomEventEmitter";
import { DSEvents } from "./DSEvents";

export class TCPSocket {
  private address: string;
  private state: RobotStateData;
  private events: CustomEventEmitter;

  private socket: Socket | null = null;
  private closingSocket = false;
  private isSocketOpen = false;

  private keepAliveInterval: NodeJS.Timeout;
  private reconnectInterval: NodeJS.Timeout | null = null;

  // Outbound keep alive packet
  private outboundKeepAlivePacket = Buffer.alloc(2);

  public constructor(address: string, state: RobotStateData, events: CustomEventEmitter) {
    this.address = address;
    this.state = state;
    this.events = events;

    // Open socket
    this.initSocket();

    // Set up keep alive interval
    this.keepAliveInterval = setInterval(() => this.sendKeepAlivePacket(), 2000);
  }

  /** Inits a new connection */
  private initSocket() {
    if (this.closingSocket) { return; }

    // Open socket
    this.socket = TcpSocket.createConnection({
      host: this.address,
      port: 1740,
      //localPort: 1740,
      reuseAddress: true
    }, () => {
      // When port opens, begin sending packets
      this.isSocketOpen = true;
      this.sendJoystickPacket();
      this.sendGameSpecificMessage();
      console.log("Sending TCP packets");
      this.events.emit(DSEvents.SocketConnectionChanged, "TCPSocket.initSocket:createConnection");
    });

    // Listen for errors
    this.socket.on("error", (msg) => {
      console.log(`TCP Error: ${msg}`);
      this.socketClosed();
    });

    // Listen for socket closing
    this.socket.on("close", () => this.socketClosed());

    // Listen for data
    this.socket.on("data", (msg) => {
      // TODO handle
    });
  }

  /** Handles the socket being closed */
  private socketClosed() {
    this.isSocketOpen = false;
    this.events.emit(DSEvents.SocketConnectionChanged, "TCPSocket.socketClosed");

    // Disable
    this.state.enabled = false;
    this.events.emit(DSEvents.RobotEnabledStateChanged, "TCPSocket.socketClosed");

    if (this.reconnectInterval != null) {
      clearInterval(this.reconnectInterval);
    }

    // Attempt reconnection
    if (!this.closingSocket) {
      this.reconnectInterval = setTimeout(() => this.initSocket(), 750);
    }
  }

  /** Sends an empty packet to keep the connection alive */
  private sendKeepAlivePacket() {
    if (this.socket == null || this.closingSocket || !this.isSocketOpen) { return; }
    this.socket.write(this.outboundKeepAlivePacket);
  }

  /** Sends the joystick data packets */
  public sendJoystickPacket() {
    if (this.socket == null || this.closingSocket || !this.isSocketOpen) { return; }
    
    const buffer = Buffer.alloc(66 + JoystickName.length);
    var idx = 0;

    for (let joystickIndex = 0; joystickIndex < 6; joystickIndex++) {
      if (joystickIndex === this.state.joystickIndex) {
        // The currently used joystick
        buffer.writeUInt16BE(13 + 1 + JoystickName.length, idx); // Size, including ID
        buffer.writeUInt8(0x02, idx+2); // Tag ID (Joystick descriptor)

        buffer.writeUInt8(this.state.joystickIndex, idx+3); // Joystick index
        buffer.writeUInt8(0x01, idx+4); // Is Xbox (true)
        buffer.writeInt8(21, idx+5); // Type (21 == HID Gamepad)
        buffer.writeUInt8(JoystickName.length, idx+6); // Joystick name length
        buffer.write(JoystickName, idx+7, JoystickName.length); // Joystick name
        buffer.writeUInt8(6, idx + 7 + JoystickName.length); // Axis count (6)
        buffer.writeUInt8(0, idx + 8 + JoystickName.length); // Axis 0 type (X)
        buffer.writeUInt8(1, idx + 9 + JoystickName.length); // Axis 1 type (Y)
        buffer.writeUInt8(4, idx + 10 + JoystickName.length); // Axis 2 type (Throttle)
        buffer.writeUInt8(4, idx + 11 + JoystickName.length); // Axis 3 type (Throttle)
        buffer.writeUInt8(0, idx + 12 + JoystickName.length); // Axis 4 type (X)
        buffer.writeUInt8(1, idx + 13 + JoystickName.length); // Axis 5 type (Y)
        buffer.writeUInt8(11, idx + 14 + JoystickName.length) // Button count (11)
        buffer.writeUInt8(1, idx + 15 + JoystickName.length); // POV count (1)
        idx += 16 + JoystickName.length;
      } else {
        // Empty joystick slot
        buffer.writeUInt16BE(8, idx); // Size (including ID)
        buffer.writeUInt8(0x02, idx+2); // Tag ID
        buffer.writeUInt8(joystickIndex, idx+3); // Joystick index
        buffer.writeInt8(-1, idx+5); // Type (-1 == Unknown)
        // Is Xbox, Name length, axis count, button count, pov count all 0
        idx += 10;
      }
    }

    // Send
    this.socket.write(buffer);
  }

  /** Sends a game specific message */
  public sendGameSpecificMessage() {
    if (this.socket == null || this.closingSocket || !this.isSocketOpen) { return; }

    const buffer = Buffer.alloc(this.state.gameSpecificMessage.length + 3);
    buffer.writeUInt16BE(this.state.gameSpecificMessage.length + 1, 0); // Size, including ID
    buffer.writeUInt8(0x0e, 2); // Tag ID (Game specific message)

    buffer.write(this.state.gameSpecificMessage, 3, this.state.gameSpecificMessage.length); // Message

    // Send
    this.socket.write(buffer);
  }

  /** Gets whether the socket is currently open */
  public getIsSocketOpen() {
    return this.isSocketOpen;
  }

  /** Disconnects the socket */
  public disconnect() {
    this.closingSocket = true;

    if (this.socket != null) {
      this.socket.destroy();
    }

    clearInterval(this.keepAliveInterval);
  }
}