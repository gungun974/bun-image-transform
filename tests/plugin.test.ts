import { plugin } from "bun";
import BunImageTransformPlugin from "../src";
import { tmpdir } from "os";
import { resolve } from "path";
import { describe, expect, it } from "bun:test";
import sharp from "sharp";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

plugin(
  BunImageTransformPlugin({
    cacheDirectory: resolve(tmpdir(), generateUUID()),
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
