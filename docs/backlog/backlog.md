# Product Backlog: Hệ thống Số hóa Tài liệu Thư viện

> Mỗi feature được liên kết với Workflow tương ứng từ `project_vision_scope.md` và có Acceptance Criteria (AC) cụ thể, đo lường được.

---

## Workflow Mapping Reference

| Workflow | Mô tả | User |
| :--- | :--- | :--- |
| **WF-A** | Cấu trúc EDOB (EBSN, Categories, Tags, Users, Search Index) | System / All |
| **WF-B** | Thủ thư → Scan PDF → EDOB → Saved | Librarian |
| **WF-C** | Sinh viên → Search → Read | Student |

---

## EPIC 1: Xác thực & Phân quyền (Authentication & Authorization)

> Là nền tảng cho tất cả các workflow. Mọi tương tác có role đều phụ thuộc vào epic này.

---

### F-01 · Đăng ký tài khoản

- **Workflows:** WF-B, WF-C
- **User Story:** Là một người dùng mới, tôi muốn đăng ký tài khoản với vai trò phù hợp (Librarian hoặc Student), để tôi có thể đăng nhập và sử dụng hệ thống.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Form đăng ký có các trường: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, Vai trò (Student / Librarian).
- [ ] Email phải đúng định dạng và chưa tồn tại trong hệ thống — hệ thống báo lỗi nếu trùng.
- [ ] Mật khẩu tối thiểu 8 ký tự, có chữ hoa và số.
- [ ] Sau khi đăng ký thành công, người dùng được chuyển đến trang đăng nhập với thông báo xác nhận.
- [ ] Tài khoản Librarian phải được Admin phê duyệt trước khi kích hoạt (trạng thái: pending → active).

---

### F-02 · Đăng nhập & Đăng xuất

- **Workflows:** WF-B, WF-C
- **User Story:** Là người dùng đã có tài khoản, tôi muốn đăng nhập để hệ thống nhận diện vai trò và hiển thị đúng giao diện phù hợp với quyền hạn của tôi.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Người dùng đăng nhập bằng Email + Mật khẩu.
- [ ] Sau khi đăng nhập, hệ thống điều hướng đúng theo vai trò: Admin → Admin Dashboard, Librarian → Trang quản lý tài liệu, Student → Trang tìm kiếm.
- [ ] Nếu sai thông tin, hiển thị thông báo lỗi rõ ràng (không tiết lộ tài khoản có tồn tại hay không).
- [ ] Phiên đăng nhập (session/token) hết hạn sau 24 giờ không hoạt động.
- [ ] Nút đăng xuất luôn hiển thị ở header sau khi đăng nhập và xóa phiên hiện tại.

---

### F-03 · Phân quyền theo vai trò (RBAC)

- **Workflows:** WF-A, WF-B, WF-C
- **User Story:** Là quản trị viên hệ thống, tôi muốn mỗi vai trò chỉ truy cập được những tính năng họ được phép, để tránh xâm phạm dữ liệu và hành động trái phép.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Student không thể truy cập trang Upload tài liệu hoặc Admin Dashboard — trả về lỗi 403.
- [ ] Librarian không thể truy cập trang quản lý tài khoản người dùng.
- [ ] Tài liệu đặt quyền "Nội bộ" không hiển thị với Student chưa đăng nhập.
- [ ] API backend kiểm tra token và role trước mỗi thao tác — không chỉ dựa vào UI.
- [ ] Admin có toàn quyền: quản lý tài khoản, danh mục, tài liệu, và xem thống kê.

---

## EPIC 2: Số hóa & Tạo EDOB (Document Upload & EDOB Creation)

> Workflow chính: **WF-B** (Thủ thư → Scan PDF → EDOB → Saved). Đây là quy trình cốt lõi tạo ra dữ liệu cho toàn hệ thống.

---

### F-04 · Tải lên tệp tài liệu (Upload Document File)

