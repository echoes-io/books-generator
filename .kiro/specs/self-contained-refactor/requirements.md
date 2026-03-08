# Self-Contained Refactor + Typst Migration

## Context

books-generator currently depends on `@echoes-io/models` and `@echoes-io/utils`, which are being archived. The package must become self-contained. This is also the right moment to migrate from LaTeX/Pandoc to Typst.

## Requirements

### Phase 1: Remove External Dependencies

1. **Replace `@echoes-io/utils` dependency**
   - `parseMarkdown()` is a 3-line wrapper around `gray-matter`
   - Add `gray-matter` as direct dependency
   - Inline the parsing: `const { data, content } = matter(rawContent)`
   - Remove `@echoes-io/utils` from package.json

2. **Replace `@echoes-io/models` dependency**
   - `ChapterMetadataSchema` is used only for optional validation warnings
   - Either: inline a minimal Zod schema (~15 lines) for validation
   - Or: remove validation entirely (it's a non-blocking warning)
   - Remove `@echoes-io/models` from package.json

3. **Use `@echoes-io/brand` for colors**
   - Currently timeline colors are hardcoded in `book-generator.ts` (lines 196-201)
   - Import color palettes from `@echoes-io/brand` instead
   - Add `@echoes-io/brand` as dependency
   - Add Pulse timeline colors (currently missing)

### Phase 2: Migrate from LaTeX to Typst

4. **Replace LaTeX template with Typst**
   - Current: `templates/victoria-regia/template.tex` + Pandoc + pdflatex/xelatex/lualatex
   - Target: Typst templates (`.typ` files)
   - Remove Pandoc dependency
   - Remove LaTeX engine detection (`detectPdfEngine()`)
   - Use Typst CLI directly for compilation

5. **Update compilation pipeline**
   - Current flow: markdown → Pandoc → LaTeX → PDF
   - Target flow: markdown → Typst → PDF
   - Typst handles markdown natively, simplifying the pipeline
   - Keep the same CLI interface (`books-generator <contentPath> <outputPath> <timeline>`)

6. **Preserve existing features**
   - Episode/chapter structure detection
   - Multi-episode and multi-POV header formatting
   - Table of contents generation
   - Page format options (A4/A5)
   - Timeline-specific color theming

### Phase 3: Cleanup

7. **Remove old templates**
   - Delete `templates/victoria-regia/` (LaTeX)
   - Create new Typst template directory

8. **Update documentation**
   - Update README with new prerequisites (Typst instead of LaTeX)
   - Update CLI usage examples

## Out of Scope

- Adding new features beyond current functionality
- Changing the public API (`generateBook()` signature stays the same)
- MCP server integration (books-generator stays standalone)

## Dependencies After Refactor

```
dependencies:
  gray-matter        # frontmatter parsing
  @echoes-io/brand   # color palettes
  (typst CLI)        # system dependency, not npm
```

## Notes

- Phase 1 can be done independently of Phase 2
- Phase 1 is required before archiving `models` and `utils` repos
- Typst docs: https://typst.app/docs
