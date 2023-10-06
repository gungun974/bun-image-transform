/**
 * Bun Image Transform Settings
 */
export type Settings = {
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
