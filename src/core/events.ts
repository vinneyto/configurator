import mitt, { type Emitter } from 'mitt';

export type UpdateEvent = {
  deltaSeconds: number;
  elapsedSeconds: number;
};

export type LoadModelEvent = {
  buffer: ArrayBuffer;
};

export type CameraParams = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  target: {
    x: number;
    y: number;
    z: number;
  };
};

export type ModelAddedEvent = {
  at: number;
  camera: CameraParams;
};

export type RendererInitializedEvent = {
  at: number;
};

export type RendererResizedEvent = {
  width: number;
  height: number;
};

export type SceneRelaxationChangedEvent = {
  relaxed: boolean;
};

export type OrbitInteractionChangedEvent = {
  active: boolean;
};

export type EventMap = {
  update: UpdateEvent;
  loadModel: LoadModelEvent;
  modelAdded: ModelAddedEvent;
  rendererInitialized: RendererInitializedEvent;
  rendererResized: RendererResizedEvent;
  sceneRelaxationChanged: SceneRelaxationChangedEvent;
  orbitInteractionChanged: OrbitInteractionChangedEvent;
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
