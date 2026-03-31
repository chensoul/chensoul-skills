---
name: keep-running-json
description: 通过 Keep Open API 登录并拉取跑步记录，生成与 Garmin 脚本兼容的 running.json（含 VDOT、训练负荷、周期统计、可选每公里分段）。在用户提及 Keep 跑步同步、fetch_keep_run、running.json 或从 Keep 导出跑步数据时使用。
---

# Keep 跑步数据同步

指导如何运行本仓库内的 **[`scripts/fetch_keep_run.py`](scripts/fetch_keep_run.py)** 拉取 Keep 跑步数据并生成 **`running.json`**。

## 何时使用

- 用户要从 **Keep** 导出跑步记录并与既有 **Garmin 风格** 统计格式对齐。
- 用户提到 **`fetch_keep_run.py`**、**`running.json`**、**Keep API**、**VDOT** / **训练负荷**。
- 需要说明脚本依赖、环境变量、输出路径或调试方式。

脚本已置于本技能目录 **`keep/scripts/fetch_keep_run.py`**；若上游有破坏性更新，可对照 GitHub 同步替换该文件。

## 脚本职责（摘要）

1. 使用手机号 + 密码调用 Keep 登录接口，取得 token。
2. 分页拉取跑步 ID 列表，再逐条请求单条跑步详情。
3. 将 API 数据映射为行结构，再经 `format_running_data` 汇总为 `stats` + `runs`。
4. **所有写入 `running.json` 的展示时间统一为上海时区**（`Asia/Shanghai`，UTC+8）；周期统计（昨日/本周/本月/年）也按上海本地日期计算。

## 依赖

- **Python 3**
- **`requests`**
- **`pycryptodome`**（`Crypto.Cipher.AES`）：解码加密的 `geoPoints` / 心率 runmap 数据。
- **`haversine`**（可选）：当没有 `crossKmPoints` 而需从 `geoPoints` 推算每公里分段时使用；缺省则分段可能为空。

安装示例：

```bash
pip install requests pycryptodome haversine
# 或：pip install -r keep/scripts/requirements.txt
```

## 凭证与环境变量

| 变量 | 含义 |
|------|------|
| `KEEP_MOBILE` | Keep 登录手机号（可用 `--mobile` 覆盖） |
| `KEEP_PASSWORD` | 密码（可用 `--password` 覆盖） |
| `MAX_HR` | 最大心率，默认 `180`（VDOT/心率区间） |
| `RESTING_HR` | 静息心率，默认 `55` |
| `RUNNER_WEIGHT_KG` | 体重（kg），用于本地估算功率，默认 `70` |

不要在对话或日志中复述用户密码； credentials 仅通过环境变量或本地 CLI 传入。

## 命令行

在仓库根目录执行时，`--output` 的默认值相对于**脚本所在目录**解析（默认写入 `keep/scripts/data/running.json`）：

```bash
python keep/scripts/fetch_keep_run.py --mobile "$KEEP_MOBILE" --password "$KEEP_PASSWORD"
```

若在 `keep/scripts/` 下执行，则等价于 `python fetch_keep_run.py ...`，默认输出为当前目录下的 `data/running.json`。

常用参数：

| 参数 | 说明 |
|------|------|
| `--output` | 输出文件，默认 `data/running.json` |
| `--limit N` | 只拉前 N 条（调试） |
| `--debug` | 打印每条请求的原始 `data` 与转换后的 row |

## 输出结构要点

- **`stats`**：`total_runs`、`total_distance`、`total_duration`、`avg_pace`、`longest_run`、`avg_vdot`、`total_training_load`、`period_stats`（`yesterday` / `week` / `month` / `year` / `total`）、`statistics_time`（上海时间）。
- **`runs`**：每条含 `date`（上海本地时间字符串）、`distance`（km）、`duration`、`pace`、`heart_rate`、`vdot`、`training_load`、`hr_zone`、`segments`（若有数据源）等。

若代码中有 `save_running_json(..., merge=True)` 的调用场景：**按 `date` 键合并**已有文件并重算统计；默认 CLI `main()` 一般为覆盖写入（以仓库内脚本为准）。

## Agent 操作建议

1. 确认用户已安装依赖且能访问 Keep API（网络环境）。
2. 优先使用环境变量传入凭证，避免将密码写入仓库或聊天。
3. 首次排查接口或字段问题时，建议 `--limit 1 --debug`。
4. 若用户需与 **Garmin 导出脚本** 混用同一 `running.json`，保持字段名与 `format_running_data` 输出一致，不要私自改键名。