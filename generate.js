//@ts-check

import { resolve } from "node:path";
import { readdir, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { parse } from "svg-parser";
import packageJson from "./package.json" with { type: "json" };

const paths = [
    {
        source: resolve("./node_modules/@material-symbols/svg-200"),
        target: resolve("./src/lib/light/svg"),
        name: "@ajwdmedia/svelterial-symbols-light",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-400"),
        target: resolve("./src/lib/regular/svg"),
        name: "@ajwdmedia/svelterial-symbols",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-700"),
        target: resolve("./src/lib/bold/svg"),
        name: "@ajwdmedia/svelterial-symbols-bold",
    }
];

/**
 * @type {Record<string, string>}
 */
const copies = {
    "./src/lib/bold/icon.d.ts":         "./src/lib/regular/icon.d.ts",
    "./src/lib/bold/Icon.svelte":       "./src/lib/regular/Icon.svelte",
    "./src/lib/bold/Icon.svelte.d.ts":  "./src/lib/regular/Icon.svelte.d.ts",
    "./src/lib/bold/icon.ts":           "./src/lib/regular/icon.ts",

    "./src/lib/light/icon.d.ts":        "./src/lib/regular/icon.d.ts",
    "./src/lib/light/Icon.svelte":      "./src/lib/regular/Icon.svelte",
    "./src/lib/light/Icon.svelte.d.ts": "./src/lib/regular/Icon.svelte.d.ts",
    "./src/lib/light/icon.ts":          "./src/lib/regular/icon.ts",
    
    "./src/lib/bold/README.md":         "./README.md",
    "./src/lib/light/README.md":        "./README.md",
    "./src/lib/regular/README.md":      "./README.md",
}

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

/**
 * 
 * @param {string} rootPath 
 * @param {string} base 
 * @param {string} file 
 * @returns 
 */
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
        
        const content = list.map(it => `export const ${it.name} = "${it.pathData}";`).join("\n");
        const types = list.map(it => `export declare const ${it.name}: string;`).join("\n");
        return [
            [ style, content ],
            [ style + ".d", types ]
        ];
        
    }).flat();
    

    for (let [ group, content ] of built) {
        await mkdir(resolve(targetPath), { recursive: true });
        await writeFile(resolve(targetPath, group + ".ts"), content, { "encoding": "utf-8" });
    }

}

for (let why of paths) {
    await rm(resolve(why.target), { recursive: true, force: true })
    await mkdir(resolve(why.target), { recursive: true });
}

await Promise.all( paths.map(({ source, target, name }) => convertWidth(source, target, name)))

for (let to in copies) {
    const from = copies[to];

    const writes = createWriteStream(to, "utf-8");
    const reads = createReadStream(from, "utf-8");
    reads.pipe(writes);
}

// build package.json
const file = await readFile("./package.template.json", { encoding: "utf-8" });

/**
 * @type {Record<string, Record<string, string>>}
 */
const outputs = {
    "./src/lib/bold/package.json": {
        "__NAME__": "@ajwdmedia/svelterial-symbols-bold",
        "__VERSION__": packageJson.version,
    },
    "./src/lib/light/package.json": {
        "__NAME__": "@ajwdmedia/svelterial-symbols-light",
        "__VERSION__": packageJson.version,
    },
    "./src/lib/regular/package.json": {
        "__NAME__": "@ajwdmedia/svelterial-symbols",
        "__VERSION__": packageJson.version,
    }
}

for (let packageOut in outputs) {
    const d = outputs[packageOut];
    let work = file;
    for (let replacer in d) {
        work = work.split(replacer).join(d[replacer]);
    }
    await writeFile(packageOut, work, { encoding: "utf-8" });
}