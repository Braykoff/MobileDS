import EventEmitter, { EmitterSubscription } from "react-native/Libraries/vendor/emitter/EventEmitter";

/** Event emitter that supports addSingleListener(...), which will only allow one listener
 * per event type.
 */
export class SingleEventEmitter extends EventEmitter {
  /**
   * Adds a listener to be invoked when events of the specified type are
   * emitted. An optional calling context may be provided. The data arguments
   * emitted will be passed to the listener function.
   * 
   * **This will remove all previous listeners with that event type**
   *
   * @param eventType - Name of the event to listen to
   * @param listener - Function to invoke when the specified event is
   *   emitted
   * @param context - Optional context object to use when invoking the
   *   listener
   */
  public addSingleListener(
    eventType: string,
    listener: (...args: any[]) => any,
    context?: any,
  ): EmitterSubscription {
    this.removeAllListeners(eventType);
    return this.addListener(eventType, listener, context);
  }
}