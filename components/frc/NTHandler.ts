import { NTName } from "@/constants/Constants";
import { Alert } from "react-native";

var socket: WebSocket;
var target = "";

/**
 * Attempts to connect to a websocket.
 * @param warningMessage If a warning message should be shown upon failure.
 * @returns If WebSocket creation was successful.
 */
function attemptWSConnection(warningMessage: boolean): boolean {
    if (target == "") return false;

    try {
        // Attempt to create socket
        socket = new WebSocket(target);
    } catch (e) {
        // Socket creation failed
        if (warningMessage) {
            Alert.alert(
                "Failed to initialize WebSocket", 
                (e instanceof Error) ? e.message : "Unknown error.");
        }
        return false;
    }

    // Socket closed
    socket.onclose = () => {

        // Attempt reconnection in 1.5 seconds
        setTimeout(() => { attemptWSConnection(false) }, 1500);
    }

    return true;
}

/**
 * Disconnects any previously connected socket, then connects to a new socket.
 * @param host The IP address or host name.
 * @returns Whether the socket could be created successfully.
 */
export function connect(host: string): boolean {
    disconnect();

    target = `ws://${host}:5810/nt/${NTName}`;

    return attemptWSConnection(true);
}

/**
 * Disconnects and closes the websocket.
 */
export function disconnect() {
    target = "";
    if (socket != undefined) socket.close();
}