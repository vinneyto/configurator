import './style.css';
import { AppFacade } from './core/facade';
import { createTestSceneModule } from './modules/test-scene';
import { createViewportResizeModule } from './modules/viewport-resize';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const teardownModules = [createViewportResizeModule(facade), createTestSceneModule(facade)];

facade.start();

window.addEventListener('beforeunload', () => {
  teardownModules.forEach((teardown) => teardown());
  facade.stop();
});
