# Lessons

## 2026-09-14 Preserve exact Markdown output examples
- Incident: Prettier inserted a blank line into a fenced Markdown footer example; the PRD also nested single-backtick code spans.
- Preventative rule: Check rendered code-span boundaries and preserve exact-output examples with a targeted prettier-ignore comment when the formatter rewrites their content.
- Validation: Compare the documented footer with the output assertion after formatting.
- Next trigger: Documentation containing literal generated Markdown.
