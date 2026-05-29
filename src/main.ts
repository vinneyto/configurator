import './style.css';
import { AppFacade } from './core/facade';
import { createBasicLightingModule } from './modules/basic-lighting';
import { createModelCenteringModule } from './modules/model-centering';
import { createModelLoaderModule } from './modules/model-loader';
import { createOrbitControlsModule } from './modules/orbit-controls';
import { createOrbitRadiusFromModelModule } from './modules/orbit-radius-from-model';
import { createViewportResizeModule } from './modules/viewport-resize';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const teardownModules = [
  createViewportResizeModule(facade),
  createBasicLightingModule(facade),
  createOrbitControlsModule(facade),
  createOrbitRadiusFromModelModule(facade),
  createModelLoaderModule(facade),
  createModelCenteringModule(facade),
];

facade.start();

window.addEventListener('beforeunload', () => {
  teardownModules.forEach((teardown) => teardown());
  facade.stop();
});
