export type UpdateEvent = {
  deltaSeconds: number;
  elapsedSeconds: number;
};

type EventMap = {
  update: UpdateEvent;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (payload: EventMap[K]) => void;

export class EventEmitter {
  private listeners: { [K in EventKey]: Set<Listener<K>> } = {
    update: new Set(),
  };

  on<K extends EventKey>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener);

    return () => {
      this.listeners[event].delete(listener);
    };
  }

  emit<K extends EventKey>(event: K, payload: EventMap[K]): void {
    this.listeners[event].forEach((listener) => {
      listener(payload);
    });
  }
}
