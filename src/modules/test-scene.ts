import * as THREE from 'three';
import type { AppModule } from './types';

export const createTestSceneModule: AppModule = (facade) => {
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x4fa3ff });
  const cube = new THREE.Mesh(geometry, material);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(3, 4, 5);

  const fillLight = new THREE.AmbientLight(0xffffff, 0.35);

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
