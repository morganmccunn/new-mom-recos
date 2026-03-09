# New Mom Recos — Claude Context

## What this is
A curated baby product/app/service recommendation site built for Morgan to share with other new moms. Static site (no backend), deployed via GitHub Pages.

## Project location
`/Users/morganmccunn/Documents/GitHub/new-mom-recos`
(previously also at `/Users/morganmccunn/Claude/new-mom-recos` — GitHub version is the source of truth)

## Tech stack
- Pure HTML / CSS / JS — no frameworks, no build step
- Data driven via JSON files (`data/config.json`, `data/recommendations.json`)
- OG images fetched via Microlink API
- Deployed to GitHub Pages (push to `main` = live in ~60s)

## File structure
```
index.html          # Shell — JS populates everything
css/styles.css      # All styles
js/app.js           # All logic
data/config.json    # Site metadata, types (product/app/service), categories
data/recommendations.json  # All recommendation items
README.md           # Non-technical curator guide (no-code instructions)
```

## Key design decisions
- No "All" tab or pill — tabs are per type (Products, Apps, Services)
- Clicking an active category pill deselects it (returns to "all")
- Cards show OG images fetched from product links via Microlink
- List view has expand/collapse for curator notes
- CSV export downloads all recommendations
- Categories defined in config.json control the pills; order matters
- Content editable directly in GitHub's web UI (no code knowledge needed)

## Current recommendations data
- 60 products across 7 categories: Clothing, Feeding, For Parents, Gear, Hygiene, Medical, Nursery
- App and Service tabs exist but have no items yet
- IDs go up to prod-060 (note: prod-026 is skipped)

## Last session / next steps
> Update this section at the end of each session with what we worked on and what's next.
- [Session history not yet recorded — update after first working session]

## Morgan's preferences
- Keep it simple and beautiful — this is a gift for other moms, not a dev project
- Curated with real personal notes and Canadian retailer links
- Mobile-friendly is important (moms are on phones)
