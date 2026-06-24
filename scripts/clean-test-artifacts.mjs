import { rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const generatedArtifactDirs = ["test-results", "playwright-report", "blob-report"];

for (const artifactDir of generatedArtifactDirs) {
  rmSync(join(root, artifactDir), { force: true, recursive: true });
}
