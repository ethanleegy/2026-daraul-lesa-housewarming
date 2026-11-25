# Ivory event site — instructions for AI agents

This repo is one client's public event site, built from the Ivory template
(Jekyll + Tailwind v4, hosted on GitHub Pages). The backend (Firebase
Functions + Firestore), image storage (Cloudflare) and the React admin app
live elsewhere; this repo only calls them over HTTPS.

## The golden rule

**Client content goes in `_data/event.yml` and `assets/images/` — nowhere else.**
Names, dates, venues, copy, colours, fonts, feature switches and API URLs are
all data. If you find yourself typing a client's name into an `.html` or `.js`
file, stop and put it in `event.yml` instead.

## What you may change, from most to least common

1. `_data/event.yml` — every normal client request.
2. `assets/images/` — client photos, logo, share image (1200×630), favicon.
3. `src/event.css` — flourishes unique to this event (animated text, decorative
   overlays). Reference its classes from `*_html` fields in `event.yml`.
4. `_includes/sections/<new>.html` — only when a client needs a section type
   the template doesn't have. Read every value from `site.data.event`, then add
   the name to `sections` in `event.yml`. Keep it generic enough to reuse.
5. `_layouts/`, `_includes/` (other), `assets/js/`, `src/tailwind.css` — shared
   template code. Change only to fix a bug or add a reusable feature, and say
   so clearly in the PR, since the change should go back to the template repo.

Never commit secrets, `.env` files or service-account JSON. Only public values
belong in `event.yml` — it's published to the browser as `window.IVORY`.

## Conventions

- Styling: Tailwind utilities with the theme tokens — `bg-primary`,
  `text-accent`, `border-line`, `text-on-dark/75`, `font-display`. Don't
  hard-code hex colours in markup; add or change a colour in `theme.colors`.
- A Tailwind class that only appears inside a Liquid expression
  (e.g. `md:grid-cols-{{ n }}`) must be listed in `@source inline(...)` in
  `src/tailwind.css`, or it won't be generated.
- Images are referenced by file name in `event.yml`; templates add
  `/assets/images/` and `relative_url`.
- Front-end ↔ backend shapes are fixed by `docs/API-CONTRACT.md`. Don't add
  fields to request bodies: the backends reject unknown keys.
- Accessibility: keep `alt` text, `aria-live` messages, focus-visible outlines
  and `prefers-reduced-motion` fallbacks when you touch markup.

## Feature switches (`features` in event.yml)

| Switch | Effect |
|---|---|
| `rsvp: open` | Anyone registers by name (+ optional plus-one) |
| `rsvp: personal` | Per-household `?token=` links; greeting becomes the household name |
| `rsvp: form` | Custom fields from `rsvp.fields` (text, email, tel, textarea, select) posted to `submissions` |
| `rsvp: none` | Information-only invite |
| `contributions` | "Bring a dish" menu (needs `rsvp: open`) |
| `gallery` | `/gallery/` page + hero link |
| `countdown` | Countdown section (add `countdown` to `sections`) |
| `ivory_credit` | "Have an event of your own?" link |

## Hero layouts (`hero.style` in event.yml)

| Style | Look | Needs |
|---|---|---|
| `classic` (default) | Full-bleed `hero.image` (or solid `hero` colour), title left | — |
| `split` | Title on the left, `hero.image` on the right. Set `hero.image_shape: portrait` for a tall photo (narrower image column, taller panel on phones) | `hero.image` |
| `centered` | Full-screen white hero: `hero.image` on white, only the title, centred in dark ink (eyebrow, subtitle and `cta` aren't shown). `image_shape: portrait` shows the whole image. Style title flourishes for white via `.hero-light` in `event.css` | `hero.image` with a white background |
| `polaroid` | Two framed photos piled in the centre (first in front), solid `hero` colour, title bottom-left | `hero.photos` (two, with `alt`) |

Each layout is `_includes/hero/<style>.html` and shares `hero/top-bar.html`
and `hero/title.html`, so copy fields work the same in every layout.

## Before you finish

```sh
ruby scripts/check_event.rb   # data + image checks; must print ✓
npm run css:build             # Tailwind
bundle exec jekyll build      # site builds without Liquid errors
```

In a PR, list what you changed in `event.yml`, any images you need from the
client, and any template code you touched.
