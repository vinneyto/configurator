# configurator

Отчёт по текущему состоянию рендер-пайплайна и качеству модели.

## Модульная архитектура

Проект собран из модулей `AppModule`:

- каждый модуль получает `facade`;
- настраивает часть сцены/постпроцессинга;
- возвращает teardown-функцию.

Модули запускаются в `main.ts` в двух группах.

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

Teardown выполняется в обратном порядке.

## Постпроцессинг (по коду)

Текущая цепочка:

1. SSGI
2. SSAO (через GTAO node)
3. SSR
4. TRAA/TAA

Дополнительно:

- SSAO и SSR работают в half-resolution (`resolutionScale = 0.5`);
- при движении камеры SSGI упрощается по параметрам (ниже).

## Препроцессинг модели при загрузке

Перед парсингом GLB выполняется:

- `await document.transform(metalRough())`

Это нужно, чтобы не получать предупреждение:

- `THREE.GLTFLoader: Unknown extension "KHR_materials_pbrSpecularGlossiness"`

По сути идёт конвертация материала из specular-glossiness в metallic-roughness.

## Z-fighting

В модели есть z-fight. Текущий runtime-workaround:

- рекурсивно всем объектам модели применяется `scale *= 1.0001`.

Это рабочий временный фикс, но правильнее править геометрию в Blender.

## Нормали и влияние на SSGI/SSAO

В модели есть объекты с инвертированными нормалями.

Последствия:

- деградация SSGI;
- чрезмерное затемнение в SSAO на проблемных мешах.

Рекомендация:

- исправлять нормали в Blender (предпочтительно);
- для SSAO допустим обходной путь: рассчитывать нормали из depth, чтобы ослабить артефакты на проблемных объектах.

## Прозрачные объекты

Сейчас прозрачные объекты не вынесены в отдельный поздний проход.

Проблема:

- они вносят вклад в normal/depth-контекст screen-space эффектов;
- пример: при взгляде на раковину через прозрачное стекло ванной SSGI работает хуже.

Рекомендация:

- рендерить transparent-объекты отдельным pass после основного opaque + postprocessing пайплайна.

## Оптимизация SSGI при движении

При событии `sceneRelaxationChanged` параметры SSGI переключаются:

- в движении (scene tense): `sliceCount = 1`, `stepCount = 1`;
- в покое (scene relaxed): `sliceCount = 2`, `stepCount = 8`.

Это сохраняет отзывчивость камеры и повышает качество в статике.

## Центрирование модели

После загрузки модель центрируется по bbox:

- вычисляется `Box3`;
- берётся центр;
- позиция `modelRoot` сдвигается так, чтобы центр модели был в нуле сцены.

## Темпоральное сглаживание

Используется TRAA/TAA:

- снижает шум от SSGI;
- визуально стабилизирует изображение в статике.

## Освещение

Текущий выбор:

- `RectAreaLight` (ключевой свет, «прямоугольная лампочка»);
- `AmbientLight` как fill.

IBL проверялся, но по визуальному результату выбран вариант с обычной лампочкой.
