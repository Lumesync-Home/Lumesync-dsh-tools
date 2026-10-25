# lumesync-rainbow（外观层）

接管 DSH Web 的**配色**与**字体**，运行时向页面注入一条最高优先级的 `<style>`，并提供设置面板。

## 功能

- 4 组基色 × 明/暗两套主题
- 字体三档：CJK（中日韩）、Latin（拉丁）、Code（代码）
- 设置面板写入本地 `lume-appearance.config.json`（**不入库、不外传**）
- 纯 CSS/DOM 注入，不改 DSH 源码

## 结构

- `lib/index.js` — 主机侧：注册设置段（`settings.register` / `installSection`）、提供配置读写路由
- `lib/client.js` — 浏览器侧：读配置、注入 `<style>`、渲染设置面板

## 安装

见仓库根 `README.md`。挂载后重启 DSH。

## 配置

默认读取插件目录下的 `lume-appearance.config.json`（可在主机侧设置面板里改）。文件结构由代码内 schema 约束；**不要提交到仓库**。

## 回退

从 profile `dependencies` 移除 → 重启 DSH。外观配置留在本地，可重新挂载后继续用。

## 注意

- 0.2.x 起 DSH 的 settings 改为「profile 插件配置」投影，本包的主机侧注册方式需要迁移（见仓库 `docs/`）。
