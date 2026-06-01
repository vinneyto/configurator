import './style.css';
import { AppFacade } from './core/facade';
import { createBasicLightingModule } from './modules/basic-lighting';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelParserModule } from './modules/model-parser';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createSceneRelaxationModule } from './modules/scene-relaxation';
import { createViewportResizeModule } from './modules/viewport-resize';
import { createModelLoaderModule } from './modules/model-loader';
import { createSsgiPassModule } from './modules/ssgi-pass';
import { createSsaoPassModule } from './modules/ssao-pass';
import { createSsrPassModule } from './modules/ssr-pass';
import { createTaaPassModule } from './modules/taa-pass';
import { createModelZFightFixModule } from './modules/model-zfight-fix';
import { createToneMappingModule } from './modules/tone-mapping';
import type { AppModule } from './modules/types';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const sceneModules: AppModule[] = [
  createViewportResizeModule,
  createOrbitControlsModule,
  createSceneRelaxationModule,
  createModelLoaderModule,
  createModelParserModule,
  createModelCenteringModule,
  createModelZFightFixModule,
  createBasicLightingModule,
  createToneMappingModule,
  // createIBLLightingModule,
];

const postprocessingModules: AppModule[] = [
  createSsgiPassModule,
  createSsaoPassModule,
  createSsrPassModule,
  createTaaPassModule,
];

const instantiateModules = (modules: AppModule[]): Array<() => void> =>
  modules.map((m) => m(facade));

const sceneTeardowns = instantiateModules(sceneModules);
const postprocessingTeardowns = instantiateModules(postprocessingModules);

void facade.start();

window.addEventListener('beforeunload', () => {
  [...postprocessingTeardowns].reverse().forEach((teardown) => teardown());
  [...sceneTeardowns].reverse().forEach((teardown) => teardown());
  facade.stop();
});
