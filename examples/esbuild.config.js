import esbuild from "esbuild";
import { ESBuildImageTransformPlugin } from "bun-image-transform";

esbuild.build({
  target: "esnext",
  format: "esm",
  entryPoints: ["index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "dist",
  plugins: [ESBuildImageTransformPlugin()],
  loader: {
    ".ts": "ts",
  },
});
