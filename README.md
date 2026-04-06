# Website Bệnh viện Đa khoa + E-Health Booking

Dự án full-stack theo yêu cầu:

- Backend: Node.js + Express.js + TypeScript
- Database: PostgreSQL (thiết kế chuẩn hóa)
- Auth: JWT + Refresh Token (cookie HTTP-only) + RBAC
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Ngôn ngữ giao diện: Tiếng Việt

## 1) Cấu trúc thư mục

```text
backend/
  src/
    config/
    db/
      migrations/
      seeds/
    middlewares/
    modules/
      auth/
      bookings/
      cms/
      contact/
      departments/
      doctors/
      lab-results/
      news/
      services/
    routes/
frontend/
  src/
    components/
    lib/
    pages/
```

## 2) Khởi chạy PostgreSQL

Cách nhanh bằng Docker:

```bash
docker compose up -d
```

## 3) Backend

### Cài package

```bash
cd backend
npm install
```

### Cấu hình môi trường

```bash
cp .env.example .env
```

### Tạo schema + seed dữ liệu mẫu

```bash
npm run db:init
```

### Chạy server API

```bash
npm run dev
```

API base URL mặc định: `http://localhost:8080/api/v1`

## 4) Frontend

### Cài package

```bash
cd frontend
npm install
```

### Cấu hình môi trường

```bash
cp .env.example .env
```

### Chạy web

```bash
npm run dev
```

Frontend mặc định: `http://localhost:5173`

## 5) Tài khoản mẫu seed

- Admin: `admin@benhvien.vn` / `Admin@123`
- Bệnh nhân: `patient@benhvien.vn` / `Patient@123`

Lưu ý: nếu bạn thay hash mật khẩu trong file seed, cần cập nhật lại thông tin đăng nhập tương ứng.

## 6) Sitemap giao diện

- Trang chủ (`/`)
- Giới thiệu (`/gioi-thieu`)
- Chuyên khoa (`/chuyen-khoa`)
- Dịch vụ (`/dich-vu`)
- Hướng dẫn người bệnh (`/huong-dan-nguoi-benh`)
- Đăng ký bệnh nhân (`/dang-ky`)
- Đăng nhập bệnh nhân (`/dang-nhap`)
- Đặt lịch khám trực tuyến (`/dat-lich-kham`) - yêu cầu đăng nhập
- Tra cứu cận lâm sàng (`/tra-cuu-can-lam-sang`)
- Tin tức (`/tin-tuc`)
- Liên hệ (`/lien-he`)
- CMS Admin (`/admin/login`, `/admin`)

## 7) API nổi bật

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- Booking: `/bookings`, `/bookings/me`
- Lab lookup: `/lab-results/lookup`
- RSS news feed: `/rss-news?limit=8&source=vnexpress|tuoitre|thanhnien|dantri|suckhoedoisong`
  - Nguồn mặc định: `vnexpress` (mục Sức khỏe)
  - Cấu trúc item: `title`, `link`, `description`, `pubDate`
  - Trang chủ hiện đang gọi đồng thời cả 5 nguồn và hiển thị chung.
- CMS admin: `/admin/*` (departments, doctors, services, news, bookings, lab-results, contact, cms)

Tất cả API đều dùng response format thống nhất:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": null
}
```

Đã kiểm tra chạy thực tế

backend: npm run db:init, npm run typecheck, npm run test, npm run build đều pass.
frontend: npm run lint, npm run typecheck, npm run build đều pass.
Dữ liệu hiện tại sau seed: patients=74, doctors=10, appointments=493, prescriptions=245, payments=409, notification_jobs=120.