import { resolve } from "path";
import { Dirent, readdirSync, readFileSync, writeFileSync } from "fs";
import { TypescriptFile } from "./TypescriptFile";
import * as prettier from "prettier";

function getFiles(dir, files: string[]) {
  const dirents: Dirent[] = readdirSync(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      getFiles(res, files);
    } else {
      if (res.endsWith(".ts")) {
        files.push(res);
      }
    }
  }

  return files;
}

function processFile(filePath: string) {
  const fileContents = readFileSync(filePath);
  const fileContentsStr = fileContents.toString();
  const lines: string[] = fileContentsStr.split(/(?:\r\n|\r|\n)/g);

  const newFiles: TypescriptFile[] = [];
  const fileNames: string[] = [];
  let currentFile = { lines: [] } as TypescriptFile;

  const cycleFile = () => {
    newFiles.push(currentFile);
    currentFile = { lines: [] } as TypescriptFile;
  };

  const setFilename = (line: string) => {
    const className = line.split(" ")[2];
    currentFile.fileName = `${className}.ts`;
    currentFile.className = className;
  };

  for (const line of lines) {
    // We want to avoid unnecessary empty lines
    if (line.trim().length == 0) {
      continue;
    }

    /** If the line indicates that it is exporting something
     * we have the start of a Type, so we either have a one liner, or
     * a new complex entity
     */
    if (line.indexOf("export") > -1) {
      if (!currentFile.fileName) {
        setFilename(line);
      } else {
        cycleFile();
        setFilename(line);
      }
    }

    //Handle imports between
    currentFile.lines.push(`${line}\n`);

    if (line.indexOf("}") > -1) {
      cycleFile();
    }
  }

  return newFiles;
}

function handleImports(files: TypescriptFile[]) {
  //Extract all filenames
  const filenames: string[] = files.map((file) => file.className);
  //Read lines to find imports
  for (const file of files) {
    const imports: string[] = [];
    for (const line of file.lines) {
      if (line.indexOf("=") > -1 || line.indexOf(": ") > -1) {
        for (const filename of filenames) {
          if (line.indexOf(filename) > -1) {
            imports.push(filename);
          }
        }
      }
    }

    for (const newImport of imports) {
      if (file.className != newImport) {
        file.lines.unshift(`import { ${newImport} } from './${newImport}';\n`);
      }
    }
  }
}

const files = getFiles(
  "/home/aloisio/Dev/Workspaces/typescript-types-separator/test/samples/",
  []
);

files.forEach((file) => {
  const newFiles = processFile(file);
  handleImports(newFiles);

  newFiles.forEach((file) =>
    writeFileSync(
      `./output/${file.fileName}`,
      prettier.format(file.lines.join(""), { semi: true, parser: "typescript" })
    )
  );
});
