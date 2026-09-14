import { readFile } from "node:fs/promises";
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import esMain from "es-main";
import semver from "semver";
import { setTimeout } from "node:timers/promises";

const execAsync = promisify(exec);

/**
 * @param {Parameters<typeof spawn>} params
 * @returns {Promise<[ code: number, signal: null ] | [ code: null, signal: string ]>}
 */
const summon = (...params) => new Promise((resolve, rejects) => {
    const child = spawn(...params);
    child.on("error", (err) => rejects(err));
    child.on("close", (code, signal) => { resolve([code, signal]) });
})

const packages = [ "@material-symbols/svg-200", "@material-symbols/svg-400", "@material-symbols/svg-700" ];

/**
 * 
 * @returns {string | null}
 */
const getPackageVersion = async () => {
    const file = await readFile("./package.json");
    const json = JSON.parse(file);
    
    return json?.version ?? null;
}

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

/**
 * 
 * @returns {string | null}
 */
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
    const installer = await execAsync(`npm install -E ${packages.map(it => it + "@" + next).join(" ")}`);
    console.log(installer.stdout);
    console.log(installer.stderr);
    const verify = await getIconVersion();
    if (verify !== next) {
        console.log("Failed to verify that versions were updated correctly. Screw this I'm out!");
        return;
    }
    console.log(`Packages updated successfully to ${next}`);

    console.log("Running npm version");
    const versioner = await execAsync(`npm version ${diff} --no-git-tag-version`);
    console.log(versioner.stdout);
    console.log(versioner.stderr);

    const future = await getPackageVersion();
    console.log(`Next Release: ${future}`);

    console.log("Attempting to build and update NPM packages");
    const [ code, signal ] = await summon("npm", [ "run", "push" ], { stdio: "inherit" });
    console.log([ code, signal ]);
    if (code !== 0) {
        console.error("FAILED TO UDPATE NPM");
        console.error("EXITING EARLY");
        process.exit(code);
    }

    console.log("Creating commit...");

    const committer = await execAsync(`git commit -a -m "Update Material Symbols to ${next}"`);
    console.log(committer.stdout);
    console.log(committer.stderr);
    console.log(`Committed`);
    
    console.log(`Pushing...`);
    const pusher = await execAsync(`git push`);
    console.log(pusher.stdout);
    console.log(pusher.stderr);
    console.log(`Pushed to origin`);

    await setTimeout(5000);

    console.log(`Creating Release...`);
    const releaser = await execAsync(`gh release create v${future} -t "v${future}" -n "Updates material symbols packages to version ${next}"`);
    console.log(releaser.stdout);
    console.log(releaser.stderr);
    console.log(`Release created. Already published, release action will do nothing.`);
}

if (esMain(import.meta)) {
    main();
}