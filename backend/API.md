# RoSiHome Backend API

Tài liệu này mô tả REST API hiện được khai báo trong backend RoSiHome.
Nguồn chuẩn của tài liệu là `src/app.ts` cùng các file
`src/modules/*/router.ts`, `schema.ts`, `controller.ts` và `service.ts`.

## 1. Tổng quan

- Base URL local mặc định: `http://localhost:3000`
- API prefix: `/api/v1`
- Kiểu API: REST/JSON
- Xác thực: JWT Bearer token
- Vai trò: `Landlord`, `Tenant`
- ID tài nguyên: UUID
- Ngày: `YYYY-MM-DD`
- Kỳ hóa đơn: `YYYY-MM`
- Tiền VND: số nguyên, không dùng số thực

Backend hiện khai báo:

- 1 health endpoint.
- 51 endpoint dưới `/api/v1`.

Ngoại lệ về content type:

- Tạo yêu cầu bảo trì có ảnh sử dụng `multipart/form-data`.
- Tải hóa đơn PDF trả về `application/pdf`.

## 2. Xác thực và phân quyền

Các endpoint được bảo vệ yêu cầu header:

```http
Authorization: Bearer <accessToken>
```

JWT chứa các thông tin chính:

```json
{
  "sub": "user-uuid",
  "role": "Landlord",
  "mustChangePassword": false
}
```

Luồng kiểm tra quyền:

```text
Bearer token
    ↓
requireAuth
    ↓
requireRole nếu endpoint giới hạn vai trò
    ↓
Service kiểm tra ownership của tài nguyên
```

Nếu `mustChangePassword` là `true`, người dùng chỉ được gọi API đổi mật khẩu.
Những endpoint bảo vệ khác trả về `403 FORBIDDEN`.

## 3. Response format

### 3.1. Thành công

Response thông thường:

```json
{
  "data": {}
}
```

Response danh sách:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Giới hạn phân trang:

- `page`: mặc định `1`.
- `pageSize`: mặc định `20`.
- `pageSize` tối đa `100`.

### 3.2. Lỗi

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": [
      {
        "field": "email",
        "message": "Invalid email."
      }
    ]
  }
}
```

| HTTP status | Error code | Ý nghĩa |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request không đúng schema |
| `401` | `UNAUTHENTICATED` | Thiếu token hoặc token không hợp lệ |
| `403` | `FORBIDDEN` | Không đúng vai trò hoặc chưa đủ quyền |
| `404` | `NOT_FOUND` | Không tìm thấy hoặc không sở hữu tài nguyên |
| `409` | `CONFLICT` | Dữ liệu trùng hoặc xung đột trạng thái |
| `422` | `UNPROCESSABLE` | Request đúng schema nhưng vi phạm nghiệp vụ |
| `500` | `INTERNAL_ERROR` | Lỗi backend ngoài dự kiến |

## 4. Danh sách endpoint

Quy ước quyền:

- **Public**: không cần access token.
- **Authenticated**: Landlord và Tenant đều có thể gọi.
- **Scoped**: service chỉ trả tài nguyên người dùng được phép xem.
- **Landlord**: chỉ tài khoản Landlord.
- **Tenant**: chỉ tài khoản Tenant.

### 4.1. System

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/health` | Public | Kiểm tra backend đang hoạt động |

Response:

```json
{
  "status": "ok",
  "service": "rosihome-backend"
}
```

### 4.2. Authentication

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản Landlord |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập |
| `POST` | `/api/v1/auth/refresh` | Public với refresh token | Làm mới token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Đăng xuất và thu hồi refresh token |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Đổi mật khẩu |
| `POST` | `/api/v1/auth/forgot-password` | Public | Yêu cầu khôi phục mật khẩu |

#### Đăng ký

```http
POST /api/v1/auth/register
Content-Type: application/json
```

```json
{
  "fullName": "Nguyễn Minh An",
  "email": "landlord@example.com",
  "password": "password123",
  "passwordConfirmation": "password123"
}
```

Mật khẩu phải:

- Có ít nhất 8 ký tự.
- Có ít nhất một chữ cái.
- Có ít nhất một chữ số.

Thành công trả `201 Created`.

#### Đăng nhập

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "username": "landlord@example.com",
  "password": "password123"
}
```

Response chứa:

```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<refresh-token>",
    "user": {
      "id": "user-uuid",
      "role": "Landlord",
      "mustChangePassword": false
    }
  }
}
```

#### Làm mới token

```json
{
  "refreshToken": "<refresh-token>"
}
```

#### Đăng xuất

```json
{
  "refreshToken": "<refresh-token>"
}
```

`refreshToken` trong request đăng xuất là tùy chọn.

#### Đổi mật khẩu

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "newPasswordConfirmation": "newPassword456"
}
```

