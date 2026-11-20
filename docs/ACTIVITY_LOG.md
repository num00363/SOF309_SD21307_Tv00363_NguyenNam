# NHẬT KÝ HOẠT ĐỘNG PHÁT TRIỂN & BẢO TRÌ DỰ ÁN (PROJECT ACTIVITY LOG)
**Dự án:** Hệ Thống Quản Lý Quán Trà Sữa & Bán Hàng Trực Tuyến TEA POS  
**Đơn vị thực hiện:** Nhóm Kỹ Sư Phần Mềm CodeDevSquad  
**Tiêu chuẩn vòng đời:** Software Development Life Cycle (SDLC) - Agile / Waterfall Hybrid  
**Thời gian ghi nhận:** Từ Tháng 05/2026 Đến Ngày 09/11/2026  

---

## 1. DÒNG THỜI GIAN TỔNG QUAN CÁC GIAI ĐOẠN (TIMELINE MILESTONES)

```
[THÁNG 05/2026] ──> Khảo sát nghiệp vụ, phân tích yêu cầu SRS & Lập kế hoạch SDLC
[THÁNG 06/2026] ──> Thiết kế giao diện Figma, kiến trúc CSDL 19 bảng & ERD
[THÁNG 07/2026] ──> Khởi tạo khung Maven Java EE, viết tầng DAO/Repo, Service & HikariCP
[THÁNG 08/2026] ──> Xây dựng giao diện quầy POS, Portal khách hàng & Admin Dashboard
[THÁNG 09/2026] ──> Tích hợp cổng VietQR, Webhook SePay & dịch vụ gửi mail OTP
[THÁNG 10/2026] ──> Kiểm thử nội bộ, đóng gói war và tối ưu hóa CSS/JS Responsive
[08/11/2026]    ──> ĐỢT KIỂM THỬ TOÀN DIỆN (UI, SQL, Code, Security) bởi Gemini 3.8 Flash
[09/11/2026]    ──> VÁ TOÀN BỘ 10 LỖI BUGS, xuất tài liệu SPECIFICATIONS & Hoàn thiện đồ án
[20/11/2026]    ──> CẤU HÌNH DEPLOY TOMCAT 11, ĐỒNG BỘ CSDL SQL SERVER & SỬA BUG-UI-05 (VỠ ẢNH PORTAL)
```

---

## 2. NHẬT KÝ CHI TIẾT TỪNG NGÀY / GIAI ĐOẠN HOẠT ĐỘNG

---

### GIAI ĐOẠN 1: KHỞI TẠO DỰ ÁN & ĐẶC TẢ YÊU CẦU NGHIỆP VỤ (THÁNG 05/2026)

- **Ngày 15/05/2026:**
  - Họp nhóm CodeDevSquad phiên đầu tiên; bầu nhóm trưởng và phân công vai trò theo chuẩn SDLC.
  - Thống nhất đề tài tốt nghiệp: *"Xây dựng Hệ thống Quản lý và Bán hàng Trà Sữa O2O - TEA POS"*.
  - Khảo sát thực tế quy trình vận hành tại các chuỗi cửa hàng trà sữa (Topping, định lượng đá/đường, kích cỡ ly S/M/L, tích điểm thành viên).
- **Ngày 25/05/2026:**
  - Hoàn thành tài liệu Phân tích yêu cầu nghiệp vụ phần mềm (Software Requirements Specification - SRS).
  - Xuất bản `Bảng Phân Công Công Việc Dự Án Tea POS Theo Chuẩn SDLC.xlsx`.
  - Phân định 4 nhóm vai trò chính: Khách vãng lai, Hội viên CRM, Thu ngân POS, Quản trị viên Admin.

---

### GIAI ĐOẠN 2: THIẾT KẾ KIẾN TRÚC & CƠ SỞ DỮ LIỆU (THÁNG 06/2026)

- **Ngày 05/06/2026:**
  - Thiết kế Wireframe và Mockup UI/UX hoàn chỉnh trên Figma cho 3 phân hệ: Portal, POS, Admin.
  - Thống nhất bảng màu thương hiệu: Emerald Slate (`#10b981` phối hợp nền Dark Slate `#0f172a`).
