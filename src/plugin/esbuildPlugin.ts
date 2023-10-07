import { relative, join, resolve } from "path";
import { OnLoadArgs, OnLoadResult, type Plugin } from "esbuild";
import { applyImageTransformation } from "../core/core.js";
import { Settings } from "./PluginSettings.js";

type OnLoadCallback = (
  args: OnLoadArgs
) => OnLoadResult | null | undefined | Promise<OnLoadResult | null | undefined>;

/**
 * ESBuild Image Transform Plugin
 */
export function ESBuildImageTransformPlugin(settings?: Settings): Plugin {
  return {
    name: "ESBuildImageTransform",
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
            contents: pathToImage,
            loader: "text",
          };
        }

        return {
          contents: pathToImage,
          loader: "text",
        };
      };

      build.onResolve({ filter: /&bunimg$/ }, async (args) => {
        const path = resolve(process.cwd(), args.path);

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
    },
  };
}

export default ESBuildImageTransformPlugin;
