import { pass, sample, select, uniform, vec2 } from 'three/tsl';
import type { AppModule } from './types';
import { type PassNode } from 'three/webgpu';
import { VerticalSplitControl } from '../ui/vertical-split-control';

export const createSplitPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as PassNode;

  const rawCamera = facade.camera.clone();

  const syncRawCamera = () => {
    rawCamera.copy(facade.camera);
    rawCamera.clearViewOffset();
  };

  syncRawCamera();

  const unsubscribeUpdate = facade.events.on('update', syncRawCamera);

  const rawScenePass = pass(facade.scene, rawCamera);

  const rawColor = rawScenePass.getTextureNode('output');
  const sceneColor = previousColorNode.getTextureNode();

  const ratio = uniform(0.5);

  const verticalSplit = sample((uv) => {
    const uvNode = uv as ReturnType<typeof vec2>;
    const processedColor = sceneColor.sample(uv);
    const rawSceneColor = rawColor.sample(uv);

    return select(uvNode.x.greaterThan(ratio), processedColor, rawSceneColor);
  });

  const splitControl = new VerticalSplitControl();
  splitControl.setRatio(ratio.value);

  const root = facade.renderer.domElement.parentElement;

  if (root) {
    splitControl.mount(root);
  }

  const handleRatioChange = (event: Event) => {
    const ratioChangeEvent = event as CustomEvent<{ ratio: number }>;
    ratio.value = ratioChangeEvent.detail.ratio;
  };

  splitControl.addEventListener('ratiochange', handleRatioChange);

  facade.renderPipeline.outputNode = verticalSplit;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    splitControl.removeEventListener('ratiochange', handleRatioChange);
    splitControl.destroy();
    unsubscribeUpdate();
    rawScenePass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
