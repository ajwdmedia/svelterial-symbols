//@ts-check

import { resolve } from "node:path";
import { readdir, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { parse } from "svg-parser";

const paths = [
    {
        source: resolve("./node_modules/@material-symbols/svg-200"),
        target: resolve("./src/svg/light/"),
        name: "@ajwdmedia/svelterial-symbols-light",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-400"),
        target: resolve("./src/svg/regular/"),
        name: "@ajwdmedia/svelterial-symbols",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-700"),
        target: resolve("./src/svg/bold/"),
        name: "@ajwdmedia/svelterial-symbols-bold",
    }
];

/**
 * 
 * @param {string} name 
 * @returns {string}
 */
const convertNameToPascalCase = (name) => {
    let hold = name.split(/[_\- ]/g).map(item => item[0].toUpperCase() + item.slice(1).toLowerCase()).join("");
    if (hold[0].match(/\d/)) hold = "Icon" + hold;
    return hold;
};

const convertSVG = async (rootPath, base, file) => {
    let svgString = await readFile(resolve(rootPath, base, file + ".svg"), { encoding: "utf8" });
    const filled = file.endsWith("-fill");
    const fileName = convertNameToPascalCase((filled) ? file.slice(0, -5) : file);

    const parsed = parse(svgString);
    let queue = [ ...parsed.children ];
    let pathData = "";
    while (queue.length > 0) {
        const work = queue.shift();

        if (!work) break;
        if (work.type === "text") continue;
        for (let child of work.children) {
            if (typeof child !== "string") queue.push(child);
        }
        if (work.tagName !== "path") continue;
        // we have a path el - if d is present we are in business
        if (work.properties && "d" in work.properties && typeof work.properties["d"] === "string") {
            pathData = "" + work.properties.d;
            break;
        }
    }

    return { id: file, variant: convertNameToPascalCase(base), name: fileName, pathData, filled };
};

/**
 * 
 * @param {string} packageName 
 * @param {string} version
 * @param {Map<string, string[]>} mapping 
 */
const constructPackageJson = (packageName, version, mapping) => {
    let exportsField = {
        ".": {
            import: "./index.js",
            types: "./index.d.ts",
        }
    };
    for (const [ variant ] of mapping) {
        const path = `./${variant}`;
        exportsField[path] = {
            import: path + "/index.js",
            types: path + "/index.d.ts",
        }
        exportsField[path + "/*.svelte"] = {
            svelte: path + "/*.svelte",
            import: path + "/*.svelte",
            types: path + "/*.svelte.d.ts",
        }
    }

    return JSON.stringify({
        name: packageName,
        version: version,
        main: "./index.js",
        peerDependencies: {
            svelte: "^5.0.0"
        },
        type: "module",
        exports: exportsField
    }, null, 4);
}

/**
 * 
 * @param {string} sourcePath 
 * @param {string} targetPath 
 * @param {string} name 
 */
let convertWidth = async (sourcePath, targetPath, name) => {
    /**
     * @type {Map<string,Awaited<ReturnType<typeof convertSVG>>[]>}
     */
    let foldered = new Map();

    // Each folder is a style
    let folders = (await readdir(sourcePath, { withFileTypes: true, encoding: "utf8" })).filter(item => item.isDirectory()).map(item => item.name);

    for (const folder of folders) {

        let files = (await readdir(resolve(sourcePath, folder), { encoding: "utf8" })).filter(item => item.endsWith(".svg")).map(item => item.slice(0, -4));
        let converted = await Promise.all(files.map(name => convertSVG(sourcePath, folder, name)));

        const folders = {
            lines: convertNameToPascalCase(folder),
            fills: convertNameToPascalCase(folder) + "Filled",
        };

        converted.forEach(it => {
            let folderName = (it.filled) ? folders.fills : folders.lines;
            if (!foldered.has(folderName)) {
                foldered.set(folderName, []);
            }

            foldered.get(folderName)?.push(it);
        })
    }

    let built = [...foldered.entries()].map(([ style, list ]) => {
        
        const content = list.map(it => `    ${it.name}: "${it.pathData}",\n`).join("");
        return [ style, `export const paths = {\n${content}};\n` ];
        
    });
    

    for (let [ file, content ] of built) {
        await mkdir(resolve(targetPath), { recursive: true });
        await writeFile(resolve(targetPath, file + ".ts"), content, { "encoding": "utf-8" });
    }

}

await rm(resolve("./src/svg"), { recursive: true, force: true })
await mkdir(resolve("./src/svg"), { recursive: true });

await Promise.all( paths.map(({ source, target, name }) => convertWidth(source, target, name)))