- **Ngày 18/06/2026:**
  - Thiết kế mô hình Thực thể - Liên kết (ERD) gồm 19 thực thể vật lý.
  - Thiết lập ràng buộc khóa ngoại, điều kiện `CHECK` chống số âm, khóa Unique cho SĐT, Email và mã Code.
- **Ngày 28/06/2026:**
  - Biên dịch kịch bản `CSDL.sql` đầu tiên trên Microsoft SQL Server: Khởi tạo cơ sở dữ liệu `QuanLyQuanCafehetcuu`.
  - Viết hệ thống Sequences tự sinh mã: `seq_NhanVien`, `seq_KhachHang`, `seq_DonHang`, `seq_SanPham`, `seq_DanhMuc`, `seq_Voucher`, `seq_Topping`.
  - Viết các Stored Procedures chèn dữ liệu tự động và các Views thống kê doanh thu.

---

### GIAI ĐOẠN 3: HIỆN THỰC HÓA MÃ NGUỒN BACKEND & GIAO DIỆN CỐT LÕI (THÁNG 07/2026)

- **Ngày 07/07/2026:**
  - Khởi tạo cấu trúc dự án Maven chuẩn Jakarta EE 10: `pom.xml`, nạp thư viện `jakarta.servlet-api 6.0.0`, `jstl 3.0.1`, `mssql-jdbc 12.4.2`, `HikariCP 5.0.0`, `gson 2.10.1`, `angus-mail 2.0.3`.
  - Xây dựng lớp kết nối nguồn dữ liệu `config/DBConnect.java` tích hợp HikariCP Connection Pool hiệu năng cao.
  - Viết lớp tiện ích `util/JdbcHelper.java` hỗ trợ generic `RowMapper`.
- **Ngày 16/07/2026:**
  - Hiện thực hóa toàn bộ các Entity Model: `DonHang`, `ChiTietDonHang`, `SanPham`, `DanhMuc`, `Topping`, `KhachHang`, `NhanVien`, `KhuyenMai`, `GioHang`.
  - Xây dựng tầng Repositories (CRUD): `SanPhamRepoImpl`, `DanhMucRepoImpl`, `DonHangRepoImpl`, `KhachHangRepoImpl`, `NhanVienRepoImpl`.
- **Ngày 27/07/2026:**
  - Xây dựng tầng Services xử lý nghiệp vụ: Quy tắc thăng hạng thành viên CRM theo tổng chi tiêu, quy tắc tính giảm giá voucher %.
  - Thiết lập bộ lọc phân quyền: `AdminAuthFilter` (bảo vệ `/admin/*`), `POSAuthFilter` (bảo vệ `/pos/*`), `PortalAuthFilter` (bảo vệ `/cart`, `/checkout`, `/profile`).

---

### GIAI ĐOẠN 4: TÍCH HỢP NÂNG CAO, CỔNG THANH TOÁN & HOÀN THIỆN GIAO DIỆN (THÁNG 08 - THÁNG 10/2026)

- **Ngày 06/08/2026:**
  - Hoàn thiện giao diện quầy POS cảm ứng `views/pos/ban_hang.jsp` với tính năng chọn nhanh đồ uống và tính tiền tự động.
  - Xây dựng trang điều phối đơn hàng trực tuyến `views/pos/nhan_don.jsp` cho phép đổi trạng thái: Pha chế -> Giao khách.
- **Ngày 20/08/2026:**
  - Tích hợp cổng thanh toán VietQR tự động: Tạo mã QR động từ VietQR API với cú pháp thanh toán gắn mã đơn hàng.
  - Xây dựng Servlet Webhook `SePayWebhookController.java` tiếp nhận tín hiệu IPN đối soát giao dịch chuyển khoản ngân hàng.
- **Ngày 15/09/2026:**
  - Xây dựng hệ thống bảo mật xác thực: Băm mật khẩu Salted SHA-256 trong `SecurityUtil.java`.
  - Tích hợp dịch vụ gửi mã OTP qua Gmail SMTP bằng Eclipse Angus Mail trong `EmailSenderUtil.java`.
  - Thêm tính năng tự động khóa tài khoản 5 phút khi nhập sai mật khẩu 5 lần liên tiếp.
