import { plugin, sleep } from "bun";
import BunImageTransformPlugin from "../src";
import { tmpdir } from "os";
import { extname, resolve } from "path";
import { describe, expect, it } from "bun:test";
import sharp from "sharp";
import { ModifierError } from "../src/modifier";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

plugin(
  BunImageTransformPlugin({
    outputDirectory: () =>
      resolve(tmpdir(), "bun-image-transform-test", generateUUID()),
  }),
);

describe("import", () => {
  it("should import image and return a link to generated image", async () => {
    const { default: image }: any = await import("./bun-logo.png?&bunimg");
    const originalFile = Bun.file(resolve(import.meta.dir, "./bun-logo.png"));
    const generatePath = image.replace("file:", "");
    const newFile = Bun.file(generatePath);

    expect(generatePath).not.toBe(resolve(import.meta.dir, "./bun-logo.png"));
    expect(Bun.hash(await newFile.arrayBuffer())).not.toBe(
      Bun.hash(await originalFile.arrayBuffer()),
    );
  });

  it("should not import image and generate when image don't have the `&bunimg` suffix", async () => {
    const { default: image }: any = await import("./bun-logo.png");

    expect(image.replace("file:", "")).toBe(
      resolve(import.meta.dir, "./bun-logo.png"),
    );
  });

  it("should don't touch generated image when already generate", async () => {
    const { default: image }: any = await import("./bun-logo.png?&bunimg");
    const firstGeneratePath = image.replace("file:", "");

    const { lastModified: firstLastModified, size: firstSize } =
      Bun.file(firstGeneratePath);

    await sleep(1);

    const { default: imageB }: any = await import("./bun-logo.png?&bunimg");
    const secondGeneratePath = imageB.replace("file:", "");
    const { lastModified: secondLastModified, size: secondSize } =
      Bun.file(secondGeneratePath);

    expect(secondGeneratePath).toBe(firstGeneratePath);
    expect(secondLastModified).toBe(firstLastModified);
    expect(secondSize).toBe(firstSize);
  });
});

describe("resize", () => {
  it("should resize bun logo with a width of 16px", async () => {
    const { default: image }: any = await import(
      "./bun-logo.png?width=16&bunimg"
    );

    const metadata = await sharp(image.replace("file:", "")).metadata();

    expect(metadata.width).toBe(16);
  });

  it("should resize bun logo with a height of 16px", async () => {
    const { default: image }: any = await import(
      "./bun-logo.png?height=16&bunimg"
    );

    const metadata = await sharp(image.replace("file:", "")).metadata();

    expect(metadata.height).toBe(16);
  });

  it("should resize bun logo with a width of 32px and height of 16px", async () => {
    const { default: image }: any = await import(
      "./bun-logo.png?resize=32x16&bunimg"
    );

    const metadata = await sharp(image.replace("file:", "")).metadata();

    expect(metadata.width).toBe(32);
    expect(metadata.height).toBe(16);
  });
});

describe("format", () => {
  it.each([
    ["png", ".png", "png"],
    ["jpg", ".jpg", "jpeg"],
    ["jpeg", ".jpeg", "jpeg"],
    ["webp", ".webp", "webp"],
    ["gif", ".gif", "gif"],
    ["avif", ".avif", "heif"],
    ["heif", ".heif", "heif"],
  ])(
    "should convert the file to %s",
    async (format, extension, specialFormat) => {
      const { default: image }: any = await import(
        `./bun-logo.png?format=${format}&bunimg`
      );

      const metadata = await sharp(image.replace("file:", "")).metadata();

      expect(metadata.format).toBe(specialFormat);
      expect(extname(image)).toBe(extension);
    },
  );

  it("should throw error when format type is unknown", async () => {
    expect(
      () => import(`./bun-logo.png?format=myFutureImageFormat&bunimg`),
    ).toThrow(new ModifierError("Format myFutureImageFormat is unknown"));
  });

  it("should format bun logo in jpeg with quality of 65", async () => {
    const { default: image }: any = await import(
      "./bun-logo.png?quality=65&format=jpeg&bunimg"
    );
    const targetFile = Bun.file(resolve(import.meta.dir, "./bun-logo-65.jpeg"));

    const generatePath = image.replace("file:", "");
    const newFile = Bun.file(generatePath);

    expect(Bun.hash(await newFile.arrayBuffer())).toBe(
      Bun.hash(await targetFile.arrayBuffer()),
    );
  });
});
