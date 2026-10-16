# Fukuoka Trip Companion

手機優先的繁體中文福岡旅行網站，旅程為 **2026/12/12～12/17**。主軸為每一站想買、想吃的清單；React、TypeScript、Vite、Tailwind CSS、React Router，使用 GitHub Actions 部署 GitHub Pages。純靜態，無後端、資料庫或登入。

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

- **行程**：Day 1～6 時間軸，「詳細資訊」保留原 Markdown 的巢狀清單、粗體、交通、備案、訂位與注意事項；外層只留時間、標題、清單入口與確認過的導航。每日上方可展開「當日提醒」，沒有全站「行前準備」區塊。旅程期間依日本日期預設當天；旅程外記住上次選擇，首次開啟顯示 Day 1。有目標的停留點以底色與購物／美食標籤標示；點擊「查看清單」進入該站清單；行程只顯示一個已確認目的地的 Google Maps 導航按鈕，店家摘要留在清單卡片。
- **清單**：依日期、站點、類型（購物／美食）與完成狀態篩選。相同項目在多個備案地點不重複計算。「超商」可獨立查看路過再買的項目，依 7-ELEVEN／Lawson 篩選，不綁日期、站點或導航。
- **地點詳情**：保留既有網址作次要入口，底部不再顯示地點頁籤。清單卡片直接顯示主要地點、時間、簡短地址與導航；備案與詳細資訊可展開查看，查證來源僅留在資料檔供維護，不顯示於介面。

HashRouter 避免 GitHub Pages 重新整理時出現 404。舊 /wishlist 與 /stores 入口仍能開啟對應頁面。

## 資料與 UI 分離

- `src/data/itinerary.json`：TripDay（id、day、date、title、stops），ItineraryStop（id、startTime、endTime、name、type、notes、選填 placeId／placeIds）。
- `src/data/places.json`：Place（id、name、type、area、address、notes、選填 mapUrl／shortAddress／hours／closedDays／sourceUrls）。type 為 shop／restaurant／attraction。
- `src/data/items.json`：TripItem（id、name、type、category、priority、image、notes、placeIds、選填 color／size／convenienceStore／sourceUrls）。type 為 shopping／food，priority 為 1～5。
- `src/types.ts`：共用 TypeScript 型別。
- `public/items/`：項目圖片，使用 `items/photo.webp` 相對路徑，不加 repo base path。
- `docs/itinerary-source.md`：使用者提供的行程參考文件，不是項目來源。

清單項目皆由使用者指定並確認後加入；目前包含由布院、太宰府與博多站周邊的甜點和伴手禮。**只依使用者在 Codex 對話提供的圖片或明確指定新增項目，不從行程 Markdown、地點名稱或備註擷取或推測商品、小吃或體驗。**

### 如何新增項目

1. 使用者在 Codex 對話上傳圖片或明確指定內容。
2. 圖片放入 public/items/，建議壓縮後的 WebP／JPEG。
3. 更新 items.json，使用唯一 id，指定類型、商品類別標籤、優先度與備註。
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

Google Maps 導航僅使用明確核對並設定的 navigationDestination，省略起點由手機使用目前位置。未核對或地址有疑義的地點不顯示地圖按鈕或佔位資訊。未關聯地點的休息、返飯店、交通等行程不會自動產生地圖按鈕，也不以行程文字推測目的地。

移動段的 Google Maps 按鈕由 itinerary.json 的 maps 欄位明確指定：label、destination、選填 origin、transit／walking。轉乘路線留在詳細資訊，移動段只以一個按鈕導向最終目的地；maps 的 confirmed 欄位明確控制是否允許導航。班次與船班仍依詳細交通資訊及官方時刻表。

超商項目設定 `convenienceStore` 為 `7-ELEVEN` 或 `Lawson`，`placeIds` 保持空陣列，不修改行程。`sourceUrls` 留存查證連結，圖片仍放在 `public/items/`；供應不明時於 notes 標示。

行程詳情使用 `ItineraryStop.detailMarkdown`，共通提醒使用 `TripDay.remindersMarkdown`。原始文件留在 `docs/itinerary-source.md`；匯入時以後續確認的時間、飯店、站點安排為準，訂位提醒放回對應站點，原文不是重新查證的即時資訊。Markdown 只作文字呈現，不執行 HTML、不載入嵌入圖片、不從中建立清單商品。

### 乳清比價與入手標準

清單上方的「乳清」按鈕位於「超商」旁；點選即顯示三個候選圖片、入手門檻、口味、營養參考與台灣 ON 基準，不用展開，不提供現場價格紀錄、匯率或換算功能。

乳清在 items.json 只放一項，以 `comparisonId` 對應 `src/data/comparisons.json`。尚未確認福岡分店供應，因此不綁行程。價格、營養數字來自使用者文件，並非即時售價或各口味共通規格。可用一般已購買勾選完成整組；沿用原有完成紀錄，不新增比價儲存。

「藥妝」快速篩選位於「乳清」旁；項目以 `shoppingGroup: "drugstore"` 明確加入此群組。清單不提供細分類篩選，商品卡保留類別標籤。沒有商品時顯示空清單，不從行程或品名推測新增。

藥妝商品以 `purchaseOptions` 保存已核對的藥妝通路名稱、說明及來源連結，卡片以預設收合的「購買通路」顯示店家說明，產品介紹保持約 1～2 行，來源網址只留資料中維護。確認通路販售即可，不需查各分店即時庫存；未確認分店地址不建立導航。

### 視覺主題

「蛋黃哥的福岡慢慢遊手帳」使用奶油白、蛋黃橘與焦糖棕，搭配福岡地標、名產及每日主題插圖。主題文字與圖片路徑集中在 `src/data/theme.json`，圖片位於 `public/theme/`；行程與清單資料維持原有結構。插圖為個人旅遊網站的自製 AI 主題插圖，非官方聯名。手繪導覽圖示為本地 SVG，沒有外部字體或動畫依賴。

### 代購與現場記錄

底部「代購」頁籤依代購對象分組，列出商品、數量與可展開的購買通路；可依人員查看已買項目與已記錄日圓總額。尚未填寫的金額不會當成零元，照片與金額都儲存後才標示已購買。金額是該項所有件數的實付總額。

代購需求由 Codex 維護 `src/data/proxyOrders.json`：`people` 定義對象的 `id/name`，`products` 放代購專用商品資料，`orders` 以 `id/personId/itemId/quantity/notes` 串接對象與商品。同一商品可由不同訂單分別代購；`itemId` 也可直接參照 `items.json` 的既有商品，避免重複資料。新增代購品項仍需確認購買通路，不要求分店即時庫存。初始需求留空，不放示範訂單。

每個項目可拍照或從相簿選一張照片，照片會壓縮至 1MB 以內。按「儲存購買結果」後，照片、金額及對應需求保存在此網站的 IndexedDB（`fukuoka-trip-proxy`），與自己的清單完成狀態分開。這是瀏覽器本機儲存，沒有後端資料庫。正常關閉分頁、瀏覽器或手機重新開啟後仍可繼續記錄；請使用同一瀏覽器的一般模式與同一網站網址。未按儲存的修改不會保留。

代購頁不顯示備份匯入／匯出、要求保留本機資料或相關說明區塊。紀錄仍使用上述本機儲存方式；無痕模式、清除網站資料或瀏覽器回收儲存空間可能造成遺失，不會自動同步到其他手機或 GitHub。
