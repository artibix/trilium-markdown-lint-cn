class MarkdownLintButton extends api.NoteContextAwareWidget {
    get parentWidget() {
        return 'center-pane';
    }

    doRender() {
        this.$widget = $(`<style type="text/css">
            .markdown-lint-icon.ribbon-tab-title-icon.bx:before {
                content: "\\2714";
            }
        </style>`);
        return this.$widget;
    }

    async refreshWithNote() {
        $(document).ready(() => {
            if (!$("div.component.note-split:not(.hidden-ext) div.ribbon-tab-title").hasClass('markdown-lint-button')) {
                $("div.component.note-split:not(.hidden-ext) .ribbon-tab-title:not(.backToHis)").last().after(`
                    <div class="markdown-lint-button ribbon-tab-spacer"></div>
                    <div class="markdown-lint-button ribbon-tab-title">
                        <span class="markdown-lint-icon ribbon-tab-title-icon bx" title="检查并修复Markdown"></span>
                    </div>
                `);
            }
            $('div.component.note-split:not(.hidden-ext) div.markdown-lint-button').off("click", lintAndFixMarkdown);
            $('div.component.note-split:not(.hidden-ext) div.markdown-lint-button').on("click", lintAndFixMarkdown);
        });
    }
}

class MarkdownLinter {
    constructor(config = {}) {
        this.config = {
            ...config
        };

        // 按照优先级和依赖关系排序规则
        this.rules = [
            this.fixSpaceAroundAlphabet,          // 中英文空格
            this.fixSpaceAroundNumber,            // 中数字空格
            this.fixNoEmptyCodeLang,              // 代码块语言
            this.fixNoEmptyUrl,                   // 链接地址
            this.fixNoEmptyList,                  // 列表内容
            this.fixNoEmptyCode,                  // 代码块内容
            this.fixNoEmptyInlineCode,            // 行内代码
            this.fixNoEmptyBlockquote,            // 引用块
            this.fixUseStandardEllipsis,          // 省略号
            this.fixNoFullwidthNumber,            // 全角数字
            this.fixNoSpaceInLink,                // 链接空格
            this.fixNoMultipleSpaceBlockquote,    // 引用块空格
            this.fixCorrectTitleTrailingPunctuation, // 标题标点
            this.fixNoSpaceInInlineCode,          // 行内代码空格
        ];
    }

    lint(markdown) {
        let lines = markdown.split('\n');
        const fixes = [];

        lines = lines.map((line, lineIndex) => {
            let modifiedLine = line;
            this.rules.forEach(rule => {
                const ruleResult = rule.call(this, modifiedLine, lineIndex + 1);
                if (ruleResult) {
                    modifiedLine = ruleResult.fixedLine;
                    if (ruleResult.description) {
                        fixes.push({
                            line: lineIndex + 1,
                            original: line,
                            fixed: modifiedLine,
                            description: ruleResult.description
                        });
                    }
                }
            });
            return modifiedLine;
        });

        return {
            fixedMarkdown: lines.join('\n'),
            fixes: fixes
        };
    }

    // 中文与英文之间增加空格
    fixSpaceAroundAlphabet(line) {
        const regex = /([\u4e00-\u9fff])([a-zA-Z])|([a-zA-Z])([\u4e00-\u9fff])/g;
        const fixedLine = line.replace(regex, (match, p1, p2, p3, p4) => {
            if (p1 && p2) return `${p1} ${p2}`;
            if (p3 && p4) return `${p3} ${p4}`;
            return match;
        });

        return fixedLine !== line ? {
            fixedLine,
            description: '为中英文之间添加空格'
        } : null;
    }

    // 中文与数字之间增加空格
    fixSpaceAroundNumber(line) {
        const regex = /([\u4e00-\u9fff])(\d+)|(\d+)([\u4e00-\u9fff])/g;
        const fixedLine = line.replace(regex, (match, p1, p2, p3, p4) => {
            if (p1 && p2) return `${p1} ${p2}`;
            if (p3 && p4) return `${p3} ${p4}`;
            return match;
        });

        return fixedLine !== line ? {
            fixedLine,
            description: '为中文和数字之间添加空格'
        } : null;
    }

