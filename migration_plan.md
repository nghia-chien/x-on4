# KẾ HOẠCH: Chuẩn hóa Enum + Quyết định JSON + Migration Dry-run
> Trạng thái: **PLAN ONLY — chưa thực thi bất kỳ bước nào**

---

## PHẦN A — Step 2: Chuẩn hóa Enum & Taxonomy

### A.1 Bảng thay đổi Enum

| Entity / Field | Giá trị hiện tại | Giá trị sau chuẩn hóa | File ảnh hưởng |
| :--- | :--- | :--- | :--- |
| `NailShape` (type mới) | `string[]` | `"Almond" \| "Coffin" \| "Oval" \| "Round" \| "Square" \| "Stiletto"` | `types/admin.ts`, `models/index.ts`, seeds, UI filter |
| `Product.shapes` | `["Almond","Coffin","Square"]` | `NailShape[]` (6 giá trị theo spec) | `dataStore.ts`, `ProductForm.tsx`, shop filter |
| `Product.productType` default | `"Handmade X-ON Nails"` | `"Handmade Press-On Nails"` | `models/index.ts`, seeds |
| `ContactMessage.status` | `"New" \| "Replied" \| "Resolved"` | `"new" \| "read" \| "replied" \| "archived"` | `types/admin.ts`, `models/index.ts`, `contact/route.ts`, admin UI |
| `WholesaleRequest.status` | `"New" \| "Contacted" \| "Approved" \| "Rejected" \| "Converted"` | `"new" \| "contacted" \| "approved" \| "rejected" \| "converted"` | `types/admin.ts`, `models/index.ts`, admin UI |
| `BlogPost.status` | `"Draft" \| "Published" \| "Archived"` | `"draft" \| "published" \| "archived"` | `types/admin.ts`, `models/index.ts`, admin blog UI |
| `Newsletter.status` | `"Subscribed" \| "Unsubscribed"` | `"subscribed" \| "unsubscribed"` | `types/admin.ts`, `models/index.ts` |
| `ComingSoon.status` | `"Coming Soon" \| "Published" \| "Released" \| "Hidden"` | `"coming_soon" \| "published" \| "released" \| "hidden"` | `types/admin.ts`, `models/index.ts`, admin UI |

> [!IMPORTANT]
> Mỗi giá trị enum chỉ được định nghĩa **một lần duy nhất** trong `types/admin.ts`, sau đó Mongoose schema và UI đều import/tham chiếu từ đó.

### A.2 Taxonomy — Phân loại qua Category Model

- `Product.category` và `Product.productType` là `String` **tự do** trong Mongoose — **không dùng `enum` constraint** trong schema.
- Hạn chế giá trị do app logic và Category model đảm bảo.
- Giá trị chuẩn cho demo: `"Handmade Press-On Nails"`, `"Nail Essentials"`.
- **Best Sellers:** Lọc qua `bestSeller: true` boolean flag — **không** dùng category string.

---

## PHẦN B — Quyết định 4 file JSON trong `src/data/`

| File | Nội dung | Quyết định | Hành động cụ thể |
| :--- | :--- | :---: | :--- |
| `products.json` | 11 sản phẩm stub (id, title, price, image, category, url) — hiện tại là `[]` | **Xóa** | Giữ qua dry-run để làm nguồn tham chiếu; xóa sau khi MongoDB confirmed |
| `gallery-product.json` | Danh sách item gallery (image, title, category, tags) | **Xóa sau migration** | Dùng làm nguồn dữ liệu migration; xóa sau khi xác nhận MongoDB OK |
| `site-content.json` | Cấu hình nội dung trang (Home, About, Banner sections...) | **Giữ** | Static fallback — `PageContent` chưa có MongoDB model. Không xóa ở phase này |
| `media-map.json` | Map video ID → URL (1554 dòng) | **Đã xóa** ✅ | Đã `git rm` ở commit `a51ab78`. Không còn action nào. |

> [!NOTE]
> `products.json` và `gallery-product.json` hiện có trong working tree (modified/empty `[]`). Cần commit hoặc restore chúng **trước** khi chạy migration để tránh nhầm lẫn về trạng thái.

---

## PHẦN C — Script Migration Dry-run

### C.1 File duy nhất cần tạo

```
scripts/migrate.ts
```

Chạy bằng: `npx tsx scripts/migrate.ts --dry-run`

### C.2 Cấu trúc logic script

