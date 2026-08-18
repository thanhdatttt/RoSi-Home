# Project Status Report #1 — 50% Milestone (Status Email)

- **Completion scope:** **48.18%** (119 / 247 Story Points) — 31 / 51 User Stories completed (8 / 15 Features shipped).
- **Completion date:** 128 remaining points / 59.5 points/batch = **~2.15 Batches** (~23 ngày làm việc) $\rightarrow$ **Mục tiêu hoàn thành: Tuần 10**.
- **Budget usage & Estimated final cost:** Đã chi **1,900,000 VND** (44.7%) | Dự toán chi phí hoàn thành: **~3,850,000 VND** (On Budget).
- **Issues and resolutions:** 
  - Phụ thuộc tích hợp FE-BE $\rightarrow$ Thống nhất mock schema Zod & OpenAPI contract sớm.
  - Upload ảnh bảo trì nặng trên mobile $\rightarrow$ Nén ảnh client-side trước khi upload Supabase.
- **Changes and impacts:** Chuyển cấu hình gửi email tài khoản từ SMTP sang Resend API để tránh bị chặn thư rác.
- **Updated product backlog:**
  - *Stories completed (31 US):* US-AUTH-01→06, US-PROFILE-01, US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01, US-TENANT-01→02, US-LEASE-01→06, US-METER-01→03, US-MAINT-01→05.
  - *Stories added or removed:* 0 (bảo toàn 51 stories).
- **Updated release plan:** Release 1 (Batch 1 & 2) 100% DONE $\rightarrow$ Release 2 (Batch 3: Billing & VietQR) Tuần 8 $\rightarrow$ Release 3 (Batch 4: Analytics) Tuần 10.
- **Risks with high probability and impact:** 
  - Rủi ro tương thích mã VietQR với các app ngân hàng $\rightarrow$ Test thực tế 4 app ngân hàng phổ biến trong Batch 3.
  - Độ tin cậy Push Notification $\rightarrow$ Theo dõi log trên Expo Push Service.
- **Working software and documentation:** Backend API deployed Render (`/api/v1`), Expo Mobile Preview, và bộ tài liệu tham chiếu tại root `docs/` (`product_backlog_2.0.md`, `project_estimation.md`, `project_plan.md`).

---

# Project Status Report #2 — 100% Milestone (Final Release Status Email)

- **Completion scope:** **100%** (247 / 247 Story Points) — **51 / 51 User Stories completed** (**15 / 15 Features shipped & accepted**).
- **Completion date:** **Đã hoàn thành toàn bộ sản phẩm tại Tuần 10 (Ngày làm việc 45)** $\rightarrow$ **ĐÚNG HẠN (ON TIME)**.
- **Budget usage & Estimated final cost:** Tổng chi phí thực tế: **3,850,000 VND / 4,250,000 VND** (**90.6%** ngân sách) $\rightarrow$ **TIẾT KIỆM (UNDER BUDGET ~400,000 VND)**.
- **Issues and resolutions:** 
  - Đã tích hợp và quét thành công mã VietQR thực tế trên 4 ứng dụng ngân hàng phổ biến (Vietcombank, MB, Techcombank, TPBank).
  - Tối ưu hóa truy vấn tính toán biểu đồ Dashboard và trích xuất file PDF báo cáo tài chính/bảo trì ổn định trên thiết bị di động.
- **Changes and impacts:** 0 stories phát sinh ngoài phạm vi (Bảo toàn 100% baseline 51 User Stories từ Product Backlog 2.0).
- **Updated product backlog:**
  - *Stories completed (51/51 US):* 
    - Batch 1 (15 US): US-AUTH-01→06, US-PROFILE-01, US-PROPERTY-01→02, US-ROOM-01→03, US-UTILITY-01→02, US-CHARGE-01
    - Batch 2 (16 US): US-TENANT-01→02, US-LEASE-01→06, US-METER-01→03, US-MAINT-01→05
    - Batch 3 (11 US): US-INVOICE-01→04, US-VIETQR-01→02, US-PAYMENT-01→03, US-REMINDER-01→02
    - Batch 4 (9 US): US-DASH-01→04, US-REPORT-01→05
  - *Stories added or removed:* 0 stories.
- **Updated release plan:** Release 1 (100%), Release 2 (100%), Release 3 (100%) $\rightarrow$ **Toàn bộ 4 Delivery Batches đã hoàn tất, sẵn sàng cho buổi Final Demo & Pilot**.
- **Risks with high probability and impact:** Toàn bộ rủi ro kỹ thuật và tích hợp đã được giải tỏa (*All closed*); hệ thống sẵn sàng bàn giao vận hành thử nghiệm.
- **Working software and documentation:** Hệ thống hoàn chỉnh đã triển khai trên Render Production API (`/api/v1`), ứng dụng React Native Mobile hoàn thiện, CI/CD pass 100%, và đầy đủ bộ tài liệu chính thức tại root `docs/` (`product_backlog_2.0.md`, `project_estimation.md`, `project_plan.md`, `architecture.md`, `proposal.md`).
