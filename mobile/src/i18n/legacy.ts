import type { AppLanguage } from './messages';

// During the route-by-route migration, shared controls can safely translate
// existing static English labels without altering form values or API payloads.
const vietnamese: Record<string, string> = {
  'Billing': 'Hóa đơn', 'Invoices': 'Hóa đơn', 'My invoices': 'Hóa đơn của tôi', 'Invoice details': 'Chi tiết hóa đơn',
  'Business report': 'Báo cáo kinh doanh', 'Portfolio analytics': 'Phân tích danh mục',
  'New lease': 'Tạo hợp đồng mới', 'Lease details': 'Chi tiết hợp đồng', 'Leases': 'Hợp đồng',
  'Tenant information': 'Thông tin người thuê',
  'Full name': 'Họ và tên', 'Phone number (username)': 'Số điện thoại (tên đăng nhập)',
  'Email address': 'Địa chỉ email', 'Identification number': 'Số giấy tờ tùy thân',
  'Property': 'Bất động sản', 'Vacant room': 'Phòng trống', 'Lease start date': 'Ngày bắt đầu hợp đồng',
  'Lease end date': 'Ngày kết thúc hợp đồng', 'Monthly rent (VNĐ)': 'Tiền thuê hằng tháng (VNĐ)',
  'Deposit (VNĐ)': 'Tiền cọc (VNĐ)', 'Agreed rent': 'Tiền thuê đã thỏa thuận',
  'Lease period': 'Thời hạn hợp đồng', 'Tenant contact': 'Liên hệ người thuê',
  'Room status': 'Trạng thái phòng', 'Last updated': 'Cập nhật lần cuối',
  'Actual end date': 'Ngày kết thúc thực tế', 'Start date': 'Ngày bắt đầu', 'End date': 'Ngày kết thúc',
  'Current password': 'Mật khẩu hiện tại', 'Temporary password': 'Mật khẩu tạm thời',
  'New password': 'Mật khẩu mới', 'Confirm password': 'Xác nhận mật khẩu',
  'Confirm new password': 'Xác nhận mật khẩu mới', 'Password': 'Mật khẩu',
  'Property name': 'Tên bất động sản', 'Street address': 'Địa chỉ đường',
  'Locality / Area (optional)': 'Khu vực (không bắt buộc)',
  'Prefix': 'Tiền tố', 'Start number': 'Số bắt đầu', 'Number of rooms': 'Số lượng phòng',
  'Shared base rent (VNĐ)': 'Tiền thuê cơ bản chung (VNĐ)',
  'Search invoice, tenant or room': 'Tìm hóa đơn, người thuê hoặc phòng',
  'Search tenant, property or room': 'Tìm người thuê, bất động sản hoặc phòng',
  'Search tenants': 'Tìm người thuê', 'Search name or address': 'Tìm theo tên hoặc địa chỉ',
  'Month': 'Theo tháng', 'Custom range': 'Khoảng tùy chọn', 'Reporting month': 'Tháng báo cáo',
  'Generate report': 'Tạo báo cáo', 'Draft': 'Nháp', 'Sent': 'Đã gửi', 'Paid': 'Đã thanh toán', 'All': 'Tất cả',
  'Save changes': 'Lưu thay đổi', 'Saving...': 'Đang lưu...', 'Create lease': 'Tạo hợp đồng',
  'Update lease terms': 'Cập nhật điều khoản', 'Record renewal': 'Ghi nhận gia hạn',
  'End lease & release room': 'Kết thúc hợp đồng & trả phòng', 'Confirm': 'Xác nhận',
  'Report a repair': 'Báo hỏng', 'Title': 'Tiêu đề', 'Description': 'Mô tả', 'Cancel': 'Hủy',
  'Upload payment proof': 'Tải minh chứng thanh toán', 'Pay now': 'Thanh toán ngay',
  'My lease': 'Hợp đồng của tôi', 'Maintenance': 'Bảo trì', 'Notifications': 'Thông báo',
  'Reports': 'Báo cáo', 'Electricity': 'Điện', 'Water': 'Nước',
  'Tenant': 'Người thuê', 'Landlord': 'Chủ nhà', 'Tenant account': 'Tài khoản người thuê',
  'Maintenance request': 'Yêu cầu bảo trì', 'Details': 'Chi tiết', 'Payment': 'Thanh toán',
  'Payment preview': 'Xem trước thanh toán',
};

export function translateLegacy(language: AppLanguage, value: string) {
  return language === 'vi' ? vietnamese[value] ?? value : value;
}
