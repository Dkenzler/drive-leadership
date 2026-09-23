# DRIVE Design
- Ink #131b2e, purple #6b01cd, orange #fd5e34, lavender #f3f0ff, warm paper #f7f3ec.
- Google Sans Flex for UI; Newsreader italic for editorial emphasis.
- Purple primary actions, white secondary actions with fine gray borders.
- Generous whitespace, quiet separators, no invented popularity metrics.
- Four areas: Drive, Lead, Ship, Yourself.
- Responsive layouts, keyboard focus, meaningful empty states.

## Skills exploration
Local prototype with illustrative draft content, not the final book catalogue. Access selection (20 free / full reader collection / optional newsletter) is not decided. Restricted content must be served after server-side authorization in production; never ship protected Markdown to anonymous clients. No email or purchase data collected in this prototype.

## Real skill catalogue (local integration)
The supplied collection currently contains 89 skills and 138 Markdown files, including one cross-cutting Flywheel skill. Access assignments are `pending` until selected by the author.

Import locally with `python3 scripts/import-skills.py /path/to/drive-leadership-skills`. Original files are never modified. Metadata is written to `src/skills-data.json`; full text and ZIPs are kept in ignored `.local-skills/`.

`npm run build` produces only catalogue metadata with no Markdown payload or downloads. `npm run build:local` includes private contents for local inspection only and refuses CI/Vercel environments. Do not upload the local `public/` folder. Verify either build with `node tests/skills-build.mjs`.

Future free/reader authorization must deliver documents and archives from the server after access checks; client flags are only presentation state, never authorization. Never commit `.local-skills` or export the local preview as a deployment.
