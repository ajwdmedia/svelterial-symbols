//@ts-check

import { resolve } from "path";
import { readdir, readFile, writeFile, rm, mkdir } from "fs/promises";

let thisPackageJSON = JSON.parse(await readFile(resolve("./package.json"), { encoding: "utf-8" }));
let readme = await readFile(resolve("./README.md"), {encoding: "utf-8"});

const paths = [
    {
        source: resolve("./node_modules/@material-symbols/svg-200"),
        target: resolve("./dist/light"),
        name: "@ajwdmedia/svelterial-symbols-light",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-400"),
        target: resolve("./dist/regular"),
        name: "@ajwdmedia/svelterial-symbols",
    },
    {
        source: resolve("./node_modules/@material-symbols/svg-700"),
        target: resolve("./dist/bold"),
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

    let types = `interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const ${fileName}: $$__sveltets_2_IsomorphicComponent<{
    size?: string;
    width?: string;
    height?: string;
    fill?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type ${fileName} = InstanceType<typeof ${fileName}>;
export default ${fileName};
`
    return { id: file, variant: convertNameToPascalCase(base), name: fileName, component, filled, types };
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


let convertWidth = async (sourcePath, targetPath, name) => {
    let foldered = new Map();
    
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

        await Promise.all(converted.map(async (item) => {
            let folderName = (item.filled) ? folders.fills : folders.lines;

            if (!foldered.has(folderName)) {
                foldered.set(folderName, []);
            }

            await writeFile(resolve(targetPath, folderName, item.name + ".svelte"), item.component, { encoding: "utf8" });
            await writeFile(resolve(targetPath, folderName, item.name + ".svelte.d.ts"), item.types, { encoding: 'utf8' });

            foldered.get(folderName).push(item.name);
            return true;
        }));
    }

    let finalExport = "";

    for (const [variant, names] of foldered) {
        let exportFile = names.map(name => `export { default as ${name} } from "./${name}.svelte"`).join("\n");
        await writeFile(resolve(targetPath, variant, "index.js"), exportFile, { encoding: 'utf8' });
        await writeFile(resolve(targetPath, variant, "index.d.ts"), exportFile, { encoding: 'utf8' });

        finalExport += `export * as ${variant} from "./${variant}/index.js"\n`;
    }

    await writeFile(resolve(targetPath, "index.js"), finalExport, { encoding: 'utf8' });
    await writeFile(resolve(targetPath, "index.d.ts"), finalExport, { encoding: 'utf8' });
    await writeFile(resolve(targetPath, "package.json"), constructPackageJson(name, thisPackageJSON.version, foldered), {encoding: "utf-8"});
    await writeFile(resolve(targetPath, "README.md"), readme, { encoding: "utf-8" });
}

await rm(resolve("./package"), { recursive: true, force: true })
await mkdir(resolve("./package"), { recursive: true });

await Promise.all( paths.map(({ source, target }) => convertWidth(source, target)))
