#!/usr/bin/env bash
# 删除 .fork/removed-paths.txt 中列出的路径，以及 .github/workflows 下非 fork-* 的上游工作流。
# 合并上游时对冲突文件执行 git rm 也会把冲突标记为已解决。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

grep -v -e '^[[:space:]]*#' -e '^[[:space:]]*$' .fork/removed-paths.txt | while IFS= read -r spec; do
  git rm -r -f -q --ignore-unmatch -- "$spec"
done

git ls-files -- .github/workflows | sort -u | while IFS= read -r file; do
  case "$(basename "$file")" in
    fork-*) ;;
    *) git rm -f -q --ignore-unmatch -- "$file" ;;
  esac
done
