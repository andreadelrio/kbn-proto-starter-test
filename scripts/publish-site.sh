#!/usr/bin/env bash
# Publishes or removes one branch's version on the pages-site branch, which holds the published
# site. Run by .github/workflows/deploy.yml.
#
#   scripts/publish-site.sh publish <branch> <target-folder> <dist-dir>
#   scripts/publish-site.sh remove  <branch> <target-folder>
#
# Set VERSIONS_DIST to the versions page build (dist-versions) to update the page at the site root.
#
# pages-site always holds a single commit, replaced on every publish, so old builds don't pile up
# in the repo. Several designers can push at once: a publish only replaces pages-site if nobody else
# changed it in the meantime; otherwise it starts again from the latest one, so every version is kept.
set -euo pipefail

mode=${1:?publish or remove}
branch=${2:?branch}
target=${3:?target folder}
dist=""
if [ "$mode" = publish ]; then dist=$(cd "${4:?dist dir}" && pwd); fi
versions_dist=""
if [ -n "${VERSIONS_DIST:-}" ]; then versions_dist=$(cd "$VERSIONS_DIST" && pwd); fi

scripts=$(cd "$(dirname "$0")" && pwd)
author=$(git log -1 --format=%an 2>/dev/null || true)
repo_url=${REPO_URL:-"https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"}

site=$(mktemp -d)
heads=$(mktemp)
cd "$site"
git init -q -b pages-site
git remote add origin "$repo_url"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

for attempt in 1 2 3 4 5; do
  expected=""
  if git fetch -q --depth 1 origin pages-site 2>/dev/null; then
    git reset -q --hard FETCH_HEAD
    expected=$(git rev-parse FETCH_HEAD)
  fi
  git ls-remote --heads origin | sed 's#.*refs/heads/##' | grep -vx pages-site > "$heads" || true

  HEADS_FILE="$heads" TARGET="$target" DIST="$dist" VERSIONS_DIST="$versions_dist" BRANCH="$branch" SHA="${GITHUB_SHA:-local}" AUTHOR="$author" \
    node "$scripts/pages-site.mjs" "$site"

  git add -A
  if [ -n "$expected" ] && git diff --cached --quiet "$expected"; then echo "Nothing to change"; exit 0; fi
  # A commit with no history: the site as it is now, nothing more.
  commit=$(git commit-tree "$(git write-tree)" -m "Site after $mode $branch")
  if git push -q --force-with-lease="refs/heads/pages-site:$expected" origin "$commit:refs/heads/pages-site"; then
    echo "Done: $mode $branch"
    exit 0
  fi
  echo "Someone else published at the same time (attempt $attempt), trying again"
  sleep $((attempt * 2))
done
echo "Could not update pages-site after 5 attempts" >&2
exit 1