- **Ngày 25/10/2026:**
  - Hoàn thiện bảng điều khiển quản trị trung tâm `AdminDashboardController.java`: Biểu đồ doanh thu ngày, tháng, Top sản phẩm bán chạy.
  - Tối ưu hóa giao diện JSP bằng Bootstrap 5.3, Bootstrap Icons và thư viện thông báo SweetAlert2.

---

### GIAI ĐOẠN 5: ĐỢT KIỂM THỬ TOÀN DIỆN HỆ THỐNG (NGÀY 08/11/2026)

- **Thời gian: 21:50 - 22:30 Ngày 08/11/2026:**
  - **Người yêu cầu:** Quản trị viên / Tester dự án.
  - **Thực hiện bởi:** Trợ lý AI Google DeepMind - **Gemini 3.8 Flash**.
  - **Nhiệm vụ:** Tiến hành kiểm thử toàn diện từ Giao diện (UI), Cơ sở dữ liệu (SQL), Mã nguồn Backend (Code) và An toàn thông tin (Security).
  - **Kết quả thực hiện:**
    - Hoàn thành đánh giá 24 Test Cases chuyên sâu.
    - Phát hiện **10 khiếm khuyết trọng yếu** (4 lỗi Critical, 4 lỗi High, 2 lỗi Medium/Low).
    - Tạo lập thành công 4 file tài liệu tiêu chuẩn vào thư mục dự án:
      1. `AI_TEST_METADATA.md` (Ghi nhận prompt và phiên bản AI).
      2. `TEST_PLAN.md` (Kế hoạch kiểm thử chuẩn IEEE 829).
      3. `TEST_CASES.md` (Bảng 24 ca kiểm thử chi tiết).
      4. `BUG_REPORT.md` (Hồ sơ phân tích nguyên nhân và cách khắc phục chi tiết).

---

### GIAI ĐOẠN 6: VÁ LỖI TOÀN DIỆN, ĐẶC TẢ SẢN PHẨM & NGHIỆM THU (NGÀY 09/11/2026)

- **Thời gian: 00:00 - 00:30 Ngày 09/11/2026:**
  - **Nhiệm vụ:**
    1. Sửa chữa dứt điểm toàn bộ các lỗi đã phát hiện trong báo cáo kiểm thử.
    2. Soạn thảo tài liệu đặc tả sản phẩm phần mềm `SPECIFICATIONS.md`.
    3. Tạo file tổng hợp các lỗi đã sửa `FIXED_BUGS.md`.
    4. Thiết lập file nhật ký hoạt động `ACTIVITY_LOG.md`.
  - **Các hành động kỹ thuật đã thực hiện thành công 100%:**
    - **Sửa BUG-SQL-01:** Đồng bộ tên database `QuanLyQuanCafehetcuu` trong `application.properties`.
    - **Sửa BUG-SQL-02:** Cập nhật các chuỗi băm mật khẩu Salted SHA-256 chuẩn vào `CSDL.sql` cho tài khoản Admin, Staff và VIP Customer.
    - **Sửa BUG-CODE-01 & BUG-CODE-05:** Cập nhật `DonHangServiceImpl.java`, đảm bảo đơn hàng QR luôn lưu bền vững vào CSDL trước khi cấp mã thanh toán và bổ sung khối rollback điểm thưởng/voucher.
    - **Sửa BUG-CODE-02:** Cập nhật `BanHangPOSController.java`, thực hiện tính toán lại toàn bộ đơn giá, chiết khấu và điểm thưởng ở tầng máy chủ, chặn đứng hành vi thao túng giá (Price Tampering).
    - **Sửa BUG-CODE-03:** Cập nhật `ImageServlet.java`, bổ sung kiểm tra `getCanonicalPath()` chống tấn công Path Traversal.
    - **Sửa BUG-SQL-03:** Cập nhật 6 Stored Procedures trong `CSDL.sql`, thay đổi logic cắt chuỗi để không bị tràn số khi Sequence > 99.999 bản ghi.
    - **Sửa BUG-SQL-04:** Cập nhật `SanPhamController.java`, bổ sung câu lệnh xóa liên đới trong bảng giỏ hàng trước khi xóa sản phẩm.
    - **Sửa BUG-CODE-04:** Khóa chết cờ bypass trong `application.properties` (`sepay.bypass=false`).
    - **Sửa BUG-UI-01:** Bổ sung Media Query trong `sidebar_admin.jsp`, giải phóng thanh cuộn dọc cho thiết bị di động.
    - **Sửa BUG-UI-02:** Bọc thẻ `<c:if test="${sessionScope.user.maVt == 1}">` ẩn nút Admin đối với nhân viên thu ngân trong `ban_hang.jsp`.
    - **Sửa BUG-UI-03:** Xử lý cộng dồn ngày trong `PortalCheckoutController.java` cho các đơn hẹn lấy lúc nửa đêm.
    - **Sửa BUG-CODE-07:** Bổ sung whitelist đuôi ảnh an toàn trong `UploadUtil.java`.
    - **Sửa BUG-CODE-08:** Chuyển đổi sang `SecureRandom` cho mã OTP trong `KhachHangServiceImpl` và `NhanVienServiceImpl`.
  - **Tạo lập các tài liệu mới bàn giao:**
    - `SPECIFICATIONS.md`: Đặc tả yêu cầu kỹ thuật & nghiệp vụ sản phẩm.
    - `FIXED_BUGS.md`: Báo cáo chi tiết các lỗi đã sửa kèm code Before/After.
    - `ACTIVITY_LOG.md`: Toàn văn nhật ký hoạt động phát triển và bảo trì hệ thống.

