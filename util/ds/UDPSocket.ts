import UdpSocket from "react-native-udp/lib/types/UdpSocket";
import dgram from 'react-native-udp';
import { Buffer } from "buffer";
import { RobotStateData } from "./RobotState";
import { CustomEventEmitter } from "../CustomEventEmitter";
import { DSEvents } from "./DSEvents";

/** Converts a -1 to 1 axis value to a -128 to 127 single byte. */
function axisValueToByte(axisValue: number) {
  return Math.trunc((axisValue < 0) ? axisValue * 128 : axisValue * 127);
}

/** Manages the DriverStation's UDP socket */
export class UDPSocket {
  private address: string;
  private state: RobotStateData;
  private events: CustomEventEmitter;

  private socket: UdpSocket;
  private reconnectTimeout: NodeJS.Timeout | undefined = undefined;
  private closingSocket = false;
  private isSocketConnected = false;

  private packetsLost = 0;
  private lastReceivedPacketSequence = -1;
  private lastReceivedPacketTimestamp = -1;

  private packetTimeout: NodeJS.Timeout | undefined = undefined;

  // Outbound data
  private outboundBuffer = Buffer.alloc(46); // 6 joystick tags
  private outboundPacketSequenceNumber = 0;
  private outboundPacketJoystickOffset = 0; // Byte offset of joystick tag

  public constructor(address: string, state: RobotStateData, events: CustomEventEmitter) {
    this.address = address;
    this.state = state;
    this.events = events;

    // Init static fields of outbound packet (setup mimics XBox Controller for code compatibility)
    this.outboundBuffer.writeUInt8(0x01, 2); // Comm version
    this.reformatUDPPacketTags();
    
    // Open socket
    this.socket = dgram.createSocket({type: "udp4", debug: false});
    this.socket.setMaxListeners(3);

    // Once listening, start sending packets
    this.socket.once("listening", () => {
      this.packetTimeout = setTimeout(() => this.sendPacket(), 20);
      this.isSocketConnected = true;
      this.events.emit(DSEvents.SocketConnectionChanged, "UDPSocket:listening");
      console.log("Sending UDP packets");
    });

    // Error listener
    this.socket.on("error", (err) => {
      console.log(`UDP Error: ${err}`);
      this.isSocketConnected = false;
      this.reconnectTimeout = setTimeout(() => this.bind(), 500);
    });

    // Handle inbound messages
    this.socket.on("message", (msg,) => this.handlePacket(msg));

    // Bind to socket
    this.bind();
  }

  /** Binds the socket */
  private bind() {
    if (this.closingSocket || this.isSocketConnected) { return; }
    this.socket.bind(1150);
  }

  /** Updates the UDP packet so the joystick is at the correct index */
  public reformatUDPPacketTags() {
    var idx = 6; // First packet of tag

    for (let joystickIndex = 0; joystickIndex < 6; joystickIndex++) {
      if (joystickIndex === this.state.joystickIndex) {
        // Joystick mimics Xbox controller for code compatibility
        this.outboundPacketJoystickOffset = idx;
        this.outboundBuffer.writeUInt8(13 + 1, idx); // Joystick tag size (with ID)
        this.outboundBuffer.writeUInt8(0x0c, idx+1); // Joystick tag ID
        this.outboundBuffer.writeUInt8(6, idx+2); // Number of axes
        this.outboundBuffer.writeUInt8(11, idx+9); // Number of buttons
        this.outboundBuffer.writeUInt8(0, idx+10); // First byte of buttons (never written to again)
        this.outboundBuffer.writeUInt8(1, idx+12); // Number of POVs
        this.outboundBuffer.writeInt16BE(-1, idx+13); // POV 0 value (-1 = unpressed)
        idx += 15;
      } else {
        // Empty joystick
        this.outboundBuffer.writeUInt8(4, idx); // Joystick tag size (with ID)
        this.outboundBuffer.writeUInt8(0x0c, idx+1); // Joystick tag ID
        this.outboundBuffer.writeUInt8(0, idx+2); // Number of axes
        this.outboundBuffer.writeUInt8(0, idx+3); // Number of buttons
        this.outboundBuffer.writeUInt8(0, idx+4); // Number of POVs
        idx += 5;
      }
    }
  }

