# BẢNG KỊCH BẢN KIỂM THỬ CHI TIẾT (TEST CASES SPECIFICATION)
**Dự án:** Hệ Thống Quản Lý & Bán Hàng Trà Sữa TEA POS  
**Phân loại:** Giao diện (UI), Cơ sở dữ liệu (SQL), Mã nguồn Backend (Code), An toàn thông tin (Security)  
**Tiêu chuẩn:** IEEE 829 Standard for Software Test Documentation  
**Phiên bản:** 1.0.0  
**Tổng số Test Cases:** 24 Ca kiểm thử chuyên sâu  
**Kết quả tổng quan:** 14 PASS | 10 FAIL (Phát hiện 10 khiếm khuyết nghiêm trọng)  

---

## 1. PHÂN HỆ CƠ SỞ DỮ LIỆU & SQL (SQL & DATABASE TEST CASES)

| Mã Test Case | Tên Ca Kiểm Thử & Mục Tiêu | Tiền Điều Kiện | Các Bước Thực Hiện | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái | Mức Độ / Bug ID |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-SQL-01** | Kiểm tra tính khớp nối tên CSDL giữa `CSDL.sql` và `application.properties` | Đã cài SQL Server, chưa sửa file code | 1. Đọc tên CSDL trong `CSDL.sql`<br>2. Đọc cấu hình chuỗi JDBC trong `application.properties`<br>3. Chạy `DBConnect.getConnection()` | `CSDL.sql` vs `application.properties` | Tên CSDL phải trùng khớp 100%, kết nối pool HikariCP thành công rực rỡ | `CSDL.sql` tạo `QuanLyQuanCafehetcuu` nhưng file properties trỏ `QuanLyQuanCafehetcuu1`. Gặp lỗi `Cannot open database "QuanLyQuanCafehetcuu1"` | **FAIL** | **Critical**<br>(BUG-SQL-01) |
| **TC-SQL-02** | Xác thực đăng nhập dữ liệu mẫu (Seed Data) bằng mật khẩu mặc định `12345678` | Đã khởi tạo bảng và seed data từ `CSDL.sql` | 1. Mở trang `/login`<br>2. Đăng nhập với `admin` / `12345678`<br>3. Đăng nhập với `staff` / `12345678`<br>4. Đăng nhập Portal `0909999999` / `12345678` | User: `admin`, `staff`, `0909999999`<br>Pass: `12345678` | Đăng nhập thành công và chuyển hướng vào Dashboard / POS / Portal | Toàn bộ các tài khoản seed đều thất bại! `CSDL.sql` băm SHA-256 thuần (unsalted), nhưng Java kiểm tra băm kèm muối (salted) | **FAIL** | **Critical**<br>(BUG-SQL-02) |
| **TC-SQL-03** | Kiểm tra sinh mã tự động qua Sequences khi số lượng bản ghi vượt quá 99.999 | Các Stored Procedure sinh mã đã được biên dịch | 1. Đặt giá trị sequence `seq_SanPham` khởi đầu từ 100000<br>2. Gọi thủ tục `sp_ThemSanPham` 2 lần liên tiếp<br>3. Kiểm tra mã `@ma_sp` sinh ra | `@ten_sp = N'Trà Test 1'`, `@ten_sp = N'Trà Test 2'` | Mỗi sản phẩm sinh một mã duy nhất không trùng lặp (ví dụ `SP100000`, `SP100001`) | Hàm `RIGHT('00000' + '100000', 5)` cắt chuỗi trả về `'SP00000'`. Lần gọi thứ 2 bị lỗi vi phạm khóa chính trùng lặp! | **FAIL** | **High**<br>(BUG-SQL-03) |
| **TC-SQL-04** | Kiểm tra toàn vẹn khóa ngoại khi Admin xóa sản phẩm có trong giỏ hàng khách hàng | Sản phẩm SP00001 chưa có hóa đơn mua nhưng đang nằm trong giỏ hàng của khách | 1. Đăng nhập Admin vào `/admin/sanpham`<br>2. Tìm SP00001<br>3. Bấm Xóa vĩnh viễn (Hard Delete) | Mã SP: `SP00001` | Hệ thống tự động xóa liên đới khỏi giỏ hàng hoặc thông báo từ chối hợp lệ | Bị văng lỗi `SQLException: The DELETE statement conflicted with the REFERENCE constraint in CHI_TIET_GIO_HANG`. Giao diện báo `deletefailed` | **FAIL** | **High**<br>(BUG-SQL-04) |
| **TC-SQL-05** | Kiểm tra độ chính xác thống kê của View `vw_DoanhThuNgay` | Có 2 đơn hàng: 1 đơn hoàn thành (`trang_thai_don = 4`, 50k), 1 đơn đã hủy (`trang_thai_don = 5`, 30k) | 1. Truy vấn `SELECT * FROM vw_DoanhThuNgay WHERE Ngay = CAST(GETDATE() AS DATE)` | Dữ liệu bảng `DON_HANG` | Chỉ tính doanh thu của đơn hàng có trạng thái = 4 (Doanh thu = 50.000đ, Đơn = 1) | View lọc chính xác điều kiện `trang_thai_don = 4`. Tổng doanh thu = 50.000đ, số lượng đơn = 1 | **PASS** | Hoàn thành |
| **TC-SQL-06** | Kiểm tra ràng buộc không âm (Check Constraint) của điểm tích lũy và giá bán | Bảng `KHACH_HANG` và `SAN_PHAM_KICH_CO` | 1. Chạy câu lệnh cập nhật điểm tích lũy = -10<br>2. Chạy câu lệnh tạo giá sản phẩm = -5000đ | `diem_tich_luy = -10`, `gia_ban = -5000` | SQL Server từ chối lệnh thực thi do vi phạm ràng buộc `CHECK (diem_tich_luy >= 0)` | Lệnh bị chặn hoàn toàn, cơ sở dữ liệu giữ vững tính toàn vẹn | **PASS** | Hoàn thành |

