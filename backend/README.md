# RosiHome Backend - Deployment & CD Guide

Hướng dẫn vận hành backend RosiHome trên Render.

## 1. Thông tin triển khai

| Hạng mục | Cấu hình |
| --- | --- |
| Service | Render Web Service |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Auto-deploy | `After CI check pass` |
| Service notifications | `All notifications` |
| Production URL | <https://rosi-home.onrender.com> |
| Health check | <https://rosi-home.onrender.com/health> |

Backend dùng Node.js/Express/TypeScript, PostgreSQL qua Drizzle ORM và các dịch vụ Supabase, EmailJS, Expo Push.

## 2. Quy trình CD trên Render

### Tạo và cấu hình service

1. Vào Render, tạo project hoặc Web Service mới.
2. Kết nối Web Service với repository GitHub của RosiHome.
3. Chọn branch `main`.
4. Nhập:

   ```text
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. Chọn **Auto-Deploy: After CI check pass**.
6. Trong **Service Notifications**, chọn **All notifications**.
7. Mở tab **Environment**, chọn **Import from .env**, rồi dán các biến môi trường production.
8. Lưu cấu hình và thực hiện deploy.

Root Directory là `backend` nên Render chạy lệnh trong thư mục `backend`, nơi có `package.json`.

### Deployment script tham chiếu

Render là PaaS nên không bắt buộc có file `.sh` riêng. Các lệnh dưới đây chính là kịch bản triển khai được khai báo trên dashboard:

```bash
cd backend
npm install
npm run build
npm start
```

Trong Render, không cần ghi `cd backend` vì đã cấu hình **Root Directory: `backend`**. `npm run build` biên dịch TypeScript thành `dist`, còn `npm start` chạy `node dist/server.js`.

## 3. Kịch bản cấu hình cơ sở dữ liệu

Backend dùng PostgreSQL. Khai báo connection string production trong Render:

```text
DATABASE_URL=<PostgreSQL production connection string>
```

Migration được quản lý bằng Drizzle và lưu tại `src/db/migrations`. Khi tạo database mới hoặc có migration mới:

```bash
cd backend
npm install
npm run db:migrate
```

Lệnh này đọc `DATABASE_URL` và áp dụng các migration chưa chạy. Build command hiện tại không tự chạy migration, vì vậy phải xác nhận database đã migrate trước khi kiểm tra API. Không dùng `TEST_DATABASE_URL`, `npm run db:push` hoặc `npm run db:seed` cho production nếu chưa có phê duyệt riêng.

Các biến ứng dụng chính:

| Biến | Mục đích |
| --- | --- |
| `DATABASE_URL` | Kết nối PostgreSQL production |
| `JWT_SECRET` | Secret ký JWT |
| `NODE_ENV` | Đặt `production` |
| `APP_PUBLIC_URL` | URL public của hệ thống |
| `JWT_EXPIRY_SECONDS` | Thời hạn access token, mặc định `900` |
| `JWT_REFRESH_EXPIRY_SECONDS` | Thời hạn refresh token, mặc định `604800` |

Không commit `.env` thật vào Git. Khi in/chụp màn hình, chỉ hiển thị tên biến và che giá trị secret.

## 4. Cấu hình dịch vụ bên thứ ba

### Supabase Storage

Khai báo:

```text
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<server-side service role key>
```

Backend sử dụng các bucket private `maintenance-photos` và `payment-proofs`.

### EmailJS - email thông báo

Thực hiện theo các bước sau:

1. Vào website [EmailJS](https://www.emailjs.com/) và đăng nhập.
2. Tạo hoặc kết nối email service.
3. Tạo một email template.
4. Trong template, đặt các trường động:

   ```text
   To:      {{to}}
   Subject: {{subject}}
   From:    {{from}}
   Body:    {{body}}
   ```

   Như vậy To, Subject và From không bị hard-code trong template. Với code hiện tại, backend mới truyền `to`, `subject`, `body`; trường From nên dùng địa chỉ gửi đã xác thực trong EmailJS service. Nếu muốn dùng `{{from}}`, cần bổ sung biến `from` vào payload của backend.

5. Lưu template, sau đó lấy các thông tin:

   ```text
   email_service_id  -> EMAILJS_SERVICE_ID
   email_template_id -> EMAILJS_TEMPLATE_ID
   email_public_key  -> EMAILJS_PUBLIC_KEY
   private key       -> EMAILJS_PRIVATE_KEY
   ```

6. Nhập bốn biến trên vào Render Environment.
7. Gửi một email thử để kiểm tra To, Subject, From và Body.

Code hiện tại gọi EmailJS REST API và truyền `to`, `subject`, `body`. `EMAILJS_PRIVATE_KEY` là secret, không commit vào repository và không in giá trị thật.

### Expo Push

`EXPO_ACCESS_TOKEN` là tùy chọn, chỉ cần khi Expo project bật Enhanced Security for Push Notifications:

```text
EXPO_ACCESS_TOKEN=<optional Expo access token>
```

## 5. CI/CD và kiểm tra sau deploy

Luồng triển khai:

```text
Push/merge main
    -> GitHub Actions CI pass
    -> Render npm install && npm run build
    -> Render npm start
    -> Kiểm tra health, API, logs và email notification
```

Kiểm tra service:

```bash
curl -i https://rosi-home.onrender.com/health
```

Kết quả mong đợi là HTTP `200`:

```json
{
  "status": "ok",
  "service": "rosihome-backend"
}
```

`/health` hiện chỉ xác nhận process Express đang chạy, chưa kiểm tra database hoặc dịch vụ bên thứ ba. Vì vậy cần kiểm tra thêm:

- Render Runtime Logs không có lỗi build, thiếu biến môi trường hoặc lỗi kết nối PostgreSQL.
- Database đã chạy migration.
- Swagger tại <https://rosi-home.onrender.com/api/v1/api-docs> mở được.
- EmailJS gửi được email thử.
- Supabase upload/đọc file hoạt động nếu tính năng này được sử dụng.

Khi deploy lỗi, xem **Deploys/Logs** và redeploy commit ổn định trước đó. Rollback code không tự rollback migration database.

## 6. Minh chứng cần in khi vấn đáp

1. Phần **Deployment script tham chiếu** và **Kịch bản cấu hình cơ sở dữ liệu** trong tài liệu này.
2. Render Settings: repository, branch, Root Directory, Build Command và Start Command.
3. Render Environment: tên biến hiển thị, giá trị secret đã che.
4. Render Deploys/Logs: kết quả build và deploy thành công.
5. Render Service Notifications: chọn `All notifications`.
6. GitHub Actions CI pass và email nhận thông báo deploy tự động.
7. Trình duyệt/Postman gọi `/health` thành công.
8. Giao diện hoặc Swagger/API chứng minh backend hoạt động.

## 7. Câu trả lời ngắn khi vấn đáp

Render không yêu cầu file deployment script riêng vì đây là PaaS. Deployment script của nhóm được thể hiện bằng Build Command `npm install && npm run build`, Start Command `npm start` và cấu hình Render tương ứng.

Kịch bản cấu hình cơ sở dữ liệu gồm khai báo `DATABASE_URL`, chạy `npm run db:migrate` bằng connection string production và kiểm tra schema trước khi vận hành API.