- **Workflow:** WF-B (Bước 2, 3)
- **User Story:** Là thủ thư, tôi muốn tải lên tệp tài liệu đã scan (PDF, PNG, JPG) từ máy tính của tôi, để bắt đầu quy trình số hóa tài liệu đó.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Hệ thống chấp nhận các định dạng: `.pdf`, `.png`, `.jpg`, `.jpeg`.
- [ ] Giới hạn kích thước tệp tối đa: 100MB mỗi tệp.
- [ ] Hiển thị thanh tiến trình (progress bar) khi tệp đang được tải lên.
- [ ] Nếu định dạng không hợp lệ, hệ thống hiển thị thông báo lỗi và ngăn quá trình tiếp theo.
- [ ] Sau khi upload thành công, hệ thống hiển thị bản preview tệp để thủ thư xem trước chất lượng (WF-B Bước 6).
- [ ] Hỗ trợ tải lên nhiều ảnh (PNG/JPG) và ghép thành một EDOB duy nhất (multi-page scan).

---

### F-05 · Tự động sinh EBSN

- **Workflow:** WF-A (EBSN component), WF-B (Bước 4)
- **User Story:** Là hệ thống, tôi muốn tự động tạo ra một EBSN (Electronic Book Serial Number) duy nhất cho mỗi tài liệu khi thủ thư tải lên, để mỗi EDOB có mã định danh không trùng lặp.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] EBSN được tự động sinh ngay sau khi tệp tải lên thành công.
- [ ] EBSN có định dạng chuẩn, ví dụ: `EDOB-2026-000001` (tiền tố + năm + số thứ tự).
- [ ] Không có hai EDOB nào trong hệ thống có cùng EBSN.
- [ ] EBSN được hiển thị rõ trên form metadata và trên trang chi tiết EDOB.
- [ ] Thủ thư có thể tra cứu EDOB trực tiếp bằng EBSN trong thanh tìm kiếm.

---

### F-06 · Nhập metadata tài liệu (EDOB Metadata Form)

- **Workflow:** WF-B (Bước 5)
- **User Story:** Là thủ thư, tôi muốn nhập thông tin mô tả đầy đủ cho tài liệu sau khi tải lên, để EDOB có đủ dữ liệu cho việc phân loại và tìm kiếm.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Form gồm các trường bắt buộc: Tiêu đề, Tác giả, Năm xuất bản.
- [ ] Form gồm các trường tùy chọn: Số trang, Mô tả tóm tắt, Nhà xuất bản, Ngôn ngữ.
- [ ] Trường Category là bắt buộc — phải chọn ít nhất một danh mục.
- [ ] Trường Tags là tùy chọn — hỗ trợ thêm nhiều tag bằng cách gõ và nhấn Enter.
- [ ] Trường Phân quyền xem là bắt buộc — mặc định là "Yêu cầu đăng nhập".
- [ ] Nếu thiếu trường bắt buộc, hệ thống hiển thị lỗi inline và ngăn lưu.

---

### F-07 · Lưu và Xuất bản EDOB (Save & Publish)

- **Workflow:** WF-B (Bước 7, 8, 9)
- **User Story:** Là thủ thư, tôi muốn lưu và xuất bản EDOB sau khi đã điền đầy đủ thông tin, để tài liệu được lưu vào hệ thống và sinh viên có thể tìm kiếm được ngay.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Nhấn "Lưu và Xuất bản" lưu EDOB vào database và tệp vào cloud storage.
- [ ] Hệ thống tự động xây dựng Search Index cho EDOB ngay sau khi lưu.
- [ ] Thủ thư nhận thông báo thành công kèm EBSN và liên kết xem trang chi tiết EDOB.
- [ ] EDOB xuất hiện trong kết quả tìm kiếm trong vòng 30 giây sau khi xuất bản.
- [ ] Thủ thư có thể lưu nháp (Save Draft) mà không xuất bản — trạng thái Draft không hiển thị với Student.

---

### F-08 · Chỉnh sửa và Xóa EDOB

