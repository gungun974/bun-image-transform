import { resolve, dirname, extname, relative, join } from "path";
import { type BunPlugin, type OnLoadCallback } from "bun";
import sharp from "sharp";
import {
  getModifierFormatOutput,
  modifiersExecutor,
  modifiersPlanner,
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
        const [left, right] = path.split("?");

        if (!left || !right) {
          throw Error("Invalid path");
        }

        const parameters = right;

        const sourceFile = left;

        let extension = extname(sourceFile).slice(1);

        const foundExtension = getModifierFormatOutput(parameters);

        if (foundExtension) {
          extension = foundExtension;
        }

        const fileMetadata = Bun.file(sourceFile);

        const hasher = new Bun.CryptoHasher("md5");
        hasher.update(path);
        hasher.update(`size=${fileMetadata.size}`);
        hasher.update(`lastModified=${fileMetadata.lastModified}`);
        const hash = hasher.digest("hex");

        const generatedImage = resolve(outputDirectory, `${hash}.${extension}`);

        try {
          await access(generatedImage);

          return generatedImage;
        } catch {
          let image = sharp(sourceFile);

          const modifiers = modifiersPlanner(parameters);

          image = await modifiersExecutor(image, modifiers);

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
