#!/usr/bin/env node
// Leak guard. Usage: node leak-guard.mjs <dir> [--deny file] [--exclude relpath]...
//        git log -p | node leak-guard.mjs --stdin   (scan piped text, e.g. history)
// Env DENY_EXTRA=path adds a private list. Exit 1 on any hit.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
let stdin = false;
let dir = ".",
  denyFile = path.join(here, "deny-public.txt");
const excludes = new Set();
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--deny") denyFile = args[++i];
  else if (args[i] === "--stdin") stdin = true;
  else if (args[i] === "--exclude") excludes.add(path.normalize(args[++i]));
  else dir = args[i];
}
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".vercel"]);
const BANNED_FILE = [
  /logo/i,
  /cross/i,
  /\.zip$/i,
  /\.heic$/i,
  /\.jpe?g$/i,
  /\.png$/i,
  /\.webp$/i,
  /\.gif$/i,
  /\.tiff?$/i,
  /\.raw$/i,
];
const BINARY = /\.(zip|heic|jpe?g|png|webp|gif|tiff?|raw|pdf|ico|woff2?)$/i;

function loadList(f) {
  return fs
    .readFileSync(f, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const m = /^h(w?):(\d+):([0-9a-f]+)$/.exec(l);
      if (m) return { label: l, hash: m[3], len: +m[2], word: m[1] === "w" };
      return l.startsWith("re:")
        ? { label: l, re: new RegExp(l.slice(3), "gi") }
        : { label: l, re: new RegExp(l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") };
    });
}
const rules = loadList(denyFile);
if (process.env.DENY_EXTRA) rules.push(...loadList(process.env.DENY_EXTRA));

const h16 = (t) => crypto.createHash("sha256").update(t).digest("hex").slice(0, 16);
const hashRules = rules.filter((r) => r.hash);
const lens = [...new Set(hashRules.filter((r) => !r.word).map((r) => r.len))];
const wantSub = new Map(hashRules.filter((r) => !r.word).map((r) => [r.hash, r]));
const wantWord = new Map(hashRules.filter((r) => r.word).map((r) => [r.hash, r]));
const isWord = (c) => /\p{L}/u.test(c ?? "");
function lineHits(line) {
  const out = [];
  const low = line.toLowerCase();
  for (const r of rules) {
    if (!r.re) continue;
    r.re.lastIndex = 0;
    if (r.re.test(line)) out.push(r.label);
  }
  if (hashRules.length && /[a-z]/i.test(low)) {
    for (const L of lens)
      for (let i = 0; i + L <= low.length; i++) {
        const r = wantSub.get(h16(low.slice(i, i + L)));
        if (r) out.push(r.label);
      }
    for (const m of low.matchAll(/\p{L}+/gu)) {
      const r = wantWord.get(h16(m[0]));
      if (r && !isWord(low[m.index - 1])) out.push(r.label);
    }
  }
  return out;
}

/** README screenshots may live in docs/. Other images, and any logo/cross name, stay banned. */
function isAllowedDocsScreenshot(rel, name) {
  const parts = path.normalize(rel).split(path.sep);
  return (
    parts.length === 2 &&
    parts[0] === "docs" &&
    /\.(png|webp|jpe?g)$/i.test(name) &&
    !/logo/i.test(name) &&
    !/cross/i.test(name)
  );
}
function isBannedName(rel, name) {
  return BANNED_FILE.some((r) => r.test(name)) && !isAllowedDocsScreenshot(rel, name);
}

const hits = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name),
      rel = path.relative(dir, full);
    if (excludes.has(path.normalize(rel))) continue;
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(full);
      continue;
    }
    if (isBannedName(rel, e.name) || lineHits(e.name).length)
      hits.push(`${rel}: banned file type/name`);
    if (BINARY.test(e.name)) continue;
    fs.readFileSync(full, "utf8")
      .split(/\r?\n/)
      .forEach((line, n) => {
        for (const l of lineHits(line)) hits.push(`${rel}:${n + 1}: "${l}"`);
      });
  }
}
function scanText(label, text) {
  text.split(/\r?\n/).forEach((line, n) => {
    for (const l of lineHits(line)) hits.push(`${label}:${n + 1}: "${l}"`);
  });
}
if (stdin) scanText("<stdin>", fs.readFileSync(0, "utf8"));
else walk(dir);
if (hits.length) {
  console.error(`LEAK GUARD: ${hits.length} hit(s)\n` + hits.join("\n"));
  process.exit(1);
}
console.log(`LEAK GUARD: clean (${rules.length} rules)`);
