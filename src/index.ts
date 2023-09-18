import { resolve, dirname, extname, relative, join } from "path";
import { type BunPlugin, type OnLoadCallback } from "bun";
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
  modulateModifier,
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

/**
 * Bun Image Transform Settings
 */
type Settings = {
  /**
   * Default directory when file are output
   */
  outputDirectory?: string | (() => string);
  /**
   * Change the return path of generate image to be a relative path from output directory
   * When enabled this, the plugin stop copy the assets to the build folder
   * You need to copy manually assets or make outputDirectory the build folder
   */
  useRelativePath?: boolean;
  /**
   * Add a prefix on every path generate by relative path, useful for public folder
   */
  prefixRelativePath?: string;
};

/**
 * Bun Image Transform Plugin
 */
export function BunImageTransformPlugin(settings?: Settings): BunPlugin {
  return {
    name: "BunImageTransform",
    async setup(build) {
      let outputDirectory = ".cache";

      if (settings && settings.outputDirectory) {
        if (typeof settings.outputDirectory === "string") {
          outputDirectory = settings.outputDirectory;
        } else {
          outputDirectory = settings.outputDirectory();
        }
      }

      async function generateImage(path: string) {
        const link = new URL(
          `file://${path.replace(/,/g, ".").replace(/#/g, "%23")}`,
        );

        const parameters = Object.fromEntries(link.searchParams);

        const sourceFile = link.pathname;

        let extension = extname(sourceFile).slice(1);

        if (parameters.format) {
          extension = parameters.format;
        }

        const generatedImage = resolve(
          outputDirectory,
          `${Bun.hash(path)}.${extension}`,
        );

        try {
          await access(generatedImage);

          return generatedImage;
        } catch {
          let image = sharp(sourceFile);

          const meta = await image.metadata();

          image = widthModifier(image, parameters);
          image = heightModifier(image, parameters);
          image = resizeModifier(image, meta, parameters);
          image = extendModifier(image, parameters);
          image = extractModifier(image, parameters);
          image = rotateModifier(image, parameters);
          image = modulateModifier(image, parameters);
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

          return generatedImage;
        }
      }

      const onLoadCallback: OnLoadCallback = (args) => {
        const generatedImage = args.path;

        let pathToImage = generatedImage;

        if (settings && settings.useRelativePath) {
          pathToImage = join(
            settings.prefixRelativePath ? settings.prefixRelativePath : "./",
            relative(outputDirectory, generatedImage),
          );

          return {
            contents: `
              export default ${JSON.stringify(pathToImage)}
            `,
            loader: "js",
          };
        }

        return {
          contents: `
              export {default} from ${JSON.stringify(pathToImage)}
            `,
          loader: "js",
        };
      };

      if (build.config) {
        build.onResolve({ filter: /&bunimg$/ }, async (args) => {
          const path = Bun.resolveSync(args.path, process.cwd());

          const generatedImage = await generateImage(path);

          return {
            path: generatedImage,
            namespace: "bun-image-transformed",
          };
        });

        build.onLoad(
          { filter: /./, namespace: "bun-image-transformed" },
          onLoadCallback,
        );
      } else {
        build.onLoad({ filter: /&bunimg$/ }, async (args) => {
          const generatedImage = await generateImage(args.path);

          return onLoadCallback({
            ...args,
            path: generatedImage,
          });
        });
      }
    },
  };
}

export default BunImageTransformPlugin;
