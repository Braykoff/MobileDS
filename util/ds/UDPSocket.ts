import UdpSocket from "react-native-udp/lib/types/UdpSocket";
import dgram from 'react-native-udp';
import { DSConnection, DSConnectionEvents } from "./DSComms";

/** Manages the DriverStation's UDP socket */
export class UDPSocket {
  private comms: DSConnection;

  private socket: UdpSocket;
  private closingSocket = false;
  private isSendingPackets = false;

  private packetTimeout: NodeJS.Timeout | undefined = undefined;

  // Outbound buffer views and buffers
  private outboundBufferArray = new ArrayBuffer(6);
  private outboundIntBuffer = new Uint8Array(this.outboundBufferArray);
  private outboundSeqNumberDV = new DataView(this.outboundBufferArray, 0, 2); // 2 byte sequence number

  private outboundPacketSequenceNumber = 0;

  public constructor(comms: DSConnection) {
    this.comms = comms;

    // Init outbound packet
    this.outboundIntBuffer[2] = 0x01; // Comm Version is static

    // Open socket
    this.socket = dgram.createSocket({type: "udp4", debug: false});

    // Once listening, start sending packets
    this.socket.once("listening", () => {
      this.packetTimeout = setTimeout(() => this.sendPacket(), 20);
      this.isSendingPackets = true;
      this.comms.events.emit(DSConnectionEvents.UDPSocketConnectionStatusChanged);
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
  private sendPacket() {
    if (this.closingSocket) { return; }

    this.outboundSeqNumberDV.setUint16(0, this.outboundPacketSequenceNumber, false);

    this.socket.send(
      this.outboundIntBuffer,
      undefined,
      undefined,
      1110,
      this.comms.address,
      undefined
    );

    this.outboundPacketSequenceNumber += 1;
    this.packetTimeout = setTimeout(() => this.sendPacket(), 20); // Kick off next packet
  }

  private handlePacket(msg: any) {
    // TODO
  }

  /** Gets whether packets have begun to be sent. */
  public getIsSendingPackets(): boolean {
    return this.isSendingPackets;
  }

  /* Disconnects and closes the socket. */
  public disconnect() {
    // Cancel interval
    clearInterval(this.packetTimeout);

    this.sendPacket(); // Will flush most recent packet (usually a disable packet)

    this.closingSocket = true;
    this.isSendingPackets = false;
    this.socket.close();
    this.comms.events.emit(DSConnectionEvents.UDPSocketConnectionStatusChanged);
  }
}