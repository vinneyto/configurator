import './style.css';
import { AppFacade } from './core/facade';
import { createBasicLightingModule } from './modules/basic-lighting';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelParserModule } from './modules/model-parser';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createViewportResizeModule } from './modules/viewport-resize';
import { createModelLoaderModule } from './modules/model-loader';
import { createSsgiPassModule } from './modules/ssgi-pass';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const teardownModules = [
  createViewportResizeModule(facade),
  createBasicLightingModule(facade),
  createOrbitControlsModule(facade),
  createSsgiPassModule(facade),
  createModelLoaderModule(facade),
  createModelParserModule(facade),
  createModelCenteringModule(facade),
];

void facade.start();

window.addEventListener('beforeunload', () => {
  teardownModules.forEach((teardown) => teardown());
  facade.stop();
});