#### Quên mật khẩu

```json
{
  "email": "user@example.com"
}
```

Backend trả kết quả thành công chung và không trả mật khẩu tạm trong response.

### 4.3. Profile

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/v1/profile` | Authenticated | Lấy hồ sơ của tài khoản hiện tại |
| `PATCH` | `/api/v1/profile` | Authenticated | Cập nhật hồ sơ |

Body cập nhật:

```json
{
  "fullName": "Nguyễn Minh An",
  "phone": "0901234567"
}
```

Cả hai trường đều tùy chọn. Email không được cập nhật qua endpoint này.

### 4.4. Properties

Tất cả endpoint trong nhóm này chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/properties` | Tạo bất động sản |
| `GET` | `/api/v1/properties` | Danh sách bất động sản |
| `GET` | `/api/v1/properties/:id` | Chi tiết bất động sản |
| `PATCH` | `/api/v1/properties/:id` | Cập nhật bất động sản |
| `GET` | `/api/v1/properties/:propertyId/lease-reminder-config` | Lấy cấu hình nhắc hết hạn hợp đồng |
| `PATCH` | `/api/v1/properties/:propertyId/lease-reminder-config` | Cập nhật cấu hình nhắc hết hạn |

Tạo bất động sản:

```json
{
  "name": "Nhà trọ Bình An",
  "address": "18 Nguyễn Văn Cừ, Quận 5",
  "locality": "TP.HCM"
}
```

`locality` là tùy chọn.

Danh sách hỗ trợ:

```text
GET /api/v1/properties?page=1&pageSize=20
```

Cấu hình nhắc hết hạn:

```json
{
  "remindAt30Days": true,
  "remindAt15Days": true,
  "remindAt7Days": true
}
```

Khi cập nhật, phải cung cấp ít nhất một trường.

### 4.5. Tenants

Tất cả endpoint trong nhóm này chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/v1/tenants` | Danh sách người thuê |
| `GET` | `/api/v1/tenants/:id` | Chi tiết người thuê |
| `PATCH` | `/api/v1/tenants/:id` | Cập nhật người thuê |
| `DELETE` | `/api/v1/tenants/:id` | Lưu trữ người thuê |

Danh sách hỗ trợ `page` và `pageSize`.

Body cập nhật:

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "tenant@example.com",
  "idNumber": "012345678901"
}
```

`DELETE` là thao tác archive/soft-delete. Backend vẫn giữ dữ liệu lịch sử được
tham chiếu bởi hợp đồng, hóa đơn và thanh toán.

Backend không có endpoint tạo người thuê độc lập. Người thuê được tạo hoặc cấp
tài khoản trong luồng tạo hợp đồng.

### 4.6. Rooms

Tất cả endpoint trong nhóm này chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/rooms/properties/:propertyId` | Tạo một phòng |
| `POST` | `/api/v1/rooms/properties/:propertyId/bulk` | Tạo nhiều phòng |
| `GET` | `/api/v1/rooms/properties/:propertyId` | Danh sách phòng của bất động sản |
| `GET` | `/api/v1/rooms/:id` | Chi tiết phòng |
| `PATCH` | `/api/v1/rooms/:id` | Cập nhật phòng |

Tạo một phòng:

```json
{
  "name": "101",
  "baseRent": 3500000
}
```

Tạo nhiều phòng:

```json
{
  "rooms": [
    {
      "name": "101",
      "baseRent": 3500000
    },
    {
      "name": "102",
      "baseRent": 3500000
    }
  ]
}
```

Mỗi lần tạo tối đa 50 phòng. `name` trong từng phần tử bulk là tùy chọn.

Backend không cho cập nhật trực tiếp trạng thái thuê. Occupancy được suy ra từ
hợp đồng đang hoạt động.

### 4.7. Utility rates

Chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/utilities/properties/:propertyId/utility-rates` | Tạo phiên bản giá điện nước |
| `GET` | `/api/v1/utilities/properties/:propertyId/utility-rates` | Lấy mức giá đang có hiệu lực |

Body tạo phiên bản giá:

```json
{
  "electricityRatePerKwh": 3500,
  "waterBillingMethod": "Metered",
  "waterRatePerM3": 18000,
  "waterFlatAmountPerTenant": null,
  "effectiveFrom": "2026-08-01"
}
```

`waterBillingMethod` nhận:

- `Metered`
- `Flat`

### 4.8. Surcharges

Chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/charges/properties/:propertyId/surcharges` | Tạo phụ phí |
| `GET` | `/api/v1/charges/properties/:propertyId/surcharges` | Danh sách phụ phí |
| `PATCH` | `/api/v1/charges/:id` | Cập nhật phụ phí |
| `DELETE` | `/api/v1/charges/:id` | Soft-delete phụ phí |

Tạo phụ phí:

```json
{
  "name": "Internet",
  "monthlyAmount": 100000,
  "effectiveFrom": "2026-08-01",
  "effectiveTo": null
}
```

Danh sách hỗ trợ `page` và `pageSize`.

Body `PATCH` có thể chứa:

```text
name
monthlyAmount
effectiveFrom
effectiveTo
```

Phải cung cấp ít nhất một trường.

### 4.9. Leases

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/v1/leases` | Landlord | Tạo hợp đồng |
| `GET` | `/api/v1/leases` | Authenticated, scoped | Danh sách hợp đồng |
| `GET` | `/api/v1/leases/:id` | Authenticated, scoped | Chi tiết hợp đồng |
| `PATCH` | `/api/v1/leases/:id` | Landlord | Chỉnh sửa hoặc gia hạn |
| `POST` | `/api/v1/leases/:id/end` | Landlord | Kết thúc hợp đồng |
| `GET` | `/api/v1/leases/upcoming-expirations` | Landlord | Hợp đồng sắp hết hạn |

Landlord chỉ xem hợp đồng thuộc bất động sản của mình. Tenant chỉ xem hợp đồng
của chính mình.

Tạo hợp đồng:

```json
{
  "roomId": "room-uuid",
  "tenant": {
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "idNumber": "012345678901",
    "email": "tenant@example.com"
  },
  "startDate": "2026-08-01",
  "endDate": "2027-07-31",
  "agreedRent": 3500000,
  "deposit": 3500000
}
```

Response tạo hợp đồng:

```json
{
  "data": {},
  "meta": {
    "tenantAccountProvisioned": true
  }
}
```

Danh sách hỗ trợ:

```text
GET /api/v1/leases?page=1&pageSize=20&propertyId=<property-uuid>
```

Chỉnh sửa thông thường:

```json
{
  "endDate": "2027-08-31",
  "agreedRent": 3700000,
  "deposit": 3700000
}
```

Gia hạn:

```json
{
  "renewalStartDate": "2027-08-01",
  "renewalEndDate": "2028-07-31",
  "agreedRent": 3800000
}
```

Không gửi đồng thời `endDate` và cặp trường gia hạn.

Kết thúc hợp đồng:

```json
{
  "actualEndDate": "2027-06-30"
}
```

### 4.10. Meter readings

Chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/rooms/:roomId/meter-readings` | Ghi chỉ số điện hoặc nước |
| `POST` | `/api/v1/meter-readings/:id/correct` | Sửa chỉ số đã ghi |

Ghi chỉ số:

```json
{
  "utilityType": "Electricity",
  "billingPeriod": "2026-08",
  "value": 125,
  "isInitial": false
}
```

`utilityType` nhận:

- `Electricity`
- `Water`

Sửa chỉ số:

```json
{
  "value": 130
}
```

Không thể sửa chỉ số nếu hóa đơn liên quan đã được gửi.

### 4.11. Invoices

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/v1/invoices/:id` | Authenticated, scoped | Chi tiết hóa đơn |
| `GET` | `/api/v1/invoices/:id/pdf` | Authenticated, scoped | Tải PDF hóa đơn |
| `POST` | `/api/v1/invoices/:id/send` | Landlord | Gửi hóa đơn Draft |
| `POST` | `/api/v1/properties/:propertyId/invoices/generate` | Landlord | Sinh hóa đơn theo kỳ |

Landlord chỉ xem hóa đơn thuộc bất động sản của mình. Tenant chỉ xem hóa đơn
gắn với hợp đồng của chính mình.

Sinh hóa đơn:

```text
POST /api/v1/properties/:propertyId/invoices/generate?period=2026-08
```

`period` là tùy chọn. Nếu không truyền, backend sử dụng tháng trước.

Trạng thái hóa đơn:

- `Draft`
- `Sent`
- `Paid`

Chi tiết hóa đơn chứa:

```text
id
leaseId
roomId
billingPeriod
status
issueDate
dueDate
totalAmount
sentBy
sentAt
createdAt
updatedAt
lineItems[]
```

PDF trả về:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice-<period>-<id>.pdf"
```

### 4.12. Push notifications

Landlord và Tenant đều có thể quản lý token của tài khoản mình.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/v1/notifications/device-tokens` | Đăng ký Expo push token |
| `DELETE` | `/api/v1/notifications/device-tokens` | Gỡ Expo push token |
| `POST` | `/api/v1/notifications/test` | Gửi thử push notification |

