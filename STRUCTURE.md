# CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

Dự án được xây dựng trên nền tảng **Next.js 16 (App Router)** kết hợp **React 19**, **TypeScript**, **Tailwind CSS v4**, **MongoDB (Mongoose)** và **Cloudinary**.

---

## 📂 Sơ đồ tổ chức thư mục tổng quan

```text
├── .env.local                  # Biến môi trường cục bộ (Database, Cloudinary, Port...)
├── .env.example                # File mẫu biến môi trường khi chia sẻ / triển khai
├── public/                     # Tài nguyên tĩnh công khai (served trực tiếp bởi Next.js)
│   ├── images/                 # Hình ảnh sản phẩm, banner, biểu tượng
│   ├── videos/                 # Video demo sản phẩm
│   └── seo/                    # Favicon, OpenGraph meta images, webmanifest
│
├── src/                        # Toàn bộ mã nguồn chính của ứng dụng
│   │
│   ├── app/                    # Next.js App Router (Routing, Pages & REST API)
│   │   ├── (Storefront Routes) # Các trang giao diện khách hàng
│   │   │   ├── page.tsx        # Trang chủ (Homepage)
│   │   │   ├── shop/           # Trang danh sách sản phẩm & bộ lọc
│   │   │   ├── product/[slug]/ # Trang chi tiết sản phẩm
│   │   │   ├── product-category/# Trang theo danh mục / loại sản phẩm
│   │   │   ├── cart/           # Trang giỏ hàng & thanh toán
│   │   │   ├── about/          # Trang giới thiệu / Câu chuyện thương hiệu
│   │   │   ├── contact-us/     # Trang liên hệ
│   │   │   ├── blog/           # Trang bài viết / tin tức & bài viết chi tiết
│   │   │   ├── sizing-chart/   # Hướng dẫn chọn size móng (Fit Guide)
│   │   │   ├── wholesale-signup/# Đăng ký khách mua sỉ (Wholesale)
│   │   │   ├── gallery-product/# Thư viện ảnh sản phẩm
│   │   │   └── bundle-and-save/# Chương trình khuyến mãi combo
│   │   │
│   │   ├── admin/              # Trang quản trị (Admin Panel)
│   │   │   ├── page.tsx        # Dashboard tổng quan & thống kê doanh thu/đơn hàng
│   │   │   ├── products/       # Quản lý sản phẩm (Thêm, Sửa, Xóa, Phân loại)
│   │   │   ├── categories/     # Quản lý danh mục & nhóm sản phẩm
│   │   │   ├── orders/         # Quản lý đơn hàng & trạng thái vận chuyển
│   │   │   ├── customers/      # Danh sách khách hàng & tài khoản sỉ
│   │   │   ├── blog/           # Quản lý bài viết blog & tin tức
│   │   │   ├── gallery/        # Quản lý hình ảnh thư viện
│   │   │   ├── wholesale/      # Quản lý yêu cầu mở đại lý sỉ
│   │   │   ├── reviews/        # Quản trị đánh giá khách hàng
│   │   │   ├── newsletter/     # Quản lý email đăng ký nhận tin
│   │   │   ├── settings/       # Cấu hình website (Logo, Hotline, Banner...)
│   │   │   └── layout.tsx      # Khung layout trang quản trị (Sidebar + Header)
│   │   │
│   │   ├── api/                # Backend API Endpoints (Serverless REST API)
│   │   │   ├── products/       # API lấy / thêm / sửa / xóa sản phẩm
│   │   │   ├── categories/     # API danh mục
│   │   │   ├── orders/         # API đặt hàng & tra cứu đơn hàng
│   │   │   ├── blog/           # API bài viết tin tức
│   │   │   ├── upload/         # API upload ảnh lên Cloudinary
│   │   │   ├── wholesale/      # API tiếp nhận thông tin sỉ
│   │   │   ├── contact/        # API form liên hệ
│   │   │   ├── newsletter/     # API đăng ký nhận bản tin
│   │   │   └── settings/       # API lấy & cập nhật cấu hình hệ thống
│   │   │
│   │   ├── globals.css         # CSS toàn cục & định nghĩa Design Tokens Tailwind v4
│   │   └── layout.tsx          # Root Layout (Fonts, CartProvider, ToastProvider)
│   │
│   ├── components/             # Các React UI Components tái sử dụng
│   │   ├── Header.tsx          # Header chính (Navigation, Search, Wishlist, Cart)
│   │   ├── Footer.tsx          # Footer website (Links, Newsletter, Socials)
│   │   ├── CartDrawer.tsx      # Drawer giỏ hàng trượt bên phải
│   │   ├── ProductCard.tsx     # Thẻ hiển thị sản phẩm (Ảnh, Giá, Nút thêm giỏ)
│   │   ├── StoreShell.tsx      # Bọc bố cục cho toàn bộ trang cửa hàng
│   │   ├── FormValidationEnforcer.tsx # Tiện ích kiểm tra dữ liệu form
│   │   ├── admin/              # Components dành riêng cho trang Admin
│   │   │   ├── AdminSidebar.tsx# Thanh điều hướng bên trái trang Admin
│   │   │   ├── AdminHeader.tsx # Thanh tiêu đề trang Admin & Breadcrumb
│   │   │   ├── AdminLayout.tsx # Layout container cho Admin
│   │   │   ├── ProductForm.tsx # Form tạo/chỉnh sửa sản phẩm
│   │   │   ├── BlogForm.tsx    # Trình soạn thảo bài viết Blog
│   │   │   └── ConfirmModal.tsx# Modal xác nhận xóa / thao tác nguy hiểm
│   │   ├── ui/                 # UI Primitives theo chuẩn shadcn
│   │   │   └── button.tsx      # Nút bấm cơ sở
│   │   └── index.ts            # Entrypoint export nhanh tất cả components
│   │
│   ├── context/                # Quản lý State toàn cục (React Context API)
│   │   ├── CartContext.tsx     # State giỏ hàng (Thêm, Xóa, Cập nhật SL, Lưu LocalStorage)
│   │   ├── AdminAuthContext.tsx# State phân quyền & thông tin Admin
│   │   ├── ToastContext.tsx    # Hệ thống hiển thị thông báo popup (Toast notifications)
│   │   └── index.ts            # Entrypoint export nhanh các Contexts
│   │
│   ├── lib/                    # Thư viện tiện ích, Database & Backend Logic
│   │   ├── db.ts               # Quản lý kết nối MongoDB qua Mongoose
│   │   ├── models/             # Mongoose Models (Schemas: Product, Order, Category, Blog...)
│   │   │   └── index.ts
│   │   ├── cloudinary.ts       # Module kết nối & upload file lên Cloudinary
│   │   ├── auth.ts             # Module phân quyền & JWT
│   │   ├── dataStore.ts        # Tầng Data Abstraction (kết nối DB + cache/in-memory)
│   │   ├── productMapper.ts    # Chuẩn hóa dữ liệu sản phẩm giữa DB và Giao diện
│   │   ├── blogParser.ts       # Xử lý định dạng bài viết blog
│   │   ├── utils.ts            # Hàm tiện ích cn() (clsx + tailwind-merge)
│   │   └── index.ts            # Entrypoint export lib
│   │
│   ├── types/                  # TypeScript Interface & Type Definitions
│   │   ├── admin.ts            # Types cho Admin, Sản phẩm, Đơn hàng, Khách hàng...
│   │   └── index.ts            # Entrypoint export types
│   │
│   └── data/                   # Dữ liệu khởi tạo (Seed data & static JSON)
│       ├── products.json       # Dữ liệu sản phẩm mẫu
│       ├── site-content.json   # Dữ liệu nội dung các trang tĩnh
│       ├── media-map.json      # Bản đồ ánh xạ hình ảnh & video
│       └── gallery-product.json# Dữ liệu album hình ảnh
```

---

## 🎯 Quy tắc tổ chức & Nhập xuất (Import Conventions)

1. **Path Alias `@/*`**:
   - Tất cả đường dẫn nội bộ đều dùng `@/` trỏ vào thư mục `src/`:
   ```ts
   import { Header, Footer, CartDrawer } from "@/components";
   import { useCart } from "@/context";
   import { ProductItem } from "@/types";
   import { uploadToCloudinary, connectToDatabase } from "@/lib";
   ```

2. **Tách biệt Frontend và Backend**:
   - **Frontend UI**: Nằm trong `src/app/(store)` và `src/components/`.
   - **Backend API**: Nằm trong `src/app/api/`.
   - **Database & Services**: Nằm trong `src/lib/` và `src/lib/models/`.

3. **Môi trường (Environment)**:
   - Các biến dùng phía trình duyệt luôn có tiền tố `NEXT_PUBLIC_`.
   - Các biến bảo mật (Cloudinary API Secret, MongoDB URI, JWT Secret) luôn giữ ở server-side.
