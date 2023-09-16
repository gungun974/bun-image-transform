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
    default:
      throw new ModifierError(`Format ${parameters.format} is unknown`);
  }
}