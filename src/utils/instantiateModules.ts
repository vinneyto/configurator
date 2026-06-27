import type { AppFacade } from '../core/facade';
import type { AppModule } from '../modules/types';

export const instantiateModules = (modules: AppModule[], facade: AppFacade): Array<() => void> =>
  modules.map((m) => m(facade));
