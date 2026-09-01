@AGENTS.md

## UI Review & Vision Optimization Skill
- **Targeted Captures Only:** Never capture the entire screen if only a single component or window needs checking. Use regional/window cropping via native OS flags.
- **Resolution Strategy:** Default to low-resolution inspection for text, alignment, or basic structural checks to save tokens. Only use high-resolution if inspecting micro-typography or subtle pixel gradients.
- **Caching & Reference:** Once an image is captured, name it (e.g., "UI_State_1") and reference it in subsequent steps. Do not take a new screenshot unless a code change has been applied.
- **Strict Visual Diff Format:** For UI reviews, output only a minimal markdown table:

  | Element | Issue | Fix |
  Do not include conversational introductions, polite filler, or text descriptions of unchanged UI elements.
