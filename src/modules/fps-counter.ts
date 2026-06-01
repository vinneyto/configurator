import Stats from 'stats.js';
import type { AppModule } from './types';

export const createFpsCounterModule: AppModule = (facade) => {
  const stats = new Stats();
  stats.showPanel(0);

  const root = facade.renderer.domElement.parentElement;

  if (root) {
    stats.dom.style.position = 'fixed';
    stats.dom.style.top = '0';
    stats.dom.style.left = '0';
    stats.dom.style.zIndex = '20';
    root.appendChild(stats.dom);
  }

  const unsubscribeUpdate = facade.events.on('update', () => {
    stats.update();
  });

  return () => {
    unsubscribeUpdate();
    stats.dom.remove();
  };
};
