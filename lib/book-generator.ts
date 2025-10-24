import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BookGeneratorOptions {
  contentPath: string;
  outputPath: string;
  timeline: string;
  episodes?: string;
  format?: 'a4' | 'a5';
}

function detectPdfEngine(): string {
  const engines = ['pdflatex', 'xelatex', 'lualatex'];
  for (const engine of engines) {
    try {
      execSync(`which ${engine}`, { stdio: 'ignore' });
      return engine;
    } catch {}
  }
  throw new Error('No PDF engine found. Install xelatex, pdflatex, or lualatex');
}

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function processMarkdownContent(
  content: string,
  filePath: string,
  hasMultipleEpisodes: boolean,
  hasMultiplePOVs: boolean,
  chapterNumber: number,
  isFirstChapterOfEpisode: boolean,
): string {
  content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  // Remove emoji and problematic Unicode characters
  content = content.replace(
    /[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2B1C}\u{2B1B}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}\u{1F1E0}-\u{1F1FF}\u{2200}-\u{22FF}]|\u{FE0F}|\u{200D}/gu,
    '',
  );

  const episodeMatch = filePath.match(/ep(\d+)-([^/]+)/);
  if (episodeMatch) {
    const episodeName = episodeMatch[2].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    let processed = content;

    if (hasMultipleEpisodes && isFirstChapterOfEpisode) {
      processed = `# ${episodeName}\n\n${processed}`;
    }

    const headerLevel = hasMultipleEpisodes ? '##' : '#';

    processed = processed.replace(/^# (\d+)\.\s*(.+)$/m, (_, __, titleWithPov) => {
      const povMatch = titleWithPov.match(/^([^:]+):\s*(.+)$/);
      if (povMatch && hasMultiplePOVs) {
        const [, pov, title] = povMatch;
        return hasMultipleEpisodes
          ? `${headerLevel} ${title} _(${pov})_`
          : `${headerLevel} ${chapterNumber}. ${title} _(${pov})_`;
      } else if (povMatch) {
        const title = povMatch[2];
        return hasMultipleEpisodes
          ? `${headerLevel} ${title}`
          : `${headerLevel} ${chapterNumber}. ${title}`;
      }
      return hasMultipleEpisodes
        ? `${headerLevel} ${titleWithPov}`
        : `${headerLevel} ${chapterNumber}. ${titleWithPov}`;
    });

    content = processed;
  }

  return content;
}

export async function generateBook(options: BookGeneratorOptions): Promise<void> {
  const { contentPath, outputPath, timeline, episodes, format = 'a4' } = options;

  console.log(`📚 Generating book for timeline: ${timeline.toUpperCase()}`);

  const chaptersPath = path.join(contentPath, 'chapters');
  if (!fs.existsSync(chaptersPath)) {
    throw new Error(`Chapters folder not found: ${chaptersPath}`);
  }

  let files = collectMarkdownFiles(chaptersPath);

  if (episodes) {
    const episodeList = episodes.split(',').map((e) => e.trim());
    files = files.filter((file) =>
      episodeList.some((ep) => file.includes(`ep${ep.padStart(2, '0')}`)),
    );
    if (files.length === 0) throw new Error(`No files found for episodes: ${episodes}`);
    console.log(`🎯 Filtered ${files.length} files for episodes: ${episodes}`);
  }

  files = files.filter((file) => !file.includes('-ch00-'));
  console.log(`📄 Processing ${files.length} files`);

  if (files.length === 0) throw new Error('No files to process');

  const episodeSet = new Set<string>();
  const povSet = new Set<string>();

  for (const filePath of files) {
    const episodeMatch = filePath.match(/ep(\d+)-([^/]+)/);
    if (episodeMatch) episodeSet.add(episodeMatch[0]);

    const content = fs.readFileSync(filePath, 'utf-8');
    const povInTitle = content.match(/^# \d+\.\s*([^:]+):/m);
    const povInLine = content.match(/^# [^:]+\s*\n\s*_\[([^\]]+)\]_/m);

    if (povInTitle) {
      const pov = povInTitle[1].trim();
      if (pov.length <= 10 && /^[A-Z][a-z]+$/.test(pov)) povSet.add(pov);
    } else if (povInLine) {
      const pov = povInLine[1].trim();
      if (pov.length <= 10 && /^[A-Z][a-z]+$/.test(pov)) povSet.add(pov);
    }
  }

  const hasMultipleEpisodes = episodeSet.size > 1;
  const hasMultiplePOVs = povSet.size > 1;

  console.log(`📊 ${episodeSet.size} episodes, ${povSet.size} POVs`);

  let bookContent = '';
  let currentEpisode = '';
  let chapterCounter = 0;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const episodeMatch = filePath.match(/ep(\d+)-([^/]+)/);
    const isFirstChapterOfEpisode = episodeMatch && episodeMatch[0] !== currentEpisode;

    if (isFirstChapterOfEpisode) {
      currentEpisode = episodeMatch[0];
      chapterCounter = 0;
    }

    chapterCounter++;

    const processed = processMarkdownContent(
      content,
      filePath,
      hasMultipleEpisodes,
      hasMultiplePOVs,
      chapterCounter,
      Boolean(isFirstChapterOfEpisode),
    );

    if (bookContent) bookContent += '\n\n\\newpage\n\n';
    bookContent += processed;
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const tempFile = path.resolve(path.join(outputDir, `temp-${timeline}-${Date.now()}.md`));
  fs.writeFileSync(tempFile, bookContent);

  try {
    const pdfEngine = detectPdfEngine();
    console.log(`🔧 Using PDF engine: ${pdfEngine}`);

    const templatesDir = path.join(__dirname, '..', 'templates');
    const templatePath = path.join(templatesDir, 'victoria-regia', 'template.tex');

    const timelineColors: Record<string, { primary: string; secondary: string; accent: string }> = {
      anima: { primary: '4ECDC4', secondary: '95E1D3', accent: 'F3B6D3' },
      eros: { primary: 'D2001F', secondary: 'FF6B6B', accent: 'FFD93D' },
      bloom: { primary: 'FF69B4', secondary: 'FFA07A', accent: 'FFD700' },
    };

    const colors = timelineColors[timeline] || timelineColors.bloom;

    const variables = {
      geometry: format,
      timeline: timeline,
      title: 'Echoes',
      subtitle: timeline.charAt(0).toUpperCase() + timeline.slice(1),
      author: 'Zweer',
      authorFull: 'Niccolò Olivieri Achille',
      publisher: 'Echoes',
      email: 'n.olivieriachille@gmail.com',
      year: '2025',
      'timeline-primary': colors.primary,
      'timeline-secondary': colors.secondary,
      'timeline-accent': colors.accent,
      'templates-dir': templatesDir,
    };

    const pandocArgs = [
      'pandoc',
      `"${tempFile}"`,
      '-o',
      `"${path.resolve(outputPath)}"`,
      `--template="${templatePath}"`,
      `--pdf-engine=${pdfEngine}`,
      '--toc',
      '--toc-depth=1',
      ...Object.entries(variables).map(([k, v]) => `--variable="${k}:${v}"`),
    ];

    const pandocCmd = pandocArgs.join(' ');
    console.log(`🔧 Executing pandoc...`);
    execSync(pandocCmd, { stdio: 'inherit', cwd: templatesDir });

    console.log(`✅ Book generated: ${outputPath}`);

    const stats = fs.statSync(outputPath);
    console.log(`📊 Size: ${Math.round(stats.size / 1024)} KB`);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}
