import {
  AmbientLight,
  Mesh,
  MeshBasicMaterial,
  RectAreaLight,
  SphereGeometry,
  SpotLight,
} from 'three';
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

  const flashlight = new SpotLight(0xfff4de, 85, 5, Math.PI / 6, 0.5, 2);
  flashlight.position.copy(keyLight.position);
  flashlight.position.y -= 0.06;
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.width = 1024;
  flashlight.shadow.mapSize.height = 1024;
  flashlight.shadow.bias = -0.00015;
  flashlight.shadow.normalBias = 0.02;
  flashlight.shadow.radius = 1.6;
  flashlight.target.position.set(keyLight.position.x, -2, keyLight.position.z);

  const flashlightBulb = new Mesh(
    new SphereGeometry(0.035, 16, 12),
    new MeshBasicMaterial({ color: 0xfff2d2 })
  );
  flashlightBulb.position.copy(flashlight.position);

  facade.scene.add(keyLight, fillLight, flashlight, flashlight.target, flashlightBulb);

  return () => {
    facade.scene.remove(keyLight, fillLight, flashlight, flashlight.target, flashlightBulb);
    flashlight.shadow.dispose();
    flashlightBulb.geometry.dispose();
    flashlightBulb.material.dispose();
  };
};
