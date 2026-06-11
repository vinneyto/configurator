import { AmbientLight, RectAreaLight } from 'three';
import type { AppModule } from './types';
import { RectAreaLightNode } from 'three/webgpu';
import { RectAreaLightTexturesLib } from 'three/examples/jsm/lights/RectAreaLightTexturesLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

export const createBasicLightingModule: AppModule = (facade) => {
  RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());

  const fillLight = new AmbientLight(0xffffff, 0.45);
  fillLight.intensity = 1.5;

  const keyLight = new RectAreaLight(0xffffff, 115, 1.8, 0.1);

  keyLight.position.y = 1.3;
  keyLight.position.z = 1.1;
  keyLight.rotation.x = -Math.PI / 2;

  const helper = new RectAreaLightHelper(keyLight);
  keyLight.add(helper);
  helper.visible = false;

  facade.scene.add(keyLight, fillLight);

  return () => {
    facade.scene.remove(keyLight, fillLight);
  };
};
