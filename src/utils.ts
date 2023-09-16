import { Metadata } from "sharp";

export function convertToNumber(text: string): number;
export function convertToNumber(text: string | undefined): number | undefined {
  if (text === undefined) {
    return;
  }

  const number = parseInt(text, 10);

  if (isNaN(number)) {
    throw new Error(`Fail to convert ${text} to a number`);
  }

  return number;
}

export function convertToBoolean(text: string | undefined): boolean {
  if (text === undefined) {
    return false;
  }

  return (
    text.trim().toLowerCase() === "true" || text.trim().toLowerCase() === "1"
  );
}

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
