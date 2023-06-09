import * as fs from "fs";
import * as path from "path";
import colorLog from "../log";
import { PluginOption } from "vite";
import ManifestParser from "../manifest-parser";

const { resolve } = path;

const outDir = resolve(__dirname, "..", "..", "dist");

export default function makeManifest(
  manifest: chrome.runtime.ManifestV3
): PluginOption {
  return {
    name: "make-manifest",
    buildEnd() {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }

      const manifestPath = resolve(outDir, "manifest.json");
      const manifestString = ManifestParser.convertManifestToString(manifest);

      setTimeout(() => {
        fs.writeFileSync(manifestPath, manifestString);
      }, 3000);

      colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
    },
  };
}
