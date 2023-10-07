await Bun.build({
  entrypoints: ["./src/cli.ts"],
  target: "node",
  splitting: false,
  outdir: "dist",
  external: ["sharp", "commander"],
});
