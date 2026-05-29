import type { AppFacade } from '../core/facade';

export type AppModule = (facade: AppFacade) => () => void;
