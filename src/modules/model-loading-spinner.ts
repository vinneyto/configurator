import type { AppModule } from './types';

export const createModelLoadingSpinnerModule: AppModule = (facade) => {
  const overlay = document.createElement('div');
  overlay.className = 'model-loading-spinner-overlay';

  const spinner = document.createElement('div');
  spinner.className = 'model-loading-spinner';
  spinner.setAttribute('aria-label', 'Loading 3D model');

  overlay.appendChild(spinner);
  facade.renderer.domElement.parentElement?.appendChild(overlay);

  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    overlay.remove();
  });

  return () => {
    unsubscribeModelAdded();
    overlay.remove();
  };
};
