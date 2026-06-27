import type { AppFacade } from '../core/facade';
import { base } from './base';

export const splats = (facade: AppFacade) => {
  const baseTeardowns = base(facade);

  return () => {
    [...baseTeardowns].reverse().forEach((teardown) => teardown());
  };
};
