# Fukuoka Trip Companion

手機優先的繁體中文福岡旅行網站，旅程為 **2026/12/12～12/17**。主軸為每一站想買、想吃、想體驗的清單；React、TypeScript、Vite、Tailwind CSS、React Router，使用 GitHub Actions 部署 GitHub Pages。純靜態，無後端、資料庫或登入。

## Local development

需要 Node.js 22.12+ 與 npm。使用既有 checkout，不需要另外建立 worktree。

```bash
npm install
npm run dev
```

可重現安裝、測試及建置：

```bash
npm ci
npm test
npm run build
npm run preview
```

## 頁面

- **行程**：Day 1～6 時間軸。旅程期間依日本日期預設當天；旅程外記住上次選擇，首次開啟顯示 Day 1。有目標的停留點以底色與購物／美食／體驗標籤標示；點擊「查看清單」進入該站清單；單一地點直接顯示資訊與 Google Maps 導航，多地點從「店家與導航」查看。
- **清單**：依日期、站點、類型（購物／美食／體驗）、細分類與完成狀態篩選。相同項目在多個備案地點不重複計算。
- **地點詳情**：保留既有網址作次要入口，底部不再顯示地點頁籤。清單卡片直接顯示主要地點、時間、簡短地址與導航；備案、詳細資訊及查證來源可展開查看。

HashRouter 避免 GitHub Pages 重新整理時出現 404。舊 /wishlist 與 /stores 入口仍能開啟對應頁面。

## 資料與 UI 分離

- `src/data/itinerary.json`：TripDay（id、day、date、title、stops），ItineraryStop（id、startTime、endTime、name、type、notes、選填 placeId／placeIds）。
- `src/data/places.json`：Place（id、name、type、area、address、notes、選填 mapUrl／shortAddress／hours／closedDays／sourceUrls）。type 為 shop／restaurant／attraction。
- `src/data/items.json`：TripItem（id、name、type、category、priority、image、notes、placeIds、選填 color／size）。type 為 shopping／food／experience，priority 為 1～5。
- `src/types.ts`：共用 TypeScript 型別。
- `public/items/`：項目圖片，使用 `items/photo.webp` 相對路徑，不加 repo base path。
- `docs/itinerary-source.md`：使用者提供的行程參考文件，不是項目來源。

目前第一個項目為使用者提供的 Milch 半熟起司蛋糕／牛奶布丁。**只依使用者在 Codex 對話提供的圖片或明確指定新增項目，不從行程 Markdown、地點名稱或備註擷取或推測商品、小吃或體驗。**

### 如何新增項目

1. 使用者在 Codex 對話上傳圖片或明確指定內容。
2. 圖片放入 public/items/，建議壓縮後的 WebP／JPEG。
3. 更新 items.json，使用唯一 id，指定類型、細分類、優先度與備註。
4. placeIds 第一個為主要地點，其餘為備案；引用 places.json 的 id。
5. 更新必要的行程 placeId／placeIds 關聯，讓目標出現在對應停留點。
6. 執行 npm test、npm run build，再提交並部署。

**後續資料主要由 Codex 對話協助更新 items.json / places.json / public/items/。**

### 如何新增地點與更新行程

地點可為店家、餐廳或景點，更新 places.json 後以 id 關聯行程和項目。地址不確定時標明待確認；地圖搜尋不代表位置、營業時間或庫存已驗證。

新版行程 .md 直接上傳 Codex 對話，更新 itinerary.json 與原始行程文件。網站沒有檔案上傳，也不讀取瀏覽器儲存的旧行程，各裝置使用 repo 部署版本。

## 完成狀態

購物項目顯示「已購買」、美食「已吃過」、體驗「已體驗」。同一項目的主要地點與備案共用完成狀態。

useCompletedItems() 提供 isCompleted(id)、toggleCompleted(id)、clearCompleted()，localStorage key 為 fukuoka-trip-completed-items；若沒有新版記錄，兼容讀取舊 fukuoka-trip-purchased-items。清除完成狀態會寫入新版空清單，不重新套用舊記錄。

記錄只保存在目前瀏覽器，可同步同來源分頁，不跨裝置同步。清除瀏覽器資料會移除記錄，私人瀏覽也可能遺失。存取受阻時顯示提醒，不修改 items.json。

## GitHub Pages deployment

1. 將變更 commit / push 到 main。
2. Repository → Settings → Pages → Build and deployment → Source 選 GitHub Actions。
3. 查看 Actions → Deploy GitHub Pages，push main 自動執行，也能 Run workflow。
4. 部署成功後使用 Pages 設定顯示的正式網址。

.github/workflows/deploy.yml 執行 npm ci、npm run build，以官方 configure-pages、upload-pages-artifact、deploy-pages Actions 部署 dist。權限包含 contents: read、pages: write、id-token: write。

Vite base 從 GITHUB_REPOSITORY 或 origin 推導 repository 名称；一般 repo 使用 /REPO_NAME/，username.github.io 使用 /。不要在圖片路徑硬寫 repository 名稱。

Google Maps 導航僅使用明確核對並設定的 navigationDestination，省略起點由手機使用目前位置。未核對或地址有疑義的地點只提供「地圖查找（請確認位置）」。未關聯地點的休息、返飯店、交通等行程不會自動產生地圖按鈕，也不以行程文字推測目的地。
