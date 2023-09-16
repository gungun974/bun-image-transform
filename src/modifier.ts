import { type Sharp } from "sharp";

export type Parameters = {
  format?: string;
};

class ModifierError extends Error {}

export function formatModifier(image: Sharp, parameters: Parameters) {
  if (!parameters.format) {
    return image;
  }

  switch (parameters.format) {
    case "png":
      image.png();
      return image;
    case "jpg":
    case "jpeg":
      image.jpeg();
      return image;
    case "webp":
      image.webp();
      return image;
    case "gif":
      image.gif();
      return image;
    case "jp2":
      image.jp2();
      return image;
    case "tiff":
      image.tiff();
      return image;
    case "avif":
      image.avif();
      return image;
    case "heif":
      image.heif();
      return image;
    case "jxl":
      image.jxl();
      return image;
    case "raw":
      image.raw();
      return image;
    default:
      throw new ModifierError(`Format ${parameters.format} is unknown`);
  }
}
