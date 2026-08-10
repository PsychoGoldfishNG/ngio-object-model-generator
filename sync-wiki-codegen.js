#!/usr/bin/env node
/**
 * sync-wiki-codegen
 *
 * Copies samples/skeletons/ into the developer guide wiki's codegen/ directory,
 * making the wiki copy an artifact of this repo rather than a second thing to
 * maintain. The two were previously kept in sync by hand and weren't.
 *
 *   node sync-wiki-codegen.js ../ngio-developer-guide-wiki
 *   node sync-wiki-codegen.js ../ngio-developer-guide-wiki --check
 *
 * Exit codes: 0 in sync, 1 stale (--check only), 2 bad usage.
 *
 * NOTE: this DELETES anything in codegen/ that is not in samples/skeletons/.
 *
 * Full documentation - including what to do when --check reports drift you did
 * not cause - is under "Maintaining the developer guide wiki" in README.md.
 */

const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "samples", "skeletons");
const TARGET_SUBDIR = path.join("codegen");

const HEADER_NOTE = "GENERATED-FILE-DO-NOT-EDIT.txt";
const HEADER_TEXT = `These files are copied verbatim from the model generator repo:

    ngio-object-model-generator/samples/skeletons/

Do not edit anything in this directory. Edit the source in that repo and run:

    node sync-wiki-codegen.js <path-to-this-wiki>

Hand-edits here will be silently overwritten by the next sync, and - worse -
will not reach anyone using the generator directly, which is most people.
`;

function walk(dir, base) {
    base = base || dir;
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, base));
        else out.push(path.relative(base, full));
    }
    return out.sort();
}

// Line endings differ between checkouts; that is not drift.
const normalize = (s) => s.replace(/\r\n/g, "\n");

function main() {
    const wikiRoot = process.argv[2];
    const checkOnly = process.argv.includes("--check");

    if (!wikiRoot) {
        console.error("usage: node sync-wiki-codegen.js <path-to-wiki> [--check]");
        process.exit(2);
    }
    if (!fs.existsSync(wikiRoot)) {
        console.error(`No such directory: ${wikiRoot}`);
        process.exit(2);
    }

    const targetRoot = path.join(wikiRoot, TARGET_SUBDIR);
    const files = walk(SOURCE);
    const changed = [];

    for (const rel of files) {
        const src = fs.readFileSync(path.join(SOURCE, rel), "utf8");
        const dstPath = path.join(targetRoot, rel);
        const existing = fs.existsSync(dstPath) ? fs.readFileSync(dstPath, "utf8") : null;

        if (existing !== null && normalize(existing) === normalize(src)) continue;

        changed.push(rel + (existing === null ? " (new)" : ""));
        if (!checkOnly) {
            fs.mkdirSync(path.dirname(dstPath), { recursive: true });
            fs.writeFileSync(dstPath, src);
        }
    }

    // Anything in the target that no longer exists in the source is a leftover
    // from an older layout - the base classes used to live under models/.
    const stale = fs.existsSync(targetRoot)
        ? walk(targetRoot).filter((rel) => rel !== HEADER_NOTE && !files.includes(rel))
        : [];

    for (const rel of stale) {
        changed.push(rel + (checkOnly ? " (stale, would be removed)" : " (stale, removed)"));
        if (!checkOnly) fs.unlinkSync(path.join(targetRoot, rel));
    }

    if (!checkOnly) {
        // Drop empty directories left behind by removals.
        const prune = (dir) => {
            if (!fs.existsSync(dir)) return;
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                if (e.isDirectory()) prune(path.join(dir, e.name));
            }
            if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
        };
        prune(targetRoot);
        fs.mkdirSync(targetRoot, { recursive: true });
        fs.writeFileSync(path.join(targetRoot, HEADER_NOTE), HEADER_TEXT);
    }

    if (changed.length === 0) {
        console.log(`Wiki codegen is up to date (${files.length} files).`);
        return;
    }

    console.log(`${checkOnly ? "DRIFT" : "Synced"} - ${changed.length} file(s):`);
    for (const c of changed) console.log(`  ${c}`);
    if (checkOnly) {
        console.log("\nRun without --check to update.");
        process.exit(1);
    }
}

main();