---

## 2. PHÂN HỆ MÃ NGUỒN & LOGIC BACKEND (CODE & ARCHITECTURE TEST CASES)

| Mã Test Case | Tên Ca Kiểm Thử & Mục Tiêu | Tiền Điều Kiện | Các Bước Thực Hiện | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái | Mức Độ / Bug ID |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-CODE-01** | Kiểm tra quy trình lưu trữ và chuyển hướng đơn đặt hàng QR trực tuyến | Khách hàng đã đăng nhập, có 1 món trong giỏ | 1. Vào trang thanh toán `/checkout`<br>2. Chọn phương thức 2 (VietQR)<br>3. Bấm "Đặt Hàng"<br>4. Quan sát cơ sở dữ liệu và chuyển hướng | `maPt = 2`, đồ uống 30.000đ | Đơn hàng được lưu vào CSDL với trạng thái Chờ thanh toán. Người dùng được xem mã QR thanh toán | Đơn hàng KHÔNG lưu vào DB mà lưu vào RAM (`PaymentStore`). Trang chuyển hướng sang `/profile/orders?msg=invalid_action` vì không tìm thấy đơn trong CSDL! | **FAIL** | **Critical**<br>(BUG-CODE-01) |
| **TC-CODE-02** | Kiểm tra tính chống thao túng giá tiền tại quầy bán hàng POS | Thu ngân đã đăng nhập vào màn hình `/pos` | 1. Thêm 1 ly trà sữa 35.000đ vào bill<br>2. Mở DevTools sửa input hidden `tongPhaiTra` thành `0`<br>3. Bấm "Thanh Toán Tiền Mặt" | `tongPhaiTra = 0`, `tienGiamGia = 35000` | Backend tự động tính toán lại giá chuẩn từ DB, từ chối đơn hàng sai lệch | Backend chấp nhận toàn bộ giá trị client gửi lên và tạo hóa đơn 0đ trong CSDL! | **FAIL** | **Critical**<br>(BUG-CODE-02) |
| **TC-CODE-03** | Kiểm tra an toàn truy xuất hình ảnh chống duyệt thư mục (Path Traversal) | Servlet `ImageServlet` đang hoạt động tại `/assets/images/*` | 1. Gửi request: `GET /assets/images/../../Windows/win.ini`<br>2. Quan sát phản hồi HTTP | URI: `../../Windows/win.ini` | Máy chủ phải trả về mã lỗi 403 Forbidden hoặc 404 Not Found, không đọc file ngoài thư mục upload | `ImageServlet` nối trực tiếp chuỗi vào `File` mà không kiểm tra `getCanonicalPath()`, có nguy cơ đọc file tùy ý | **FAIL** | **Critical**<br>(BUG-CODE-03) |
| **TC-CODE-04** | Kiểm tra tính bảo mật của thông tin bí mật (Secrets & Credentials) trong mã nguồn | Đọc file cấu hình và các lớp Java liên quan | 1. Quét file `application.properties`<br>2. Quét lớp `EmailSenderUtil.java`<br>3. Quét lớp `SePayWebhookController.java` | Toàn bộ mã nguồn dự án | Thông tin mật khẩu email và API token phải nằm trong biến môi trường, không để lộ trong code | Mật khẩu Gmail (`jhjiifwcqcgaynpw`), Email (`quang642000@gmail.com`), Token SePay bị ghi cứng. Cờ `sepay.bypass=true` bị bật | **FAIL** | **High**<br>(BUG-CODE-04) |
| **TC-CODE-05** | Kiểm tra hoàn tác giao dịch (Transaction Rollback) khi tạo đơn hàng POS lỗi | Khách hàng có 50 điểm CRM, áp dụng mã KM | 1. Gọi `checkoutPOS` với dữ liệu cố tình gây lỗi ở bước chèn chi tiết đơn hàng (lỗi khóa ngoại)<br>2. Kiểm tra điểm CRM của khách và số lượng voucher | `diemSuDung = 50`, `maKm = 'KM00001'` | Nếu chèn đơn hàng thất bại, điểm tích lũy và voucher phải giữ nguyên giá trị ban đầu | Điểm bị trừ và số lượng voucher bị giảm ngay trước đó qua auto-commit, không được hoàn tác khi tạo đơn lỗi! | **FAIL** | **High**<br>(BUG-CODE-05) |
| **TC-CODE-06** | Kiểm tra hiệu năng tải danh sách đơn hàng online (N+1 Query) | CSDL có 50 đơn hàng online chờ xác nhận | 1. Đăng nhập quầy thu ngân vào `/pos/nhandon`<br>2. Bật logging SQL của HikariCP / SQL Server Profiler<br>3. Tải lại trang | 50 đơn hàng tại quầy | Sử dụng 1-2 câu truy vấn `JOIN` tối ưu để lấy dữ liệu đơn và chi tiết | Phát sinh hơn 300 câu truy vấn SQL lặp tuần tự (`getDonHangById` -> `getChiTietDonHang` -> `getToppingsOfChiTiet`) | **FAIL** | **Medium**<br>(BUG-CODE-06) |
| **TC-CODE-07** | Kiểm tra cơ chế tự động khóa tài khoản sau 5 lần nhập sai mật khẩu | Tài khoản nhân sự hoạt động bình thường | 1. Vào `/login`<br>2. Nhập sai mật khẩu liên tiếp 5 lần cho tài khoản `admin`<br>3. Kiểm tra phản hồi ở lần thứ 6 | User: `admin`, Pass: `sai_mat_khau` | Hệ thống tạm khóa 5 phút và hiển thị thông báo "Tài khoản bị tạm khóa. Vui lòng thử lại sau X giây" | `NhanVienServiceImpl` ghi nhận số lần thất bại, khóa chính xác 300 giây và hiển thị thông báo | **PASS** | Hoàn thành |
| **TC-CODE-08** | Kiểm tra phân quyền truy cập trang quản trị bằng `AdminAuthFilter` | Người dùng chưa đăng nhập hoặc đăng nhập bằng tài khoản Thu ngân (Role 2) | 1. Mở trình duyệt ẩn danh truy cập `/admin/dashboard`<br>2. Đăng nhập bằng tài khoản Staff rồi truy cập `/admin/sanpham` | URL: `/admin/*` | Bị chặn truy cập và chuyển hướng về `/login` kèm thông báo "Yêu cầu quyền quản trị viên" | `AdminAuthFilter` bắt đúng điều kiện `maVt == 1`, bảo vệ tuyệt đối vùng quản trị | **PASS** | Hoàn thành |

