# Project data rules

This is a static travel companion with itinerary, places, and shopping/food/experience goals.

- Only add or change goal items when the user provides images or explicitly specifies the item in the conversation. Never infer items from itinerary Markdown, place names, notes, or examples in documentation.
- Goal data belongs in src/data/items.json, places in src/data/places.json, images in public/items/, and itinerary in src/data/itinerary.json.
- Keep the item list empty until the user supplies goals. Test fixtures belong in tests only, never in production JSON.
- A new itinerary Markdown uploaded in the conversation updates itinerary data, not goal data. The website has no upload UI.
- Preserve item IDs for browser completion records. Place references use IDs; the first placeIds entry is primary and subsequent entries are backups.
- Run npm test and npm run build for functional changes. Use the existing checkout; do not create worktrees unless asked.
- Navigation requires an explicitly verified navigationDestination. Never generate navigation from itinerary titles, rest/transport text, generic place names, or disputed addresses. Unverified places may offer a clearly labeled map search scoped to Japan and the relevant area.
