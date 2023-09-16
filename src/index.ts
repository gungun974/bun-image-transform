import { resolve, dirname, extname } from "path";
import { type BunPlugin } from "bun";
import sharp from "sharp";
import {
  blurModifier,
  extendModifier,
  extractModifier,
  flipModifier,
  flopModifier,
  formatModifier,
  gammaModifier,
  grayscaleModifier,
  heightModifier,
  medianModifier,
  negateModifier,
  normalizeModifier,
  resizeModifier,
  rotateModifier,
  sharpenModifier,
  thresholdModifier,
  tintModifier,
  widthModifier,
} from "./modifier";
import { access, mkdir } from "fs/promises";

function BunImageTransformPlugin(settings: {
  cacheDirectory?: string | (() => string);
}): BunPlugin {
  return {
    name: "BunImageTransform",
    async setup(build) {
      let cacheDirectory = ".cache";

      if (settings.cacheDirectory) {
        if (typeof settings.cacheDirectory === "string") {
          cacheDirectory = settings.cacheDirectory;
        } else {
          cacheDirectory = settings.cacheDirectory();
        }
      }

      build.onResolve({ filter: /&bunimg$/ }, async (args) => {
        const path = resolve(dirname(args.importer), args.path);

        const link = new URL(`file://${path}`);

        const parameters = Object.fromEntries(link.searchParams);

        const sourceFile = link.pathname;

        let extension = extname(sourceFile).slice(1);

        if (parameters.format) {
          extension = parameters.format;
        }

        const generatedImage = resolve(
          cacheDirectory,
          `${Bun.hash(path)}.${extension}`,
        );

        try {
          await access(generatedImage);

          return {
            path: generatedImage,
          };
        } catch {
          let image = sharp(sourceFile);

          const meta = await image.metadata();

          image = widthModifier(image, parameters);
          image = heightModifier(image, parameters);
          image = resizeModifier(image, meta, parameters);
          image = extendModifier(image, parameters);
          image = extractModifier(image, parameters);
          image = rotateModifier(image, parameters);
          image = flipModifier(image, parameters);
          image = flopModifier(image, parameters);
          image = sharpenModifier(image, parameters);
          image = medianModifier(image, parameters);
          image = blurModifier(image, parameters);
          image = gammaModifier(image, parameters);
          image = negateModifier(image, parameters);
          image = normalizeModifier(image, parameters);
          image = thresholdModifier(image, parameters);
          image = tintModifier(image, parameters);
          image = grayscaleModifier(image, parameters);
          image = formatModifier(image, parameters);

          await mkdir(dirname(generatedImage), {
            recursive: true,
          });

          await image.toFile(generatedImage);

          return {
            path: generatedImage,
          };
        }
      });
    },
  };
}

export default BunImageTransformPlugin;
