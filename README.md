# @echoes-io/books-generator

**LaTeX book generation and compilation system for Echoes.io storytelling platform**

## Overview

The Book Generator provides automated LaTeX compilation for Echoes timeline content, enabling professional book publishing with timeline-specific styling and formatting.

## Features

- **Timeline-Specific Templates**: Custom LaTeX templates for each timeline (Anima, Eros, Bloom)
- **Automated Compilation**: Generate PDF books from markdown content
- **Chapter Organization**: Respect arc/episode/chapter hierarchy
- **Metadata Integration**: Use frontmatter for book structure
- **Custom Styling**: Timeline-aware colors, fonts, and layouts
- **Multi-Format Output**: PDF, EPUB, and print-ready formats

## Architecture

```
Book Generator
├── Templates - LaTeX templates for each timeline
├── Compiler - PDF generation engine
├── Metadata Parser - Extract book structure from content
└── Style Engine - Timeline-specific formatting
```

## Usage

### Basic Book Generation

```typescript
import { BookGenerator } from '@echoes-io/books-generator';

const generator = new BookGenerator();

// Generate book for entire timeline
await generator.generateBook({
  timeline: 'anima',
  outputPath: './books/anima-complete.pdf',
  includeArcs: ['matilde', 'anima']
});

// Generate book for specific arc
await generator.generateBook({
  timeline: 'eros',
  arc: 'ale',
  outputPath: './books/eros-ale.pdf'
});
```

### Custom Templates

```typescript
// Use custom template
await generator.generateBook({
  timeline: 'bloom',
  template: 'custom-bloom-template.tex',
  outputPath: './books/bloom-custom.pdf'
});
```

## Templates

### Timeline Templates

Each timeline has its own LaTeX template with specific styling:

- **Anima Template**: Sage green palette, gentle typography, growth themes
- **Eros Template**: Burgundy palette, intense typography, passion themes  
- **Bloom Template**: Terracotta palette, balanced typography, discovery themes

### Template Structure

```latex
\documentclass[12pt,a5paper]{book}
\usepackage[utf8]{inputenc}
\usepackage{xcolor}
\usepackage{geometry}

% Timeline-specific colors
\definecolor{timelinecolor}{HTML}{{{timelineColor}}}

% Chapter formatting
\newcommand{\echochapter}[3]{
  \chapter{#1}
  \textit{#2} % POV
  \vspace{1em}
  #3 % Content
}
```

## Configuration

```typescript
const config = {
  templatesPath: './templates',
  outputPath: './output',
  latexEngine: 'xelatex',
  timelineColors: {
    anima: '#8FBC8F',    // Sage green
    eros: '#800020',     // Burgundy
    bloom: '#CD853F'     // Terracotta
  }
};
```

## Integration

### With Timeline Repositories

Automatically processes content from timeline repositories:
- `timeline-anima/content/`
- `timeline-eros/content/`
- `timeline-bloom/content/`

### With MCP Server

Integrates with `@echoes-io/mcp-server` via `book-generate` tool:

```bash
# Generate book via MCP
q chat "Generate a PDF book for the Anima timeline"
```

### With GitHub Actions

Automated book generation on content updates:

```yaml
name: Generate Books
on:
  push:
    paths: ['content/**/*.md']
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate Books
        run: npx @echoes-io/books-generator --timeline anima
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Development mode
npm run dev
```

## API Reference

### BookGenerator

Main class for book generation operations.

#### Methods

- `generateBook(options)` - Generate PDF book from timeline content
- `compileLatex(template, data)` - Compile LaTeX template with data
- `extractMetadata(contentPath)` - Extract book structure from content
- `applyTemplate(timeline, data)` - Apply timeline-specific template

### Types

```typescript
interface BookOptions {
  timeline: string;
  arc?: string;
  episodes?: number[];
  outputPath: string;
  template?: string;
  format?: 'pdf' | 'epub';
}

interface BookMetadata {
  title: string;
  timeline: string;
  arcs: ArcMetadata[];
  totalChapters: number;
  wordCount: number;
}
```

## Templates Directory

```
templates/
├── anima/
│   ├── book.tex
│   ├── chapter.tex
│   └── styles.sty
├── eros/
│   ├── book.tex
│   ├── chapter.tex
│   └── styles.sty
├── bloom/
│   ├── book.tex
│   ├── chapter.tex
│   └── styles.sty
└── shared/
    ├── base.tex
    └── common.sty
```

---

**Echoes** - Multi-POV storytelling platform ✨