Đăng ký:

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxx]",
  "platform": "android"
}
```

`platform` nhận `ios` hoặc `android`.

Gỡ token:

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxx]"
}
```

Lưu ý: request `DELETE` nhận `pushToken` trong JSON body.

### 4.13. Maintenance

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/v1/maintenance-requests` | Authenticated, scoped | Danh sách yêu cầu bảo trì |
| `GET` | `/api/v1/maintenance-requests/:id` | Authenticated, scoped | Chi tiết yêu cầu |
| `POST` | `/api/v1/maintenance-requests` | Tenant | Gửi yêu cầu bảo trì |
| `PATCH` | `/api/v1/maintenance-requests/:id/status` | Landlord | Cập nhật trạng thái |
| `GET` | `/api/v1/rooms/:roomId/maintenance-requests` | Landlord | Lịch sử bảo trì của phòng |

Landlord xem yêu cầu thuộc phòng trong bất động sản của mình. Tenant chỉ xem
yêu cầu do chính mình gửi.

Danh sách hỗ trợ:

```text
page
pageSize
propertyId
status
```

Trạng thái:

- `Pending`
- `InProgress`
- `Completed`

Tạo yêu cầu sử dụng `multipart/form-data`:

```text
roomId=<room-uuid>
title=Máy lạnh không hoạt động
description=Máy lạnh không khởi động từ sáng nay
photos=<file>
photos[]=<file>
```

Quy định ảnh:

- Tối đa 3 ảnh.
- Mỗi ảnh tối đa 5 MB.
- Chỉ nhận `.png`, `.jpg`, `.jpeg`.
- Chỉ nhận `image/png` hoặc `image/jpeg`.
- Backend kiểm tra extension, Content-Type và magic bytes của file.

Cập nhật trạng thái:

```json
{
  "status": "InProgress"
}
```

### 4.14. Dashboard

Chỉ dành cho Landlord.

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/v1/dashboard/outstanding` | Tổng tiền chưa thu và hóa đơn quá hạn |
| `GET` | `/api/v1/dashboard/upcoming-expirations` | Hợp đồng sắp hết hạn |

Response công nợ:

```json
{
  "data": {
    "outstandingTotal": 7000000,
    "overdueInvoices": [
      {
        "invoiceId": "invoice-uuid",
        "tenant": "Nguyễn Văn A",
        "room": "101",
        "dueDate": "2026-08-05",
        "amount": 3500000
      }
    ]
  }
}
```

## 5. Endpoint chưa có

Database có thể đã chứa một phần bảng hoặc dữ liệu liên quan, nhưng backend
chưa khai báo HTTP route cho các chức năng dưới đây.

### 5.1. Danh sách hóa đơn

Chưa có:

```text
GET /api/v1/invoices
```

Ứng dụng mobile chưa thể tải toàn bộ danh sách hóa đơn bằng một endpoint riêng.

### 5.2. VietQR và thanh toán

Chưa có HTTP API cho:

```text
GET hoặc PUT cấu hình thanh toán của Landlord
GET VietQR của hóa đơn
POST payment proof
GET danh sách payment proof
PATCH trạng thái payment proof
POST xác nhận thanh toán
```

Việc database có bảng `landlord_payment_configs`, `payment_proofs` và
`payments` không đồng nghĩa các API này đã được triển khai.

### 5.3. Danh sách chỉ số điện nước

Chưa có:

```text
GET /api/v1/rooms/:roomId/meter-readings
```

Backend hiện chỉ hỗ trợ ghi và sửa chỉ số.

### 5.4. Lịch sử giá điện nước

Backend chỉ trả mức giá đang có hiệu lực, chưa có endpoint liệt kê các phiên
bản giá theo thời gian.

### 5.5. Dashboard tổng quan đầy đủ

Dashboard hiện chỉ có:

- Công nợ và hóa đơn quá hạn.
- Hợp đồng sắp hết hạn.

Chưa có endpoint tổng hợp số phòng, phòng trống, phòng đang thuê và tổng số
công việc đang chờ.

### 5.6. Nhắc nợ quá hạn

Job `sendOverdueReminders` vẫn được đánh dấu chưa triển khai.

## 6. Lệnh kiểm tra

Sau khi checkout hoặc đồng bộ backend:

```bash
cd backend
npm ci
npm run typecheck
npm run test:api
```

Kiểm tra với database integration:

```bash
npm run test:integration:local
```

Không đưa `.env`, JWT secret, database URL hoặc service key vào tài liệu,
commit hay request mẫu.
