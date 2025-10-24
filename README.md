# @echoes-io/books-generator

**LaTeX book generation and compilation system for Echoes.io storytelling platform**

## Overview

The Book Generator provides automated LaTeX compilation for Echoes timeline content, enabling professional book publishing with the Victoria Regia template.

## Features

- **Victoria Regia Template**: Elegant LaTeX template inspired by golden ratio with Brazilian style
- **Automated Compilation**: Generate PDF books from markdown content using pandoc
- **Chapter Organization**: Respect episode/chapter hierarchy
- **Timeline-Aware Styling**: Custom colors for each timeline (Anima, Eros, Bloom)
- **Multi-Format Output**: Support for A4 and A5 page formats

## Installation

```bash
npm install @echoes-io/books-generator
```

### Requirements

- Node.js >= 20
- pandoc
- LaTeX distribution (pdflatex, xelatex, or lualatex)

On Ubuntu/Debian:
```bash
sudo apt-get install pandoc texlive-latex-base texlive-latex-extra texlive-fonts-recommended
```

## Usage

### CLI

```bash
books-generator <contentPath> <outputPath> <timeline> [episodes] [format]
```

**Arguments:**
- `contentPath`: Path to timeline content folder (containing `chapters/` directory)
- `outputPath`: Output PDF file path
- `timeline`: Timeline name (`anima`, `eros`, or `bloom`)
- `episodes`: Optional comma-separated episode numbers (e.g., `"1,2,3"`)
- `format`: Optional page format (`a4` or `a5`, default: `a4`)

**Example:**
```bash
# Generate book for Bloom timeline, episode 1, A4 format
books-generator ./docs/bloom ./output/bloom-ep1.pdf bloom "1" a4

# Generate book for all episodes
books-generator ./docs/eros ./output/eros-complete.pdf eros
```

### Programmatic API

```typescript
import { generateBook } from '@echoes-io/books-generator';

await generateBook({
  contentPath: './docs/anima',
  outputPath: './output/anima.pdf',
  timeline: 'anima',
  episodes: '1,2,3',
  format: 'a4'
});
```

## Content Structure

Your content folder should follow this structure:

```
timeline-name/
└── chapters/
    ├── ep01-episode-name/
    │   ├── ep01-ch001-chapter-title.md
    │   ├── ep01-ch002-chapter-title.md
    │   └── ...
    ├── ep02-episode-name/
    │   └── ...
    └── ...
```

## Template

The Victoria Regia template includes:

- **Golden ratio-based layout**: Professional typography and spacing
- **Timeline-specific colors**: Each timeline has its own color palette
  - Anima: Sage green (`#4ECDC4`)
  - Eros: Burgundy (`#D2001F`)
  - Bloom: Pink (`#FF69B4`)
- **Elegant frontmatter**: Title page, copyright, preface, table of contents
- **Chapter decorations**: Ornamental separators and headers
- **Professional styling**: Optimized for readability

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## TODO

### Content Structure Migration
- [ ] Migrate from `docs/` to `content/` folder structure
- [ ] Add frontmatter support for chapter metadata:
  - `title`: Chapter title
  - `pov`: Point of view character (for multi-POV timelines)
  - `number`: Chapter number
  - `episodeNumber`: Episode number
  - `timelineId`: Timeline identifier
- [ ] Parse frontmatter using gray-matter or similar
- [ ] Update path resolution to use `content/timeline/chapters/` instead of `docs/timeline/chapters/`
- [ ] Extract title and POV from frontmatter instead of markdown headers

### Template Improvements
- [ ] Add support for custom metadata in frontmatter
- [ ] Improve multi-language support
- [ ] Add more page format options (letter, custom sizes)

## License

MIT

---

**Echoes** - Multi-POV storytelling platform ✨
