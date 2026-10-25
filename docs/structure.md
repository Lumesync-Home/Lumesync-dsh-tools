# docs · 两包结构说明

## 共同结构（DSH web 插件）

```
package/
├── package.json      # name / version / exports / dsh{engines,bundle,client}
├── cordis.patch.yml  # insert 一行：把本包挂进 web 插件 roster
└── lib/
    ├── index.js      # 主机侧（node 进程里跑；可注册 tools / settings / 路由）
    └── client.js     # 浏览器侧（DSH 前端加载 exports["./client"]）
```

要点：

1. `package.json` 的 `dsh.client.platform = "web"` 告诉 host「本包有浏览器半边」；
2. `dsh.bundle.patch` 指向 `cordis.patch.yml`，DSH 装配时把这一行插进 roster；
3. `cordis.patch.yml` 里的 `name` **必须**等于 `package.json` 的 `name`；
4. `exports["./client"]` 指向浏览器半边，由 client-modules host 扫描后下发。

## rainbow（外观）

- 主机侧：注册设置段（`settings.register` / `installSection`），提供 `/api/lume-appearance/config` 读写
- 浏览器侧：拉配置 → 生成 `<style>` 插到 `<head>` 末尾（最高优先级）→ 渲染设置面板到 `settings.section` slot
- 配置存插件目录下 `lume-appearance.config.json`（本地，不入库）
- 依赖 `schemastery` 描述设置 schema

## inhand（移动层）

- 主机侧：空壳（`inject: []`，`apply()` 空），只为 roster 解析
- 浏览器侧：注入 `@deepseek-ai/dsh-client-ui-layout` 与 `@deepseek-ai/dsh-client-ui-slots`，做抽屉/缩放守卫/viewport/安全区/输入框稳定
- 仅窄屏生效

## 升级到 DSH 0.2.x 时要注意

- **settings 服务**改成了「活跃 profile 条目的 Config 字段投影」，旧 `register` / `installSection` 没有等价物 → rainbow 的主机侧要改
- **preset** 改为插件组合包声明；`persona/toolFilter` 在子代理上被拒
- **会话格式** v3 → v4（本仓库不涉及会话读写）
- 具体以官方 `docs/subsystems/settings.md` 与 `docs/upgrade-guide/*` 为准

## 安全

本仓库不含任何凭据。外观配置里可能有使用者本地偏好（颜色/字体），**不要**把带个人数据的 `lume-appearance.config.json` 提交进来。
