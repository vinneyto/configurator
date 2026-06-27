import type { AppFacade } from '../core/facade';
import { createBasicLightingModule } from '../modules/basic-lighting';
import { createFpsCounterModule } from '../modules/fps-counter';
import { createModelCenteringModule } from '../modules/model-centering';
import { createModelLoaderModule } from '../modules/model-loader';
import { createModelLoadingSpinnerModule } from '../modules/model-loading-spinner';
import { createModelParserModule } from '../modules/model-parser';
import { createModelZFightFixModule } from '../modules/model-zfight-fix';
import { createObjectPickDebugModule } from '../modules/object-pick-debug';
import { createOrbitControlsModule } from '../modules/orbit-controls';
import { createSceneRelaxationModule } from '../modules/scene-relaxation';
import { createSplitPassModule } from '../modules/split-pass';
import { createSsaoPassModule } from '../modules/ssao-pass';
import { createSsgiPassModule } from '../modules/ssgi-pass';
import { createSsrPassModule } from '../modules/ssr-pass';
import { createTaaPassModule } from '../modules/taa-pass';
import { createToneMappingModule } from '../modules/tone-mapping';
import type { AppModule } from '../modules/types';
import { createViewportResizeModule } from '../modules/viewport-resize';
import { instantiateModules } from '../utils/instantiateModules';

export const bathroom = (facade: AppFacade) => {
  const baseModules: AppModule[] = [
    createViewportResizeModule,
    createOrbitControlsModule,
    createFpsCounterModule,
    createToneMappingModule,
  ];

  const sceneModules: AppModule[] = [
    createSceneRelaxationModule,
    createModelLoadingSpinnerModule,
    createModelLoaderModule,
    createModelParserModule,
    createModelCenteringModule,
    createModelZFightFixModule,
    createObjectPickDebugModule,
    createBasicLightingModule,
    // createIBLLightingModule,
  ];

  const postprocessingModules: AppModule[] = [
    createSsgiPassModule,
    createSsaoPassModule,
    createSsrPassModule,
    createTaaPassModule,
    createSplitPassModule,
  ];

  const baseTeardowns = instantiateModules(baseModules, facade);
  const sceneTeardowns = instantiateModules(sceneModules, facade);
  const postprocessingTeardowns = instantiateModules(postprocessingModules, facade);

  return () => {
    [...postprocessingTeardowns].reverse().forEach((teardown) => teardown());
    [...sceneTeardowns].reverse().forEach((teardown) => teardown());
    [...baseTeardowns].reverse().forEach((teardown) => teardown());
  };
};