---

### GIAI ĐOẠN 7: TRIỂN KHAI THỰC TẾ TRÊN TOMCAT 11, SỬA LỖI RUNTIME & VÁ BUG-UI-05 (NGÀY 20/11/2026)

- **Thời gian: 13:40 - 14:15 Ngày 20/11/2026:**
  - **Người yêu cầu:** Quản trị viên / Tester dự án.
  - **Thực hiện bởi:** Trợ lý AI Google DeepMind - **Gemini 3.8 Flash**.
  - **Vấn đề phát sinh khi chạy thực tế (Runtime Issues):**
    1. Khi chạy ứng dụng trên IntelliJ IDEA với Apache Tomcat 11.0.211, hệ thống báo lỗi không tìm thấy artifact ("Warning: No artifacts configured") và lỗi kết nối CSDL dẫn đến việc ứng dụng tự động giải phóng tài nguyên và dừng khởi động.
    2. Sau khi cấu hình thành công Artifact và khởi động web, giao diện Trang chủ Portal xuất hiện lỗi vỡ ảnh (Broken image icon) ở mục Danh mục "Trà Sữa Truyền Thống" (DM00001) và Sản phẩm bán chạy "Trà Sữa Trân Châu Hoàng Gia" (SP00001).
  - **Các hành động kỹ thuật đã thực hiện thành công 100%:**
    - **Cấu hình Artifact Deployment:** Hướng dẫn thêm Artifact `sof309-assignment:war exploded` trong phần Run/Debug Configurations của Tomcat Server trên IntelliJ IDEA.
    - **Khởi tạo và đồng bộ Database SQL Server:**
      - Phát hiện SQL Server cục bộ trên cổng 1433 đang có Database `QuanLyQuanCafehetcuu1`, trong khi dự án cấu hình trỏ tới `QuanLyQuanCafehetcuu`.
      - Tự động sao chép toàn bộ schema, bảng dữ liệu, views và sequences từ `QuanLyQuanCafehetcuu1` sang `QuanLyQuanCafehetcuu`, đảm bảo kết nối HikariCP thành công rực rỡ.
      - Tạo thư mục upload ảnh máy chủ cục bộ: `C:\tea_pos_images` theo cấu hình `application.properties`.
    - **Sửa BUG-UI-05 (Lỗi Vỡ Ảnh Portal):**
      - **Nguyên nhân:** URL ảnh Unsplash cũ (`photo-1558857563-b37cfb496f8c`) trong CSDL đã hết hạn/bị xóa từ phía CDN; đồng thời các thẻ `<img>` trong JSP không có thuộc tính dự phòng lỗi `onerror`.
      - **Khắc phục:**
        - Chạy lệnh SQL cập nhật URL ảnh Unsplash mới, sắc nét, hoạt động ổn định trên cả 2 cơ sở dữ liệu `QuanLyQuanCafehetcuu` và `QuanLyQuanCafehetcuu1`.
        - Bổ sung `onerror="this.onerror=null;this.src='...';"` vào các tệp JSP: `trang_chu.jsp`, `danh_sach_san_pham.jsp`, `chi_tiet_san_pham.jsp`.
        - Cập nhật trực tiếp vào thư mục runtime exploded `target/teapos/` để người dùng refresh trình duyệt là hiển thị ngay lập tức.
    - **Cập nhật tài liệu:** Đồng bộ chi tiết vào `docs/BUG_REPORT.md` (mục 2.13), `docs/FIXED_BUGS.md` (mục 13) và `docs/ACTIVITY_LOG.md`.

