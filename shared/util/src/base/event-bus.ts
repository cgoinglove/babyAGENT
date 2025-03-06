export type EventsMap = Record<string, any>;
export type DefaultEventsMap = Record<string, void>;

export class EventBus<EventMap extends EventsMap = DefaultEventsMap> {
  private events = new Map<
    keyof EventMap,
    Array<(payload: any, stopEvent: () => void) => void | Promise<void>>
  >();

  on<EventName extends keyof EventMap>(
    eventName: EventName,
    listener: (
      payload: EventMap[EventName],
      stopEvent: () => void,
    ) => void | Promise<void>,
  ) {
    if (this.events.has(eventName)) {
      const listeners = this.events.get(eventName)!;
      listeners.push(listener);
    } else this.events.set(eventName, [listener]);

    return () => this.off(eventName, listener);
  }

  off<EventName extends keyof EventMap>(
    eventName: EventName,
    listener?: (...args: any[]) => any,
  ) {
    if (listener) {
      const currentEvents = this.events.get(eventName) || [];
      this.events.set(
        eventName,
        currentEvents.filter((fn) => fn !== listener),
      );
    } else {
      this.events.delete(eventName);
    }
  }

  once<EventName extends keyof EventMap>(
    eventName: EventName,
    listener: (
      payload: EventMap[EventName],
      stopEvent: () => void,
    ) => void | Promise<void>,
  ) {
    const wrapper = (args: EventMap[EventName], stopEvent: () => void) => {
      listener(args, stopEvent);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
  async emit<EventName extends keyof EventMap>(
    eventName: EventName,
    ...params: EventMap[EventName] extends void | undefined
      ? [params?: any]
      : [EventMap[EventName]]
  ) {
    const currentEvents = [...(this.events.get(eventName) || [])].reverse();
    for (let i = 0; i < currentEvents.length; i++) {
      const stopEvent = () => {
        currentEvents.splice(i + 1);
      };
      const value = currentEvents[i]!(params[0], stopEvent);
      if (value instanceof Promise) {
        await value;
      }
    }
  }
}
