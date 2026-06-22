# configurator

Report on the current state of the rendering pipeline and model quality.

## Bootstrap modes

The app now supports two startup modes via query string:

- default mode: `/`
- 3DGS mode: `/?mode=3dgs`

`default` keeps the current GLB + postprocessing stack.

`3dgs` uses a minimal module set:

- viewport resize
- orbit controls
- scene relaxation
- FPS counter
- splat loader

## Modular architecture

The project is assembled from `AppModule` modules:

- each module receives `facade`;
- configures part of the scene/postprocessing;
- returns a teardown function.

The modules are launched in `main.ts` in two groups.

### Scene modules

- `createViewportResizeModule`
- `createOrbitControlsModule`
- `createSceneRelaxationModule`
- `createModelLoaderModule`
- `createModelParserModule`
- `createModelCenteringModule`
- `createModelZFightFixModule`
- `createBasicLightingModule`
- `createToneMappingModule`

### Postprocessing modules

- `createSsgiPassModule`
- `createSsaoPassModule`
- `createSsrPassModule`
- `createTaaPassModule`

Teardown runs in reverse order.

## Postprocessing (from the code)

Current chain:

1. SSGI
2. SSAO (via GTAO node)
3. SSR
4. TRAA/TAA

The passes are combined as follows:

- pass modules are initialized in order;
- each subsequent pass takes the previous pass output and integrates it into its blending algorithm;
- any pass module can be commented out: the pipeline will continue to work, just without the corresponding postprocessing effect.

Additionally:

- SSAO and SSR run in half resolution (`resolutionScale = 0.5`);
- when the camera is moving, SSGI is simplified via its parameters (see below).

## Model preprocessing on load

Before GLB parsing, the following runs:

- `await document.transform(metalRough())`

This is needed to avoid the warning:

- `THREE.GLTFLoader: Unknown extension "KHR_materials_pbrSpecularGlossiness"`

In practice, this converts the material from specular-glossiness to metallic-roughness.

## Z-fighting

The model has z-fighting. Current runtime workaround:

- `scale *= 1.0001` is applied recursively to all model objects.

This is a working temporary fix, but the proper fix is to correct the geometry in Blender.

## Normals and their effect on SSGI/SSAO

The model contains objects with inverted normals.

Consequences:

- SSGI degradation;
- excessive darkening in SSAO on problematic meshes.

Recommendation:

- fix the normals in Blender (preferred);
- for SSAO, an acceptable workaround is to derive normals from depth to reduce artifacts on problematic objects.

## Transparent objects

Transparent objects are not currently separated into a dedicated late pass.

Problem:

- they contribute to the normal/depth context of screen-space effects;
- example: when looking at the sink through the bathroom glass, SSGI works worse.

Recommendation:

- render transparent objects in a separate pass after the main opaque + postprocessing pipeline.

## SSGI optimization while moving

On the `sceneRelaxationChanged` event, SSGI parameters switch as follows:

- while moving (scene tense): `sliceCount = 1`, `stepCount = 1`;
- at rest (scene relaxed): `sliceCount = 2`, `stepCount = 8`.

This preserves camera responsiveness and improves quality when the scene is static.

## Model centering

After loading, the model is centered by bbox:

- `Box3` is computed;
- its center is taken;
- `modelRoot` position is shifted so the model center is at the scene origin.

## Temporal anti-aliasing

TRAA/TAA is used:

- reduces noise from SSGI;
- visually stabilizes the image when static.

## Lighting

Current choice:

- `RectAreaLight` (key light, a “rectangular bulb”);
- `AmbientLight` as fill.

IBL was tested, but based on the visual result the regular lamp option was chosen.

## Validation and limits

Observation during validation on macOS (MacBook):

- it was necessary to increase `maxColorAttachmentBytesPerSample`, otherwise rendering hit the limit;
- the reason is that the scene pass outputs many color attachments;
- a potential optimization area is to reduce the number/weight of color attachments in the scene pass.

Cross-device validation:

- the pipeline works on a budget Android device;
- the pipeline also works on a powerful iPhone;
- performance on both devices is acceptable.
