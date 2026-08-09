# Tenant mobile UI handoff

## Mục tiêu

Mở rộng ứng dụng Expo hiện tại cho vai trò `Tenant` mà không tạo một ứng dụng
riêng và không sao chép design system. Cả chủ nhà và người thuê dùng chung
`mobile/src/ui` (Bento), chung luồng đăng nhập, hồ sơ và đổi mật khẩu; nội dung
tab được đổi theo role trả về từ backend.

## Danh sách màn hình và màn hình chủ nhà tương ứng

| Tenant screen | Mục đích | Tương thích với landlord screen | API hiện có |
| --- | --- | --- | --- |
| Đăng nhập | Tenant đăng nhập bằng số điện thoại được cấp khi tạo hợp đồng | Đăng nhập chủ nhà | `POST /api/v1/auth/login` |
| Đổi mật khẩu lần đầu | Bắt buộc thay mật khẩu tạm trước khi dùng ứng dụng | Đổi mật khẩu | `POST /api/v1/auth/change-password` |
| Trang chủ tenant | Tóm tắt nơi ở, hợp đồng và bảo trì đang mở | Trang chủ chủ nhà | Tổng hợp từ lease + maintenance |
| Hợp đồng của tôi | Danh sách hợp đồng chỉ thuộc tenant hiện tại | Danh sách hợp đồng chủ nhà | `GET /api/v1/leases` |
| Chi tiết hợp đồng | Xem phòng, bất động sản, thời hạn và tiền thuê; không có thao tác sửa/kết thúc | Chi tiết hợp đồng chủ nhà | `GET /api/v1/leases/:id` |
| Hóa đơn của tôi | Danh sách hóa đơn đã gửi/đã thanh toán | Danh sách hóa đơn chủ nhà | Chưa có invoice-list API |
| Chi tiết hóa đơn/PDF | Xem các dòng tiền và tải PDF | Chi tiết/preview hóa đơn chủ nhà | `GET /api/v1/invoices/:id`, `/pdf` |
| Bảo trì của tôi | Theo dõi các yêu cầu do tenant gửi | Danh sách bảo trì chủ nhà | `GET /api/v1/maintenance-requests` |
| Tạo yêu cầu bảo trì | Chọn phòng đang thuê, mô tả và ảnh | Chủ nhà tiếp nhận yêu cầu | `POST /api/v1/maintenance-requests` multipart |
| Chi tiết bảo trì | Xem trạng thái và lịch sử; không được cập nhật trạng thái | Chi tiết bảo trì chủ nhà | `GET /api/v1/maintenance-requests/:id` |
| Hồ sơ | Xem/cập nhật tên và số điện thoại | Hồ sơ chủ nhà | `GET/PATCH /api/v1/profile` |
| Thông báo | Danh sách nhắc hóa đơn/hợp đồng/bảo trì | Thông báo vận hành chủ nhà | Chưa có notification-list API |

## Cấu trúc điều hướng

Tenant dùng bốn tab, cùng vị trí với shell chủ nhà để giữ hành vi nhất quán:

1. `Trang chủ`
2. `Hợp đồng`
3. `Bảo trì`
4. `Hồ sơ`

Các route chi tiết dùng chung nếu hành vi giống nhau. Mọi nút ghi dữ liệu dành
riêng cho landlord phải bị ẩn khi `user.role === "Tenant"`.

## Giai đoạn triển khai

### Giai đoạn 1 — Role-aware shell

- Cho phép tenant đăng nhập thay vì đăng xuất ngay.
- Đổi tên/nội dung tab theo role.
- Thêm trang chủ tenant và danh sách hợp đồng tenant.
- Làm chi tiết hợp đồng/bảo trì an toàn cho tenant (read-only).
- Tái sử dụng hồ sơ và đổi mật khẩu.

### Giai đoạn 2 — Maintenance creation

- Thêm FormData support vào API client.
- Tạo form gửi bảo trì và chọn ảnh.
- Refresh danh sách sau khi gửi thành công.

### Giai đoạn 3 — Tenant billing

- Chỉ triển khai danh sách hóa đơn sau khi backend có invoice-list endpoint.
- Tái sử dụng invoice detail/PDF; bổ sung payment proof khi backend có API.

### Giai đoạn 4 — Notifications và polish

- Thêm notification center khi có list/read API.
- Hoàn thiện loading, empty, offline, accessibility và kiểm thử thiết bị thật.

## Prompt cho Open Design

```text
Bạn đang tiếp tục prototype mobile của RoSi-Home.

Mục tiêu:
Thiết kế bổ sung luồng UI dành cho NGƯỜI THUÊ NHÀ (Tenant), tương thích trực
tiếp với luồng Chủ nhà hiện có. Đây không phải design system mới. Hãy tiếp tục
dùng Bento và cấu trúc UI trong mobile/src/ui.

Phạm vi được phép đọc/sửa:
- mobile/
- openspec/specs/ARCHITECTURE.md (chỉ tham khảo)
- openspec/specs/FEATURE-SPECS.md (chỉ tham khảo)
- docs/product_backlog.md (chỉ tham khảo)

Không được:
- sửa backend/
- tạo web UI
- thay Expo SDK hoặc dependency
- tạo design system thứ hai
- dùng sub-agent
- dùng dữ liệu/API chưa tồn tại như thể đã hoạt động

Hãy thiết kế theo thứ tự:
1. Đăng nhập bằng số điện thoại và đổi mật khẩu lần đầu.
2. Tenant Home: nơi ở hiện tại, trạng thái hợp đồng, bảo trì đang mở.
3. Hợp đồng của tôi và chi tiết hợp đồng read-only.
4. Bảo trì của tôi, tạo yêu cầu, chi tiết và timeline trạng thái.
5. Hồ sơ và đổi mật khẩu.
6. Hóa đơn/Thông báo ở trạng thái API-blocked phải có empty/coming-soon state
   rõ ràng, không mock thành dữ liệu thật.

Điều hướng Tenant:
- Trang chủ
- Hợp đồng
- Bảo trì
- Hồ sơ

Yêu cầu tương thích:
- Giữ typography, spacing, màu sắc, Card, Badge, Button, Notice, Field và
  Screen hiện có.
- Các màn hình chi tiết dùng chung với landlord phải ẩn thao tác landlord-only.
- Tenant không được thấy Bất động sản, Thiết lập giá, Tạo phòng, Tạo/Kết thúc
  hợp đồng, Chốt chỉ số hoặc cập nhật trạng thái bảo trì.
- Tất cả màn hình phải có loading, error và empty state.
- Bàn phím không được che ô nhập cuối màn hình.

Trước khi sửa code, hãy liệt kê:
- screen inventory
- route map
- component nào tái sử dụng
- API dependency và API gap

Sau đó chỉ triển khai Giai đoạn 1 trong mobile/, chạy TypeScript/lint, liệt kê
file đã sửa và DỪNG LẠI để tôi review trước khi sang giai đoạn tiếp theo.
```