```
migrate.ts
├── 1. Safety check
│   ├── Kiểm tra ALLOW_DEMO_ACCOUNTS phải là false/unset
│   ├── Kiểm tra ADMIN_EMAIL/ADMIN_PASSWORD hợp lệ (đã cấu hình)
│   └── Không print bất kỳ giá trị secret nào
│
├── 2. Đọc toàn bộ DataStore (server-side, không gọi HTTP)
│   ├── getAdmins()       → LỌC BỎ email @xonails.com và id "admin-1/2/3"
│   ├── getProducts()     → Tất cả sản phẩm
│   ├── getCategories()   → Danh mục
│   ├── getGallery()      → Gallery items (từ dataStore + gallery-product.json)
│   ├── getBlogPosts()    → Blog posts
│   ├── getOrders()       → Orders
│   ├── getCustomers()    → Customers
│   ├── getWholesale()    → Wholesale requests
│   ├── getNewsletter()   → Newsletter subscribers
│   └── getSettings()    → Site settings
│
├── 3. Validate format MongoDB
│   ├── Dùng new Model(data) để validate từng document
│   ├── Không gọi .save() hay .insertMany()
│   └── Ghi nhận lỗi validation theo entity ID → in warnings
│
├── 4. Inventory ảnh/video cho Cloudinary
│   ├── Collect tất cả path bắt đầu bằng /images/ hoặc /videos/
│   ├── Loại bỏ trùng lặp
│   └── Phân loại: product_images, category_images, blog_images, gallery_images, videos
│
└── 5. In báo cáo và EXIT
    ├── DRY-RUN: in report, EXIT 0
    └── Không có --apply flag → không ghi dữ liệu
```

### C.3 Quy tắc bất di bất dịch

| # | Quy tắc |
| :--- | :--- |
| 1 | Demo accounts (`@xonails.com`) bị **loại hoàn toàn** khỏi output migration |
| 2 | Script không chứa `save()`, `insertMany()`, `create()`, `updateOne()` trong dry-run path |
| 3 | Không in `MONGODB_URI`, `CLOUDINARY_API_SECRET`, `ADMIN_PASSWORD` hay bất kỳ giá trị secret nào |
| 4 | Mỗi document validate qua `new Model(data)` trước khi in |
| 5 | Lỗi validation → in cảnh báo kèm entity ID, script tiếp tục (không crash) |
| 6 | Script chỉ có 1 file duy nhất (`scripts/migrate.ts`), không tạo thêm file nào |

### C.4 Format output dự kiến

```
=== X-ON Migration Dry-run ===
[OK] ALLOW_DEMO_ACCOUNTS=false — demo accounts excluded
[OK] MongoDB URI configured (masked)

📦 DOCUMENTS TO MIGRATE:
  Admin Users:      1  (env-bootstrapped only, demo excluded)
  Products:         0
  Categories:       5
  Gallery Items:   12
  Blog Posts:       3
  Orders:           0
  Customers:        0
  Wholesale:        0
  Newsletter:       0
  Settings:         1

🖼️  ASSETS TO UPLOAD (Cloudinary):
  Category images:  5  (/images/IMG_7098.webp, ...)
  Blog thumbnails:  3
  Gallery images:  12
  Videos:           3  (public/videos/1K34PRO84_DMCL0D.mp4, ...)
  Product images:   0

⚠️  WARNINGS:
  - 0 products: missing thumbnail
  - All image paths are local (/images/...) — upload before MongoDB migration

✅ Dry-run complete. No data written.
   Run with --apply to execute (requires your explicit approval first).
```

---

## PHẦN D — Thứ tự thực hiện & Commit sequence

```
[Commit A] feat(auth): bootstrap admin account + gate demo behind ALLOW_DEMO_ACCOUNTS
           → dataStore.ts, .env.example, render.yaml
           (đã viết code nhưng CHƯA COMMIT — cần commit trước các bước còn lại)

[Commit B] feat(catalog): normalize enums, nail shapes, and status values (step 2)
           → types/admin.ts, models/index.ts, dataStore.ts seeds, admin UI

[Commit C] feat(migration): add migration dry-run script
           → scripts/migrate.ts (dry-run only)
           → Chạy npx tsx scripts/migrate.ts --dry-run → in report → chờ duyệt
```

> [!WARNING]
> Chỉ sau khi bạn xem báo cáo dry-run và **phê duyệt rõ ràng**, mới thêm `--apply` flag để ghi dữ liệu thực. Bước đó **nằm ngoài phạm vi kế hoạch này**.
