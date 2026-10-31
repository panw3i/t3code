#!/usr/bin/env bash
# 把 upstream/main 合并进当前分支，并重新应用 fork 的裁剪（server + web）。
#   - 上游改动了已删除的文件：保持删除
#   - pnpm-lock.yaml 冲突：取上游版本后重新生成
#   - 其他冲突：中止合并，退出码 2，冲突文件写入 $SYNC_CONFLICTS_FILE（默认 .fork-sync-conflicts.txt）
# 用法：scripts/fork/sync-upstream.sh [upstream-ref]，默认 upstream/main
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

UPSTREAM_REF="${1:-upstream/main}"
CONFLICTS_FILE="${SYNC_CONFLICTS_FILE:-.fork-sync-conflicts.txt}"
rm -f "$CONFLICTS_FILE"

if ! git remote get-url upstream >/dev/null 2>&1; then
  git remote add upstream https://github.com/pingdotgg/t3code.git
fi
git fetch --no-tags upstream main

if git merge-base --is-ancestor "$UPSTREAM_REF" HEAD; then
  echo "已是最新：${UPSTREAM_REF} 已包含在当前分支中。"
  exit 0
fi

upstream_sha="$(git rev-parse --short "$UPSTREAM_REF")"
git merge --no-ff --no-commit "$UPSTREAM_REF" >/dev/null 2>&1 || true

lockfile_conflicted=false
if git diff --name-only --diff-filter=U | grep -qx 'pnpm-lock.yaml'; then
  git checkout --theirs -- pnpm-lock.yaml
  git add pnpm-lock.yaml
  lockfile_conflicted=true
fi

bash scripts/fork/prune.sh

unresolved="$(git diff --name-only --diff-filter=U | sort -u)"
if [ -n "$unresolved" ]; then
  printf '%s\n' "$unresolved" > "$CONFLICTS_FILE"
  git merge --abort
  echo "合并 ${UPSTREAM_REF} (${upstream_sha}) 存在需要人工处理的冲突：" >&2
  printf '  %s\n' $unresolved >&2
  exit 2
fi

# 上游依赖变化或删除的工作区都会影响锁文件，统一重新生成。
if $lockfile_conflicted || ! git diff --cached --quiet -- pnpm-lock.yaml '**/package.json' pnpm-workspace.yaml; then
  pnpm install --lockfile-only --no-frozen-lockfile
  git add pnpm-lock.yaml
fi

git commit --no-verify -q -m "chore(sync): 合并上游 pingdotgg/t3code@$upstream_sha"
echo "已合并上游 ${upstream_sha}。"
