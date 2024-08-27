import Socket from "react-native-tcp-socket/lib/types/Socket";
import { DSConnection, DSConnectionEvents } from "./DSComms";
import TcpSocket from 'react-native-tcp-socket';

export class TCPSocket {
  private comms: DSConnection;

  private socket: Socket | null = null;
  private closingSocket = false;
  private isSocketOpen = false;

  private reconnectInterval: NodeJS.Timeout | null = null;

  public constructor(comms: DSConnection) {
    this.comms = comms;

    // Open socket
    this.initSocket();
  }

  /** Inits a new connection */
  private initSocket() {
    if (this.closingSocket) { return; }

    // Open socket
    this.socket = TcpSocket.createConnection({
      host: this.comms.address,
      port: 1740,
      localPort: 1740,
      reuseAddress: true
    }, () => {
      // When port opens, begin sending packets
      this.isSocketOpen = true;
      this.sendJoystickPacket();
      this.comms.events.emit(DSConnectionEvents.TCPSocketConnectionStatusChanged);
    });

    // Listen for errors
    this.socket.on("error", (msg) => {
      console.log(`TCP Error: ${msg}`);
    });

    // Listen for socket closing
    this.socket.on("close", () => {
      this.comms.events.emit(DSConnectionEvents.TCPSocketConnectionStatusChanged);
      
      if (this.reconnectInterval != null) {
        clearInterval(this.reconnectInterval);
      }

      // Attempt reconnection
      if (!this.closingSocket) {
        this.reconnectInterval = setTimeout(() => this.initSocket, 500);
      }
    });

    // Listen for data
    this.socket.on("data", (msg) => {
      // TODO handle
    });
  }

  /** Sends the joystick data packet */
  public sendJoystickPacket() {
    if (this.closingSocket) { return; }
  }

  /** Sends a game specific message */
  public sendGameSpecificMessage(msg: string) {
    if (this.closingSocket) { return; }
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
  }
}