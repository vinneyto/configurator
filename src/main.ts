import './style.css';
import { AppFacade } from './core/facade';
import type { ViewportDefinition } from './core/viewport';
import { createBasicLightingModule } from './modules/basic-lighting';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelParserModule } from './modules/model-parser';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createSceneRelaxationModule } from './modules/scene-relaxation';
import { createViewportResizeModule } from './modules/viewport-resize';
import { createModelLoaderModule } from './modules/model-loader';
import { createModelLoadingSpinnerModule } from './modules/model-loading-spinner';
import { createFpsCounterModule } from './modules/fps-counter';
import { createSsgiPassModule } from './modules/ssgi-pass';
import { createSsaoPassModule } from './modules/ssao-pass';
import { createSsrPassModule } from './modules/ssr-pass';
import { createTaaPassModule } from './modules/taa-pass';
import { createModelZFightFixModule } from './modules/model-zfight-fix';
import { createToneMappingModule } from './modules/tone-mapping';
import type { AppModule, ViewportModule } from './modules/types';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const viewportDefinitions: ViewportDefinition[] = [
  {
    id: 'raw',
    bounds: { left: 0, top: 0, width: 0.5, height: 1 },
  },
  {
    id: 'postprocessed',
    bounds: { left: 0.5, top: 0, width: 0.5, height: 1 },
  },
];

const facade = new AppFacade(appRoot, viewportDefinitions);

const sceneModules: AppModule[] = [
  createViewportResizeModule,
  createOrbitControlsModule,
  createSceneRelaxationModule,
  createFpsCounterModule,
  createModelLoadingSpinnerModule,
  createModelLoaderModule,
  createModelParserModule,
  createModelCenteringModule,
  createModelZFightFixModule,
  createBasicLightingModule,
  createToneMappingModule,
  // createIBLLightingModule,
];

const processedViewportModules: ViewportModule[] = [
  createSsgiPassModule,
  createSsaoPassModule,
  createSsrPassModule,
  createTaaPassModule,
];

const instantiateSceneModules = (modules: AppModule[]): Array<() => void> =>
  modules.map((module) => module(facade));

const instantiateViewportModules = (
  viewportId: string,
  modules: ViewportModule[]
): Array<() => void> => {
  const viewport = facade.getViewport(viewportId);

  return modules.map((module) => module(facade, viewport));
};

const sceneTeardowns = instantiateSceneModules(sceneModules);
const processedViewportTeardowns = instantiateViewportModules(
  'postprocessed',
  processedViewportModules
);

void facade.start();

window.addEventListener('beforeunload', () => {
  [...processedViewportTeardowns].reverse().forEach((teardown) => teardown());
  [...sceneTeardowns].reverse().forEach((teardown) => teardown());
  facade.stop();
});
