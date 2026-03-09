# New Mom Recos — Curator Guide

A simple, beautiful recommendation site. No code knowledge required to update content.

---

## How to Add a Recommendation

Edit `data/recommendations.json` in GitHub's web UI (click the file → pencil icon → edit → commit).

Add a new object to the `"recommendations"` array:

```json
{
  "id": "prod-009",
  "type": "product",
  "category": "Sleep",
  "name": "Your Product Name",
  "priority": "required",
  "link": "https://example.com",
  "tags": ["newborn", "sleep"],
  "curator_note": "Why you love it.",
  "color_accent": "#A8D5BA",
  "featured": false,
  "date_added": "2024-03-01"
}
```

### Field reference

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Must be unique. Use format `type-XXX` e.g. `prod-009`, `app-005`, `svc-004` |
| `type` | Yes | Must match a key in `config.json` types: `product`, `app`, or `service` |
| `category` | Yes | Must match a category defined in `config.json` for that type |
| `name` | Yes | Display name of the item |
| `priority` | Yes | Exactly `required` or `nice to have` (lowercase) |
| `link` | No | Full URL including `https://`. Leave `""` if no link. |
| `tags` | No | Array of strings. Use `[]` for no tags. |
| `curator_note` | No | Your personal note. Leave `null` or `""` for none. |
| `color_accent` | No | Hex color for the card's left border. Defaults to gray. |
| `featured` | No | `true` or `false`. Reserved for future use. |
| `date_added` | No | ISO date string `YYYY-MM-DD` |

---

## How to Add/Remove Category Pills

Category pills are controlled in `data/config.json`. Edit the `categories` array for any type:

```json
"product": {
  "categories": ["Sleep", "Feeding", "Clothing", "Gear", "Postpartum"]
}
```

- **Add a category:** append it to the array. Any recommendations with that `category` value will appear when that pill is selected.
- **Remove a category:** delete it from the array. The pill disappears. The recommendations still exist but won't be filterable by that pill.
- **Reorder:** change the order in the array — pills appear in that order.
- **No pills:** set `"categories": []` — the pills row is hidden entirely for that type.

---

## How to Add a New Recommendation Type (Tab)

1. Add an entry to `config.json`:

```json
"recipe": {
  "label": "Recipes",
  "icon": "star",
  "description": "Easy meals for tired parents",
  "categories": ["Breakfast", "Dinner", "Snacks"]
}
```

2. Add recommendations with `"type": "recipe"` to `recommendations.json`.

That's it. A new tab appears automatically. Zero code changes needed.

---

## Importing from Google Sheets

1. Make sure your sheet has columns: `id, type, category, name, priority, link, tags, curator_note, color_accent, featured, date_added`
2. `priority` must be exactly `required` or `nice to have`
3. `tags` should be comma-separated: `newborn,sleep,splurge`
4. Export: **File → Download → CSV**
5. Convert at [csvjson.com/csv2json](https://csvjson.com/csv2json)
6. Wrap the result: `{ "recommendations": [ ...paste here... ] }`
7. Post-process tags: change `"newborn,sleep"` → `["newborn", "sleep"]`

---

## Local Preview

`fetch()` requires a server — opening `index.html` directly in a browser won't work.

```bash
# Option 1: npx (no install)
npx serve .

# Option 2: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Visit `http://localhost:3000`.

---

## Deploy to GitHub Pages

1. Push all files to the `main` branch
2. Go to **Settings → Pages → Source**: `main` branch, `/ (root)` folder
3. Save. Live at: `https://[your-username].github.io/new-mom-recos`

After that, editing any file in GitHub's web UI and committing = live in ~60 seconds.