- **Workflow:** WF-B (hỗ trợ sau xuất bản)
- **User Story:** Là thủ thư, tôi muốn chỉnh sửa thông tin hoặc xóa một EDOB đã xuất bản, để sửa lỗi nhập liệu hoặc loại bỏ tài liệu không còn phù hợp.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Thủ thư có thể chỉnh sửa tất cả trường metadata của EDOB sau khi xuất bản.
- [ ] Thủ thư có thể thay thế tệp tài liệu mà không cần tạo lại EDOB (giữ nguyên EBSN).
- [ ] Khi xóa EDOB, hệ thống yêu cầu xác nhận lần hai trước khi thực hiện.
- [ ] Xóa EDOB cũng xóa tệp khỏi cloud storage và Search Index.
- [ ] Admin có thể xóa bất kỳ EDOB nào; Librarian chỉ xóa được EDOB do mình tạo.

---

## EPIC 3: Phân loại & Gán nhãn (Categories & Tags)

> Workflow chính: **WF-A** (Components: Categories, Tags). Hỗ trợ trực tiếp cho WF-B (thủ thư gán khi tạo EDOB) và WF-C (sinh viên lọc khi tìm kiếm).

---

### F-09 · Quản lý Danh mục (Category Management)

- **Workflow:** WF-A (Categories component), WF-B (Bước 5)
- **User Story:** Là Admin, tôi muốn tạo và quản lý danh sách danh mục tài liệu, để thủ thư có thể phân loại EDOB một cách nhất quán trên toàn hệ thống.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Admin có thể thêm, sửa tên, và vô hiệu hóa danh mục.
- [ ] Danh mục có thể có cấu trúc phân cấp tối đa 2 cấp (ví dụ: Khoa học → Toán học).
- [ ] Một EDOB phải thuộc ít nhất một danh mục.
- [ ] Khi vô hiệu hóa một danh mục, các EDOB thuộc danh mục đó không bị xóa — chỉ không hiển thị danh mục trong filter.
- [ ] Danh sách danh mục được hiển thị trong sidebar/filter trên trang tìm kiếm.

---

### F-10 · Gán và Quản lý Tags

- **Workflow:** WF-A (Tags component), WF-B (Bước 5)
- **User Story:** Là thủ thư, tôi muốn gán các tag từ khóa linh hoạt cho từng EDOB, để sinh viên có thể tìm kiếm tài liệu theo nhiều chiều khác nhau ngoài danh mục cứng.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Thủ thư có thể thêm tối đa 20 tag cho một EDOB.
- [ ] Khi gõ tag, hệ thống gợi ý (autocomplete) các tag đã được dùng trước đó trong hệ thống.
- [ ] Tag không phân biệt chữ hoa/thường (`Python` và `python` được coi là một).
- [ ] Sinh viên có thể nhấn vào một tag trên trang chi tiết EDOB để xem tất cả tài liệu cùng tag.
- [ ] Admin có thể xem danh sách toàn bộ tag và số lượng EDOB sử dụng mỗi tag.

---

## EPIC 4: Phân quyền Xem Tài liệu (Document Access Control)

> Workflow chính: **WF-A** (Users component). Đảm bảo bảo mật và kiểm soát nội dung hợp lệ cho cả WF-B và WF-C.

---

### F-11 · Thiết lập mức truy cập EDOB

- **Workflow:** WF-A (Users component), WF-B (Bước 5)
- **User Story:** Là thủ thư, tôi muốn thiết lập ai có thể xem một tài liệu khi tạo EDOB, để kiểm soát quyền truy cập theo tính chất từng loại tài liệu.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Có 3 mức truy cập: **Công khai** (ai cũng xem được), **Đăng nhập** (chỉ user đã login), **Nội bộ** (chỉ Librarian và Admin).
- [ ] Mức mặc định khi tạo EDOB là "Đăng nhập".
- [ ] Tài liệu "Công khai" hiển thị và đọc được mà không cần đăng nhập.
- [ ] Tài liệu "Nội bộ" không xuất hiện trong kết quả tìm kiếm của Student.
- [ ] Thủ thư có thể thay đổi mức truy cập bất kỳ lúc nào sau khi xuất bản.

---

## EPIC 5: Tìm kiếm Tài liệu (Document Search)

> Workflow chính: **WF-A** (Search Index component), **WF-C** (Bước 3, 4, 5). Đây là hành trình cốt lõi của Student.

---

### F-12 · Tìm kiếm theo từ khóa

