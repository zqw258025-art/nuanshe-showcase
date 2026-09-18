import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const distDir = path.join(rootDir, "dist");

function assertInsideRoot(target) {
  const relative = path.relative(rootDir, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to operate outside showcase root: ${target}`);
  }
}

async function directorySize(directory) {
  let bytes = 0;
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      bytes += await directorySize(fullPath);
    } else {
      bytes += (await stat(fullPath)).size;
    }
  }
  return bytes;
}

async function build() {
  assertInsideRoot(distDir);

  const required = [
    "index.html",
    "src/styles.css",
    "src/app.js",
    "src/demo-config.js",
    "public/images/sample-input.jpg",
    "public/images/result-afternoon.jpg",
  ];

  for (const relativePath of required) {
    if (!existsSync(path.join(rootDir, relativePath))) {
      throw new Error(`Missing required file: ${relativePath}`);
    }
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await cp(path.join(rootDir, "index.html"), path.join(distDir, "index.html"));
  await cp(path.join(rootDir, "src"), path.join(distDir, "src"), { recursive: true });
  await cp(path.join(rootDir, "public", "images"), path.join(distDir, "images"), { recursive: true });
  await writeFile(path.join(distDir, ".nojekyll"), "", "utf8");
  await cp(path.join(distDir, "index.html"), path.join(distDir, "404.html"));

  const bytes = await directorySize(distDir);
  console.log(`Built static showcase: ${distDir}`);
  console.log(`Output size: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
