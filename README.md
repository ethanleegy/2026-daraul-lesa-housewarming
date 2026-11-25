# Ivory event template

The public invitation site for an Ivory Invites event: **Jekyll + Tailwind v4**
on GitHub Pages, talking to a **Firebase** backend, with photos on
**Cloudflare**. A client's site is this template plus one data file.

The example data in `_data/event.yml` reproduces WPVLHC · Christmas Social 2026.

## Start a new event

1. Create a repo from this template (GitHub → **Use this template**), named
   `<year>-<client-slug>`.
2. Replace `assets/images/` with the client's images (keep the two
   `ivory-logo_*.svg` files).
3. Fill in `_data/event.yml`. Every field is commented.
4. Restyle in `event.yml → theme` (colours, fonts, pattern). Put anything more
   bespoke in `src/event.css`, or empty it.
5. Point `backend.api_base` at the event's Functions URL.
6. Check it, then preview:

   ```sh
   npm install && bundle install
   ruby scripts/check_event.rb
   npm run css:watch            # terminal 1
   bundle exec jekyll serve     # terminal 2 → http://localhost:3000
   ```

7. Push to `main`. The workflow validates, builds and deploys to Pages; pull
   requests get the same checks without deploying.

## How it fits together

```text
_data/event.yml            ← the client data file (only file most events change)
index.html                 ← renders event.yml `sections` in order
_includes/sections/        ← hero, invitation, contributions, countdown, story, footer
_includes/rsvp/            ← open (register by name) and personal (?token=) forms
_includes/theme-vars.html  ← event.yml colours/fonts → CSS variables Tailwind uses
_includes/ivory-config.html← public settings → window.IVORY for the JS
assets/js/ivory.js         ← reveal, smooth scroll, countdown, RSVP, menu
assets/js/gallery.js       ← gallery page
src/tailwind.css           ← shared styles + default theme
src/event.css              ← per-event flourishes
scripts/check_event.rb     ← validates event.yml and referenced images
docs/API-CONTRACT.md       ← what the front end expects from the backend
CLAUDE.md                  ← rules for AI agents working in a client repo
```

## Not in this template (yet)

- Firebase Functions, Firestore rules and the React admin dashboard
- The Cloudflare gallery worker and the guest photo-upload app (`/gallery/upload/`)
- A guest-list import script

These are the next pieces to extract into a shared platform repo so every
event runs the same backend code.
