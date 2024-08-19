import EventEmitter, { EmitterSubscription } from "react-native/Libraries/vendor/emitter/EventEmitter";

/** Will print out subscription count every second. */
const EventEmitterDebugMode = true;

export interface CustomEmitterSubscription {
  remove(): void;
}

export type OptionalCustomEmitterSubscription = (CustomEmitterSubscription | null);

export class CustomEventEmitter {
  private emitter = new EventEmitter();
  private listeners = new Set<EmitterSubscription>();

  constructor(name: string) {
    if (EventEmitterDebugMode) {
      setInterval(() => {
        console.log(`CustomEventEmitter '${name}' has ${this.getTotalSubCount()} subscriptions`);
      }, 1500);
    }
  }

  public emit(eventType: string, ...params: any[]) {
    this.emitter.emit(eventType, params);
  }

  public addListener(eventType: string, listener: (...args: any[]) => any): CustomEmitterSubscription {
    const sub = this.emitter.addListener(eventType, listener);
    this.listeners.add(sub);

    return {
      remove: () => {
        sub.remove();
        this.listeners.delete(sub);
      }
    }
  }

  public removeAllListeners() {
    this.emitter.removeAllListeners();
    this.listeners.clear();
  }

  public getTotalSubCount(): number {
    return this.listeners.size;
  }
}
