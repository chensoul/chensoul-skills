---
name: jinrishici
description: 调用今日诗词 HTTP 接口获取随机古诗词句，并按固定中文标点格式展示（含作者、篇名）。在用户要「今日诗词」、简报里加诗句时使用。
---

# 今日诗词

## 接口

- **URL**: `https://v1.jinrishici.com/all.json`
- **方法**: `GET`
- **建议**: 设置合理 **User-Agent**，控制调用频率；生产环境若接口要求 token，以 [今日诗词开放平台](https://www.jinrishici.com/) 当前文档为准。

## 响应字段

JSON 根级常见字段（以实际响应为准）：

| 字段 | 含义 |
|------|------|
| `content` | 诗句正文 |
| `author` | 作者 |
| `origin` | 作品名（篇名） |

缺字段时按下面规则省略对应部分。

## 展示格式

在 `content` 非空的前提下：

1. 同时有 `author` 与 `origin`：`{content}—— {author}《{origin}》`
2. 仅有 `author`：`{content}—— {author}`
3. 仅有 `origin`：`{content}《{origin}》`
4. 都没有：只输出 `content`

行首行尾勿随意加引号；保持原文标点与用户阅读习惯一致。

## 最小请求示例

```bash
curl -fsS -H "User-Agent: YourApp/1.0" "https://v1.jinrishici.com/all.json"
```

## 本地脚本

```bash
# 默认：打印一行展示用诗句
python jinrishici/scripts/fetch_poem.py

# 查看原始 JSON
python jinrishici/scripts/fetch_poem.py --json
```

## Agent 行为约定

1. **需要实时一句诗**：优先 **GET** 上述 URL，解析 JSON 后按上一节规则组一行（或多行若用户要求只展示正文）。
2. **接口失败**：简短说明原因，不要编造作者或篇名；可提示用户稍后重试或检查网络。
3. **隐私与合规**：不在日志或提交记录中打印完整 token；内容来自第三方 API，引用时不必声称「自动生成」以外的版权主张。
