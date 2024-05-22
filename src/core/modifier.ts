import sharp, { type Metadata, type Sharp } from "sharp";
import {
  clampDimensionsPreservingAspectRatio,
  convertToBoolean,
  convertToNumber,
} from "./utils.js";

export type ModifierParameters =
  | WidthModifierParameters
  | HeightModifierParameters
  | ResizeModifierParameters
  | TrimModifierParameters
  | ExtendModifierParameters
  | ExtractModifierParameters
  | RotateModifierParameters
  | FlipModifierParameters
  | FlopModifierParameters
  | SharpenModifierParameters
  | MedianModifierParameters
  | BlurModifierParameters
  | GammaModifierParameters
  | NegateModifierParameters
  | NormalizeModifierParameters
  | ThresholdModifierParameters
  | TintModifierParameters
  | GrayscaleModifierParameters
  | ModulateModifierParameters
  | FormatModifierParameters
  | RenderModifierParameters;

export class ModifierError extends Error {}

//! Controls

const MODIFIER_SEPARATOR = /&amp;|&/g;

export function getModifierFormatOutput(
  rawParameters: string
): string | undefined {
  const rawModifiers = rawParameters
    .replace(/,/g, ".")
    .split(MODIFIER_SEPARATOR);

  for (let index = rawModifiers.length - 1; index >= 0; index--) {
    const rawModifier = rawModifiers[index];

    if (!rawModifier) {
      continue;
    }

    const [modifierType, data] = rawModifier.split("=");

    if (modifierType === "format") {
      if (!data) {
        continue;
      }

      return data;
    }
  }

  return;
}

