import { resolve, dirname, extname } from "path";
import sharp from "sharp";
import {
  getModifierFormatOutput,
  modifiersExecutor,
  modifiersPlanner,
} from "./modifier.js";
import { access, mkdir, stat } from "fs/promises";
import { createHash } from "crypto";

export async function applyImageTransformation(
  path: string,
  outputDirectory: string
): Promise<string> {
  const [left, right] = path.split("?");

  if (!left || !right) {
    throw Error("Invalid path");
  }

  const parameters = right;

  const sourceFile = left;

  let extension = extname(sourceFile).slice(1);

  const foundExtension = getModifierFormatOutput(parameters);

  if (foundExtension) {
    extension = foundExtension;
  }

  const fileMetadata = await stat(sourceFile);

  const hasher = createHash("md5");

  hasher.update(path);
  hasher.update(`size=${fileMetadata.size}`);
  hasher.update(`lastModified=${fileMetadata.mtime}`);
  const hash = hasher.digest("hex");

  const generatedImage = resolve(outputDirectory, `${hash}.${extension}`);

  try {
    await access(generatedImage);

    return generatedImage;
  } catch {
    let image = sharp(sourceFile);

    const modifiers = modifiersPlanner(parameters);

    image = await modifiersExecutor(image, modifiers);

    await mkdir(dirname(generatedImage), {
      recursive: true,
    });

    await image.toFile(generatedImage);

    return generatedImage;
  }
}
