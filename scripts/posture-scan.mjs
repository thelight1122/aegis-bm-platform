import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const INCLUDE_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".md", ".json"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".data", ".git"]);

const BANNED = [
    // enforcement / coercion semantics
    "enforce", "enforcement", "compliance", "punish", "punishment", "reward", "penalty",
    "block", "deny", "veto", "override", "kill switch", "killswitch", "terminate",
    // scoring / ranking semantics
    "score", "trustscore", "alignmentscore", "reputation", "rank", "rating", "kpi", "grade",
    // mutation semantics
    "delete", "overwrite", "redact", "mutate", "update-in-place"
];

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            walk(path.join(dir, entry.name), out);
        } else {
            const ext = path.extname(entry.name);
            if (INCLUDE_EXT.has(ext)) out.push(path.join(dir, entry.name));
        }
    }
    return out;
}

function scanFile(filePath) {
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/);

    const hits = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();
        for (const term of BANNED) {
            if (lower.includes(term)) {
                hits.push({ term, lineNo: i + 1, line: line.trim().slice(0, 240) });
            }
        }
    }
    return hits;
}

console.log("--- Starting AEGIS Posture Scan ---");
const files = walk(ROOT);
let total = 0;

for (const f of files) {
    const hits = scanFile(f);
    if (hits.length) {
        total += hits.length;
        console.log(`[POSTURE WARN] ${path.relative(ROOT, f)}`);
        for (const h of hits) {
            console.log(`  - "${h.term}" @ line ${h.lineNo}: ${h.line}`);
        }
    }
}

const STRICT_MODE = process.argv.includes("--strict");

if (total === 0) {
    console.log("✅ Clean: No posture warnings detected.");
} else {
    console.log(`⚠️ Warnings: ${total} potential drift markers found.`);
    if (STRICT_MODE) {
        console.error("Strict mode active: Exiting with error code.");
        process.exit(1);
    }
}
