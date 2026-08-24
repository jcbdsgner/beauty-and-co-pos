<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace conventions

- Same brand as [b&co](../b&co) (Beauty and Co) — reuse its brand tokens, fonts and logo rather than inventing new ones. See `CONTEXT.md` for this project's own vocabulary as it's defined.
- **Before validating a significant implementation plan** (a new feature, a non-trivial refactor, anything that touches the data model or checkout flow), run `/grill-with-docs` to stress-test it against this project's language and documented decisions before writing code.
- **At the end of a significant session** (meaningful scope covered, or context getting long), run `/handoff` to produce a continuation document for whoever picks up next.

Both are invoked manually when the moment fits — not on a fixed schedule.
