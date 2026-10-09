# Hướng dẫn Cấu hình Đăng nhập Mạng xã hội (Google & Facebook OAuth)

Tài liệu này hướng dẫn từng bước cấu hình ứng dụng trên **Google Cloud Console** và **Meta for Developers (Facebook)** để kích hoạt tính năng Đăng nhập bằng Google & Facebook cho khách hàng của X-ON Nail Shop.

---

## 1. Cấu hình Google OAuth (Google Login)

### Bước 1: Tạo dự án trên Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Đăng nhập tài khoản Google của bạn $\rightarrow$ Chọn **Select a project** $\rightarrow$ bấm **New Project**.
3. Đặt tên dự án (VD: `X-ON Nail Shop`) và bấm **Create**.

### Bước 2: Cấu hình Màn hình đồng ý (OAuth Consent Screen)
1. Vào menu bên trái: **APIs & Services** $\rightarrow$ **OAuth consent screen**.
2. Chọn **User Type**: **External** $\rightarrow$ bấm **Create**.
3. Điền thông tin cơ bản:
   - **App name**: `X-ON Press-On Nails`
   - **User support email**: Email của bạn.
   - **Developer contact information**: Email của bạn.
4. Bấm **Save and Continue** qua các bước Scopes (Mặc định chọn `openid`, `profile`, `email`).
5. Ở mục **Test users**: Thêm email Google cá nhân của bạn để test ở môi trường Localhost.

### Bước 3: Tạo OAuth Client ID & Client Secret
1. Vào menu: **APIs & Services** $\rightarrow$ **Credentials**.
2. Bấm **+ CREATE CREDENTIALS** $\rightarrow$ chọn **OAuth client ID**.
3. Chọn **Application type**: **Web application**.
4. Đặt tên Client: `X-ON Web Client`.
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-domain.vercel.app` (Domain chính thức trên Vercel của bạn)
6. **Authorized redirect URIs** *(Rất quan trọng, phải nhập chính xác)*:
   - Local: `http://localhost:3000/api/auth/oauth/google/callback`
   - Vercel Production: `https://your-domain.vercel.app/api/auth/oauth/google/callback`
7. Bấm **Create**. Một hộp thoại sẽ hiện lên chứa:
   - **Client ID** (VD: `123456789-xxx.apps.googleusercontent.com`)
   - **Client Secret** (VD: `GOCSPX-xxx...`)

---

## 2. Cấu hình Facebook OAuth (Facebook Login)

### Bước 1: Tạo App trên Meta for Developers
1. Truy cập [Meta for Developers](https://developers.facebook.com/).
2. Đăng nhập tài khoản Facebook $\rightarrow$ bấm **My Apps** $\rightarrow$ bấm **Create App**.
3. Chọn loại Use Case: **Authenticate and request data from users with Facebook Login** (Đăng nhập bằng Facebook) $\rightarrow$ bấm **Next**.
4. Đặt tên ứng dụng: `X-ON Press-On Nails` và điền App Contact Email.

### Bước 2: Cấu hình Facebook Login Settings
1. Ở giao diện Dashboard của App $\rightarrow$ tìm mục **Facebook Login** $\rightarrow$ chọn **Settings**.
2. Tại phần **Valid OAuth Redirect URIs** *(Phải điền chính xác)*:
   - Local: `http://localhost:3000/api/auth/oauth/facebook/callback`
   - Production: `https://your-domain.vercel.app/api/auth/oauth/facebook/callback`
3. Điền **Privacy Policy URL**: `https://your-domain.vercel.app/privacy-policy` (Link chính sách bảo mật trang web của bạn).
4. Bấm **Save Changes**.

### Bước 3: Lấy App ID & App Secret
1. Vào menu góc trái: **App settings** $\rightarrow$ **Basic**.
2. Sao chép 2 giá trị:
   - **App ID** (Tương ứng với `FACEBOOK_CLIENT_ID`)
   - **App Secret** (Bấm *Show* để xem, tương ứng với `FACEBOOK_CLIENT_SECRET`)

### Bước 4: Chuyển App sang chế độ Live (Công khai)
- Khi thử nghiệm ban đầu (Sandbox Mode): Chỉ có tài khoản Facebook của Admin App mới đăng nhập được.
- Để công khai cho mọi khách hàng: Chuyển công tắc từ **Development** sang **Live** ở thanh trên cùng của Meta Dashboard (Yêu cầu điền đầy đủ URL Chính sách quyền riêng tư).

---

## 3. Điền Biến môi trường (Environment Variables)

### Trên máy Local (`.env.local`):
Tạo hoặc mở file `.env.local` ở thư mục gốc của dự án và dán thông tin:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxx

# Facebook OAuth
FACEBOOK_CLIENT_ID=987654321xxxxx
FACEBOOK_CLIENT_SECRET=abcdef123456xxxxxx

# Website Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Trên Vercel Dashboard (Production):
1. Vào Vercel $\rightarrow$ Chọn project **x-on4** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.
2. Thêm 4 key: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.
3. Đổi `NEXT_PUBLIC_SITE_URL` thành domain Vercel của bạn (VD: `https://x-on-nail-shop.vercel.app`).
4. **Redeploy** lại dự án trên Vercel.
