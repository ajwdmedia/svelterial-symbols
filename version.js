//@ts-check

import path, { resolve } from "path";
import { readFile, writeFile } from "fs/promises";

const paths = [
    resolve("./packages/light/package.json"),
    resolve("./packages/regular/package.json"),
    resolve("./packages/bold/package.json"),
]


let thisPackageJSON = JSON.parse(await readFile(resolve("./package.json"), { encoding: "utf-8" }));

let updatePackage = async (path) => {
    let packageJSON = JSON.parse(await readFile(path, { encoding: "utf-8" }));
    packageJSON.version = thisPackageJSON.version;
    await writeFile(path, JSON.stringify(packageJSON, null, 4), { encoding: "utf-8" });
};

await Promise.all(paths.map(path => updatePackage(path)));