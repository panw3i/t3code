# T3 Code（server + web fork）

本仓库 fork 自 [pingdotgg/t3code](https://github.com/pingdotgg/t3code)，只保留 **server + web**：

- 删除桌面端（Electron）、移动端（Expo）、营销站及其脚本、原生模块和发布工作流
- 关闭 T3 Connect（云端 relay + Clerk 登录），删除 `infra/relay`
- Web 增加中英文界面，在 **设置 → 外观 → 语言** 切换（默认跟随浏览器语言）

被删除的路径列在 [`removed-paths.txt`](./removed-paths.txt)，由 `scripts/fork/prune.sh` 统一执行。

## 运行

需要 Node（版本见根目录 `package.json` 的 `engines.node`）和 pnpm（见 `packageManager`）。

```bash
pnpm install
pnpm dev            # 开发：同时启动 server 和 web
```

生产方式运行（server 会自动托管 `apps/web/dist`）：

```bash
pnpm build                       # 构建 web
pnpm --filter t3 build:bundle    # 打包 server
pnpm start                       # 启动 server，打开输出的地址即可
```

## 同步上游

`.github/workflows/fork-sync-upstream.yml` 每 6 小时（也可手动触发）执行 `scripts/fork/sync-upstream.sh`：

1. 合并 `upstream/main`
2. 上游改动了已删除的文件 → 保持删除；新增到已删除目录里的文件 → 再次删除
3. `pnpm-lock.yaml` 冲突 → 用上游版本后重新生成
4. 安装依赖并 `pnpm run typecheck`
   - 通过：直接推送到 `main`
   - 失败：推送到 `fork-sync/upstream-<sha>` 分支并开 PR
5. 其他文件冲突：中止合并，开一个带 `fork-sync` 标签的 issue 列出冲突文件

**首次启用需要：**

1. 创建一个 fine-grained PAT，仓库限定为本 fork，权限勾选 Contents、Workflows、Pull requests、Issues（均为 Read and write）。
   之所以不能用默认的 `GITHUB_TOKEN`：上游提交会改动 `.github/workflows`，GitHub 只允许带 Workflows 权限的令牌推送这类提交。
2. 在仓库 Settings → Secrets and variables → Actions 中添加名为 `SYNC_TOKEN` 的 secret。
3. 在 Actions 页确认工作流已启用（fork 仓库默认禁用定时任务），可以先手动运行一次 “Fork · Sync upstream”。

本地手动同步：

```bash
bash scripts/fork/sync-upstream.sh   # 退出码 2 表示有冲突，冲突文件列在 .fork-sync-conflicts.txt
```

## 国际化约定

- `apps/web/src/i18n/index.ts`：`t("English text", { name })`，英文原文即键，未翻译时回退英文
- 中文词典在 `apps/web/src/i18n/zh-CN/*.ts`，按区域分文件
- 上游新增的文案默认显示英文，补翻译只需在词典里加一行，并在调用处包上 `t()`
