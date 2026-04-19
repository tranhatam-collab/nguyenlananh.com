import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { RELEASE_INCLUDE_PATHS, RELEASE_STRIP_FILE_PATTERNS } from "./lib/release-config.mjs";

const ROOT = process.cwd();
const releaseDir = fs.mkdtempSync(path.join(os.tmpdir(), "nla-release-dist."));

for (const rel of RELEASE_INCLUDE_PATHS) {
  const source = path.join(ROOT, rel);
  if (!fs.existsSync(source)) continue;
  const destination = path.join(releaseDir, rel);
  fs.cpSync(source, destination, { recursive: true });
}

function walkAndClean(targetPath) {
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      walkAndClean(fullPath);
      continue;
    }

    if (RELEASE_STRIP_FILE_PATTERNS.some((pattern) => pattern.test(entry.name))) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

walkAndClean(releaseDir);
process.stdout.write(`${releaseDir}\n`);
