// Updates the published site (a folder holding the pages-site branch) for one branch, then
// rewrites versions.json, the list the versions page at the site root reads (src/versions/).
// Run by .github/workflows/deploy.yml through scripts/publish-site.sh.
//
//   node scripts/pages-site.mjs <site-dir>
//
// Environment:
//   HEADS_FILE      file listing the repo's current branches, one per line (others are removed)
//   DEFAULT_BRANCH  the branch shown first on the versions page
//   SITE_TITLE      the heading of the versions page
//   GITHUB_REPOSITORY  owner/name, for links to the code
//   VERSIONS_DIST   the versions page build (dist-versions); leave empty to keep the current one
//   TARGET          folder of the branch to publish or remove (for example main, branches/andrea/idea)
//   DIST            the branch's build to publish; leave empty to remove the branch
//   BRANCH, SHA, AUTHOR  shown on the versions page for the published branch
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const site = process.argv[2];
const env = process.env;
const META = '.build.json';

const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const subdirs = (dir) => readdirSync(dir).filter((name) => name !== '.git' && isDir(join(dir, name)));

/** Every published build under `dir`, as paths relative to the site. */
const findBuilds = (dir) => [
  ...(existsSync(join(dir, META)) ? [relative(site, dir)] : []),
  ...subdirs(dir).flatMap((name) => findBuilds(join(dir, name))),
];

/** Deletes one build but keeps builds nested inside it (branch `a` next to a later `a/b`). */
const removeBuild = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!(isDir(path) && findBuilds(path).length)) rmSync(path, { recursive: true, force: true });
  }
};

/** Deletes empty folders left behind, from the deepest up. */
const removeEmptyFolders = (dir) => {
  for (const name of subdirs(dir)) removeEmptyFolders(join(dir, name));
  if (dir !== site && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
};

const readMeta = (path) => {
  try {
    return JSON.parse(readFileSync(join(site, path, META), 'utf8'));
  } catch {
    return {};
  }
};

// 1. Publish or remove the branch.
const target = join(site, env.TARGET);
removeBuild(target);
if (env.DIST) {
  mkdirSync(target, { recursive: true });
  cpSync(env.DIST, target, { recursive: true });
  const meta = { branch: env.BRANCH, sha: env.SHA, author: env.AUTHOR, updated: new Date().toISOString() };
  writeFileSync(join(target, META), `${JSON.stringify(meta)}\n`);
}

// 2. Remove versions of branches that no longer exist.
const heads = new Set(readFileSync(env.HEADS_FILE, 'utf8').split('\n').filter(Boolean));
for (const path of findBuilds(site)) {
  const { branch } = readMeta(path);
  if (branch && !heads.has(branch)) removeBuild(join(site, path));
}
removeEmptyFolders(site);

// 3. Update the versions page and its list.
if (env.VERSIONS_DIST) {
  rmSync(join(site, '_versions'), { recursive: true, force: true });
  cpSync(env.VERSIONS_DIST, site, { recursive: true });
  cpSync(join(site, 'versions.html'), join(site, 'index.html'));
  rmSync(join(site, 'versions.html'));
}
const versions = findBuilds(site).map((path) => {
  const { branch, updated, author, sha } = readMeta(path);
  return { branch, path, updated, author, sha };
});
const file = {
  title: env.SITE_TITLE,
  repository: env.GITHUB_REPOSITORY,
  defaultBranch: env.DEFAULT_BRANCH,
  versions,
};
writeFileSync(join(site, 'versions.json'), `${JSON.stringify(file, null, 2)}\n`);
writeFileSync(join(site, '.nojekyll'), '');
console.log(`Versions: ${versions.map((v) => v.branch).join(', ') || 'none'}`);
