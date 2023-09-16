<p align="center">
  <img src="/logo.png" alt="Logo" height=170>
</p>

<h1 align="center">Bun Image Transform</h1>

Powered by [sharp](https://github.com/lovell/sharp) and [libvips](https://github.com/libvips/libvips).

## What is Bun Image Tranform ?

Bun Image Transform is a plugin for the [Bun](https://github.com/oven-sh/bun) Bundler and Runtime capable of transforming an image upon import.

By default, Bun allows you to import and retrieve the file path, but sometimes you may want to import a high-resolution image directly from the source code, apply effects, and then compress it.

Bun Image Transform allows you to do exactly this.

## How to installed it

You will first need a minimum version of v1.0.3 of Bun.
**_This version is not yet available, and without the changes from pull request oven-sh/bun#5477, the plugin will not be able to transform images with the Bun Runtime._**

For now, Bun Image Transform is not yet available on NPM, but later on, you'll simply need to run a bun install of the package.

## Usages

### Runtime usage

To use as a runtime plugin, create a file that registers the plugin:

```ts
// preload.ts
import BunImageTransformPlugin from "bun-image-transform";

Bun.plugin(BunImageTransformPlugin({}));
```

Then preload it in your `bunfig.toml`:

```toml
preload = ["./preload.ts"]
```

### Bundler usage

To use this plugin, you will need to add it to your Bun build step.

```ts
import BunImageTransformPlugin from "bun-image-transform";

Bun.build({
  entrypoints: ["./index.tsx"],
  // other config

  plugins: [BunImageTransformPlugin({})],
});
```

### Code usage

To use it in your code once the plugin is activated, you will simply need to load an image file as usual, with the exception that you will need to add `?YOUR_MODIFIERS&bunimg` after the file extension.

_The syntax for using the modifiers is similar to what you can find in the parameters of an HTTP GET method._

```ts
import bunLogo from './bun-logo.png?format=jpeg&bunimg'

console.log(bunLogo);
```

You can also use if you want `require` and `await import()`

```ts
require('./bun-logo.png?format=webp&bunimg');


await import('./bun-logo.png?format=jpg&quality=75&bunimg');
```

Note : Even though it's possible to transform an image with an `await import`, don't forget that the API remains limited in complex modifications, and you can simply perform the dynamic image transformations yourself using `sharp` directly.

### Modifiers

Bun Image Transform works by using the Node image processing library, sharp. Therefore, the available modifiers are directly taken from the sharp documentation.

| Property  | Docs                                                          | Example                                                           | Comments                                                                                                                                                      |
| --------- | :-------------------------------------------------------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| width     | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?width=128&bunimg`                                    |
| height    | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?height=128&bunimg`                                   |
| resize    | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?resize=128x128_#ffffff&bunimg`                       | The background color of the resize is optional                                                                                                                      |
| kernel    | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?resize=128x128_#ffffff&kernel=nearest&bunimg`        | Supported kernel: `nearest`, `cubic`, `mitchell`, `lanczos2` and `lanczos3` (default).                                                                              |
| fit       | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?resize=128x128_#ffffff&fit=fit_outside&bunimg`       | Sets `fit` option for `resize`.                                                                                                                                     |
| position  | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?resize=128x128_#ffffff&position=top&bunimg`          | Sets `position` option for `resize`.                                                                                                                                |
| trim      | [Docs](https://sharp.pixelplumbing.com/api-resize#trim)         | `./bun-logo.png?trim=true&bunimg`                                    |
| extend    | [Docs](https://sharp.pixelplumbing.com/api-resize#extend)       | `./bun-logo.png?extend={top}_{right}_{bottom}_{left}_[color]&bunimg` | Extend / pad / extrude one or more edges of the image with either the provided background colour or pixels derived from the image. The background color is optional |
| extract   | [Docs](https://sharp.pixelplumbing.com/api-resize#extract)      | `./bun-logo.png?extract={left}_{top}_{width}_{height}&bunimg`        | Extract/crop a region of the image.                                                                                                                                 |
| format    | [Docs](https://sharp.pixelplumbing.com/api-output#toformat)     | `./bun-logo.png?format=png&bunimg`                                   | Supported format: `png`, `jpg`, `jpeg`, `webp`, `avif`, `gif`, `heif` and `tiff`                                                                                    |
| quality   | \_                                                              | `./bun-logo.png?format=webp&quality=80&bunimg`                       | Accepted values: 0 to 100 and need the format property to be apply                                                                                                  |
| rotate    | [Docs](https://sharp.pixelplumbing.com/api-operation#rotate)    | `./bun-logo.png?rotate=45&bunimg`                                    |
| enlarge   | \_                                                              | `./bun-logo.png?resize=1024x1024&enlarge=true&bunimg`                | Allow the image to be upscaled. By default the returned image will never be larger than the source in any dimension, while preserving the requested aspect ratio.   |
| flip      | [Docs](https://sharp.pixelplumbing.com/api-operation#flip)      | `./bun-logo.png?flip=true&bunimg`                                    |
| flop      | [Docs](https://sharp.pixelplumbing.com/api-operation#flop)      | `./bun-logo.png?flop=true&bunimg`                                    |
| sharpen   | [Docs](https://sharp.pixelplumbing.com/api-operation#sharpen)   | `./bun-logo.png?sharpen=30&bunimg`                                   |
| median    | [Docs](https://sharp.pixelplumbing.com/api-operation#median)    | `./bun-logo.png?median=10&bunimg`                                    |
| blur      | [Docs](https://sharp.pixelplumbing.com/api-operation#blur)      | `./bun-logo.png?blur=5&bunimg`                                       |
| gamma     | [Docs](https://sharp.pixelplumbing.com/api-operation#gamma)     | `./bun-logo.png?gamma=3&bunimg`                                      |
| negate    | [Docs](https://sharp.pixelplumbing.com/api-operation#negate)    | `./bun-logo.png?negate=true&bunimg`                                  |
| normalize | [Docs](https://sharp.pixelplumbing.com/api-operation#normalize) | `./bun-logo.png?normalize=true&bunimg`                               |
| threshold | [Docs](https://sharp.pixelplumbing.com/api-operation#threshold) | `./bun-logo.png?threshold=10&bunimg`                                 |
| tint      | [Docs](https://sharp.pixelplumbing.com/api-colour#tint)         | `./bun-logo.png?tint=#00ff00&bunimg`                                 |
| grayscale | [Docs](https://sharp.pixelplumbing.com/api-colour#grayscale)    | `./bun-logo.png?grayscale=true&bunimg`                               |

## Credits
This project would not be possible without [Bun](https://github.com/oven-sh/bun) inspiring me to create this plugin.

To the project also [Sharp](https://github.com/lovell/sharp) for making it easy to transform and convert images.

And to the high-performance, secure, and easy-to-use image optimizer server, [IPX](https://github.com/unjs/ipx), which greatly inspired the syntax of the modifiers and usage.

## License

[MIT](./LICENSE)
