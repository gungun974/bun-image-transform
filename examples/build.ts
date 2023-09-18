import { BunImageTransformPlugin } from "bun-image-transform";

Bun.build({
  entrypoints: ["./index.ts"],
  // other config

  plugins: [BunImageTransformPlugin()],
  outdir: "./dist",
  target: "bun",
});
