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
  private closingSocket = false;
  private isSendingPackets = false;

  private packetsLost = 0;
  private lastReceivedPacketSequence = -1;

  private packetTimeout: NodeJS.Timeout | undefined = undefined;

  // Outbound data
  private outboundBuffer = Buffer.alloc(21);
  private outboundPacketSequenceNumber = 0;

  public constructor(address: string, state: RobotStateData, events: CustomEventEmitter) {
    this.address = address;
    this.state = state;
    this.events = events;

    // Init static fields of outbound packet (setup mimics XBox Controller for code compatibility)
    this.outboundBuffer.writeUInt8(0x01, 2); // Comm version
    this.outboundBuffer.writeUInt8(13 + 1, 6); // Joystick tag size (with ID)
    this.outboundBuffer.writeUInt8(0x0c, 7); // Joystick tag ID
    this.outboundBuffer.writeUInt8(6, 8); // Number of axes
    this.outboundBuffer.writeUInt8(11, 15); // Number of buttons
    this.outboundBuffer.writeUInt8(1, 18); // Number of POVs

    this.outboundBuffer.writeInt16BE(-1, 19); // POV 0 value (-1 = unpressed)
    
    // Open socket
    this.socket = dgram.createSocket({type: "udp4", debug: false});

    // Once listening, start sending packets
    this.socket.once("listening", () => {
      this.packetTimeout = setTimeout(() => this.sendPacket(), 20);
      this.isSendingPackets = true;
      this.events.emit(DSEvents.SocketConnectionChanged);
      console.log("Sending UDP packets");
    });

    // Error listener
    this.socket.on("error", (err) => {
      console.log(`UDP Error: ${err}`);
    });

    // Handle inbound messages
    this.socket.on("message", (msg,) => this.handlePacket(msg));

    // Bind to socket
    this.socket.bind(1150);
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
    this.outboundBuffer.writeInt8(this.state.leftTrigger ? 127 : 0, 11); // Left trigger axis
    this.outboundBuffer.writeInt8(this.state.rightTrigger ? 127 : 0, 12); // Right trigger axis
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.leftJoystickX), 9); // Left stick X
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.leftJoystickY), 10); // Left stick Y
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.rightJoystickX), 13); // Right stick X
    this.outboundBuffer.writeInt8(axisValueToByte(this.state.rightJoystickY), 14); // Right stick Y

    this.outboundBuffer.writeUInt8(
      (Number(this.state.aButton) << 1) |
      (Number(this.state.bButton) << 2) |
      (Number(this.state.xButton) << 3) |
      (Number(this.state.yButton) << 4),
      17
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
    this.state.batteryVoltage = msg.readUInt8(5) + (msg.readUInt8(6) / 256);

    // TODO rest of RoboRio's tags
    console.log(`Received message ${seq}`);
  }

  /** Gets whether packets have begun to be sent. */
  public getIsSendingPackets(): boolean {
    return this.isSendingPackets;
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

    this.sendPacket(false); // Will flush most recent packet (usually a disable packet)

    this.closingSocket = true;
    this.isSendingPackets = false;
    this.socket.close();
    this.events.emit(DSEvents.SocketConnectionChanged);
  }
}
