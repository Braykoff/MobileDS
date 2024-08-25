import { CustomEventEmitter } from "../CustomEventEmitter";
import dgram from 'react-native-udp'
import UdpSocket from "react-native-udp/lib/types/UdpSocket";
import TcpSocket from 'react-native-tcp-socket';
import { createSingleUDPTimestampPacket } from "./UDPPackets";
import Socket from "react-native-tcp-socket/lib/types/Socket";

export class DSConnection {
  private address: string
  private socketUDP: UdpSocket;
  private socketTCP: Socket;
  private open = true;

  private outboundUDPBuffer = new Uint8Array(6); // Packet + Joystick (2 axes, 6 buttons)
  private outboundUDPSequenceNumber = 0;

  private udpPacketInterval: NodeJS.Timeout | null = null;
  private tcpPacketInterval: NodeJS.Timeout | null = null;

  public readonly events: CustomEventEmitter;

  public constructor(address: string) {
    // Create emitter
    this.events = new CustomEventEmitter(`DS (${address})`);

    // Open UDP connection
    this.address = address;
    this.socketUDP = dgram.createSocket({type: "udp4", debug: false});

    // When listening starts, begin sending out packets
    this.socketUDP.once("listening", () => {
      this.udpPacketInterval = setInterval(() => this.sendUDPPacket(), 20);
      console.log("Sending UDP packets");
    });

    this.socketUDP.on("error", (err) => {
      console.log(`Error: ${err}`);
    })

    this.socketUDP.on("message", (msg, info) => {
      console.log("--");
      console.log(msg);
      console.log(info);
    });

    this.socketUDP.bind(1150);
    
    // Open TCP client connection
    this.socketTCP = TcpSocket.createConnection({
      host: address,
      port: 1740
    }, () => {
      // When port opens, begin sending out packets
      this.tcpPacketInterval = setInterval(() => this.sendTCPPacket(), 20);
      console.log("Sending TCP packets");
    });

    this.socketTCP.on("data", function(msg) {
      console.log("--tcp");
      console.log(msg);
    });

    this.socketTCP.on("error", (err) => {
      console.log(`tcp error: ${err}`);
    });
  }

  /** Sends a single UDP packet */
  private sendUDPPacket() {
    if (!this.open) { return; }

    this.socketUDP.send(
      (this.outboundUDPSequenceNumber >= 0) ? createSingleUDPTimestampPacket() : this.outboundUDPBuffer, 
      undefined, 
      undefined, 
      1110, 
      this.address, 
      undefined
    );

    this.outboundUDPSequenceNumber += 1;
  }

  /** Sends a single TCP packet */
  private sendTCPPacket() {
    if (!this.open) {
      
    }
  }

  /** Disconnects and closes the sockets */
  public disconnect() {
    this.open = false;

    // Clean up intervals
    if (this.tcpPacketInterval != null) {
      clearInterval(this.tcpPacketInterval);
      this.tcpPacketInterval = null;
    }

    if (this.udpPacketInterval != null) {
      clearInterval(this.udpPacketInterval);
      this.udpPacketInterval = null;
    }

    // Close sockets
    this.socketUDP.close();
    this.socketTCP.destroy();
  }
}

/** The current DSConnection instance */
var DSConnectionInstance: DSConnection | null = null;

/** DSConnection instance getter */
export function getCurrentDSConnection(): DSConnection | null { return DSConnectionInstance; }

/** DSConnection instance setter */
export function setCurrentDSConnection(ds: DSConnection) { DSConnectionInstance = ds; }