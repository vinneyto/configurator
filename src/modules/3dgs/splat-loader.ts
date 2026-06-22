import { createGaussForge } from '@gaussforge/wasm';
import type { GaussForge, GaussianCloudIR } from '@gaussforge/wasm';
import type { AppModule } from '../types';

const SPLAT_MODEL_URL = '/models/img_2248-clipped.ply';

let gaussForgePromise: Promise<GaussForge> | null = null;

const getGaussForge = (): Promise<GaussForge> => {
  gaussForgePromise ??= createGaussForge();
  return gaussForgePromise;
};

const computeBounds = (positions: Float32Array) => {
  const bounds = {
    x: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] as [number, number],
    y: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] as [number, number],
    z: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] as [number, number],
  };

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];

    bounds.x[0] = Math.min(bounds.x[0], x);
    bounds.x[1] = Math.max(bounds.x[1], x);
    bounds.y[0] = Math.min(bounds.y[0], y);
    bounds.y[1] = Math.max(bounds.y[1], y);
    bounds.z[0] = Math.min(bounds.z[0], z);
    bounds.z[1] = Math.max(bounds.z[1], z);
  }

  return bounds;
};

const summarizeModel = (model: GaussianCloudIR, fileSizeBytes: number) => ({
  fileSizeBytes,
  numPoints: model.numPoints,
  shDegree: model.meta.shDegree,
  sourceFormat: model.meta.sourceFormat ?? 'ply',
  bounds: computeBounds(model.positions),
});

const loadSplatModel = async (signal: AbortSignal) => {
  const gaussForge = await getGaussForge();

  if (signal.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }

  const response = await fetch(SPLAT_MODEL_URL, { signal });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${SPLAT_MODEL_URL}: ${response.status} ${response.statusText}`
    );
  }

  const fileData = await response.arrayBuffer();

  if (signal.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }

  const result = await gaussForge.read(fileData, 'ply');
  return summarizeModel(result.data, fileData.byteLength);
};

export const createSplatLoaderModule: AppModule = (_facade) => {
  const abortController = new AbortController();

  loadSplatModel(abortController.signal)
    .then((summary) => {
      console.info('[3dgs] Loaded Gaussian splat model', summary);
    })
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error(`[3dgs] Failed to load ${SPLAT_MODEL_URL}`, error);
    });

  return () => {
    abortController.abort();
  };
};