export function modifiersPlanner(rawParameters: string): ModifierParameters[] {
  const rawModifiers = rawParameters
    .replace(/,/g, ".")
    .split(MODIFIER_SEPARATOR);

  const modifiers: ModifierParameters[] = [];

  let enlargeFlag: boolean = false;
  let kernelFlag: string | undefined;
  let fitFlag: string | undefined;
  let positionFlag: string | undefined;

  let brightnessFlag: number | undefined;
  let hueFlag: number | undefined;
  let lightnessFlag: number | undefined;
  let saturationFlag: number | undefined;

  let qualityFlag: number | undefined;

  const clearFlags = () => {
    enlargeFlag = false;
    kernelFlag = undefined;
    fitFlag = undefined;
    positionFlag = undefined;

    brightnessFlag = undefined;
    hueFlag = undefined;
    lightnessFlag = undefined;
    saturationFlag = undefined;

    qualityFlag = undefined;
  };

  for (let index = 0; index < rawModifiers.length; index++) {
    const rawModifier = rawModifiers[index];

    if (!rawModifier) {
      continue;
    }

    const [modifierType, data] = rawModifier.split("=");

    switch (modifierType) {
      case "enlarge": {
        enlargeFlag = convertToBoolean(data);
        break;
      }
      case "kernel": {
        kernelFlag = data;
        break;
      }
      case "fit": {
        fitFlag = data;
        break;
      }
      case "position": {
        positionFlag = data;
        break;
      }
      case "brightness": {
        brightnessFlag = convertToNumber(data);
        break;
      }
      case "hue": {
        hueFlag = convertToNumber(data);
        break;
      }
      case "lightness": {
        lightnessFlag = convertToNumber(data);
        break;
      }
      case "saturation": {
        saturationFlag = convertToNumber(data);
        break;
      }
      case "quality": {
        qualityFlag = convertToNumber(data);
        break;
      }
      case "width": {
        const width = convertToNumber(data);

        modifiers.push({
          type: "width",
          width,
          enlarge: enlargeFlag,
        });
        clearFlags();
        break;
      }
      case "height": {
        const height = convertToNumber(data);

        modifiers.push({
          type: "height",
          height,
          enlarge: enlargeFlag,
        });
        clearFlags();
        break;
      }
      case "resize": {
        if (!data) {
          break;
        }

        let [size, background] = data.split("_");

        if (!size) {
          throw new ModifierError("Size in resize Modifier is missing");
        }

        let [width, height] = size.split("x").map(Number);

        if (!width) {
          throw new ModifierError("Size in resize Modifier is missing");
        }

        if (!height) {
          height = width;
        }

        modifiers.push({
          type: "resize",
          width,
          height,
          enlarge: enlargeFlag,
          kernel: kernelFlag,
          fit: fitFlag,
          position: positionFlag,
          background,
        });
        clearFlags();
        break;
      }
      case "trim": {
        modifiers.push({
          type: "trim",
        });
        clearFlags();
        break;
      }
      case "extend": {
        if (!data) {
          break;
        }

        let [top, right, bottom, left, background] = data.split("_");

        modifiers.push({
          type: "extend",
          top: convertToNumber(top),
          right: convertToNumber(right),
          bottom: convertToNumber(bottom),
          left: convertToNumber(left),
          background,
        });
        clearFlags();
        break;
      }
      case "extract": {
        if (!data) {
          break;
        }

        let [left, top, width, height] = data.split("_").map(Number);

        if (!left) {
          throw new ModifierError("Left in extract Modifier is missing");
        }
        if (!top) {
          throw new ModifierError("Top in extract Modifier is missing");
        }
        if (!width) {
          throw new ModifierError("Width in extract Modifier is missing");
        }
        if (!height) {
          throw new ModifierError("Height in extract Modifier is missing");
        }

        modifiers.push({
          type: "extract",
          left,
          top,
          width,
          height,
        });
        clearFlags();
        break;
      }
      case "rotate": {
        modifiers.push({
          type: "rotate",
          rotate: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "flip": {
        modifiers.push({
          type: "flip",
        });
        clearFlags();
        break;
      }
      case "flop": {
        modifiers.push({
          type: "flop",
        });
        clearFlags();
        break;
      }
      case "sharpen": {
        modifiers.push({
          type: "sharpen",
          sigma: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "median": {
        modifiers.push({
          type: "median",
          median: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "blur": {
        modifiers.push({
          type: "blur",
          blur: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "gamma": {
        modifiers.push({
          type: "gamma",
          gamma: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "negate": {
        modifiers.push({
          type: "negate",
        });
        clearFlags();
        break;
      }
      case "normalize": {
        modifiers.push({
          type: "normalize",
        });
        clearFlags();
        break;
      }
      case "threshold": {
        modifiers.push({
          type: "threshold",
          threshold: convertToNumber(data),
        });
        clearFlags();
        break;
      }
      case "tint": {
        if (!data) {
          break;
        }

        modifiers.push({
          type: "tint",
          color: data,
        });
        clearFlags();
        break;
      }
      case "grayscale": {
        modifiers.push({
          type: "grayscale",
        });
        clearFlags();
        break;
      }
      case "greyscale": {
        modifiers.push({
          type: "grayscale",
        });
        clearFlags();
        break;
      }
      case "modulate": {
        modifiers.push({
          type: "modulate",
          brightness: brightnessFlag,
          hue: hueFlag,
          lightness: lightnessFlag,
          saturation: saturationFlag,
        });
        clearFlags();
        break;
      }
      case "format": {
        if (!data) {
          break;
        }

        modifiers.push({
          type: "format",
          format: data,
          quality: qualityFlag,
        });
        clearFlags();
        break;
      }
      case "render": {
        modifiers.push({
          type: "render",
        });
        clearFlags();
        break;
      }
    }
  }

  return modifiers;
}

export async function modifiersExecutor(
  sourceImage: Sharp,
  modifiers: ModifierParameters[]
) {
  let image = sourceImage;

  for (let index = 0; index < modifiers.length; index++) {
    const modifier = modifiers[index];

    if (!modifier) {
      continue;
    }

    switch (modifier.type) {
      case "width": {
        image = widthModifier(image, modifier);
        break;
      }
      case "height": {
        image = heightModifier(image, modifier);
        break;
      }
      case "resize": {
        image = resizeModifier(image, await image.metadata(), modifier);
        break;
      }
      case "trim": {
        image = trimModifier(image);
        break;
      }
      case "extend": {
        image = extendModifier(image, modifier);
        break;
      }
      case "extract": {
        image = extractModifier(image, modifier);
        break;
      }
      case "rotate": {
        image = rotateModifier(image, modifier);
        break;
      }
      case "flip": {
        image = flopModifier(image);
        break;
      }
      case "flop": {
        image = flopModifier(image);
        break;
      }
      case "sharpen": {
        image = sharpenModifier(image, modifier);
        break;
      }
      case "median": {
        image = medianModifier(image, modifier);
        break;
      }
      case "blur": {
        image = blurModifier(image, modifier);
        break;
      }
      case "gamma": {
        image = gammaModifier(image, modifier);
        break;
      }
      case "negate": {
        image = negateModifier(image);
        break;
      }
      case "normalize": {
        image = normalizeModifier(image);
        break;
      }
      case "threshold": {
        image = thresholdModifier(image, modifier);
        break;
      }
      case "tint": {
        image = tintModifier(image, modifier);
        break;
      }
      case "grayscale": {
        image = grayscaleModifier(image);
        break;
      }
      case "modulate": {
        image = modulateModifier(image, modifier);
        break;
      }
      case "format": {
        image = formatModifier(image, modifier);
        break;
      }
      case "render": {
        image = await renderModifier(image);
        break;
      }
    }
  }

  return image;
}

//! Resize https://sharp.pixelplumbing.com/api-resize#resize

export type WidthModifierParameters = {
  type: "width";
  width: number;
  enlarge: boolean;
};

function widthModifier(image: Sharp, params: WidthModifierParameters) {
  return image.resize(params.width, undefined, {
    withoutEnlargement: !params.enlarge,
  });
}

export type HeightModifierParameters = {
  type: "height";
  height: number;
  enlarge: boolean;
};

function heightModifier(image: Sharp, params: HeightModifierParameters) {
  return image.resize(undefined, params.height, {
    withoutEnlargement: !params.enlarge,
  });
}

export type ResizeModifierParameters = {
  type: "resize";
  width: number;
  height: number;
  enlarge: boolean;
  fit?: string;
  position?: string;
  kernel?: string;
  background?: string;
};

function resizeModifier(
  image: Sharp,
  meta: Metadata,
  params: ResizeModifierParameters
) {
  let width = params.width;
  let height = params.height;

  // sharp's `withoutEnlargement` doesn't respect the requested aspect ratio, so we need to do it ourselves
  if (!params.enlarge) {
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

export type TrimModifierParameters = {
  type: "trim";
};

function trimModifier(image: Sharp) {
  return image.trim();
}

//! Extend https://sharp.pixelplumbing.com/api-resize#extend

export type ExtendModifierParameters = {
  type: "extend";
  top: number;
  right: number;
  bottom: number;
  left: number;
  background?: string;
};

function extendModifier(image: Sharp, params: ExtendModifierParameters) {
  return image.extend({
    top: params.top,
    right: params.right,
    bottom: params.bottom,
    left: params.left,
    background: params.background,
  });
}

//! Extract https://sharp.pixelplumbing.com/api-resize#extract

type ExtractModifierParameters = {
  type: "extract";
  left: number;
  top: number;
  width: number;
  height: number;
};

function extractModifier(image: Sharp, params: ExtractModifierParameters) {
  return image.extract({
    left: params.left,
    top: params.top,
    width: params.width,
    height: params.height,
  });
}

//! Rotate https://sharp.pixelplumbing.com/api-operation#rotate

export type RotateModifierParameters = {
  type: "rotate";
  rotate: number;
};

function rotateModifier(image: Sharp, params: RotateModifierParameters) {
  return image.rotate(params.rotate);
}

//! Flip https://sharp.pixelplumbing.com/api-operation#flip

export type FlipModifierParameters = {
  type: "flip";
};

function flipModifier(image: Sharp) {
  return image.flip();
}

//! Flop https://sharp.pixelplumbing.com/api-operation#flop

export type FlopModifierParameters = {
  type: "flop";
};

function flopModifier(image: Sharp) {
  return image.flop();
}

//! Sharpen https://sharp.pixelplumbing.com/api-operation#sharpen

export type SharpenModifierParameters = {
  type: "sharpen";
  sigma: number;
};

function sharpenModifier(image: Sharp, params: SharpenModifierParameters) {
  return image.sharpen({
    sigma: params.sigma,
  });
}

//! Median https://sharp.pixelplumbing.com/api-operation#median

export type MedianModifierParameters = {
  type: "median";
  median: number;
};

function medianModifier(image: Sharp, params: MedianModifierParameters) {
  return image.median(params.median);
}

//! Blur https://sharp.pixelplumbing.com/api-operation#blur

export type BlurModifierParameters = {
  type: "blur";
  blur: number;
};

function blurModifier(image: Sharp, params: BlurModifierParameters) {
  return image.blur(params.blur);
}

//! Gamma https://sharp.pixelplumbing.com/api-operation#gamma

export type GammaModifierParameters = {
  type: "gamma";
  gamma: number;
};

function gammaModifier(image: Sharp, params: GammaModifierParameters) {
  return image.gamma(params.gamma);
}

//! Negate https://sharp.pixelplumbing.com/api-operation#negate

export type NegateModifierParameters = {
  type: "negate";
};

function negateModifier(image: Sharp) {
  return image.negate();
}

//! Normalize https://sharp.pixelplumbing.com/api-operation#normalize

export type NormalizeModifierParameters = {
  type: "normalize";
};

function normalizeModifier(image: Sharp) {
  return image.normalize();
}

//! Threshold https://sharp.pixelplumbing.com/api-operation#threshold

export type ThresholdModifierParameters = {
  type: "threshold";
  threshold: number;
};

function thresholdModifier(image: Sharp, params: ThresholdModifierParameters) {
  return image.threshold(params.threshold);
}

//! Tint https://sharp.pixelplumbing.com/api-operation#tint

export type TintModifierParameters = {
  type: "tint";
  color: string;
};

function tintModifier(image: Sharp, params: TintModifierParameters) {
  return image.tint(params.color);
}

//! Grayscale https://sharp.pixelplumbing.com/api-operation#grayscale

export type GrayscaleModifierParameters = {
  type: "grayscale";
};

function grayscaleModifier(image: Sharp) {
  return image.grayscale();
}

//! Modulate https://sharp.pixelplumbing.com/api-operation#grayscale

export type ModulateModifierParameters = {
  type: "modulate";
  brightness?: number;
  saturation?: number;
  hue?: number;
  lightness?: number;
};

function modulateModifier(image: Sharp, params: ModulateModifierParameters) {
  return image.modulate({
    ...(params.brightness
      ? {
          brightness: params.brightness,
        }
      : {}),
    ...(params.saturation
      ? {
          saturation: params.saturation,
        }
      : {}),
    ...(params.hue
      ? {
          hue: params.hue,
        }
      : {}),
    ...(params.lightness
      ? {
          lightness: params.lightness,
        }
      : {}),
  });
}

//! Format https://sharp.pixelplumbing.com/api-output#toformat

type FormatModifierParameters = {
  type: "format";
  format: string;
  quality?: number;
};

function formatModifier(image: Sharp, parameters: FormatModifierParameters) {
  switch (parameters.format) {
    case "png":
      image.png({
        quality: parameters.quality,
      });
      return image;
    case "jpg":
    case "jpeg":
      image.jpeg({
        quality: parameters.quality,
      });
      return image;
    case "webp":
      image.webp({
        quality: parameters.quality,
      });
      return image;
    case "gif":
      image.gif();
      return image;
    case "jp2":
      image.jp2({
        quality: parameters.quality,
      });
      return image;
    case "tiff":
      image.tiff({
        quality: parameters.quality,
      });
      return image;
    case "avif":
      image.avif({
        quality: parameters.quality,
      });
      return image;
    case "heif":
      image.heif({
        quality: parameters.quality,
        compression: "av1",
      });
      return image;
    case "jxl":
      image.jxl({
        quality: parameters.quality,
      });
      return image;
    default:
      throw new ModifierError(`Format ${parameters.format} is unknown`);
  }
}

export type RenderModifierParameters = {
  type: "render";
};

async function renderModifier(image: Sharp) {
  return sharp(await image.withMetadata().toBuffer());
}
