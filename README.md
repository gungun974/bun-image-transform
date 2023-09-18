<p align="center">
  <img src="/logo.png" alt="Logo" height=170>
</p>

<h1 align="center">Bun Image Transform</h1>

Powered by [sharp](https://github.com/lovell/sharp) and [libvips](https://github.com/libvips/libvips).

## What is Bun Image Transform ?

Bun Image Transform is a plugin for the [Bun](https://github.com/oven-sh/bun) Bundler and Runtime capable of transforming an image upon import.

By default, Bun allows you to import and retrieve the file path, but sometimes you may want to import a high-resolution image directly from the source code, apply effects, and then compress it.

Bun Image Transform allows you to do exactly this.

## How to installed it

You will first need to install the package with Bun.

```bash
bun install bun-image-transform
```

Next, in your `tsconfig.json` file, you will need to add the library's typings to avoid "module not found" errors.

```json
  {
    "compilerOptions": {
      "types": [
        // other packages, e.g. "bun-types",
+       "bun-image-transform"
      ]
    }
  }
```

### Troubleshooting

In the latest version of bun, Bun have some issue with running `postinstall` script.
This results in Sharp not downloading the necessary binary files for its proper functioning, and this error message.

```
$ bun run ./index.ts
32 |     if (loadedModule) {
33 |       const [, loadedPackage] = loadedModule.match(/node_modules[\\/]([^\\/]+)[\\/]/);
34 |       help.push(`- Ensure the version of sharp aligns with the ${loadedPackage} package: "npm ls sharp"`);
35 |     }
36 |   }
37 |   throw new Error(help.join('\n'));
            ^
error:
Something went wrong installing the "sharp" module

Cannot find module "../build/Release/sharp-linux-x64.node" from "/home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/sharp.js"

Possible solutions:
- Install with verbose logging and look for errors: "npm install --ignore-scripts=false --foreground-scripts --verbose sharp"
- Install for the current linux-x64 runtime: "npm install --platform=linux --arch=x64 sharp"
- Consult the installation documentation: https://sharp.pixelplumbing.com/install
      at /home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/sharp.js:37:8
      at globalThis (/home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/sharp.js:37:33)
      at require (:1:20)
      at /home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/constructor.js:11:0
      at globalThis (/home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/constructor.js:439:17)
      at require (:1:20)
      at /home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/index.js:6:6
      at globalThis (/home/gungun974/lab/perso/bun-image-transform/node_modules/sharp/lib/index.js:16:17)
error: script "dev" exited with code 1 (SIGHUP)
```

For now, a solution I use is to go into the `node_modules/sharp` folder and run `bun install`, which here will correctly trigger the `postinstall`.
In the future this.

In the future, this workaround will no longer be necessary when Bun has fixed this.

## Usages

### Runtime usage

To use as a runtime plugin, create a file that registers the plugin:

```ts
// preload.ts
import BunImageTransformPlugin from "bun-image-transform";

Bun.plugin(BunImageTransformPlugin());
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
  entrypoints: ["./index.ts"],
  // other config

  plugins: [BunImageTransformPlugin()],
});
```

### Code usage

To use it in your code once the plugin is activated, you will simply need to load an image file as usual, with the exception that you will need to add modifiers like `?width=128&bunimg` after the file extension.

This syntax is similar to what one might find in the parameters of an HTTP GET method, but there is two **_major differences_**.

1. **The order matters**
2. **You can repeat the modifiers**

Also, some modifiers like `format` can receive information from special modifiers called **_"flags"_** that are placed **only behind them**.

```ts
import bunLogo from "./bun-logo.png?format=jpeg&bunimg";

console.log(bunLogo);
```

You can also use if you want `require` and `await import()`

```ts
require("./bun-logo.png?format=webp&bunimg");

await import("./bun-logo.png?quality=75&format=jpg&bunimg");
```

**Important** : You can't use dot to write number like `0.5` **you must use commas** like `0,5` or the file will not be resolve correctly

Note : Even though it's possible to transform an image with an `await import`, don't forget that the API remains limited in complex modifications, and you can simply perform the dynamic image transformations yourself using `sharp` directly.

### Modifiers

Bun Image Transform works by using the Node image processing library, sharp. Therefore, the available modifiers are directly taken from the sharp documentation.

| Property  | Docs                                                            | Example                                                              | Comments                                                                                                                                                           |
| --------- | :-------------------------------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| width     | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?width=128&bunimg`                                    | See `enlarge` modifier.                                                                                                                                            |
| height    | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?height=128&bunimg`                                   | See `enlarge` modifier.                                                                                                                                            |
| resize    | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)       | `./bun-logo.png?resize=128x128_#ffffff&bunimg`                       | The background color of the resize is optional. See `enlarge`, `kernel`, `fit` and `position` modifiers.                                                           |
| trim      | [Docs](https://sharp.pixelplumbing.com/api-resize#trim)         | `./bun-logo.png?trim&bunimg`                                         |
| extend    | [Docs](https://sharp.pixelplumbing.com/api-resize#extend)       | `./bun-logo.png?extend={top}_{right}_{bottom}_{left}_[color]&bunimg` | Extend / pad / extrude one or more edges of the image with either the provided background color or pixels derived from the image. The background color is optional |
| extract   | [Docs](https://sharp.pixelplumbing.com/api-resize#extract)      | `./bun-logo.png?extract={left}_{top}_{width}_{height}&bunimg`        | Extract/crop a region of the image.                                                                                                                                |
| format    | [Docs](https://sharp.pixelplumbing.com/api-output#toformat)     | `./bun-logo.png?format=png&bunimg`                                   | Supported format: `png`, `jpg`, `jpeg`, `webp`, `avif`, `gif`, `heif` and `tiff`                                                                                   |
| rotate    | [Docs](https://sharp.pixelplumbing.com/api-operation#rotate)    | `./bun-logo.png?rotate=45&bunimg`                                    |
| flip      | [Docs](https://sharp.pixelplumbing.com/api-operation#flip)      | `./bun-logo.png?flip&bunimg`                                         |
| flop      | [Docs](https://sharp.pixelplumbing.com/api-operation#flop)      | `./bun-logo.png?flop&bunimg`                                         |
| sharpen   | [Docs](https://sharp.pixelplumbing.com/api-operation#sharpen)   | `./bun-logo.png?sharpen=30&bunimg`                                   |
| median    | [Docs](https://sharp.pixelplumbing.com/api-operation#median)    | `./bun-logo.png?median=10&bunimg`                                    |
| blur      | [Docs](https://sharp.pixelplumbing.com/api-operation#blur)      | `./bun-logo.png?blur=5&bunimg`                                       |
| gamma     | [Docs](https://sharp.pixelplumbing.com/api-operation#gamma)     | `./bun-logo.png?gamma=3&bunimg`                                      |
| negate    | [Docs](https://sharp.pixelplumbing.com/api-operation#negate)    | `./bun-logo.png?negate&bunimg`                                       |
| normalize | [Docs](https://sharp.pixelplumbing.com/api-operation#normalize) | `./bun-logo.png?normalize&bunimg`                                    |
| threshold | [Docs](https://sharp.pixelplumbing.com/api-operation#threshold) | `./bun-logo.png?threshold=10&bunimg`                                 |
| tint      | [Docs](https://sharp.pixelplumbing.com/api-colour#tint)         | `./bun-logo.png?tint=#00ff00&bunimg`                                 |
| grayscale | [Docs](https://sharp.pixelplumbing.com/api-colour#grayscale)    | `./bun-logo.png?grayscale&bunimg`                                    | You can also use "greyscale" as a word.                                                                                                                            |
| modulate  | [Docs](https://sharp.pixelplumbing.com/api-operation#modulate)  | `./bun-logo.png?brightness=2&modulate&bunimg`                        | See `brightness`, `hue`, `lightness` and `saturation` flags.                                                                                                       |
| render    | \_                                                              | `./bun-logo.png?trim&render&rotate=90&bunimg`                        | Apply all the previous modifiers and flatten them in this way. **Use only when needed**, as the transformed image will be stored in memory in a Buffer.            |

### Flags

| Property   | Docs                                                           | Example                                                        | Comments                                                                                                                                                                                                       |
| ---------- | :------------------------------------------------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| kernel     | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)      | `./bun-logo.png?kernel=nearest&resize=128x128_#ffffff&bunimg`  | Supported kernel: `nearest`, `cubic`, `mitchell`, `lanczos2` and `lanczos3` (default), for `resize` modifier                                                                                                   |
| fit        | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)      | `./bun-logo.png?fit=fit_outside&resize=128x128_#ffffff&bunimg` | Sets `fit` option for `resize` modifier.                                                                                                                                                                       |
| position   | [Docs](https://sharp.pixelplumbing.com/api-resize#resize)      | `./bun-logo.png?position=top&resize=128x128_#ffffff&bunimg`    | Sets `position` option for `resize` modifier.                                                                                                                                                                  |
| enlarge    | \_                                                             | `./bun-logo.png?enlarge&resize=1024x1024&bunimg`               | For `width`, `height` and `resize` modifier. Allow the image to be upscaled. By default the returned image will never be larger than the source in any dimension, while preserving the requested aspect ratio. |
| quality    | \_                                                             | `./bun-logo.png?quality=80&format=webp&bunimg`                 | For `format` modifier and accepted values: 0 to 100 and need the format property to be apply                                                                                                                   |
| brightness | [Docs](https://sharp.pixelplumbing.com/api-operation#modulate) | `./bun-logo.png?brightness=2&modulate&bunimg`                  |
| hue        | [Docs](https://sharp.pixelplumbing.com/api-operation#modulate) | `./bun-logo.png?hue=180&modulate&bunimg`                       |
| lightness  | [Docs](https://sharp.pixelplumbing.com/api-operation#modulate) | `./bun-logo.png?lightness=50&modulate&bunimg`                  |
| saturation | [Docs](https://sharp.pixelplumbing.com/api-operation#modulate) | `./bun-logo.png?saturation=0,5&modulate&bunimg`                |

### Settings

By default, image files will be generated in the .cache folder.
You can modify this behavior with the parameter below.

```ts
BunImageTransformPlugin({
  outputDirectory: "customOutputFolder",
});
```

There are two more advanced options that allow you to disable the default behavior of the file loader and return a relative path to the output folder.

This behavior is perfectly suitable if you have a public folder on a web server where you want to directly place the generated images and work with the relative paths of that public folder.

```ts
BunImageTransformPlugin({
  outputDirectory: "./build/public/img/",
  useRelativePath: true,
  prefixRelativePath: "img/",
});
```

## Credits

This project would not be possible without [Bun](https://github.com/oven-sh/bun) inspiring me to create this plugin.

To the project also [Sharp](https://github.com/lovell/sharp) for making it easy to transform and convert images.

And to the high-performance, secure, and easy-to-use image optimizer server, [IPX](https://github.com/unjs/ipx), which greatly inspired the syntax of the modifiers and usage.

## License

[MIT](./LICENSE)
