import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateBook } from '../lib/book-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testContentPath = path.join(__dirname, 'content');
const testOutputPath = path.join(__dirname, 'output', 'test-book.pdf');

describe('Book Generator', () => {
  beforeAll(() => {
    // Ensure output directory exists
    const outputDir = path.dirname(testOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup generated files
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath);
    }
  });

  describe('generateBook', () => {
    it('should generate a PDF from test content', async () => {
      await generateBook({
        contentPath: testContentPath,
        outputPath: testOutputPath,
        timeline: 'test',
        format: 'a4',
      });

      expect(fs.existsSync(testOutputPath)).toBe(true);
      const stats = fs.statSync(testOutputPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should throw error for non-existent content path', async () => {
      await expect(
        generateBook({
          contentPath: '/non/existent/path',
          outputPath: testOutputPath,
          timeline: 'test',
        }),
      ).rejects.toThrow('Content folder not found');
    });

    it('should throw error when no files found', async () => {
      const emptyPath = path.join(__dirname, 'empty-content');
      fs.mkdirSync(emptyPath, { recursive: true });

      await expect(
        generateBook({
          contentPath: emptyPath,
          outputPath: testOutputPath,
          timeline: 'test',
        }),
      ).rejects.toThrow('No files to process');

      fs.rmSync(emptyPath, { recursive: true });
    });

    it('should filter by episodes when specified', async () => {
      const outputPath = path.join(__dirname, 'output', 'test-ep01.pdf');

      await generateBook({
        contentPath: testContentPath,
        outputPath,
        timeline: 'test',
        episodes: '01',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it('should throw error when no files match episode filter', async () => {
      await expect(
        generateBook({
          contentPath: testContentPath,
          outputPath: testOutputPath,
          timeline: 'test',
          episodes: '99',
        }),
      ).rejects.toThrow('No files found for episodes: 99');
    });

    it('should support A5 format', async () => {
      const outputPath = path.join(__dirname, 'output', 'test-a5.pdf');

      await generateBook({
        contentPath: testContentPath,
        outputPath,
        timeline: 'test',
        format: 'a5',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it('should handle multiple POVs correctly', async () => {
      // Test content has Alice and Bob POVs
      await generateBook({
        contentPath: testContentPath,
        outputPath: testOutputPath,
        timeline: 'test',
      });

      expect(fs.existsSync(testOutputPath)).toBe(true);
      // PDF should be generated successfully with multi-POV content
    });

    it('should handle single POV correctly', async () => {
      // Create content with single POV
      const singlePovPath = path.join(__dirname, 'single-pov-content', 'test-arc', 'ep01-test');
      fs.mkdirSync(singlePovPath, { recursive: true });

      fs.writeFileSync(
        path.join(singlePovPath, 'ep01-ch001-test.md'),
        `---
pov: Alice
title: "Test"
date: "2025-01-01"
timeline: test
arc: test-arc
episode: 1
part: 1
chapter: 1
summary: "Test"
location: "London"
---

Test content.`,
      );

      const outputPath = path.join(__dirname, 'output', 'single-pov.pdf');
      await generateBook({
        contentPath: path.join(__dirname, 'single-pov-content'),
        outputPath,
        timeline: 'test',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      fs.rmSync(path.join(__dirname, 'single-pov-content'), { recursive: true });
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it('should handle invalid metadata with warning', async () => {
      // Create content with invalid metadata
      const invalidPath = path.join(__dirname, 'invalid-content', 'test-arc', 'ep01-test');
      fs.mkdirSync(invalidPath, { recursive: true });

      fs.writeFileSync(
        path.join(invalidPath, 'ep01-ch001-invalid.md'),
        `---
pov: Alice
title: "Invalid"
timeline: test
arc: test-arc
---

Missing required fields.`,
      );

      const outputPath = path.join(__dirname, 'output', 'invalid.pdf');

      // Should still generate but with warnings
      await generateBook({
        contentPath: path.join(__dirname, 'invalid-content'),
        outputPath,
        timeline: 'test',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      fs.rmSync(path.join(__dirname, 'invalid-content'), { recursive: true });
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it('should clean up temporary files', async () => {
      const outputDir = path.dirname(testOutputPath);

      await generateBook({
        contentPath: testContentPath,
        outputPath: testOutputPath,
        timeline: 'test',
      });

      // Check no temp files remain
      const tempFiles = fs.readdirSync(outputDir).filter((f) => f.startsWith('temp-'));
      expect(tempFiles.length).toBe(0);
    });

    it('should handle multiple episodes', async () => {
      // Create content with multiple episodes
      const multiEpPath = path.join(__dirname, 'multi-ep-content', 'test-arc');
      fs.mkdirSync(path.join(multiEpPath, 'ep01-first'), { recursive: true });
      fs.mkdirSync(path.join(multiEpPath, 'ep02-second'), { recursive: true });

      fs.writeFileSync(
        path.join(multiEpPath, 'ep01-first', 'ep01-ch001-test.md'),
        `---
pov: Alice
title: "Episode 1"
date: "2025-01-01"
timeline: test
arc: test-arc
episode: 1
part: 1
chapter: 1
summary: "First episode"
location: "London"
---

Episode 1 content.`,
      );

      fs.writeFileSync(
        path.join(multiEpPath, 'ep02-second', 'ep02-ch001-test.md'),
        `---
pov: Bob
title: "Episode 2"
date: "2025-01-02"
timeline: test
arc: test-arc
episode: 2
part: 1
chapter: 1
summary: "Second episode"
location: "Manchester"
---

Episode 2 content.`,
      );

      const outputPath = path.join(__dirname, 'output', 'multi-ep.pdf');
      await generateBook({
        contentPath: path.join(__dirname, 'multi-ep-content'),
        outputPath,
        timeline: 'test',
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      fs.rmSync(path.join(__dirname, 'multi-ep-content'), { recursive: true });
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  });

  describe('Content Structure', () => {
    it('should find markdown files in arc/episode structure', () => {
      const arcPath = path.join(testContentPath, 'test-arc', 'ep01-test-episode');
      expect(fs.existsSync(arcPath)).toBe(true);

      const files = fs.readdirSync(arcPath).filter((f) => f.endsWith('.md'));
      expect(files.length).toBeGreaterThan(0);
    });

    it('should have valid frontmatter in test chapters', () => {
      const chapterPath = path.join(
        testContentPath,
        'test-arc',
        'ep01-test-episode',
        'ep01-ch001-first-chapter.md',
      );

      const content = fs.readFileSync(chapterPath, 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('pov:');
      expect(content).toContain('title:');
      expect(content).toContain('timeline:');
    });
  });
});