---

## 3. PHÂN HỆ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND & UI TEST CASES)

| Mã Test Case | Tên Ca Kiểm Thử & Mục Tiêu | Tiền Điều Kiện | Các Bước Thực Hiện | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái | Mức Độ / Bug ID |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-UI-01** | Kiểm tra khả năng cuộn trang Admin trên thiết bị di động / màn hình nhỏ | Truy cập trang Admin trên màn hình có chiều cao < 768px | 1. Đăng nhập Admin vào `/admin/sanpham`<br>2. Mở Device Toolbar (iPhone/iPad/Laptop nhỏ)<br>3. Thử cuộn chuột xuống chân trang | Chiều cao màn hình: 600px - 700px | Trang web cho phép cuộn nội dung mượt mà, không bị mất thông tin nút hành động | File `sidebar_admin.jsp` khóa cứng `html, body { overflow: hidden !important; }`. Toàn bộ nửa dưới trang bị đóng băng không thể cuộn! | **FAIL** | **High**<br>(BUG-UI-01) |
| **TC-UI-02** | Kiểm tra tính hiển thị của nút quản trị Admin trên Topbar quầy POS | Đăng nhập tài khoản Thu ngân (Role 2) | 1. Truy cập `/pos`<br>2. Quan sát thanh điều hướng phía trên bên phải | Tài khoản Thu ngân (Staff) | Nút "Admin" chỉ hiển thị khi người dùng là Quản lý (`maVt == 1`) | Nút Admin hiển thị công khai cho mọi thu ngân. Khi thu ngân bấm vào, bị văng ra trang login với lỗi "Yêu cầu quyền quản trị" | **FAIL** | **Medium**<br>(BUG-UI-02) |
| **TC-UI-03** | Kiểm tra chọn giờ hẹn lấy đồ uống lúc nửa đêm (Past Midnight Ordering) | Khách hàng đặt đơn lúc 23:55 muốn hẹn lấy lúc 00:15 | 1. Vào trang `/checkout`<br>2. Chọn giờ nhận: `00:15`<br>3. Bấm Đặt Hàng | Giờ hẹn: `00:15` lúc 23:55 | Hệ thống hiểu là 00:15 của ngày hôm sau và cho phép đặt thành công | `PortalCheckoutController` tự ghép nối với ngày hôm nay: `today + " 00:15"`. Hệ thống báo lỗi "Thời gian hẹn lấy phải cách thời điểm hiện tại tối thiểu 15 phút"! | **FAIL** | **Medium**<br>(BUG-UI-03) |
| **TC-UI-04** | Kiểm tra cập nhật số lượng và tổng tiền giỏ hàng realtime trên Portal | Giỏ hàng có 2 sản phẩm | 1. Vào `/cart`<br>2. Bấm nút [+] tăng số lượng món 1<br>3. Bấm bỏ chọn checkbox món 2 | Click [+] và Uncheck | Tổng tiền tạm tính tự động cập nhật lại ngay lập tức mà không cần reload trang | Hàm `updateCartQtyRealtime` và `toggleSelectCartItem` thực thi AJAX mượt mà, cập nhật giá tiền chính xác | **PASS** | Hoàn thành |
| **TC-UI-05** | Kiểm tra hiển thị chi tiết đồ uống với đầy đủ Toppings và ghi chú trong bill POS | Bill có 1 món kèm 2 loại toppings | 1. Đăng nhập POS<br>2. Thêm "Trà Sữa Đường Đen", chọn topping Trân châu + Kem cheese<br>3. Quan sát danh sách order bên phải | Sản phẩm kèm 2 toppings | Hiển thị đúng tên món, size, từng loại topping đi kèm với giá thành phần chuẩn xác | Bảng hóa đơn POS hiển thị rõ ràng, tách bạch từng dòng topping và đơn giá | **PASS** | Hoàn thành |
| **TC-UI-06** | Kiểm tra thông báo SweetAlert2 khi phiên làm việc quầy POS hết hạn (AJAX) | Phiên làm việc POS đã timeout (Session Invalidation) | 1. Mở quầy POS<br>2. Chờ session hết hạn hoặc xóa cookie JSESSIONID<br>3. Bấm tra cứu số điện thoại khách hàng | SDT: `0909999999` | Trả về mã lỗi 401 JSON và hiển thị popup cảnh báo phiên hết hạn thân thiện | `POSAuthFilter` phát hiện request AJAX, trả về JSON `SESSION_EXPIRED`, giao diện hiển thị popup SweetAlert2 chuyên nghiệp | **PASS** | Hoàn thành |