- **Workflow:** WF-C (Bước 3, 4)
- **User Story:** Là sinh viên, tôi muốn gõ từ khóa vào thanh tìm kiếm và nhận về danh sách tài liệu phù hợp ngay lập tức, để tôi không phải duyệt toàn bộ kho tài liệu thủ công.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Thanh tìm kiếm hiển thị ngay trên trang chủ, không cần đăng nhập để tìm tài liệu công khai.
- [ ] Tìm kiếm khớp với: Tiêu đề, Tác giả, Mô tả, Tags, và EBSN.
- [ ] Kết quả trả về trong vòng 2 giây với tập dữ liệu 1000+ EDOB.
- [ ] Kết quả hiển thị dạng thẻ (card): ảnh bìa (nếu có), tiêu đề, tác giả, danh mục, và EBSN.
- [ ] Nếu không có kết quả, hiển thị thông báo rõ ràng và gợi ý mở rộng từ khóa.

---

### F-13 · Lọc kết quả tìm kiếm

- **Workflow:** WF-C (Bước 4)
- **User Story:** Là sinh viên, tôi muốn lọc kết quả tìm kiếm theo danh mục, tag và năm xuất bản, để thu hẹp nhanh chóng xuống đúng tài liệu cần tìm.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Sidebar filter hiển thị danh sách Category với số lượng EDOB trong từng mục.
- [ ] Sinh viên có thể chọn nhiều tag để lọc (AND/OR logic).
- [ ] Bộ lọc năm xuất bản dạng range (ví dụ: 2020 – 2025).
- [ ] Bộ lọc được áp dụng ngay lập tức (không cần nhấn nút Search lại).
- [ ] Có nút "Xóa bộ lọc" để reset về toàn bộ kết quả.

---

### F-14 · Trang chi tiết EDOB

- **Workflow:** WF-C (Bước 5)
- **User Story:** Là sinh viên, tôi muốn xem đầy đủ thông tin của một tài liệu trước khi quyết định đọc, để tôi chắc chắn đây đúng là tài liệu mình cần.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Trang chi tiết hiển thị: Tiêu đề, Tác giả, EBSN, Năm xuất bản, Số trang, Danh mục, Tags, Mô tả tóm tắt, và Mức truy cập.
- [ ] Hiển thị ảnh bìa tài liệu (trang đầu tiên của EDOB) nếu có.
- [ ] Nút "Đọc ngay" (Read Now) hiển thị rõ ràng; nếu Student chưa đăng nhập và tài liệu cần đăng nhập, hiển thị thông báo yêu cầu đăng nhập với liên kết dẫn đến trang login.
- [ ] Các tag trên trang chi tiết là liên kết — nhấn vào để tìm tài liệu cùng tag.
- [ ] URL trang chi tiết có thể chia sẻ (shareable) và hiển thị đúng nội dung.

---

## EPIC 6: Đọc Tài liệu (Document Reader)

> Workflow chính: **WF-C** (Bước 6, 7). Đây là bước cuối và là kết quả giải quyết vấn đề của Student.

---

### F-15 · Trình đọc tài liệu tích hợp (In-browser Document Reader)

- **Workflow:** WF-C (Bước 6, 7)
- **User Story:** Là sinh viên, tôi muốn đọc tài liệu trực tiếp trên trình duyệt mà không cần tải về hay cài phần mềm ngoài, để tôi có thể học ngay lập tức trên bất kỳ thiết bị nào.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] PDF được hiển thị trong PDF viewer tích hợp (ví dụ: pdf.js) ngay trong tab trình duyệt.
- [ ] Ảnh scan (PNG/JPG) hiển thị dạng gallery từng trang, có thể cuộn qua lại.
- [ ] Hỗ trợ điều hướng trang: nút Previous/Next, nhảy đến trang cụ thể.
- [ ] Hỗ trợ phóng to/thu nhỏ (zoom in/out) tối thiểu 50% – 200%.
- [ ] Trình đọc hoạt động trên các trình duyệt: Chrome, Firefox, Edge (phiên bản mới nhất).
- [ ] Nếu Student không đủ quyền xem, hệ thống hiển thị thông báo lỗi và không để lộ URL tệp.

---

