# Bookmark Skill

为 Claude Code 设计的书签管理技能，支持保存和查询网页链接。

## 功能

- **保存书签** - `/bookmark <url> [#tag1] [#tag2]`
- **查询书签** - `/bookmark-query <range>`

## 安装

依赖已自动安装在 `~/.claude/skills/bookmark/` 目录下。

## 使用方法

### 保存书签

```bash
# 基本用法
/bookmark https://example.com

# 带自定义标签
/bookmark https://react.dev #react #docs

# 保存到自定义文件
/bookmark https://example.com file:~/my-bookmarks.md
```

### 查询书签

```bash
/bookmark-query today      # 今天的书签
/bookmark-query yesterday  # 昨天的书签
/bookmark-query week       # 本周的书签
/bookmark-query month      # 本月的书签
/bookmark-query all        # 所有书签
/bookmark-query 2026-04-21 # 指定日期
```

## 开发

### 运行测试

```bash
cd ~/.claude/skills/bookmark
npx vitest run
```

### 文件结构

```
bookmark/
├── SKILL.md              # 技能定义
├── package.json          # 依赖配置
├── vitest.config.js      # 测试配置
├── bookmarks.md          # 书签数据文件
├── README.md             # 本文档
└── tests/
    ├── test-utils.js                    # 测试工具
    ├── bookmark.test.js                 # 单元测试
    └── bookmark.integration.test.js     # 集成测试
```

## 书签格式

```markdown
### 2026-04-21

- [ZhiJun Blog](https://blog.zhijun.io/) #blog #java
  > 记录 Java、Spring、MicroServices、Architecture、Kubernetes、DevOps、AI 编码工具、架构与个人周报的博客
```

## 许可证

MIT
