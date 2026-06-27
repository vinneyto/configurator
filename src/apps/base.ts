import type { AppFacade } from '../core/facade';
import { createFpsCounterModule } from '../modules/fps-counter';
import { createOrbitControlsModule } from '../modules/orbit-controls';
import { createToneMappingModule } from '../modules/tone-mapping';
import { createViewportResizeModule } from '../modules/viewport-resize';
import { instantiateModules } from '../utils/instantiateModules';

export const base = (facade: AppFacade) =>
  instantiateModules(
    [
      createViewportResizeModule,
      createOrbitControlsModule,
      createFpsCounterModule,
      createToneMappingModule,
    ],
    facade
  );
