# 秋招网申一键填表工具（Chrome 扩展）

原生 Chrome 扩展开发（Manifest V3），无需构建工具，直接加载即可使用。

## 文件结构

```
chrome-extension/
├── manifest.json    # 扩展配置文件（Manifest V3）
├── popup.html       # 弹窗页面 HTML
├── popup.css        # 弹窗样式
├── popup.js         # 弹窗交互逻辑
├── content.js       # 内容脚本（Day 6-7 实现表单填充）
├── options.html     # 信息管理面板（Day 4 实现）
├── options.js       # 信息管理逻辑
├── options.css      # 信息管理样式
└── icons/           # 图标目录
```

## 安装到 Chrome（开发者模式）

1. 打开 Chrome 浏览器
2. 地址栏输入 `chrome://extensions/`
3. 开启右上角「**开发者模式**」开关
4. 点击「**加载已解压的扩展程序**」
5. 选择本文件夹（`chrome-extension`）
6. 插件出现在扩展列表中
7. 点击浏览器右上角拼图图标，把「秋招网申一键填表」固定到工具栏
8. 点击插件图标，即可看到 popup 弹窗

## 开发计划

| 天数 | 任务 | 状态 |
|------|------|------|
| Day 3 | 最小骨架（manifest + popup） | ✅ 完成 |
| Day 4 | 信息管理面板 + chrome.storage 本地存储 | ⬜ 待开始 |
| Day 5 | 简历 AI 解析（DeepSeek API） | ⬜ 待开始 |
| Day 6-7 | 通用表单自动填充（content script） | ⬜ 待开始 |
| Day 8 | 高频站点定向适配（牛客/北森/智联） | ⬜ 待开始 |
| Day 9 | AI 开放性问题助手 | ⬜ 待开始 |
| Day 10 | 体验打磨 | ⬜ 待开始 |
| Day 11 | 授权机制 | ⬜ 待开始 |

## 技术说明

- **为什么不用 Plasmo**：Plasmo 依赖 @parcel/watcher 需要 Visual Studio C++ 编译工具，安装复杂。原生开发方式零依赖，直接加载即可，适合 MVP 快速验证。
- **后续迁移**：如果需要 React/TypeScript/Tailwind，可在 MVP 验证后迁移到 Plasmo 或 Vite + CRXJS。
