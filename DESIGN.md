# DRIVE Design
- Ink #131b2e, purple #6b01cd, orange #fd5e34, lavender #f3f0ff, warm paper #f7f3ec.
- Google Sans Flex for UI; Newsreader italic for editorial emphasis.
- Purple primary actions, white secondary actions with fine gray borders.
- Generous whitespace, quiet separators, no invented popularity metrics.
- Four areas: Drive, Lead, Ship, Yourself.
- Responsive layouts, keyboard focus, meaningful empty states.

## Public skill library
All 89 skills, 138 Markdown files and original ZIP downloads are released for free public access. The collection includes four areas and a cross-cutting Leadership Flywheel skill.

Import from the separate content repository with `python3 scripts/import-skills.py /path/to/drive-leadership-skills`. Original files remain unchanged. The import writes full contents into `src/skills-data.json` and the 90 ZIP archives into `src/downloads/`.

`npm run build` includes the complete library, with no access gate or preview disclaimers. Verify with `node tests/skills-build.mjs`. The content repository itself remains private; the explicitly released content is distributed through the website.
