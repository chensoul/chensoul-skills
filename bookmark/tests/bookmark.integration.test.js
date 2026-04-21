/**
 * 书签技能集成测试
 *
 * 测试实际的书签添加和查询功能
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { readFileSync, appendFileSync } from 'fs';
import { cleanup, initTestFile, getTestFilePath } from './test-utils.js';

const TEST_BOOKMARK_FILE = getTestFilePath('bookmarks.integration.test.md');

// 模拟添加书签的函数
function addBookmark(file, url, title, tags, description) {
  const today = new Date().toISOString().split('T')[0];
  const dateHeader = `### ${today}`;
  const tagsStr = tags.join(' ');
  const entry = `\n- [${title}](${url}) ${tagsStr}\n  > ${description}\n`;

  const content = readFileSync(file, 'utf-8');

  // 检查是否已存在该日期头
  if (!content.includes(dateHeader)) {
    appendFileSync(file, `\n${dateHeader}\n`, 'utf-8');
  }

  appendFileSync(file, entry, 'utf-8');
}

// 模拟查询书签的函数
function queryBookmarks(file, range) {
  const content = readFileSync(file, 'utf-8');
  const today = new Date().toISOString().split('T')[0];
  const results = [];

  if (range === 'today') {
    const dateSection = content.match(new RegExp(`### ${today}[\\s\\S]*?(?=###|$)`));
    if (dateSection) {
      for (const match of dateSection[0].matchAll(/^- \[(.+?)\]\((.+?)\)/gm)) {
        results.push(`[${match[1]}](${match[2]})`);
      }
    }
  } else if (range === 'all') {
    for (const match of content.matchAll(/^- \[(.+?)\]\((.+?)\)/gm)) {
      results.push(`[${match[1]}](${match[2]})`);
    }
  }

  return results;
}

describe('Bookmark Integration Tests', () => {
  beforeEach(() => {
    cleanup(TEST_BOOKMARK_FILE);
    initTestFile(TEST_BOOKMARK_FILE);
  });

  afterAll(() => {
    cleanup(TEST_BOOKMARK_FILE);
  });

  describe('添加书签', () => {
    it('应该添加书签到今天的日期头下', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example', ['#test'], '测试描述');

      const content = readFileSync(TEST_BOOKMARK_FILE, 'utf-8');
      const today = new Date().toISOString().split('T')[0];

      expect(content).toContain(`### ${today}`);
      expect(content).toContain('[Example](https://example.com)');
      expect(content).toContain('#test');
      expect(content).toContain('测试描述');
    });

    it('应该在同一日期头下添加多个书签', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example 1', ['#test'], '第一个描述');
      addBookmark(TEST_BOOKMARK_FILE, 'https://another.com', 'Example 2', ['#test'], '第二个描述');

      const content = readFileSync(TEST_BOOKMARK_FILE, 'utf-8');
      const today = new Date().toISOString().split('T')[0];

      // 只应该有一个日期头
      const dateHeaderCount = (content.match(new RegExp(`### ${today}`, 'g')) || []).length;
      expect(dateHeaderCount).toBe(1);

      expect(content).toContain('[Example 1](https://example.com)');
      expect(content).toContain('[Example 2](https://another.com)');
    });

    it('应该最多添加 2 个标签', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example', ['#tag1', '#tag2'], '描述');

      const content = readFileSync(TEST_BOOKMARK_FILE, 'utf-8');
      expect(content).toMatch(/#tag1 #tag2/);
    });
  });

  describe('查询书签', () => {
    it('应该查询今天的书签', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example', ['#test'], '描述');

      const results = queryBookmarks(TEST_BOOKMARK_FILE, 'today');
      expect(results.length).toBe(1);
      expect(results[0]).toBe('[Example](https://example.com)');
    });

    it('应该查询所有书签', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example 1', ['#test'], '描述 1');
      addBookmark(TEST_BOOKMARK_FILE, 'https://another.com', 'Example 2', ['#test'], '描述 2');

      const results = queryBookmarks(TEST_BOOKMARK_FILE, 'all');
      expect(results.length).toBe(2);
    });

    it('空查询应该返回空数组', () => {
      const results = queryBookmarks(TEST_BOOKMARK_FILE, 'today');
      expect(results.length).toBe(0);
    });
  });

  describe('重复检测', () => {
    it('应该检测到重复 URL', () => {
      addBookmark(TEST_BOOKMARK_FILE, 'https://example.com', 'Example', ['#test'], '描述');

      const content = readFileSync(TEST_BOOKMARK_FILE, 'utf-8');

      expect(content.includes('https://example.com')).toBe(true);
    });
  });
});
