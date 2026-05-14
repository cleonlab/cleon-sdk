import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "schemas/index": "src/schemas/index.ts",
    "hashing/index": "src/hashing/index.ts",
    "contracts/index": "src/contracts/index.ts",
    "signatures/index": "src/signatures/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "es2022",
  outDir: "dist",
});
