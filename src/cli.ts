#!/usr/bin/env node

import fs, { readFile, stat, writeFile } from "fs/promises";
import { program } from "commander";
import path, { dirname, join, relative, resolve } from "path";
import { applyImageTransformation } from "./core/core";
import { colors } from "./colors";

const directoryPath = process.argv[2]!;

let filePattern = new RegExp("\\.html$");

const bunImageTransformURLPattern =
  /bunimg:\/\/([-a-zA-Z0-9()@:%_\+.~#?&\/=,;]{1,256})/gm;

let ignoredDirectories = ["node_modules"];

let relativeMode:
  | "relativeToFile"
  | "relativeToProcess"
  | "relativeToSpecificFolder" = "relativeToFile";

let imageResourceFolder = "./";

let outputDirectory = ".cache";
let useRelativePath = false;
let prefixRelativePath = "img/";

let dryRun = false;

async function listFilesByPattern(
  directory: string,
  pattern: RegExp
): Promise<string[]> {
  let results: string[] = [];

  const files = await fs.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      if (ignoredDirectories.includes(file.name)) {
        continue;
      }

      const nestedFiles = await listFilesByPattern(
        path.join(directory, file.name),
        pattern
      );
      results = results.concat(nestedFiles);
    } else if (pattern.test(file.name)) {
      results.push(path.join(directory, file.name));
    }
  }

  return results;
}

type FileToTransform = {
  source: string;
  urls: {
    url: string;
    path: string;
    output?: string;
  }[];
};

async function extractImageToTransform(
  files: string[]
): Promise<FileToTransform[]> {
  let results: FileToTransform[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    if (!file) {
      continue;
    }

    console.log(
      `${colors.yellow}Extract Image information for ${colors.blue}${file}${colors.clear}`
    );

    const content = await readFile(file, "utf8");

    const matches = content.match(bunImageTransformURLPattern);

    if (!matches) {
      continue;
    }

    const result: FileToTransform = {
      source: file,
      urls: [],
    };

    for (let j = 0; j < matches.length; j++) {
      const match = matches[j];

      if (!match) {
        continue;
      }

      const path = match.replace(/^bunimg:\/\//, "");

      switch (relativeMode) {
        case "relativeToFile": {
          result.urls.push({
            url: match,
            path: resolve(dirname(file), path),
          });
          break;
        }
        case "relativeToProcess": {
          result.urls.push({
            url: match,
            path: resolve(process.cwd(), path),
          });
          break;
        }
        case "relativeToSpecificFolder": {
          result.urls.push({
            url: match,
            path: resolve(imageResourceFolder, path),
          });
          break;
        }
      }
    }

    results.push(result);
  }
  return results;
}

async function generateImages(files: FileToTransform[]) {
  console.log(`${colors.yellow}Generate image${colors.clear}`);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    if (!file) {
      continue;
    }
    for (let j = 0; j < file.urls.length; j++) {
      const url = file.urls[j];

      if (!url) {
        continue;
      }

      const rawFilePath = url.path.split("?")[0];

      if (rawFilePath && !(await stat(rawFilePath))) {
        console.error(
          `${colors.red}File ${colors.blue}${rawFilePath}${colors.red} is not found for url ${colors.green}${url.url}${colors.clear}`
        );
        process.exit(1);
      }

      url.output = await applyImageTransformation(url.path, outputDirectory);
      console.log(
        `${colors.yellow}Transform ${colors.blue}${url.path}${colors.yellow} to ${colors.blue}${url.output}${colors.clear}`
      );
    }
  }
}

async function updateFiles(files: FileToTransform[]) {
  console.log(`${colors.yellow}Update Files${colors.clear}`);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    if (!file) {
      continue;
    }

    let content = await readFile(file.source, "utf8");

    for (let j = 0; j < file.urls.length; j++) {
      const url = file.urls[j];

      if (!url) {
        continue;
      }

      if (!url.output) {
        continue;
      }

      let pathToImage = url.output;

      if (useRelativePath) {
        pathToImage = join(
          prefixRelativePath ? prefixRelativePath : "./",
          relative(outputDirectory, url.output)
        );
      }

      content = content.replaceAll(url.url, pathToImage);
    }

    if (dryRun) {
      console.log(`${colors.blue}[${file.source}]${colors.clear}`);
      console.log(`${colors.green}${content}${colors.clear}`);

      return;
    }

    console.log(`${colors.blue}Write to ${file.source}${colors.clear}`);

    await writeFile(file.source, content, "utf8");
  }
}

async function main() {
  program
    .argument("<directory>", "Directory to scan and transform image")
    .option(
      "-e, --exclude <dir>",
      "Directory to exclude from the scan",
      (dir, previous) => previous.concat([dir]),
      ["node_modules"]
    )
    .option("-p, --pattern <pattern>", "Pattern for file matching", "\\.html$")
    .option(
      "-m, --relative-mode <mode>",
      "Define how file path are resolve in found file [relativeToFile, relativeToProcess, relativeToSpecificFolder]",
      "relativeToFile"
    )
    .option(
      "-r, --resource-directory <directory>",
      "Specify a directory when image are search inside. Only use in 'relativeToSpecificFolder' relative mode",
      "relativeToFile"
    )
    .option(
      "-o, --output <directory>",
      "Default directory when file are output",
      ".cache"
    )
    .option(
      "--use-output-relative-path",
      "Don't use absolute path in output file",
      false
    )
    .option(
      "--output-prefix-relative-path <path>",
      "Default prefix before every output prefix relative path",
      "./"
    )
    .option(
      "--dry",
      "Execute image transformation without touching existing file",
      false
    )
    .parse(process.argv);

  const options = program.opts();

  ignoredDirectories = options.exclude;
  filePattern = new RegExp(options.pattern);

  outputDirectory = options.output;
  useRelativePath = options.useOutputRelativePath;
  prefixRelativePath = options.outputPrefixRelativePath;

  relativeMode = options.relativeMode;

  switch (relativeMode) {
    case "relativeToFile": {
      break;
    }
    case "relativeToProcess": {
      break;
    }
    case "relativeToSpecificFolder": {
      break;
    }
    default: {
      console.error(`${colors.red}Invalid relative mode${colors.clear}`);
      process.exit(1);
    }
  }

  imageResourceFolder = options.resourceDirectory;

  dryRun = options.dry;

  if (dryRun) {
    console.log(`${colors.red}[DRY RUN]${colors.red}`);
  }

  const files = await listFilesByPattern(directoryPath, filePattern);

  const results = await extractImageToTransform(files);

  await generateImages(results);

  await updateFiles(results);
}

main().catch((error) => {
  console.error(error);
});
