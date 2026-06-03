import type { AppFacade } from '../core/facade';
import type { ViewportContext } from '../core/viewport';

export type AppModule = (facade: AppFacade) => () => void;
export type ViewportModule = (facade: AppFacade, viewport: ViewportContext) => () => void;
