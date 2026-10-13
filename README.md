# Fukuoka Trip Companion

手機優先、繁體中文的福岡旅遊購物網站，旅程為 **2026/12/12～12/17**。首頁為行程，底部導覽提供行程、購物、店家三個頁籤。提供每日時間軸、店家與商品清單、主要與備案購買點、已購買標記，以及新版行程 Markdown 匯入。純靜態 React + TypeScript + Vite + Tailwind CSS；無後端、資料庫或登入，使用 GitHub Pages 免費部署。

## Local development

需要 Node.js 22.12+（建議 Node 22 LTS）與 npm。使用既有 checkout，不需要另建 worktree。

```bash
npm install
npm run dev
```

正式建置與檢查：

```bash
npm ci
npm test
npm run build
npm run preview
```

## 頁面

- **行程**：Day 1～6 切換，購物停留點以綠色標示，點擊連到購物頁並自動篩選該站商品、新版 `.md` 匯入與原始行程恢復。
- **購物**：旅行日期／購物站點、全部／未購買／已購買、分類篩選、商品資訊與勾選購買。
- **店家**：區域列表與店家商品詳情。

HashRouter 使用 `/#/itinerary` 等網址，GitHub Pages 直接重新整理也能正常開啟。

## 資料檔案與模型

- `src/data/itinerary.json`：`TripDay`（id、day、date、title、stops）。每個 `ItineraryStop` 有 id、startTime、endTime、name、type、notes 與選填 storeId／storeIds（同一停留點可連結多間店）。
- `src/data/stores.json`：`Store`（id、name、area、address、notes、選填 mapUrl）。
- `src/data/wishlist.json`：`WishlistItem`（id、name、category、priority、image、notes、storeIds、選填 color／size）。優先度 1～5；storeIds 第一個為主要店家，其餘依序為備案。
- `src/types.ts`：共用 TypeScript 型別。
- `public/products/`：商品圖片；目前使用明確標示的示意佔位圖，尚未放入商品實拍圖。
- `docs/itinerary-source.md`：你提供的原始行程，作為後續編輯與匯入測試參考。Day 1～4、6 初版保留主要站點，詳細提醒請參考原檔。

店家部分門牌尚待確認，已明確標示；Google Maps 按鈕為店名搜尋，不代表營業、位置或庫存已驗證。

### 新增商品

1. 把圖片放到 `public/products/`，建議 WebP/JPEG 並縮小檔案，使用清楚且唯一的檔名。
2. 在 wishlist.json 加入唯一 id 的商品，image 寫成 `products/your-photo.webp`，**不包含 repository base path**。
3. storeIds 使用 stores.json 已存在的 id，主要店家排第一。新增商品不需要修改 React component。
4. 執行 `npm test` 與 `npm run build` 後提交到 main。

### 新增店家

在 stores.json 新增唯一 id、name、area、address、notes 與選填 mapUrl；再於商品 storeIds 或行程 stop.storeId 引用 id。常用區域為博多、天神、大名、太宰府、由布院。

**後續商品資料主要由 Codex 對話協助更新 wishlist.json / stores.json / public/products。**

### 更新行程 Markdown

也可以在 Codex 對話上傳新版行程 `.md`，請 Codex 更新 itinerary.json 與原始行程，再經 GitHub Actions 部署到所有裝置。

旅途中可在「行程 → 更新行程」上傳檔案，預覽日期與站數後確認套用。只更新此瀏覽器的 localStorage，不會修改 repo 或發布網站；未包含的日期保留原內容。支援本次上傳的原檔格式，也支援：

```md
## 12/16 Day 5：天神購物日
- 09:30 - 11:30｜博多站購物
  GU、UNIQLO、Nintendo FUKUOKA、伴手禮。
- 14:45 - 15:25｜HOKA 福岡天神店
  看到淺色合適尺寸就買。
```

標題需包含 12/12～12/17 的日期、對應 Day 1～6 與冒號。時間使用 24 小時格式，以 `｜` 或 `|` 隔開時間與地點。每一天時間需按順序、不重疊。店家名稱包含 stores.json 的完整 name 時，自動連結商品；Markdown 內容以純文字顯示，不執行 HTML 或指令。

## 購買狀態

`usePurchasedItems()` 提供 isPurchased(id)、togglePurchased(id)、clearPurchased()；key 為 `fukuoka-trip-purchased-items`。不會修改 wishlist.json。同來源多分頁可同步，裝置間不會同步。清除瀏覽器資料會移除記錄，私人瀏覽結束也可能遺失；存取被阻擋時會顯示提醒。

## GitHub Pages deployment

1. 檢查變更後，由你自行 commit / push 到 **main**。
2. 在 GitHub repository **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
3. 查看 **Actions → Deploy GitHub Pages**；可手動執行 workflow_dispatch，或 push main 自動觸發。
4. 等 build / deploy 成功，開啟 Settings → Pages 顯示的正式網址。

`.github/workflows/deploy.yml` 使用 npm ci、npm run build 與官方 configure-pages / upload-pages-artifact / deploy-pages Actions，部署 dist；權限為 contents: read、pages: write、id-token: write。

Vite base 從 Actions 的 GITHUB_REPOSITORY 或本機 origin remote 推導 repository 名稱；一般 repo 使用 `/REPO_NAME/`，username.github.io 使用 `/`。不要手動把商品圖片路徑加上 repository 名稱。

程式碼已提交至 main；部署結果請查看 GitHub Actions。GitHub Pages 與 Actions 需由 repository 設定允許。localStorage 不包含登入資訊或遠端資料。