  /** Sends a single UDP packet */
  private sendPacket(startNextPacket: boolean = true) {
    if (this.closingSocket) { return; }

    // Set sequence number field (2 bytes)
    this.outboundBuffer.writeUInt16BE(this.outboundPacketSequenceNumber, 0);

    // Set control field (1 byte)
    this.outboundBuffer.writeUInt8((Number(this.state.estop) << 7) | (Number(this.state.enabled) << 2) | (this.state.mode), 3);

    // Set request field (1 byte)
    this.outboundBuffer.writeUInt8((Number(this.state.requestRoboRIOReboot) << 3) | (Number(this.state.requestCodeRestart) << 2), 4);

    // Set alliance field (1 byte)
    this.outboundBuffer.writeUInt8(this.state.dsPosition, 5);

    // Set joystick data (mimics Xbox Controller, triggers are axes)
    this.outboundBuffer.writeInt8(this.state.leftTrigger ? 127 : 0, this.outboundPacketJoystickOffset + 5); // Left trigger axis
    this.outboundBuffer.writeInt8(this.state.rightTrigger ? 127 : 0, this.outboundPacketJoystickOffset + 6); // Right trigger axis
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.leftJoystickX), this.outboundPacketJoystickOffset + 3); // Left stick X
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.leftJoystickY), this.outboundPacketJoystickOffset + 4); // Left stick Y
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.rightJoystickX), this.outboundPacketJoystickOffset + 7); // Right stick X
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.rightJoystickY), this.outboundPacketJoystickOffset + 8); // Right stick Y

    this.outboundBuffer.writeUInt8(
      (Number(this.state.aButton) << 1) |
      (Number(this.state.bButton) << 2) |
      (Number(this.state.xButton) << 3) |
      (Number(this.state.yButton) << 4),
      this.outboundPacketJoystickOffset + 11
    );

    this.socket.send(
      this.outboundBuffer,
      undefined,
      undefined,
      1110,
      this.address,
      undefined
    );

    this.outboundPacketSequenceNumber += 1;
    this.state.requestRoboRIOReboot = false;
    this.state.requestCodeRestart = false;

    if (this.isSocketConnected && Date.now() - this.lastReceivedPacketTimestamp > 500) {
      // .5 seconds without a response, the robot may be disconnected
      this.isSocketConnected = false;
      this.events.emit(DSEvents.SocketConnectionChanged, "UDPSocket.sendPacket:timeout");

      // Disable
      this.state.enabled = false;
      this.events.emit(DSEvents.RobotEnabledStateChanged, "UDPSocket.sendPacket:timeout");
    }

    if (startNextPacket) {
      this.packetTimeout = setTimeout(() => this.sendPacket(), 20); // Kick off next packet
    }
  }

  private handlePacket(msg: Buffer) {
    // Get sequence number
    const seq = msg.readUInt16BE(0);

    if (seq <= this.lastReceivedPacketSequence) { return; }

    this.packetsLost += (seq - this.lastReceivedPacketSequence - 1);
    this.lastReceivedPacketSequence = seq;

    // Get status field
    this.state.estop = (((msg.readUInt8(2) >> 7) & 0x01) === 0x01);
    this.state.codeRunning = ((msg.readUInt8(2) >> 3) & 0x01) !== 0x01;

    // Get battery
    this.state.batteryVoltage = msg.readUInt8(5) + (msg.readUInt8(6) / 256.0);

    // TODO rest of RoboRio's tags

    // Keep track of inbound packets
    this.lastReceivedPacketTimestamp = Date.now();
    
    if (!this.isSocketConnected) {
      this.isSocketConnected = true;
      this.events.emit(DSEvents.SocketConnectionChanged, "UDPSocket.handlePacket");
    }
  }

  /** Gets whether packets are successfully being sent and received. */
  public getIsConnected(): boolean {
    return this.isSocketConnected;
  }

  /** Returns the percentage of packets from the RoboRIO that were lost */
  public getPacketLoss(): number {
    if (this.lastReceivedPacketSequence === -1) { return 0.0; }
    return this.packetsLost / (this.lastReceivedPacketSequence + 1) * 100;
  }

  /* Disconnects and closes the socket. */
  public disconnect() {
    // Cancel interval
    clearInterval(this.packetTimeout);
    clearInterval(this.reconnectTimeout);

    this.sendPacket(false); // Will flush most recent packet (usually a disable packet)

    this.closingSocket = true;
    this.isSocketConnected = false;
    this.socket.close();
    this.events.emit(DSEvents.SocketConnectionChanged, "UDPSocket.disconnect");
  }
}
