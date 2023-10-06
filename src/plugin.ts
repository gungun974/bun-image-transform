import { relative, join } from "path";
import { type BunPlugin, type OnLoadCallback } from "bun";
import { applyImageTransformation } from "./core";

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
        return await applyImageTransformation(path, outputDirectory);
      }

      const onLoadCallback: OnLoadCallback = (args) => {
        const generatedImage = args.path;

        let pathToImage = generatedImage;

        if (settings && settings.useRelativePath) {
          pathToImage = join(
            settings.prefixRelativePath ? settings.prefixRelativePath : "./",
            relative(outputDirectory, generatedImage)
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
          onLoadCallback
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
