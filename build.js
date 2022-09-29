//@ts-check

import { resolve } from "path";
import { readdir, readFile, writeFile, rm, mkdir } from "fs/promises";

const paths = [
    {
        source: resolve("./node_modules/@material-symbols/svg-200"),
        target: resolve("./packages/light/src/lib"),
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-400"),
        target: resolve("./packages/regular/src/lib"),
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-700"),
        target: resolve("./packages/bold/src/lib"),
    }
]

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

    svgString = svgString.replace(/width="\d+"/g, `width="{width}"`);
    svgString = svgString.replace(/height="\d+"/g, `height="{height}"`);
    svgString = svgString.replace(/<path d=/g, `<path fill="{fill}" d=`);

    let component = `
<script lang="ts">
    export let size: string = "1rem";
    export let width: string = size;
    export let height: string = size;
    export let fill: string = "white";
</script>
${svgString}
    `

    let filled = file.endsWith("-fill")

    return { id: file, variant: convertNameToPascalCase(base), name: convertNameToPascalCase((filled) ? file.slice(0, -5) : file), component, filled };
};


let convertWidth = async (sourcePath, targetPath) => {
    let foldered = new Map();

    try {
        await rm(targetPath, { recursive: true });
    } catch (_err) {
    }
    
    try {
        await mkdir(targetPath, { recursive: true });
    } catch (_err) {
        console.log("Couldn't re-create lib directory");
    }

    // Each folder is a style
    let folders = (await readdir(sourcePath, { withFileTypes: true, encoding: "utf8" })).filter(item => item.isDirectory()).map(item => item.name);

    for (const folder of folders) {

        let files = (await readdir(resolve(sourcePath, folder), { encoding: "utf8" })).filter(item => item.endsWith(".svg")).map(item => item.slice(0, -4));

        let converted = await Promise.all(files.map(name => convertSVG(sourcePath, folder, name)));

        const folders = {
            lines: convertNameToPascalCase(folder),
            fills: convertNameToPascalCase(folder) + "Filled",
        };

        // we're now only doing one of these each
        try {
            await mkdir(resolve(targetPath, folders.lines));
            await mkdir(resolve(targetPath, folders.fills));
        } catch (err) {
            
        }

        await Promise.all(converted.map((item) => {

            return new Promise(async (promiseResolve) => {

                let folderName = (item.filled) ? folders.fills : folders.lines;

                if (!foldered.has(folderName)) {
                    foldered.set(folderName, []);
                }

                await writeFile(resolve(targetPath, folderName, item.name + ".svelte"), item.component, { encoding: "utf8" });

                foldered.get(folderName).push(item.name);

                promiseResolve(true);
            })

        }));

    }

    let finalExport = "";

    for (const [variant, names] of foldered) {
        let exportFile = names.map(name => `export { default as ${name} } from "./${name}.svelte"`).join("\n");
        await writeFile(resolve(targetPath, variant, "index.ts"), exportFile, { encoding: 'utf8' });

        finalExport += `export * as ${variant} from "./${variant}/index"\n`;
    }

    await writeFile(resolve(targetPath, "index.ts"), finalExport, { encoding: 'utf8' });
}

await Promise.all( paths.map(({ source, target }) => convertWidth(source, target)))