## EPIC 7: Quản trị Hệ thống (Admin Dashboard)

> Workflow gián tiếp: hỗ trợ **WF-B** (phê duyệt Librarian) và **WF-C** (kiểm soát chất lượng). Giải quyết vấn đề của Admin.

---

### F-16 · Quản lý tài khoản người dùng

- **Workflow:** WF-A (Users component)
- **User Story:** Là Admin, tôi muốn xem, phê duyệt và vô hiệu hóa tài khoản người dùng trên hệ thống, để đảm bảo chỉ người dùng hợp lệ mới có thể truy cập và thao tác.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Admin xem danh sách tất cả tài khoản: tên, email, vai trò, trạng thái (active / pending / disabled).
- [ ] Admin phê duyệt tài khoản Librarian mới (chuyển từ pending → active).
- [ ] Admin có thể vô hiệu hóa (disable) bất kỳ tài khoản nào — người dùng bị khóa không thể đăng nhập.
- [ ] Admin có thể tìm kiếm tài khoản theo tên hoặc email.
- [ ] Không thể xóa tài khoản; chỉ được disable để giữ lịch sử dữ liệu.

---

### F-17 · Dashboard thống kê

- **Workflow:** WF-A, WF-B, WF-C (tổng hợp)
- **User Story:** Là Admin, tôi muốn xem bảng tổng quan thống kê hoạt động của hệ thống, để đánh giá hiệu quả vận hành và đưa ra quyết định quản lý.
- **Priority:** Must Have

**Acceptance Criteria:**
- [ ] Dashboard hiển thị: Tổng số EDOB, Tổng số người dùng (theo vai trò), Tổng số EDOB theo danh mục, Tổng lượt xem/đọc trong 7 ngày qua.
- [ ] Hiển thị danh sách Top 5 EDOB được xem nhiều nhất.
- [ ] Hiển thị số lượng EDOB mới được thêm trong tháng hiện tại.
- [ ] Dữ liệu thống kê được cập nhật trong vòng 5 phút.
- [ ] Dashboard chỉ Admin mới truy cập được.

---

## Tổng hợp Backlog theo Priority

| ID | Feature | Workflow | Priority |
| :--- | :--- | :--- | :--- |
| F-01 | Đăng ký tài khoản | WF-B, WF-C | Must Have |
| F-02 | Đăng nhập & Đăng xuất | WF-B, WF-C | Must Have |
| F-03 | Phân quyền theo vai trò (RBAC) | WF-A, WF-B, WF-C | Must Have |
| F-04 | Tải lên tệp tài liệu | WF-B | Must Have |
| F-05 | Tự động sinh EBSN | WF-A, WF-B | Must Have |
| F-06 | Nhập metadata EDOB | WF-B | Must Have |
| F-07 | Lưu và Xuất bản EDOB | WF-B | Must Have |
| F-08 | Chỉnh sửa và Xóa EDOB | WF-B | Must Have |
| F-09 | Quản lý Danh mục (Categories) | WF-A, WF-B | Must Have |
| F-10 | Gán và Quản lý Tags | WF-A, WF-B | Must Have |
| F-11 | Thiết lập mức truy cập EDOB | WF-A, WF-B | Must Have |
| F-12 | Tìm kiếm theo từ khóa | WF-C | Must Have |
| F-13 | Lọc kết quả tìm kiếm | WF-C | Must Have |
| F-14 | Trang chi tiết EDOB | WF-C | Must Have |
| F-15 | Trình đọc tài liệu tích hợp | WF-C | Must Have |
| F-16 | Quản lý tài khoản người dùng | WF-A | Must Have |
| F-17 | Dashboard thống kê | WF-A, WF-B, WF-C | Must Have |
| F-18 | Lọc nâng cao (năm, ngôn ngữ) | WF-C | Should Have |
| F-19 | Lịch sử đọc của sinh viên | WF-C | Should Have |
| F-20 | Tải xuống tài liệu (nếu được phép) | WF-C | Should Have |
| F-21 | OCR tích hợp (Google Vision API) | WF-B | Could Have |
| F-22 | Bookmark & Ghi chú cá nhân | WF-C | Could Have |
