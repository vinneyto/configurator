import type { AppModule } from '../types';
import { createGaussForge } from '@gaussforge/wasm';

const SPLAT_MODEL_URL = '/models/img_2248.ply';

export const createSplatLoader: AppModule = (facade) => {
  const load = async () => {
    const gaussForge = await createGaussForge();
    const response = await fetch(SPLAT_MODEL_URL);
    const data = await response.arrayBuffer();
    const model = await gaussForge.read(data, 'ply');

    console.log(model);
  };

  load();

  return () => {};
};
