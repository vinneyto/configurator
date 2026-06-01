import { Color, MeshLambertMaterial, PointLight } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

type StudioRoomEnvironmentOptions = {
  lightColor?: number | string | Color;
  emissiveColor?: number | string | Color;
  pointLightIntensityMultiplier?: number;
  emissiveIntensityMultiplier?: number;
};

export class StudioRoomEnvironment extends RoomEnvironment {
  constructor(options: StudioRoomEnvironmentOptions = {}) {
    super();

    const lightColor = new Color(options.lightColor ?? 0xffffff);
    const emissiveColor = new Color(options.emissiveColor ?? 0xffffff);
    const pointLightIntensityMultiplier = options.pointLightIntensityMultiplier ?? 1;
    const emissiveIntensityMultiplier = options.emissiveIntensityMultiplier ?? 1;

    this.traverse((object) => {
      if (object instanceof PointLight) {
        object.color.copy(lightColor);
        object.intensity *= pointLightIntensityMultiplier;
      }

      if ('material' in object) {
        const material = object.material;

        if (material instanceof MeshLambertMaterial && material.emissiveIntensity > 0) {
          material.emissive.copy(emissiveColor);
          material.emissiveIntensity *= emissiveIntensityMultiplier;
        }
      }
    });
  }
}

export type { StudioRoomEnvironmentOptions };
