import './style.css';
import { AppFacade } from './core/facade';
import { getModuleGroupsForMode, resolveAppBootstrapMode } from './module-presets';
import type { AppModule } from './modules/types';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);
const appMode = resolveAppBootstrapMode();
const { sceneModules, postprocessingModules } = getModuleGroupsForMode(appMode);

const instantiateModules = (modules: AppModule[]): Array<() => void> =>
  modules.map((moduleFactory) => moduleFactory(facade));

const sceneTeardowns = instantiateModules(sceneModules);
const postprocessingTeardowns = instantiateModules(postprocessingModules);

console.info('[configurator] boot mode:', appMode);

void facade.start();

window.addEventListener('beforeunload', () => {
  [...postprocessingTeardowns].reverse().forEach((teardown) => teardown());
  [...sceneTeardowns].reverse().forEach((teardown) => teardown());
  facade.stop();
});
