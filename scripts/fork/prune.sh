#!/usr/bin/env bash
# 删除 .fork/removed-paths.txt 中列出的路径（server + web fork 不需要的部分）。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
grep -v -e '^[[:space:]]*#' -e '^[[:space:]]*$' .fork/removed-paths.txt | while IFS= read -r spec; do
  git rm -r -q --ignore-unmatch -- "$spec"
done
