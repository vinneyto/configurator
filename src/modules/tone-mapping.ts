import { ACESFilmicToneMapping, AgXToneMapping, type ToneMapping } from 'three';
import type { AppModule } from './types';

type ToneMappingPreset = 'aces' | 'agx';

type ToneMappingConfig = {
  preset: ToneMappingPreset;
  toneMapping: ToneMapping;
  exposure: number;
};

const PRESETS: Record<ToneMappingPreset, ToneMappingConfig> = {
  aces: {
    preset: 'aces',
    toneMapping: ACESFilmicToneMapping,
    exposure: 1,
  },
  agx: {
    preset: 'agx',
    toneMapping: AgXToneMapping,
    exposure: 1,
  },
};

function applyPreset(facade: Parameters<AppModule>[0], config: ToneMappingConfig): void {
  facade.renderer.toneMapping = config.toneMapping;
  facade.renderer.toneMappingExposure = config.exposure;

  console.info(`[tone-mapping] switched to ${config.preset.toUpperCase()}`);
}

export const createToneMappingModule: AppModule = (facade) => {
  let currentPreset: ToneMappingPreset = 'aces';

  const setPreset = (preset: ToneMappingPreset): void => {
    currentPreset = preset;
    applyPreset(facade, PRESETS[preset]);
  };

  const togglePreset = (): void => {
    setPreset(currentPreset === 'aces' ? 'agx' : 'aces');
  };

  setPreset(currentPreset);

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'KeyT') {
      return;
    }

    togglePreset();
  };

  window.addEventListener('keydown', onKeyDown);

  const controls = {
    get: () => currentPreset,
    set: (preset: ToneMappingPreset) => setPreset(preset),
    toggle: () => togglePreset(),
  };

  Object.assign(globalThis, {
    __toneMapping: controls,
  });

  return () => {
    window.removeEventListener('keydown', onKeyDown);

    if ((globalThis as { __toneMapping?: unknown }).__toneMapping === controls) {
      Reflect.deleteProperty(globalThis, '__toneMapping');
    }
  };
};
