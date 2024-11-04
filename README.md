# Trilium Notes 中文 Markdown 格式检查修复插件

基于阮一峰的 [中文技术文档写作规范](https://github.com/ruanyf/document-style-guide)。

## 功能特点

- 添加中英文数字之间的空格
- 使用标准化省略号
- 转换全角数字为半角

> [!CAUTION]
> **注意**：修复操作不可逆，建议在执行修复前备份您的笔记内容，以防止格式化后无法还原。

## 使用方法

1. 下载 `MarkdownLintButton.js`
2. 导入 Trilium 笔记的任意位置，类型选择 `JS frontend`
3. 属性添加 `#widget`
4. 执行脚本，重启客户端
5. 打开需要格式化的文章，点击头部的 ✔ 标志修复

## 致谢

感谢 [lint-md](https://github.com/lint-md/lint-md) 提供的灵感。

## 贡献指南

如果你再使用过程中遇到问题，欢迎提交 Issue 和 Pull Request。
