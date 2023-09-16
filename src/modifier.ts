import { type Metadata, type Sharp } from "sharp";
import {
  clampDimensionsPreservingAspectRatio,
  convertToBoolean,
  convertToNumber,
} from "./utils";

export type Parameters = {
  grayscale?: string;
  tint?: string;
  threshold?: string;
  normalize?: string;
  negate?: string;
  gamma?: string;
  blur?: string;
  median?: string;
  sharpen?: string;
  flop?: string;
  flip?: string;
  width?: string;
  height?: string;
  resize?: string;
  fit?: string;
  position?: string;
  kernel?: string;
  enlarge?: string;
  background?: string;
  format?: string;
  quality?: string;
  trim?: string;
  extend?: string;
  extract?: string;
  rotate?: string;
};

export class ModifierError extends Error {}

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

//! Trim https://sharp.pixelplumbing.com/api-resize#trim

export function trimModifier(image: Sharp, params: Parameters) {
  if (!params.trim) {
    return image;
  }

  return image.trim();
}

//! Extend https://sharp.pixelplumbing.com/api-resize#extend

export function extendModifier(image: Sharp, params: Parameters) {
  if (!params.extend) {
    return image;
  }

  let [top, right, bottom, left] = params.extend.split("_").map(Number);

  return image.extend({
    top,
    right,
    bottom,
    left,
  });
}

//! Extract https://sharp.pixelplumbing.com/api-resize#extract

export function extractModifier(image: Sharp, params: Parameters) {
  if (!params.extract) {
    return image;
  }

  let [left, top, width, height] = params.extract.split("_").map(Number);

  return image.extract({
    left,
    top,
    width,
    height,
  });
}

//! Rotate https://sharp.pixelplumbing.com/api-operation#rotate

export function rotateModifier(image: Sharp, params: Parameters) {
  if (!params.rotate) {
    return image;
  }

  return image.rotate(convertToNumber(params.rotate));
}

//! Flip https://sharp.pixelplumbing.com/api-operation#flip

export function flipModifier(image: Sharp, params: Parameters) {
  if (!params.flip) {
    return image;
  }

  return image.flip();
}

//! Flop https://sharp.pixelplumbing.com/api-operation#flop

export function flopModifier(image: Sharp, params: Parameters) {
  if (!params.flop) {
    return image;
  }

  return image.flop();
}

//! Sharpen https://sharp.pixelplumbing.com/api-operation#sharpen

export function sharpenModifier(image: Sharp, params: Parameters) {
  if (!params.sharpen) {
    return image;
  }

  return image.sharpen({
    sigma: convertToNumber(params.sharpen),
  });
}

//! Median https://sharp.pixelplumbing.com/api-operation#median

export function medianModifier(image: Sharp, params: Parameters) {
  if (!params.median) {
    return image;
  }

  return image.median(convertToNumber(params.median));
}

//! Blur https://sharp.pixelplumbing.com/api-operation#blur

export function blurModifier(image: Sharp, params: Parameters) {
  if (!params.blur) {
    return image;
  }

  return image.blur(convertToNumber(params.blur));
}

//! Gamma https://sharp.pixelplumbing.com/api-operation#gamma

export function gammaModifier(image: Sharp, params: Parameters) {
  if (!params.gamma) {
    return image;
  }

  return image.gamma(convertToNumber(params.gamma));
}

//! Negate https://sharp.pixelplumbing.com/api-operation#negate

export function negateModifier(image: Sharp, params: Parameters) {
  if (!params.negate) {
    return image;
  }

  return image.negate();
}

//! Normalize https://sharp.pixelplumbing.com/api-operation#normalize

export function normalizeModifier(image: Sharp, params: Parameters) {
  if (!params.normalize) {
    return image;
  }

  return image.normalize();
}

//! Threshold https://sharp.pixelplumbing.com/api-operation#threshold

export function thresholdModifier(image: Sharp, params: Parameters) {
  if (!params.threshold) {
    return image;
  }

  return image.threshold(convertToNumber(params.threshold));
}

//! Tint https://sharp.pixelplumbing.com/api-operation#tint

export function tintModifier(image: Sharp, params: Parameters) {
  if (!params.tint) {
    return image;
  }

  return image.threshold(params.tint);
}

//! Grayscale https://sharp.pixelplumbing.com/api-operation#grayscale

export function grayscaleModifier(image: Sharp, params: Parameters) {
  if (!params.grayscale) {
    return image;
  }

  return image.grayscale();
}

//! Format https://sharp.pixelplumbing.com/api-output#toformat

export function formatModifier(image: Sharp, parameters: Parameters) {
  if (!parameters.format) {
    return image;
  }

  switch (parameters.format) {
    case "png":
      image.png({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "jpg":
    case "jpeg":
      image.jpeg({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "webp":
      image.webp({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "gif":
      image.gif();
      return image;
    case "jp2":
      image.jp2({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "tiff":
      image.tiff({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "avif":
      image.avif({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "heif":
      image.heif({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    case "jxl":
      image.jxl({
        quality: convertToNumber(parameters.quality),
      });
      return image;
    default:
      throw new ModifierError(`Format ${parameters.format} is unknown`);
  }
}