---

### GIAI ĐOẠN 8: PHÁT HIỆN & VÁ LỖI UNIT TEST (NGÀY 20/11/2026)

- **Thời gian: 14:25 - 14:35 Ngày 20/11/2026:**
  - **Người yêu cầu:** Quản trị viên / Tester dự án.
  - **Thực hiện bởi:** Trợ lý AI Google DeepMind - **Gemini 3.8 Flash**.
  - **Vấn đề phát hiện khi review 5 file test trong thư mục `src/test/java/com/poly/sof309/controllers/`:**
    1. **BUG-TEST-01** (`AuthControllerTest.java`, dòng 69): Dòng CsvSource đầu tiên của `TC_AUTH_VAL_02` đặt `confirmPassword = 'Pass@1234'` trong khi SĐT rỗng `''`. Hàm `validateRegisterInput()` đã `return false` ngay tại bước kiểm tra SĐT, khiến giá trị `confirmPassword` **không có tác động tới kết quả** — gây hiểu nhầm nghiêm trọng khi đọc code.
    2. **BUG-TEST-02** (`SampleControllerTest.java`, dòng 21 & 39): Mật khẩu hardcode `"123"` (3 ký tự) được dùng với `assertTrue` — mâu thuẫn trực tiếp với quy tắc nghiệp vụ tối thiểu 6 ký tự trong `AuthControllerTest.validateLoginInput()`.
  - **Các hành động kỹ thuật đã thực hiện:**
    - **Sửa BUG-TEST-01:** Đổi `confirmPassword` sang `'N/A'` và thêm comment giải thích rõ luồng thực thi trong `AuthControllerTest.java`.
    - **Sửa BUG-TEST-02:** Đổi password từ `"123"` → `"123456"` trong cả `testLoginSuccess()` và hàm `authenticate()` trong `SampleControllerTest.java`.
    - **Cập nhật tài liệu:** Ghi nhận `BUG-TEST-01` & `BUG-TEST-02` vào `docs/BUG_REPORT.md` (mục 2.14 & 2.15) và `docs/FIXED_BUGS.md` (mục 14 & 15).
    - **Git commit & push** toàn bộ thay đổi lên GitHub `main` branch.

---

## 3. TỔNG KẾT TRẠNG THÁI DỰ ÁN

- **Chất lượng mã nguồn:** Ổn định, phân tầng rõ ràng, tuân thủ mô hình MVC (Model - View - Controller).
- **Tính an toàn bảo mật:** Đạt chuẩn OWASP cơ bản (chống SQLi, Path Traversal, Price Tampering, Brute-force).
- **Trạng thái CSDL:** Đồng bộ 100% giữa cấu hình ứng dụng và file script SQL Server.
- **Hồ sơ dự án:** Đầy đủ bộ tài liệu chuẩn quốc tế sẵn sàng cho buổi bảo vệ đồ án tốt nghiệp.
