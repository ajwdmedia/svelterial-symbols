import { readFile, writeFile } from "node:fs/promises";
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import esMain from "es-main";
import semver from "semver";

const execAsync = promisify(exec);

const packages = [ "@material-symbols/svg-200", "@material-symbols/svg-400", "@material-symbols/svg-700" ];

/**
 * 
 * @returns {string | null}
 */
const getIconVersion = async () => {
    const file = await readFile("./package.json");
    const json = JSON.parse(file);
    const versions = packages.map(it => json?.["devDependencies"]?.[it] ?? null);
    
    return versions.reduce((p, v) => (p === v ? p : null), versions[0]);
}

const getLatestVersion = async () => {
    const versions = [];
    for (let item of packages) {
        const res = await fetch(`https://registry.npmjs.org/${item}/latest`);
        const metadata = await res.json();
        versions.push(metadata?.version ?? null);
    }

    return versions.reduce((p, v) => (p === v ? p : null), versions[0]);
}

const main = async () => {
    const current = await getIconVersion();
    console.log(`Found version ${current}`);

    console.log("Getting latest version from registry...");
    const next = await getLatestVersion();
    console.log(`Next version: ${next}`);

    const diff = semver.diff(current, next);
    if (diff === null) {
        console.log("No changes required. Ka kite ano!");
        return;
    }

    if (diff.startsWith("pre")) {
        console.log("Updated to a pre-release. This is a pre-release, so I don't release. Later!");
        return;
    }

    console.log(`Found upgrade: ${diff.toUpperCase()}`);
    console.log("Updating packages...");
    const { stderr, stdout } = await execAsync(`npm install -E ${packages.map(it => it + "@" + next).join(" ")}`);
    console.log(stdout);
    console.log(stderr);
    const verify = await getIconVersion();
    if (verify !== next) {
        console.log("Failed to verify that versions were updated correctly. Screw this I'm out!");
        return;
    }
    console.log(`Packages updated successfully to ${next}`);
    await writeFile("./VERSION", diff, { encoding: "utf8" });
    console.log(`Repo prepared, handing control to updater`);
}

if (esMain(import.meta)) {
    main();
}