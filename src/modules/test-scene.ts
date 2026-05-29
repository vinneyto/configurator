import { AmbientLight, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial } from 'three';
import type { AppModule } from './types';

export const createTestSceneModule: AppModule = (facade) => {
  const geometry = new BoxGeometry(1.5, 1.5, 1.5);
  const material = new MeshStandardMaterial({ color: 0x4fa3ff });
  const cube = new Mesh(geometry, material);

  const keyLight = new DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(3, 4, 5);

  const fillLight = new AmbientLight(0xffffff, 0.35);

  facade.scene.add(cube);
  facade.scene.add(keyLight);
  facade.scene.add(fillLight);

  const unsubscribeUpdate = facade.events.on('update', ({ deltaSeconds }) => {
    cube.rotation.y += deltaSeconds;
    cube.rotation.x += deltaSeconds * 0.6;
  });

  return () => {
    unsubscribeUpdate();
    facade.scene.remove(cube, keyLight, fillLight);
    geometry.dispose();
    material.dispose();
  };
};
