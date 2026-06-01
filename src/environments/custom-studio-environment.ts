import {
  BackSide,
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PointLight,
  Scene,
} from 'three';

type CustomStudioEnvironmentOptions = {
  lightColor?: number | string | Color;
  emissiveColor?: number | string | Color;
  pointLightIntensity?: number;
  emissiveIntensityMultiplier?: number;
};

export class CustomStudioEnvironment extends Scene {
  constructor(options: CustomStudioEnvironmentOptions = {}) {
    super();

    this.name = 'CustomStudioEnvironment';
    this.position.y = -3.5;

    const lightColor = new Color(options.lightColor ?? 0xffe6f2);
    const emissiveColor = new Color(options.emissiveColor ?? 0xffeef8);
    const pointLightIntensity = options.pointLightIntensity ?? 900;
    const emissiveIntensityMultiplier = options.emissiveIntensityMultiplier ?? 1;

    const geometry = new BoxGeometry();
    geometry.deleteAttribute('uv');

    const roomMaterial = new MeshStandardMaterial({ side: BackSide });

    // верхний источник строго в центре сцены
    const mainLight = new PointLight(lightColor, pointLightIntensity, 28, 2);
    mainLight.position.set(0, 16.199, 0);
    this.add(mainLight);

    const room = new Mesh(geometry, roomMaterial);
    room.position.set(-0.757, 13.219, 0.717);
    room.scale.set(31.713, 28.305, 28.591);
    this.add(room);

    // Эмиссивные панели (без кубов в центре)
    const light1 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 50 * emissiveIntensityMultiplier)
    );
    light1.position.set(-16.116, 14.37, 8.208);
    light1.scale.set(0.1, 2.428, 2.739);
    this.add(light1);

    const light2 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 50 * emissiveIntensityMultiplier)
    );
    light2.position.set(-16.109, 18.021, -8.207);
    light2.scale.set(0.1, 2.425, 2.751);
    this.add(light2);

    const light3 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 17 * emissiveIntensityMultiplier)
    );
    light3.position.set(14.904, 12.198, -1.832);
    light3.scale.set(0.15, 4.265, 6.331);
    this.add(light3);

    const light4 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 43 * emissiveIntensityMultiplier)
    );
    light4.position.set(-0.462, 8.89, 14.52);
    light4.scale.set(4.38, 5.441, 0.088);
    this.add(light4);

    const light5 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 20 * emissiveIntensityMultiplier)
    );
    light5.position.set(3.235, 11.486, -12.541);
    light5.scale.set(2.5, 2, 0.1);
    this.add(light5);

    const light6 = new Mesh(
      geometry,
      createAreaLightMaterial(emissiveColor, 100 * emissiveIntensityMultiplier)
    );
    light6.position.set(0, 20, 0);
    light6.scale.set(1, 0.1, 1);
    this.add(light6);
  }

  dispose(): void {
    const resources = new Set<{ dispose: () => void }>();

    this.traverse((object) => {
      if (object instanceof Mesh) {
        resources.add(object.geometry);

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => resources.add(material));
        } else {
          resources.add(object.material);
        }
      }
    });

    resources.forEach((resource) => resource.dispose());
  }
}

function createAreaLightMaterial(emissiveColor: Color, intensity: number): MeshLambertMaterial {
  return new MeshLambertMaterial({
    color: 0x000000,
    emissive: emissiveColor,
    emissiveIntensity: intensity,
  });
}

export type { CustomStudioEnvironmentOptions };
