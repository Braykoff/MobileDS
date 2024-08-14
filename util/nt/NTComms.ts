import { NTName } from "@/constants/Constants";
import { NTTable, NTTopic } from "./NTData";
import { decodeMulti, encode } from "@msgpack/msgpack";
import { createTypedNTTopic } from "./NTTypes";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

/** The first argument of every event will be a string describe who emitted the event, for 
 * debugging. */
export const NTConnectionEvents = {
  ConnectionStatusChanged: "connectionStatusChange",
  TableUpdated: "tableUpdated",
  TopicUpdated: "topicUpdated:" // Prefix
}

/** Gets the timestamp, in microseconds, with an added offset */
function microseconds(offset: number): number {
  return (Date.now() * 1000) + offset;
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

  private timeOffset = 0; // Time offset, in microseconds

  public readonly events = new EventEmitter();
  
  public constructor(address: string) {
    // Set addresses
    this.address = address;
    //var secureAddress = `wss://${address}:5811/nt/${NTName}`;
    this.unsecureAddress = `ws://${address}:5810/nt/${NTName}`;
    
    // Attempt connection
    this.socket = new WebSocket(this.unsecureAddress);
    this.initWSConnection();
  }

  /** Pings the socket, and sends a timestamp */
  private ping() {
    if (this.isConnected()) {
      this.socket.ping();
      this.socket.send(encode([-1, 0, 2, Math.floor(microseconds(0))]));
    }
  }

  /** Inits the callbacks for the websocket. */
  private initWSConnection() {
    // When the socket opens
    this.socket.onopen = () => {
      // Begin our periodic pinging every 2.5 seconds
      this.ping();
      this.pingIntervalId = setInterval(() => this.ping(), 2500);

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
      this.timeOffset = 0.0;
      
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
          if (this.closingSocket) { return; }
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

          if (id == -1) {
            // This is a timestamp response
            var receiveTS = msg[3] + (0.5 * (microseconds(0) - msg[3]));
            this.timeOffset = msg[1] - receiveTS;
          } else if (id in this.ntTopics) {
            // Updated value
            var topic = this.ntTopics[id];
            topic.setValue(msg[3]);
            topic.lastUpdate = msg[1];

            // Notify listeners
            this.events.emit(NTConnectionEvents.TopicUpdated + topic.fullName, "socket.onmessage:object");
          } else {
            console.log(`Received NT update for unknown id '${id}' and type ${msg[2]}`);
          }
        }
      } else if (typeof data === "string") {
        // JSON message
        data = JSON.parse(data);

        var tableUpdated = false;

        for (let msg of data) {
          if (msg["method"] === "announce") {
            // A new topic
            if (msg["params"]["pubuid"] != undefined) {
              // This is a response to a publish request
              //this.ntTopics[msg["params"]["pubuid"]].hasPublishId = true;

              if (msg["params"]["id"] != msg["params"]["pubuid"]) {
                // For some reason, the NT server will give us a new subscribe ID for this topic too
                // TODO probably should figure this one out
                this.ntTopics[msg["params"]["id"]] = this.ntTopics[msg["params"]["pubuid"]]
                console.log(`New sub id for topic ${msg["params"]["id"]} (previously ${msg["params"]["pubuid"]})`);
              }

              continue;
            }

            var id = msg["params"]["id"];

            this.ntTopics[id] = createTypedNTTopic(
              msg["params"]["name"], 
              id,
              msg["params"]["type"],
              this.rootNetworkTable
            );
            tableUpdated = true;
          } else if (msg["method"] === "unannounce") {
            // A topic was deleted
            var id = msg["params"]["id"]

            if (id in this.ntTopics) {
              var topic = this.ntTopics[id];
              delete topic.parent.topics[topic.name];
              delete this.ntTopics[id];
            }
            tableUpdated = true;
          } // properties messages are ignored
        }

        if (tableUpdated) {
          // Don't update if only a property update or publish request response
          this.events.emit(NTConnectionEvents.TableUpdated, "socket.onmessage:string");
        }
      } else {
        // Unknown message
        console.log(`Received unknown message of type: ${typeof data}`);
      }
    }
  }

  /** Checks if the WebSocket is OPEN. */
  public isConnected(): boolean {
    return (this.socket.readyState === WebSocket.OPEN && !this.closingSocket);
  }

  /** Requests a publishing id for a topic */
  public requestPublisher(topic: NTTopic) {
    if (!this.isConnected()) { return; }
    if (topic.hasPublishId) { return; }

    // Send request
    this.socket.send(JSON.stringify([{
      "method": "publish",
      "params": {
        "name": topic.fullName,
        "pubuid": topic.id,
        "type": topic.type,
        "properties": {}
    }}]));

    // Ideally, we wait for an announce message before setting this to true, but for some unknown
    // reason, the NT server doesn't always send one back for some topics.
    topic.hasPublishId = true;
  }

  /** Requests to stop publishing for a topic */
  public unRequestPublisher(topic: NTTopic) {
    if (!this.isConnected()) { return; }
    if (!topic.hasPublishId) { return; }

    // Send request
    this.socket.send(JSON.stringify([{
      "method": "unpublish",
      "params": {
        "pubuid": topic.id
      }
    }]));

    topic.hasPublishId = false;
  }

  /** Publishes a new value. */
  public publishValue(topic: NTTopic, newValue: any) {
    if (!topic.hasPublishId) return; // We can't publish

    var timestamp = Math.floor(microseconds(this.timeOffset));
    
    this.socket.send(encode([
      topic.id,
      timestamp,
      topic.typeInt,
      newValue
    ]));

    // Update on our end
    topic.setValue(newValue);
    topic.lastUpdate = timestamp;
    this.events.emit(NTConnectionEvents.TopicUpdated + topic.fullName, "publishValue")
  }

  /** Disconnect the websocket, and don't try to reconnect. */
  public disconnect() {
    this.closingSocket = true;
    this.socket.close();
    this.events.removeAllListeners();
  }
}

/** The current NTConnection instance. */
var NTConnectionInstance: NTConnection | null = null;

/** NTConnection instance getter. */
export function getCurrentNTConnection(): NTConnection | null { return NTConnectionInstance; }

/** NTConnection instance setter. */
export function setCurrentNTConnection(nt: NTConnection) { NTConnectionInstance = nt; }