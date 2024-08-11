import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

/** The EventEmitter shared throughout the entire app */
export const GlobalEventEmitter = new EventEmitter();

export const events = {
  /** When the NT WebSocket's connection status changes (opened or closed). */
  onNTConnectionStatusChanged: "ntConnectionStatusChanged"
}