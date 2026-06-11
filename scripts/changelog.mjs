import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CATEGORY_ORDER = [
  "Added",
  "Changed",
  "Deprecated",
  "Removed",
  "Fixed",
  "Security",
  "Performance",
  "Documentation",
  "Tests",
  "Build",
  "CI",
  "Chores",
  "Reverted",
  "Other",
];

const TYPE_TO_CATEGORY = new Map([
  ["feat", "Added"],
  ["fix", "Fixed"],
  ["refactor", "Changed"],
  ["perf", "Performance"],
  ["docs", "Documentation"],
  ["test", "Tests"],
  ["build", "Build"],
  ["ci", "CI"],
  ["chore", "Chores"],
  ["revert", "Reverted"],
  ["style", "Changed"],
]);

const CHANGELOG_HEADER = "# Changelog";
const LINE_SPLIT_RE = /\r?\n/u;
const CONVENTIONAL_COMMIT_RE =
  /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?!?: (?<message>.+)$/iu;

const args = process.argv.slice(2);
const versionArg = args.find((arg) => !arg.startsWith("--"));
const check = args.includes("--check");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const rootDir = process.cwd();
const changelogPath = path.join(rootDir, "CHANGELOG.md");

const version =
  (versionArg ?? "").replace(/^v/, "") ||
  JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
  ).version;
const releaseDate = new Date().toISOString().slice(0, 10);
const previousTag = getPreviousTag();
const range = previousTag ? `${previousTag}..HEAD` : "HEAD";
const commits = getCommits(range);

if (commits.length === 0) {
  console.log(`${changelogPath}: no new commits since last tag.`);
  process.exit(0);
}

const section = renderSection(version, releaseDate, commits);
const currentContent = readChangelog();

if (!force && currentContent.includes(`## [${version}] - `)) {
  console.log(`Section [${version}] already exists in CHANGELOG.md. Use --force to overwrite.`);
  process.exit(0);
}

const nextContent = upsertChangelog(currentContent, version, section);

if (dryRun) {
  process.stdout.write(nextContent);
  process.exit(0);
}

if (check) {
  const current = readChangelog();
  if (current !== nextContent) {
    throw new Error(
      "CHANGELOG.md is out of date. Run `pnpm changelog` to regenerate.",
    );
  }
  console.log("CHANGELOG.md is up to date.");
  process.exit(0);
}

fs.writeFileSync(changelogPath, nextContent);
console.log(`Updated CHANGELOG.md for ${version}.`);

function readChangelog() {
  if (!fs.existsSync(changelogPath)) {
    return `${CHANGELOG_HEADER}\n`;
  }
  return fs.readFileSync(changelogPath, "utf8");
}

function getPreviousTag() {
  const tag = exec("git", ["describe", "--tags", "--abbrev=0"], {
    allowFailure: true,
  }).trim();
  return tag.length > 0 ? tag : null;
}

function getCommits(rangeSpec) {
  const output = exec("git", [
    "log",
    "--no-merges",
    "--reverse",
    "--pretty=format:%s",
    rangeSpec,
  ]).trim();
  if (!output) return [];
  return output
    .split(LINE_SPLIT_RE)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCommit);
}

function parseCommit(subject) {
  const m = CONVENTIONAL_COMMIT_RE.exec(subject);
  if (!m?.groups) {
    return { category: "Other", message: subject };
  }
  const type = m.groups.type.toLowerCase();
  const scope = m.groups.scope ? `${m.groups.scope}: ` : "";
  const category = TYPE_TO_CATEGORY.get(type) ?? "Other";
  return { category, message: `${scope}${m.groups.message}` };
}

function renderSection(versionValue, dateValue, commitEntries) {
  const grouped = new Map(CATEGORY_ORDER.map((c) => [c, []]));
  for (const c of commitEntries) {
    grouped.get(c.category)?.push(c.message);
  }
  const lines = [`## [${versionValue}] - ${dateValue}`, ""];
  for (const category of CATEGORY_ORDER) {
    const msgs = grouped.get(category);
    if (!msgs?.length) continue;
    lines.push(`### ${category}`);
    for (const msg of msgs) lines.push(`- ${msg}`);
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function upsertChangelog(content, versionValue, section) {
  const normalized = content.trimEnd();
  const heading = `## [${versionValue}] - `;
  const base = normalized.length > 0 ? normalized : `${CHANGELOG_HEADER}\n`;

  const startIndex = base.indexOf(heading);
  if (startIndex >= 0) {
    const nextIndex = base.indexOf("\n## [", startIndex + heading.length);
    const sectionEnd = nextIndex >= 0 ? nextIndex + 1 : base.length;
    return `${base.slice(0, startIndex)}${section.trimEnd()}\n${
      base.slice(sectionEnd).trimStart()
    }\n`;
  }

  return `${CHANGELOG_HEADER}\n\n${section}${base.slice(CHANGELOG_HEADER.length).trimStart() ? `\n${base.slice(CHANGELOG_HEADER.length).trimStart()}\n` : ""}`;
}

function exec(binary, cargs, options = {}) {
  const { allowFailure = false, ...rest } = options;
  try {
    return execFileSync(binary, cargs, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: "pipe",
      ...rest,
    });
  } catch (err) {
    if (allowFailure) return "";
    throw err;
  }
}