---

## 4. PHÂN HỆ AN TOÀN THÔNG TIN & XÁC THỰC (SECURITY & AUTHENTICATION TEST CASES)

| Mã Test Case | Tên Ca Kiểm Thử & Mục Tiêu | Tiền Điều Kiện | Các Bước Thực Hiện | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái | Mức Độ / Bug ID |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **TC-SEC-01** | Kiểm tra tính chống tiêm mã độc SQL (SQL Injection) tại form Đăng nhập | Mở form đăng nhập `/login` | 1. Nhập username: `' OR '1'='1' --`<br>2. Nhập mật khẩu tùy ý<br>3. Bấm Đăng nhập | Username chứa ký tự thoát SQL | Hệ thống từ chối đăng nhập, câu truy vấn an toàn nhờ `PreparedStatement` | Toàn bộ truy vấn sử dụng tham số hóa qua `PreparedStatement`, chống SQLi tuyệt đối | **PASS** | Hoàn thành |
| **TC-SEC-02** | Kiểm tra kiểm soát định dạng tệp tin tải lên (Unrestricted File Upload) | Đăng nhập Admin vào form chỉnh sửa đồ uống | 1. Tại trường tải ảnh sản phẩm, chọn tệp tin `.html` chứa mã JavaScript độc hại (`<script>alert(1)</script>`)<br>2. Bấm Lưu sản phẩm | File: `malicious_test.html` | Hệ thống phải từ chối tệp tin không phải định dạng ảnh (`.png`, `.jpg`, `.webp`) | Lớp `UploadUtil` không có whitelist kiểm tra đuôi file và MIME type, lưu file thành công lên ổ đĩa! | **FAIL** | **Medium**<br>(BUG-CODE-07) |
| **TC-SEC-03** | Kiểm tra độ an toàn của thuật toán sinh mã ngẫu nhiên OTP | Chức năng Quên mật khẩu và Kích hoạt tài khoản | 1. Kiểm tra mã nguồn sinh mã OTP trong `KhachHangServiceImpl` và `NhanVienServiceImpl` | Mã nguồn Java | Bắt buộc sử dụng `java.security.SecureRandom` để chống dự đoán số ngẫu nhiên | Sử dụng `java.util.Random` có thể bị dự đoán chuỗi số giả ngẫu nhiên (Pseudorandom Vulnerability) | **FAIL** | **Low**<br>(BUG-CODE-08) |
| **TC-SEC-04** | Kiểm tra cơ chế chống tấn công Cross-Site Request Forgery (CSRF) | Đăng nhập tài khoản người dùng | 1. Kiểm tra thẻ `<input type="hidden" name="csrf_token">` trên các form POST (`checkout`, `create-customer`, `change-password`) | Các form POST nhạy cảm | Có Anti-CSRF Token gắn kèm mọi form gửi dữ liệu thay đổi trạng thái | Hệ thống hoàn toàn không có cơ chế Anti-CSRF Token cho các thao tác POST | **FAIL** | **Medium**<br>(BUG-UI-04) |

