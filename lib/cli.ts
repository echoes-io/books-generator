#!/usr/bin/env node

import { generateBook } from './book-generator.js';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
Usage: books-generator <contentPath> <outputPath> <timeline> [episodes] [format]

Arguments:
  contentPath   Path to timeline content folder (containing chapters/)
  outputPath    Output PDF file path
  timeline      Timeline name (anima, eros, bloom)
  episodes      Optional: comma-separated episode numbers (e.g., "1,2,3")
  format        Optional: page format (a4 or a5, default: a4)

Example:
  books-generator ./docs/eros ./output/eros.pdf eros "1,2" a4
`);
  process.exit(1);
}

const [contentPath, outputPath, timeline, episodes, format] = args;

generateBook({
  contentPath,
  outputPath,
  timeline,
  episodes,
  format: (format as 'a4' | 'a5') || 'a4',
}).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
