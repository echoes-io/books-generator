import type { ChapterMetadata } from '@echoes-io/models';

export interface BookOptions {
  timeline: string;
  arc?: string;
  episodes?: number[];
  outputPath: string;
  template?: string;
  format?: 'pdf' | 'epub';
  includeArcs?: string[];
}

export interface BookMetadata {
  title: string;
  timeline: string;
  arcs: ArcMetadata[];
  totalChapters: number;
  wordCount: number;
  generatedAt: Date;
}

export interface ArcMetadata {
  name: string;
  episodes: EpisodeMetadata[];
  chapterCount: number;
  wordCount: number;
}

export interface EpisodeMetadata {
  number: number;
  title: string;
  chapters: ChapterMetadata[];
  wordCount: number;
}

export interface TemplateData {
  metadata: BookMetadata;
  timelineColor: string;
  chapters: ChapterContent[];
}

export interface ChapterContent {
  metadata: ChapterMetadata;
  content: string;
  wordCount: number;
}

export interface BookConfig {
  templatesPath: string;
  outputPath: string;
  latexEngine: 'pdflatex' | 'xelatex' | 'lualatex';
  timelineColors: Record<string, string>;
}
