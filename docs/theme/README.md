# Hivemind Theme — for your web app

These are the **design tokens + tooling config** from Hivemind's real web app, so your UI matches ours exactly. When we port your work upstream, colors/spacing/components line up with zero rework.

**What's here (copy these):**

| File | Goes to | What it is |
|---|---|---|
| `globals.css` | `apps/web/src/app/globals.css` | All design tokens (Hivemind palette, light + dark) + Tailwind v4 config |
| `postcss.config.mjs` | `apps/web/postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `components.json` | `apps/web/components.json` | shadcn/ui config (style, base color, aliases) |

**What's intentionally NOT here:** any React/UI component code. You build those yourself — that's the learning. The tokens + config make sure that when you do, they look like Hivemind.

---

## Key fact: Tailwind v4 (no `tailwind.config.js`)

Hivemind uses **Tailwind CSS v4**, which is **CSS-first**. There is no `tailwind.config.js`/`.ts`. All config lives in `globals.css`:
- `@import "tailwindcss";` replaces the old three `@tailwind` directives.
- `@theme inline { ... }` maps CSS variables to utility classes — this is what makes `bg-primary`, `text-muted-foreground`, `border-border` work.
- Colors are **CSS variables in `oklch()`**, defined once in `:root` (light) and overridden in `.dark`.

If you've only seen Tailwind v3 tutorials (JS config file), don't get confused — v4 is different. Read: https://tailwindcss.com/docs/upgrade-guide and https://tailwindcss.com/blog/tailwindcss-v4

---

## Setup steps

1. **Install deps** (in `apps/web`):
   ```bash
   pnpm add tailwindcss @tailwindcss/postcss tw-animate-css
   pnpm add clsx tailwind-merge class-variance-authority lucide-react
   ```
2. Copy the three files to the locations in the table above.
3. Import the CSS once in your root layout (`apps/web/src/app/layout.tsx`):
   ```tsx
   import "./globals.css";
   ```
4. **Init shadcn/ui** (it reads `components.json`):
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card progress badge table dialog
   ```
   Generated components automatically use these tokens. The `cn()` helper lands at `src/lib/utils.ts` — that's standard shadcn boilerplate, fine to use as-is.
5. **Dark mode:** toggle by adding/removing the `dark` class on `<html>`. For a real toggle use `next-themes` later; for now you can hardcode or add a simple button.

---

## The Hivemind palette (what each token means)

| Token | Role | Color (light) |
|---|---|---|
| `--primary` | Brand / primary actions | **Gold** `oklch(0.83 0.12 78)` |
| `--secondary` | Secondary surfaces/buttons | **Mint** `oklch(0.82 0.02 165)` |
| `--accent` | Accents / highlights | **Rose** `oklch(0.86 0.06 16)` |
| `--sidebar` | Sidebar background | **Dark slate** `oklch(0.31 0.006 260)` |
| `--background` / `--foreground` | Page bg / text | near-white / slate |
| `--muted` / `--muted-foreground` | Subtle bg / secondary text | light gray / mid slate |
| `--destructive` | Errors / delete | red `oklch(0.58 0.21 22)` |
| `--card`, `--popover`, `--border`, `--input`, `--ring` | shadcn surface/control tokens | — |
| `--chart-1..5` | Chart series (for your analytics dashboards) | gold/mint/rose/blue/teal |

**Use the tokens, never hardcode hex.** Write `bg-primary text-primary-foreground`, `bg-sidebar`, `text-muted-foreground` — not `bg-[#d4a017]`. This is what makes theming + dark mode work and keeps your code portable.

> `oklch()` is a modern perceptual color space (lightness / chroma / hue). You don't need to author colors by hand — just use the token utilities. If you want to tweak one, an oklch picker (e.g. oklch.com) helps.

---

## Note for porting (FYI, don't build this now)

Upstream, Hivemind supports **multiple swappable theme presets** (brutalist, soft-pop, tangerine, hivemind) via a `:root[data-theme-preset="hivemind"]` selector pattern and per-preset CSS files. We baked the `hivemind` preset straight into your `:root` so you have **one theme, no switching machinery** — simpler for you, and it ports fine (we just move your tokens into the preset file). Don't build the preset system; single theme is correct for your repo.
