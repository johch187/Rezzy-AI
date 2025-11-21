#!/usr/bin/env bash

# Rewrites git history to drop all .env files (and variants) from every commit.
# Run this in a fresh clone to avoid losing local work.

set -euo pipefail

REPO_DIR="${1:-}"

if [[ -z "${REPO_DIR}" ]]; then
  echo "Usage: $0 /absolute/path/to/repo"
  exit 1
fi

if [[ ! -d "${REPO_DIR}/.git" ]]; then
  echo "No git repository found at: ${REPO_DIR}"
  exit 1
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  cat <<'EOT'
git-filter-repo is required.
Install with:
  python3 -m pip install git-filter-repo
or follow: https://github.com/newren/git-filter-repo#install
EOT
  exit 1
fi

env_globs=(
  ".env"
  ".env.*"
  "*.env"
  "**/.env"
  "**/.env.*"
  "**/*.env"
)

cd "${REPO_DIR}"

# Remove the env files from every commit.
git filter-repo --force --invert-paths $(printf ' --path-glob %q' "${env_globs[@]}")

# Clean up original refs and unreachable objects.
git for-each-ref --format='%(refname)' refs/original/ | xargs -r -n 1 git update-ref -d
git reflog expire --expire-unreachable=now --all
git gc --prune=now --aggressive

cat <<'EOM'
History rewritten to drop env files.
Review and then force-push to replace existing remote history:
  git push origin --force --all
  git push origin --force --tags
EOM
