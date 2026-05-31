import mitt, { type Emitter } from 'mitt';

export type UpdateEvent = {
  deltaSeconds: number;
  elapsedSeconds: number;
};

export type LoadModelEvent = {
  buffer: ArrayBuffer;
};

export type ModelAddedEvent = {
  at: number;
};

export type EventMap = {
  update: UpdateEvent;
  loadModel: LoadModelEvent;
  modelAdded: ModelAddedEvent;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (payload: EventMap[K]) => void;

export type EventBus = {
  on<K extends EventKey>(event: K, listener: Listener<K>): () => void;
  emit<K extends EventKey>(event: K, payload: EventMap[K]): void;
};

export function createEventBus(): EventBus {
  const emitter: Emitter<EventMap> = mitt<EventMap>();

  return {
    on<K extends EventKey>(event: K, listener: Listener<K>) {
      emitter.on(event, listener);

      return () => {
        emitter.off(event, listener);
      };
    },

    emit<K extends EventKey>(event: K, payload: EventMap[K]) {
      emitter.emit(event, payload);
    },
  };
}
