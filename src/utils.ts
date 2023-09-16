import { Metadata } from "sharp";

export function clampDimensionsPreservingAspectRatio(
  sourceDimensions: Metadata,
  desiredDimensions: { width: number; height: number },
) {
  let sourceWidth = sourceDimensions.width ?? -1;
  let sourceHeight = sourceDimensions.height ?? -1;

  const desiredAspectRatio = desiredDimensions.width / desiredDimensions.height;

  let { width, height } = desiredDimensions;

  if (width > sourceWidth) {
    width = sourceWidth;
    height = Math.round(sourceWidth / desiredAspectRatio);
  }

  if (height > sourceHeight) {
    height = sourceHeight;
    width = Math.round(sourceHeight * desiredAspectRatio);
  }

  return { width, height };
}
