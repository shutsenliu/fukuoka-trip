# Project data rules

This is a static travel companion with itinerary, places, and shopping/food/experience goals.

- Only add or change goal items when the user provides images or explicitly specifies the item in the conversation. Never infer items from itinerary Markdown, place names, notes, or examples in documentation.
- Goal data belongs in src/data/items.json, places in src/data/places.json, images in public/items/, and itinerary in src/data/itinerary.json.
- Keep the item list empty until the user supplies goals. Test fixtures belong in tests only, never in production JSON.
- A new itinerary Markdown uploaded in the conversation updates itinerary data, not goal data. The website has no upload UI.
- Preserve item IDs for browser completion records. Place references use IDs; the first placeIds entry is primary and subsequent entries are backups.
- Run npm test and npm run build for functional changes. Use the existing checkout; do not create worktrees unless asked.
- Navigation requires an explicitly verified navigationDestination. Never generate navigation from itinerary titles, rest/transport text, generic place names, or disputed addresses. Do not show map buttons or placeholder location information for unverified places.

- Each itinerary stop shows at most one confirmed destination map button. Transport steps belong in the expandable section titled 詳細資訊; do not show a separate 店家與導航 panel.
- Research new user-specified goals and propose their places and schedule first. After the user confirms, update the data and illustrations. Do not require an image preview in chat; images are reviewed on the website.
- Keep verification sources as data metadata only, not user-facing 查證來源 links. Mark uncertain availability explicitly and never silently substitute a requested product.

- In chat, provide verification source links only; do not display generated image previews. Save illustrations directly to the website.
- Convenience-store goals use TripItem.convenienceStore and empty placeIds; never attach them to itinerary stops or invent a branch/map.
