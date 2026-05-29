import type { AppModule } from './types';

export const createViewportResizeModule: AppModule = (facade) => {
  const root = facade.renderer.domElement.parentElement;

  if (!root) {
    throw new Error('Renderer canvas is not mounted');
  }

  const applySize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    root.style.width = `${width}px`;
    root.style.height = `${height}px`;

    facade.resize(width, height);
  };

  applySize();
  window.addEventListener('resize', applySize);

  return () => {
    window.removeEventListener('resize', applySize);
  };
};
