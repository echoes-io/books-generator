import { generateBook } from '@echoes-io/books-generator';

// Example 1: Generate book for single episode
await generateBook({
  contentPath: './docs/bloom',
  outputPath: './output/bloom-ep1.pdf',
  timeline: 'bloom',
  episodes: '1',
  format: 'a4',
});

// Example 2: Generate book for multiple episodes
await generateBook({
  contentPath: './docs/eros',
  outputPath: './output/eros-complete.pdf',
  timeline: 'eros',
  episodes: '1,2,3',
  format: 'a5',
});

// Example 3: Generate book for all episodes
await generateBook({
  contentPath: './docs/anima',
  outputPath: './output/anima-all.pdf',
  timeline: 'anima',
  format: 'a4',
});
