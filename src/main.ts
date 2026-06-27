import './style.css';
import { AppFacade } from './core/facade';
import { bathroom } from './apps/bathroom';
// import { splats } from './apps/splats';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('App root not found');
}

const facade = new AppFacade(appRoot);

const dispose = bathroom(facade);
// const dispose = splats(facade);

facade.start();

window.addEventListener('beforeunload', () => {
  dispose();
  facade.stop();
});
