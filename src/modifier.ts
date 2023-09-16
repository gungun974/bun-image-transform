import { type Metadata, type Sharp } from "sharp";
import {
  clampDimensionsPreservingAspectRatio,
  convertToBoolean,
  convertToNumber,
} from "./utils";

export type Parameters = {
  width?: string;
  height?: string;
  resize?: string;
  fit?: string;
  position?: string;
  kernel?: string;
  enlarge?: string;
  background?: string;
  format?: string;
};

class ModifierError extends Error {}

//! Resize https://sharp.pixelplumbing.com/api-resize#resize

export function widthModifier(image: Sharp, params: Parameters) {
  if (!params.width || params.resize) {
    return image;
  }

  return image.resize(convertToNumber(params.width), undefined, {
    // withoutEnlargement: !convertToBoolean(params.enlarge),
  });
}

export function heightModifier(image: Sharp, params: Parameters) {
  if (!params.height || params.resize) {
    return image;
  }

  return image.resize(undefined, convertToNumber(params.height), {
    withoutEnlargement: !convertToBoolean(params.enlarge),
  });
}

export function resizeModifier(
  image: Sharp,
  meta: Metadata,
  params: Parameters,
) {
  if (!params.resize) {
    return image;
  }

  let [width, height] = params.resize.split("x").map(Number);
  if (!width) {
    return image;
  }

  if (!height) {
    height = width;
  }

  // sharp's `withoutEnlargement` doesn't respect the requested aspect ratio, so we need to do it ourselves
  if (!convertToBoolean(params.enlarge)) {
    const clamped = clampDimensionsPreservingAspectRatio(meta, {
      width,
      height,
    });
    width = clamped.width;
    height = clamped.height;
  }
  return image.resize(width, height, {
    fit: <any>params.fit,
    position: params.position,
    background: params.background,
    kernel: <any>params.kernel,
  });
}

//! Format https://sharp.pixelplumbing.com/api-output#toformat

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