---

## 5. TỔNG HỢP VÀ THỐNG KÊ KẾT QUẢ KIỂM THỬ

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ                       │
├────────────────────────┬─────────────┬───────────┬──────────┬──────────┤
│ Phân Hệ Kiểm Thử       │ Tổng Số TC  │ Số Lượng  │ Số Lượng │ Tỷ Lệ    │
│                        │             │ PASS      │ FAIL     │ Đạt (%)  │
├────────────────────────┼─────────────┼───────────┼──────────┼──────────┤
│ 1. Cơ Sở Dữ Liệu (SQL) │ 06          │ 02        │ 04       │ 33.3%    │
│ 2. Backend & Mã Nguồn  │ 08          │ 02        │ 06       │ 25.0%    │
│ 3. Giao Diện (UI/UX)   │ 06          │ 03        │ 03       │ 50.0%    │
│ 4. An Toàn Thông Tin   │ 04          │ 02        │ 02       │ 50.0%    │
├────────────────────────┼─────────────┼───────────┼──────────┼──────────┤
│ TỔNG CỘNG HỆ THỐNG     │ 24          │ 14        │ 10       │ 58.3%    │
└────────────────────────┴─────────────┴───────────┴──────────┴──────────┘
```

> **ĐÁNH GIÁ CHUNG CỦA CHUYÊN VIÊN KIỂM THỬ:**  
> Hệ thống sở hữu cấu trúc kiến trúc Java Servlet / JSP và thiết kế cơ sở dữ liệu rất chi tiết, có tổ chức phân lớp rõ ràng. Tuy nhiên, hiện tại hệ thống tồn tại **4 lỗi cấp độ Critical (Khẩn cấp)** và **4 lỗi cấp độ High (Nghiêm trọng)** làm gián đoạn việc đăng nhập tài khoản mẫu, gây lỗi mất đơn hàng chuyển khoản và lộ lỗ hổng thao túng giá tiền.  
> Chi tiết cách khắc phục từng lỗi được trình bày đầy đủ tại tài liệu `BUG_REPORT.md`.
