import { NTName } from "@/constants/Constants";
import { NTTable, NTTopic } from "./NTData";
import { decodeMulti } from "@msgpack/msgpack";
import { createTypedNTTopic } from "./NTTypes";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

/** The first argument of every event will be a string describe who emitted the event, for 
 * debugging. */
export const NTConnectionEvents = {
  ConnectionStatusChanged: "connectionStatusChange",
  TableUpdated: "tableUpdated"
}

export class NTConnection {
  private socket: WebSocket;
  public readonly address: string;
  private readonly unsecureAddress: string;
  private closingSocket = false; // If we don't want the socket to try and reconnect
  private pingIntervalId: NodeJS.Timeout | null = null; // Interval ID of the ping interval
  private reconnectIntervalID: NodeJS.Timeout | null = null; // Interval ID of the reconnect timeout
  
  /** The root NetworkTable */
  public rootNetworkTable = new NTTable(null, "NetworkTables");
  private ntTopics: { [ topicId: number ]: NTTopic } = {}; // Maps subscribe ids to NTTopics

  public readonly events = new EventEmitter();
  
  public constructor(address: string) {
    // Set addresses
    this.address = address;
    var secureAddress = `wss://${address}:5811/nt/${NTName}`;
    this.unsecureAddress = `ws://${address}:5810/nt/${NTName}`;
    
    // Attempt connection
    this.socket = new WebSocket(secureAddress);
    this.initWSConnection();
  }

  /** Inits the callbacks for the websocket. */
  private initWSConnection() {
    // When the socket opens
    this.socket.onopen = () => {
      // Begin our periodic pinging every 2.5 seconds
      this.pingIntervalId = setInterval(() => {
        if (this.isConnected()) {
          this.socket.ping();
          //this.socket.send("null"); // TODO timestamp
        }
      }, 2500);

      // Subscribe to every topic
      this.socket.send(JSON.stringify([{
        "method": "subscribe",
        "params": {
          "topics": [""],
          "subuid": 0, // Used to unsubscribe
          "options": {"prefix": true}
        }
      }]));

     this.events.emit(NTConnectionEvents.ConnectionStatusChanged, "socket.onopen");
    };
    
    // When the socket closes
    this.socket.onclose = () => {
      this.events.emit(NTConnectionEvents.ConnectionStatusChanged, "socket.onclose");

      // Clean up cache
      this.rootNetworkTable = new NTTable(null, "NetworkTables");
      this.ntTopics = {};
      
      // Stop intervals
      if (this.pingIntervalId != null) {
        clearInterval(this.pingIntervalId);
        this.pingIntervalId = null;
      }
      
      if (this.reconnectIntervalID != null) {
        clearInterval(this.reconnectIntervalID);
        this.reconnectIntervalID = null;
      }

      this.events.emit(NTConnectionEvents.TableUpdated, "socket.onclose");
      
      // Handle reconnect
      if (!this.closingSocket) {
        // Attempt to reconnect in 2.5 seconds
        this.reconnectIntervalID = setTimeout(() => {
          this.socket = new WebSocket(this.unsecureAddress);
          this.initWSConnection();
        }, 2500);

        console.log("Socket closed unexpectedly, attempting reconnection soon...");
      }
    }

    // When the socket receives a message
    this.socket.onmessage = (msg) => {
      var data = msg.data;

      if (typeof data === "object") {
        // MessagePack message
        data = decodeMulti(data);
        
        for (let msg of data) {
          var id = msg[0];

          if (id in this.ntTopics && this.ntTopics[id].verifyType(msg[2])) {
            this.ntTopics[id].setValue(msg[3]);
            this.ntTopics[id].lastUpdate = msg[1];
          } else {
            console.log(`Received NT update for unknown id '${id}' and type ${msg[2]}`);
          }
        }

        //this.events.emit(NTConnectionEvents.TableUpdated, "socket.onmessage:object");
      } else if (typeof data === "string") {
        // JSON message
        data = JSON.parse(data);

        for (let msg of data) {
          if (msg["method"] === "announce") {
            // A new topic
            var id = msg["params"]["id"];

            if (id in this.ntTopics) {
              // This topic has already been announced 
              // (this is probably a response to a publish request)
              continue;
            }

            this.ntTopics[id] = createTypedNTTopic(
              msg["params"]["name"], 
              id,
              msg["params"]["type"],
              this.rootNetworkTable
            );
          } else if (msg["method"] === "unannounce") {
            // A topic was deleted
            var id = msg["params"]["id"]

            if (id in this.ntTopics) {
              var topic = this.ntTopics[id];
              delete topic.parent.topics[topic.name];
              delete this.ntTopics[id];
            }
          } // properties messages are ignored
        }

        this.events.emit(NTConnectionEvents.TableUpdated, "socket.onmessage:string");
      } else {
        // Unknown message
        console.log(`Received unknown message of type: ${typeof data}`);
      }
    }
  }

  /** Checks if the WebSocket is OPEN. */
  public isConnected(): boolean {
    return (this.socket.readyState === WebSocket.OPEN);
  }

  /** Disconnect the websocket, and don't try to reconnect. */
  public disconnect() {
    this.closingSocket = true;
    this.socket.close();
  }
}

/** The current NTConnection instance. */
var NTConnectionInstance: NTConnection | null = null;

/** NTConnection instance getter. */
export function getCurrentNTConnection(): NTConnection | null { return NTConnectionInstance; }

/** NTConnection instance setter. */
export function setCurrentNTConnection(nt: NTConnection) { NTConnectionInstance = nt; }