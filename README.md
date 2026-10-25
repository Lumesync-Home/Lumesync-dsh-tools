# lumesync-dsh-tools

Lumesync 家的 DSH（DeepSeek Harness）工具包集合。都是 **web 插件**：一个主机侧入口（`lib/index.js`）+ 一个浏览器侧注入件（`lib/client.js`），由 `package.json` 的 `dsh.client` 声明，DSH 的 profile 挂载后自动生效。

> 本仓库**不含任何密钥、口令、token**，也不含个人数据（外观配置文件等由使用者本地维护）。

## 包一览

| 目录 | 包名 | 用途 |
|---|---|---|
| `packages/rainbow` | `lumesync-rainbow` | **外观层**：接管配色（4 基色 × 明暗）与字体（CJK / 拉丁 / 代码），运行时注入最高优先级 `<style>`；带设置面板。 |
| `packages/inhand` | `lumesync-inhand` | **移动层**（仅窄屏）：侧栏抽屉、双击/双指缩放守卫、viewport meta、安全区内边距、稳定输入框。 |

两包的 `dist/*.tgz` 是打包产物，可直接分发给 DSH 安装。

## 安装

DSH 的 profile（`$DSH_HOME/profiles/<name>/package.json`）里加依赖，二选一：

```jsonc
{
  "dependencies": {
    // 方式一：本地目录 link（开发/自用推荐）
    "lumesync-rainbow": "link:C:/Lumesync-DSH/plugins/lumesync-rainbow",
    "lumesync-inhand": "link:C:/Lumesync-DSH/plugins/lumesync-inhand"

    // 方式二：tgz
    // "lumesync-rainbow": "file:./lumesync-rainbow-0.1.0.tgz",
    // "lumesync-inhand": "file:./lumesync-inhand-0.1.0.tgz"
  }
}
```

装完重启 DSH（插件在启动时加载）。

## 命名对照（重要）

本仓库把包名规范化了。若从家里现役插件迁移，请注意 id 变化：

| 家里现役 | 本仓库 |
|---|---|
| `lumesync-appearance` | **`lumesync-rainbow`** |
| `lumesync-mobile` | **`lumesync-inhand`** |

`cordis.patch.yml` 的 `insert` 行 id 也相应改为 `ui-lume-rainbow` / `ui-lume-inhand`。
**不要同时挂新旧两份**（会重复注入）。

## 兼容性

- `dsh.engines.dsh >= 0.1.5-rc.1`（两包一致）
- 外观层依赖 `schemastery`（设置面板 schema）
- 未在 0.2.x 上验证过：0.2.x 改了 settings 服务与 preset 组合方式，迁移前请读 `docs/` 下的说明

## 目录

```
packages/rainbow/   README.md, package.json, cordis.patch.yml, lib/{index,client}.js
packages/inhand/    README.md, package.json, cordis.patch.yml, lib/{index,client}.js
docs/               两包的结构与实现说明
dist/               打包产物 (*.tgz)
```

## 回退

从 profile 的 `dependencies` 移除对应包 → 重启 DSH。插件不改任何持久数据（外观配置是本地 JSON，删包不会删它）。

## 许可

内部自用，未附开源许可；转出前请先问归辰/小蜗。
