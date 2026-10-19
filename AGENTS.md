# Project data rules

This is a static travel companion with itinerary, places, and shopping/food goals.

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

- Preserve complete itinerary prose in detailMarkdown (nested lists and emphasis) and day-wide context in remindersMarkdown. Keep the outer card concise and do not add a page-level 行前準備 section. Later confirmed schedule, hotel, goals and maps take precedence over source Markdown; imported prose is not fresh verification.

- Protein uses one TripItem.comparisonId and src/data/comparisons.json. Show 比價與入手標準 directly with candidate images; no quote recording, FX or conversion features. Put a 乳清 quick filter next to 超商 and exclude protein from subcategories. Retain normal completion only; unverified branch stock must not create itinerary links.

- Do not show a 細分類 dropdown in the checklist. Do not research purchase channels, retailer listings or branch stock for new goals or proxy orders. Verify product identity, size or version only when needed.

- Keep drugstore product introductions to roughly 1–2 mobile lines. Do not show purchase channels on personal or proxy cards or protein comparisons; do not populate purchaseOptions for new items.

- Proxy shopping uses src/data/proxyOrders.json (people, products, orders). Keep production orders empty until the user supplies recipients and products. Reuse existing item IDs where possible; proxy-only products must not enter the personal checklist. Keep stable order IDs for local photos and amounts. Actual purchase totals and photos stay in IndexedDB, never commit them. Do not show backup/import, storage-retention buttons or a storage explanation panel on the proxy page. Distinguish missing amounts from zero. Do not promise automatic sync or guaranteed browser retention.

- Proxy purchase photos must be hidden until explicitly opened. Hide proxy product descriptions. Selecting a recipient shows a photo-free table of product, quantity, recorded JPY amount and total, with a button to switch to purchase-record cards.

- Drugstore goals are a separate user-facing group: label their cards 藥妝 and exclude them from the 購物 filter. Keep them visible in 全部 and 藥妝, with stable item IDs and completion records.

- Before adding image-provided goals, compare product names, versions and sizes against existing goals. Reuse existing IDs and preserve completion records for duplicates; never add a second copy solely because a new image was supplied.

- Do not display priority badges on goal cards. The bottom navigation must have an opaque full-width background extending to the viewport bottom, including safe-area padding, so page content cannot show underneath it.

- Keep drugstore goals with the same category adjacent in items.json; merge synonymous category labels. Do not add category filters or extra controls for this grouping. Preserve IDs and the relative order of non-drugstore goals.

- Convenience goals without a user-specified chain use convenienceStore: "any" and display 超商／超市; do not assign an invented chain or branch. Keep them independent from itinerary stops.

- Coupons belong in src/data/coupons.json and original downloaded images in public/coupons/. Never generate or redraw coupon codes. Keep source URLs as metadata only; do not display source links or last-checked dates. Web-only redemption and counter/member offers must retain their actual usage flow, with conflicting validity or eligibility clearly marked.
