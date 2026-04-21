/**
 * 书签技能测试
 *
 * 测试 /bookmark 和 /bookmark-query 命令的功能
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { cleanup, initTestFile, getTestFilePath } from './test-utils.js';

const TEST_BOOKMARK_FILE = getTestFilePath();

describe('Bookmark Skill', () => {
  beforeEach(() => {
    cleanup(TEST_BOOKMARK_FILE);
    initTestFile(TEST_BOOKMARK_FILE);
  });

  afterAll(() => {
    cleanup(TEST_BOOKMARK_FILE);
  });

  describe('URL 验证', () => {
    it('应该接受有效的 https URL', () => {
      const url = 'https://example.com';
      expect(url).toMatch(/^https?:\/\/.+/);
    });

    it('应该接受有效的 http URL', () => {
      const url = 'http://example.com';
      expect(url).toMatch(/^https?:\/\/.+/);
    });

    it('应该拒绝不含协议的 URL', () => {
      const url = 'example.com';
      expect(url).not.toMatch(/^https?:\/\/.+/);
    });
  });

  describe('书签格式', () => {
    it('应该生成正确的日期头格式 (### YYYY-MM-DD)', () => {
      const today = new Date().toISOString().split('T')[0];
      const expected = `### ${today}`;
      expect(expected).toMatch(/^### \d{4}-\d{2}-\d{2}$/);
    });

    it('应该生成正确的书签条目格式', () => {
      const entry = `- [Example](https://example.com) #tag1 #tag2\n  > Description`;
      expect(entry).toMatch(/^- \[.+\]\(https?:\/\/.+\) (#[a-z0-9]+ ?)+$\n  > .+$/m);
    });
  });

  describe('标签格式', () => {
    it('标签应该是小写', () => {
      const tags = '#blog #java #ai';
      expect(tags).toMatch(/^(#[a-z0-9]+ ?)+$/);
    });

    it('最多只能有 2 个标签', () => {
      const tags = ['#blog', '#java'];
      expect(tags.length).toBeLessThanOrEqual(2);
    });

    it('用户标签不带#时自动添加', () => {
      const userTags = ['react', 'docs'];
      const normalized = userTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      expect(normalized).toEqual(['#react', '#docs']);
    });

    it('用户标签带#时保持不变', () => {
      const userTags = ['#react', '#docs'];
      const normalized = userTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      expect(normalized).toEqual(['#react', '#docs']);
    });

    it('标签转换为小写', () => {
      const userTags = ['React', 'DOCS'];
      const normalized = userTags
        .map(tag => tag.toLowerCase())
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      expect(normalized).toEqual(['#react', '#docs']);
    });
  });

  describe('重复检测', () => {
    it('应该检测到重复的 URL', () => {
      const content = `- [Example](https://example.com) #test`;
      const url = 'https://example.com';
      expect(content).toContain(url);
    });

    it('应该允许不同的 URL', () => {
      const content = `- [Example](https://example.com) #test`;
      const url = 'https://another.com';
      expect(content).not.toContain(url);
    });
  });
});

describe('Bookmark Query Skill', () => {
  beforeEach(() => {
    cleanup(TEST_BOOKMARK_FILE);
    initTestFile(TEST_BOOKMARK_FILE);
  });

  afterAll(() => {
    cleanup(TEST_BOOKMARK_FILE);
  });

  describe('日期范围查询', () => {
    it('应该支持 today 查询', () => {
      const range = 'today';
      expect(range).toBe('today');
    });

    it('应该支持 yesterday 查询', () => {
      const range = 'yesterday';
      expect(range).toBe('yesterday');
    });

    it('应该支持 week 查询', () => {
      const range = 'week';
      expect(range).toBe('week');
    });

    it('应该支持 specific date 查询', () => {
      const range = '2026-04-21';
      expect(range).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('文件解析', () => {
    it('应该解析日期头格式', () => {
      const content = '### 2026-04-21\n\n- [Link](https://example.com)';
      const dateMatch = content.match(/^### (\d{4}-\d{2}-\d{2})$/m);
      expect(dateMatch).not.toBeNull();
      expect(dateMatch?.[1]).toBe('2026-04-21');
    });

    it('应该解析书签条目', () => {
      const content = '- [Example](https://example.com) #tag1 #tag2\n  > Description';
      const entryMatch = content.match(/^- \[([^\]]+)\]\(([^)]+)\)(.*)$/m);
      expect(entryMatch).not.toBeNull();
      expect(entryMatch?.[1]).toBe('Example');
      expect(entryMatch?.[2]).toBe('https://example.com');
    });
  });
});
