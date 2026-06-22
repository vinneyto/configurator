import { createBasicLightingModule } from './modules/basic-lighting';
import { createFpsCounterModule } from './modules/fps-counter';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelLoaderModule } from './modules/model-loader';
import { createModelLoadingSpinnerModule } from './modules/model-loading-spinner';
import { createModelParserModule } from './modules/model-parser';
import { createModelZFightFixModule } from './modules/model-zfight-fix';
import { createObjectPickDebugModule } from './modules/object-pick-debug';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createSceneRelaxationModule } from './modules/scene-relaxation';
import { createSplitPassModule } from './modules/split-pass';
import { createSsaoPassModule } from './modules/ssao-pass';
import { createSsgiPassModule } from './modules/ssgi-pass';
import { createSsrPassModule } from './modules/ssr-pass';
import { createTaaPassModule } from './modules/taa-pass';
import { createToneMappingModule } from './modules/tone-mapping';
import type { AppModule } from './modules/types';
import { createViewportResizeModule } from './modules/viewport-resize';
import { createSplatLoaderModule } from './modules/3dgs/splat-loader';

export type AppBootstrapMode = 'default' | '3dgs';

type ModuleGroups = {
  sceneModules: AppModule[];
  postprocessingModules: AppModule[];
};

export const resolveAppBootstrapMode = (): AppBootstrapMode => {
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === '3dgs' ? '3dgs' : 'default';
};

export const getModuleGroupsForMode = (mode: AppBootstrapMode): ModuleGroups => {
  if (mode === '3dgs') {
    return {
      sceneModules: [
        createViewportResizeModule,
        createOrbitControlsModule,
        createSceneRelaxationModule,
        createFpsCounterModule,
        createSplatLoaderModule,
      ],
      postprocessingModules: [],
    };
  }

  return {
    sceneModules: [
      createViewportResizeModule,
      createOrbitControlsModule,
      createSceneRelaxationModule,
      createFpsCounterModule,
      createModelLoadingSpinnerModule,
      createModelLoaderModule,
      createModelParserModule,
      createModelCenteringModule,
      createModelZFightFixModule,
      createObjectPickDebugModule,
      createBasicLightingModule,
      createToneMappingModule,
    ],
    postprocessingModules: [
      createSsgiPassModule,
      createSsaoPassModule,
      createSsrPassModule,
      createTaaPassModule,
      createSplitPassModule,
    ],
  };
};
