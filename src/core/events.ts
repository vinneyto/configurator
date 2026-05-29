import type { Group, Object3D } from 'three';

export type UpdateEvent = {
  deltaSeconds: number;
  elapsedSeconds: number;
};

export type ModelLoadedEvent = {
  rootGroup: Group;
  pivotGroup: Group;
  model: Object3D;
};

type EventMap = {
  update: UpdateEvent;
  modelLoaded: ModelLoadedEvent;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (payload: EventMap[K]) => void;

export class EventEmitter {
  private listeners: { [K in EventKey]: Set<Listener<K>> } = {
    update: new Set(),
    modelLoaded: new Set(),
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
