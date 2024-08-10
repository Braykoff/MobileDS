import { NTName } from "@/constants/Constants";
import { Alert } from "react-native";
import { NTTable } from "./NTData";

class NTConnection {
    private unsecureAddress: string;
    
    private socket: WebSocket;
    private closingSocket = false; // If we don't want the socket to try and reconnect
    private pingIntervalId: NodeJS.Timeout | null = null; // Interval ID of the ping interval

    /** The root NetworkTable */
    public rootNetworkTable = new NTTable(null, "NetworkTables");

    public constructor(address: string) {
        // Set addresses
        var secureAddress = `wss://${address}:5811/nt/${NTName}`;
        this.unsecureAddress = `ws://${address}:5810/nt/${NTName}`;

        // Attempt connection
        this.socket = new WebSocket(secureAddress);
        this.initWSConnection();
    }

    /** Creates a new unsecure websocket and inits the connection. */
    private buildWebSocket = (): void => {
        this.socket = new WebSocket(this.unsecureAddress);
        this.initWSConnection();
    }

    /** Pings the server, and sends a timestamp request. */
    private pingWebSocket = (): void => {
        if (this.connected()) {
            this.socket.ping();
            this.socket.send("null"); // TODO timestamp
        }
    }

    /** Inits the callbacks for the websocket. */
    private initWSConnection() {
        this.socket.onopen = () => {
            // Begin our periodic pinging every 2.5 seconds
            this.pingIntervalId = setInterval(this.pingWebSocket, 2500);
        };

        this.socket.onclose = () => {
            // Clean up cache
            this.rootNetworkTable = new NTTable(null, "NetworkTables");

            // Stop ping interval
            if (this.pingIntervalId != null) {
                clearInterval(this.pingIntervalId);
                this.pingIntervalId = null;
            }

            if (!this.closingSocket) {
                // Attempt to reconnect in 2.5 seconds
                setTimeout(this.buildWebSocket, 2500);
            }
        }
    }

    /** Returns if the websocket is connected or not. */
    public connected(): boolean {
        return (this.socket.readyState == WebSocket.OPEN);
    }

    /** Disconnect the websocket, and don't try to reconnect. */
    public disconnect() {
        this.closingSocket = true;
        this.socket.close();
    }
}