    // 代码块语言不能为空
    fixNoEmptyCodeLang(line) {
        const regex = /^(```)\s*()(\s*$)/;
        const fixedLine = line.replace(regex, '```text');

        return line !== fixedLine ? {
            fixedLine,
            description: '为空代码块添加默认语言 text'
        } : null;
    }

    // 链接地址不能为空
    fixNoEmptyUrl(line) {
        const regex = /\[([^\]]+)\]\(\s*\)/g;
        const fixedLine = line.replace(regex, (match, text) => {
            return `[${text}](#)`;
        });

        return line !== fixedLine ? {
            fixedLine,
            description: '为空链接添加默认锚点'
        } : null;
    }

    // 列表内容不能为空
    fixNoEmptyList(line) {
        const regex = /^(\s*[-*+])\s*$/;
        const fixedLine = line.replace(regex, '');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除空列表项'
        } : null;
    }

    // 代码块内容不能为空
    fixNoEmptyCode(line) {
        const startCodeBlockRegex = /^```\w*\s*$/;
        const endCodeBlockRegex = /^```\s*$/;

        if (startCodeBlockRegex.test(line)) {
            // 检查下一行是否为空或结束代码块
            return {
                fixedLine: '',
                description: '删除空代码块'
            };
        }

        return null;
    }

    // 行内代码块不能为空
    fixNoEmptyInlineCode(line) {
        const regex = /`\s*`/g;
        const fixedLine = line.replace(regex, '');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除空行内代码块'
        } : null;
    }

    // 引用块不能为空
    fixNoEmptyBlockquote(line) {
        const regex = /^>\s*$/;
        const fixedLine = line.replace(regex, '');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除空引用块'
        } : null;
    }

    // 使用标准省略号
    fixUseStandardEllipsis(line) {
        const chineseEllipsisRegex = /\.\.\.|…{1,}/g;
        const fixedLine = line.replace(chineseEllipsisRegex, '……');

        return line !== fixedLine ? {
            fixedLine,
            description: '使用标准省略号'
        } : null;
    }

    // 转换全角数字
    fixNoFullwidthNumber(line) {
        const fullWidthToHalfWidth = {
            '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
            '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
        };
        const regex = new RegExp(Object.keys(fullWidthToHalfWidth).join('|'), 'g');
        const fixedLine = line.replace(regex, matched => fullWidthToHalfWidth[matched]);

        return line !== fixedLine ? {
            fixedLine,
            description: '转换全角数字为半角'
        } : null;
    }

    // 删除链接前后空格
    fixNoSpaceInLink(line) {
        const regex = /\[\s+([^\]]+)\s+\]\(([^)]+)\)/g;
        const fixedLine = line.replace(regex, '[$1]($2)');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除链接文本前后空格'
        } : null;
    }

    // 引用块只保留一个空格
    fixNoMultipleSpaceBlockquote(line) {
        const regex = /^(>)\s{2,}/;
        const fixedLine = line.replace(regex, '> ');

        return line !== fixedLine ? {
            fixedLine,
            description: '引用块空格规范化'
        } : null;
    }

    // 标题末尾标点修复
    fixCorrectTitleTrailingPunctuation(line) {
        const regex = /^(#{1,6}\s+.+?)([.。,，;；:：])\s*$/;
        const fixedLine = line.replace(regex, '$1');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除标题末尾不合法标点'
        } : null;
    }

    // 行内代码块前后空格
    fixNoSpaceInInlineCode(line) {
        const regex = /`\s+(.+?)\s+`/g;
        const fixedLine = line.replace(regex, '`$1`');

        return line !== fixedLine ? {
            fixedLine,
            description: '删除行内代码块前后空格'
        } : null;
    }
}

var lintAndFixMarkdown = function () {
    api.getActiveContextTextEditor().then(editor => {
        const data = editor.getData();

        const linter = new MarkdownLinter();
        const result = linter.lint(data);

        if (result.fixes.length > 0) {
            // 生成修复报告
            const fixReport = result.fixes.map(fix => {
                return `行 ${fix.line}:\n说明: ${fix.description}`;
            }).join('\n\n');

            // 更新编辑器内容
            editor.setData(result.fixedMarkdown);

            // 显示修复报告
            api.showMessage(`已自动修复 ${result.fixes.length} 个 Markdown 格式问题:\n\n${fixReport}`);
        } else {
            // 如果没有发现问题
            api.showMessage('Markdown 格式检查完成，没有发现需要修复的问题。');
        }
    }).catch(error => {
        console.error('无法获取编辑器实例:', error);
        api.showMessage('检查并修复 Markdown 格式时发生错误。');
    });
};

module.exports = new MarkdownLintButton();