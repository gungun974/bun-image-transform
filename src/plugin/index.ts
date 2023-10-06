import { Settings } from "./PluginSettings.js";
import { BunImageTransformPlugin } from "./bunPlugin.js";
import { ESBuildImageTransformPlugin } from "./esbuildPlugin.js";

/**
 * Universal Bun Image Transform Plugin
 */
export function UniversalBunImageTransformPlugin(settings?: Settings) {
  if (typeof Bun !== "undefined") {
    return BunImageTransformPlugin(settings);
  }
  return ESBuildImageTransformPlugin(settings);
}

export default UniversalBunImageTransformPlugin;

export { BunImageTransformPlugin, ESBuildImageTransformPlugin };
