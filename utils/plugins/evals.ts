import colorLog from "../log";
import { PluginOption } from "vite";

export function removeEvals(): PluginOption {
  return {
    name: "remove-eval",
    apply: "build",
    renderChunk(code) {
      const found = code.includes('eval("require")');
      if (found) {
        const modifiedCode = code.replaceAll('eval("require")', "require");
        colorLog("remove-eval: Removed evals from chunks", "warning");
        return modifiedCode;
      }
      colorLog("remove-eval: No evals found in chunks", "success");
      return null;
    },
  };
}

export function checkEvals(): PluginOption {
  return {
    name: "check-eval",
    apply: "build",
    renderChunk(code, chunk) {
      const regex = /eval\(/g;
      let result;

      while ((result = regex.exec(code)) !== null) {
        console.warn(
          `[check-eval] Warning: "eval(" found in chunk ${chunk.fileName} at position ${result.index}`
        );
      }
      colorLog("check-eval: No evals found in chunks", "success");
      return null; // return null so Vite knows we didn't modify the code.
    },
  };
}
