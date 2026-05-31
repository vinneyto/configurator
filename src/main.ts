import './style.css';
import { AppFacade } from './core/facade';
import { createBasicLightingModule } from './modules/basic-lighting';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelParserModule } from './modules/model-parser';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createViewportResizeModule } from './modules/viewport-resize';
import { createModelLoaderModule } from './modules/model-loader';
import { createSsgiPassModule } from './modules/ssgi-pass';
import { createModelZFightFixModule } from './modules/model-zfight-fix';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const sceneModules = [
  createViewportResizeModule(facade),
  createOrbitControlsModule(facade),
  createBasicLightingModule(facade),
  createModelLoaderModule(facade),
  createModelParserModule(facade),
  createModelCenteringModule(facade),
  createModelZFightFixModule(facade),
];

const postprocessingModules = [createSsgiPassModule(facade)];

const teardownModules = [...sceneModules, ...postprocessingModules];

void facade.start();

window.addEventListener('beforeunload', () => {
  teardownModules.forEach((teardown) => teardown());
  facade.stop();
});
