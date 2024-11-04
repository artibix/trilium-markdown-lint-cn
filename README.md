# Trilium Notes 中文 Markdown 格式检查修复插件

基于阮一峰的 [中文技术文档写作规范](https://github.com/ruanyf/document-style-guide)。

## 功能特点

- 自动检查并修复中英文之间的空格
- 标准化标点符号的使用（例如省略号和标题末尾标点）
- 为空代码块添加语言，删除空代码块
- 删除空列表项、空引用块和空行内代码块
- 删除多余的链接空格，转换全角数字为半角
- 一键检查并自动修复

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
