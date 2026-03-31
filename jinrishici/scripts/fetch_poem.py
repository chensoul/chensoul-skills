#!/usr/bin/env python3
"""
拉取今日诗词 v1 接口
"""

import argparse
import json
import sys
from typing import Any, Dict, Optional
from urllib.request import Request, urlopen

SENTENCE_API = "https://v1.jinrishici.com/all.json"
USER_AGENT = "jinrishici-fetch-poem/1.0"


def _fetch_json(url: str, timeout: float = 10.0) -> Optional[Dict[str, Any]]:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
        return json.loads(body)
    except Exception:
        return None


def format_poem_line(data: Dict[str, Any]) -> str:
    content = (data.get("content") or "").strip()
    origin = (data.get("origin") or "").strip()
    author = (data.get("author") or "").strip()
    if not content:
        return ""
    if author and origin:
        return "{}—— {}《{}》".format(content, author, origin)
    if author:
        return "{}—— {}".format(content, author)
    if origin:
        return "{}《{}》".format(content, origin)
    return content


def main() -> int:
    p = argparse.ArgumentParser(description="今日诗词：从 jinrishici 拉取一句并格式化输出")
    p.add_argument(
        "--json",
        action="store_true",
        help="输出完整 JSON（美化），不换行格式化诗句",
    )
    p.add_argument(
        "--url",
        default=SENTENCE_API,
        help="接口地址（默认官方 v1 all.json）",
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=10.0,
        metavar="SEC",
        help="请求超时秒数",
    )
    args = p.parse_args()

    raw = _fetch_json(args.url, timeout=args.timeout)
    if not raw:
        print("请求失败或响应无法解析。", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(raw, ensure_ascii=False, indent=2))
        return 0

    line = format_poem_line(raw)
    if not line:
        print("响应中无有效诗句（content 为空）。", file=sys.stderr)
        return 1
    print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
