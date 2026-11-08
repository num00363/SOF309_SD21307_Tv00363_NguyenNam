# KẾ HOẠCH KIỂM THỬ TOÀN DIỆN HỆ THỐNG TEA POS (TEST PLAN)
**Dự án:** Hệ Thống Quản Lý Quán Trà Sữa & Cafe Bán Lẻ (TEA POS & Customer Portal)  
**Tổ chức thực hiện:** Nhóm Dự Án CodeDevSquad  
**Tiêu chuẩn áp dụng:** IEEE 829 & ISTQB Foundation / Advanced Level  
**Phiên bản tài liệu:** 1.0.0  
**Ngày phát hành:** 08/11/2026  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIỂM THỬ (OVERVIEW & OBJECTIVES)

### 1.1. Bối cảnh dự án
Hệ thống TEA POS là giải pháp phần mềm quản trị toàn diện dành cho chuỗi cửa hàng trà sữa và đồ uống, bao gồm 3 phân hệ chính:
1. **Portal Khách hàng (Customer Web Portal):** Xem menu, cá nhân hóa đá/đường/toppings, đặt hàng nhận tại quán (Click & Collect), thanh toán VietQR tự động qua SePay, tích điểm CRM và áp dụng mã giảm giá.
2. **Quầy Thu Ngân Bán Lẻ (POS System):** Giao diện bán hàng trực tiếp tại quầy tốc độ cao cho nhân viên thu ngân, nhận và điều phối đơn online từ khách hàng, tạo nhanh hồ sơ thành viên và tra cứu hóa đơn.
3. **Phân Hệ Quản Trị Trung Tâm (Admin Dashboard):** Báo cáo doanh thu thời gian thực, quản lý danh mục đồ uống, biến thể kích cỡ ly (S/M/L), kho toppings ăn kèm, chương trình khuyến mãi voucher và nhật ký kiểm toán hộp đen (Audit Trail).

### 1.2. Mục tiêu kiểm thử
- **Xác thực chức năng (Functional Verification):** Đảm bảo 100% các tính năng nghiệp vụ từ quầy bán hàng, giỏ hàng, đặt hàng, thanh toán đến quản trị vận hành chính xác theo đúng đặc tả yêu cầu nghiệp vụ (SRS).
- **Kiểm thử tính toàn vẹn dữ liệu (Data Integrity & SQL Testing):** Đảm bảo các cấu trúc bảng, ràng buộc khóa ngoại (Foreign Keys), Sequences, Stored Procedures, Views thống kê và Transaction ACID trong Microsoft SQL Server hoạt động đồng nhất, không gây mất mát dữ liệu hoặc lỗi deadlock.
- **Kiểm tra chất lượng mã nguồn & Kiến trúc (Code Quality & Architecture Review):** Rà soát các tầng Controller (Jakarta Servlet 6.0), Filter phân quyền, Service, Repository (JDBC) và HikariCP Connection Pool; phát hiện lỗi rò rỉ tài nguyên, lỗi logic, nuốt ngoại lệ (exception swallowing) và vấn đề N+1 query.
- **Đánh giá an toàn thông tin (Security Testing - OWASP Top 10):** Phát hiện các lỗ hổng bảo mật nghiêm trọng như SQL Injection, Price Tampering (thao túng giá), Path Traversal (đọc file tùy ý), Hardcoded Secrets (lộ mật khẩu/token trong mã nguồn), Unrestricted File Upload và rủi ro Authentication/Authorization bypass.
- **Kiểm thử giao diện & Trải nghiệm (UI/UX & Cross-Device Compatibility):** Kiểm tra độ tương thích giao diện trên màn hình desktop, tablet và mobile; phát hiện các lỗi tràn bố cục (overflow locking), nút bấm sai quyền hạn hoặc thiếu phản hồi trực quan.

---

## 2. PHẠM VI KIỂM THỬ (TEST SCOPE)

### 2.1. Các hạng mục trong phạm vi kiểm thử (In-Scope)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHẠM VI KIỂM THỬ TOÀN DIỆN TEA POS                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[GIAO DIỆN (UI/UX)]          [CƠ SỞ DỮ LIỆU (SQL)]          [MÃ NGUỒN (CODE)]
• Portal Khách Hàng          • Script Khởi Tạo CSDL         • Bộ Lọc Bảo Mật (Filters)
  - Trang chủ & Menu           - Bảng & Ràng Buộc Khóa      • Bộ Điều Hướng (Servlets)
  - Giỏ hàng & Toppings        - Hệ thống Sequences         • Tầng Nghiệp Vụ (Services)
  - Đặt hàng & Hẹn giờ         - Stored Procedures          • Tầng Truy Vấn (Repositories)
  - Thanh toán VietQR          - Views Thống Kê             • Kết Nối CSDL (HikariCP)
• Màn Hình POS Thu Ngân      • Dữ Liệu Khởi Tạo (Seed)      • Xử Lý Tải Tệp (UploadUtil)
  - Lưới chọn món nhanh      • Quản Lý Transaction ACID     • Xác Thực & Băm Mật Khẩu
  - Tìm & Tạo khách hàng     • Tối Ưu Hóa Index             • Tích Hợp Webhook SePay
• Quản Trị Hệ Thống (Admin)                                 • Gửi Mã OTP Qua Email
  - Báo cáo thống kê
  - Quản lý SP, DM, Voucher
```

#### A. Phân hệ Giao diện người dùng (UI / UX Testing)
- **Portal Khách hàng:** Giao diện Responsive (Desktop/Tablet/Mobile), thao tác thêm đồ uống vào giỏ, chọn dung lượng đá/đường/toppings, hiển thị giá theo kích cỡ, thao tác điều chỉnh số lượng realtime, áp dụng voucher và đồng hồ đếm ngược chờ thanh toán QR.
- **Quầy Thu Ngân POS:** Bố cục chia cột sản phẩm và hóa đơn, tìm kiếm đồ uống tức thì, modal thêm nhanh khách hàng mới, modal đổi mật khẩu/thông tin cá nhân của thu ngân, hiển thị thông báo SweetAlert2.
- **Admin Dashboard:** Biểu đồ doanh thu, menu thanh bên (Sidebar navigation), form tải lên hình ảnh sản phẩm, bảng quản lý nhân viên, danh mục và voucher khuyến mãi.

#### B. Phân hệ Cơ sở dữ liệu (Database & SQL Testing)
- **Tập lệnh `CSDL.sql`:** Cấu trúc 19 bảng vật lý, khóa chính (Primary Key), khóa ngoại (Foreign Key), ràng buộc `CHECK`, `DEFAULT`, `UNIQUE`.
- **Hệ thống Sequences:** Hoạt động của `seq_NhanVien`, `seq_KhachHang`, `seq_DonHang`, `seq_SanPham`, `seq_DanhMuc`, `seq_Voucher`, `seq_Topping`.
- **Stored Procedures:** Kiểm tra cú pháp và kết quả trả về của `sp_ThemSanPham`, `sp_ThemDanhMuc`, `sp_ThemVoucher`, `sp_ThemNhanVien`, `sp_ThemKhachHang`, `sp_ThemTopping`, `sp_ThanhToanDonHang`.
- **Views Phân tích:** Độ chính xác tính toán của `vw_DoanhThuNgay`, `vw_DoanhThuThang`, `vw_TopSanPham`, `vw_TopNhanVien`, `vw_DoanhThuTheoDanhMuc`.
- **Dữ liệu mẫu (Seed Data):** Tính hợp lệ của tài khoản quản lý, thu ngân, khách VIP và các sản phẩm mẫu.

#### C. Phân hệ Mã nguồn & Kiến trúc Backend (Code & Logic Testing)
- **Tầng Controller / Servlet:** Ánh xạ URL (`@WebServlet`), tiếp nhận và xác thực dữ liệu đầu vào (Input Sanitization), điều hướng `forward`/`redirect`, sinh mã JSON API.
- **Tầng Filter Bảo mật:** `AdminAuthFilter` (kiểm tra Role Admin = 1), `POSAuthFilter` (kiểm tra Role Staff/Admin = 1 hoặc 2), `PortalAuthFilter` (bảo vệ giỏ hàng và thanh toán thành viên), `UTF8EncodingFilter`.
- **Tầng Service & Nghiệp vụ:** Quy trình đặt hàng trực tuyến, quy trình bán hàng tại quầy POS, quy tắc tính tiền giảm giá Voucher, quy tắc trừ điểm và thăng hạng thành viên CRM, xử lý mã OTP đăng ký / quên mật khẩu.
- **Tầng Repository & JDBC:** Thực thi câu lệnh SQL qua `JdbcHelper`, quản lý kết nối từ `DBConnect` (HikariCP Connection Pool), xử lý ánh xạ hàng `RowMapper`.
- **Tích hợp bên ngoài:** Webhook SePay xử lý tự động xác nhận chuyển khoản, VietQR phát sinh mã QR chuyển khoản động, Angus Mail gửi email OTP qua giao thức SMTP.

#### D. Kiểm thử An toàn thông tin (Security Testing)
- Kiểm tra tính chống tiêm lệnh SQL (SQL Injection).
- Kiểm tra tính chống thao túng giá tiền và chiết khấu (Price / Parameter Tampering).
- Kiểm tra nguy cơ duyệt và đọc tệp tùy ý (Directory / Path Traversal).
- Kiểm tra cơ chế mã hóa và băm mật khẩu kèm muối (Salted SHA-256 Hashing).
- Kiểm tra nguy cơ tấn công chiếm quyền / giả mạo webhook (Webhook Authentication Bypass).
- Kiểm tra việc bảo vệ các thông tin bí mật (API Tokens, App Passwords, Database Credentials).

### 2.2. Các hạng mục ngoài phạm vi (Out-of-Scope)
- Kiểm thử tích hợp vật lý với thiết bị phần cứng máy in hóa đơn nhiệt qua cổng USB/LAN (ESC/POS Printer Hardware).
- Kiểm thử tích hợp két đựng tiền đóng mở tự động (Cash Drawer Hardware Trigger).

---

## 3. MÔI TRƯỜNG KIỂM THỬ (TEST ENVIRONMENT)

| Thành Phần | Cấu Hình / Phiên Bản Chi Tiết |
|:---|:---|
| **Hệ Điều Hành** | Windows 11 Pro 64-bit / Windows Server 2022 |
| **Nền Tảng Java (JDK)** | Java Development Kit 17 LTS / OpenJDK 25.0.2 |
| **Máy Chủ Web / Servlet Container** | Apache Tomcat 10.1.x (Hỗ trợ chuẩn Jakarta EE 10 / Servlet 6.0, JSP 3.1, JSTL 3.0) |
| **Hệ Quản Trị Cơ Sở Dữ Liệu** | Microsoft SQL Server 2019 / 2022 Developer Edition |
| **Thư Viện Kết Nối & Pool** | Microsoft JDBC Driver for SQL Server 12.4.2 + HikariCP 5.0.0 |
| **Công Cụ Thao Tác & Phân Tích** | SQL Server Management Studio (SSMS) 19.x, IntelliJ IDEA 2024.x, Google Chrome DevTools |
| **Dịch Vụ Cổng Thanh Toán** | Cổng đối soát tự động SePay Webhook Sandbox & VietQR API Service |
| **Dịch Vụ Thư Điện Tử** | Google Gmail SMTP Server (Cổng 587, StartTLS, App Password Authentication) |

---

## 4. CHIẾN LƯỢC VÀ PHƯƠNG PHÁP KIỂM THỬ (TEST STRATEGY & METHODOLOGY)

```
        ┌────────────────────────────────────────────────────────┐
        │            CÁC TẦNG CHIẾN LƯỢC KIỂM THỬ                │
        └───────────────────────────┬────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[WHITE-BOX CODE AUDIT]    [BLACK-BOX FLOW TESTING]     [SECURITY PENETRATION]
• Rà soát từng dòng code  • Kiểm thử hộp đen chức năng • Kiểm tra OWASP Top 10
• Phân tích cú pháp SQL   • Luồng đặt hàng từ A-Z      • Tấn công thao túng tham số
• Kiểm tra rò rỉ bộ nhớ   • Kiểm thử phân quyền truy cập• Khảo sát lộ lọt Secret Key
• Phân tích Transaction   • Kiểm thử tải giao dịch POS • Đọc file tùy ý qua Path Traversal
```

1. **Phương pháp Kiểm thử Hộp trắng (White-box Static Code Audit):**
   - Đọc trực tiếp toàn bộ mã nguồn Java của các Controller, Service, Repository, Filter, Utility.
   - Truy vết các luồng dữ liệu nhạy cảm (Data Flow Analysis), luồng giao dịch tài chính (Financial Flows) và các khối lệnh `try-catch` nuốt ngoại lệ.
   - So sánh ánh xạ kiểu dữ liệu giữa các thực thể Entity Java và các cột dữ liệu trong `CSDL.sql`.
2. **Phương pháp Kiểm thử Hộp đen (Black-box Functional & Integration Testing):**
   - Thiết lập các ca kiểm thử đầu vào - đầu ra cho từng nghiệp vụ (Đăng ký -> Nhận OTP -> Kích hoạt tài khoản -> Thêm món vào giỏ -> Áp dụng mã VIP -> Đặt hàng -> Chuyển khoản QR -> Quầy duyệt -> Pha chế -> Hoàn thành).
   - Kiểm tra các trường hợp biên (Boundary Value Analysis): Giỏ hàng rỗng, đặt hàng lúc 23:59 hẹn 00:15, áp dụng voucher với đơn hàng sát mốc tối thiểu.
3. **Phương pháp Kiểm thử An toàn thông tin (Security & Penetration Testing):**
   - Tấn công thử nghiệm Path Traversal bằng các chuỗi `../../`.
   - Kiểm tra khả năng gửi Webhook giả mạo với cờ `sepay.bypass=true`.
   - Kiểm tra can thiệp sửa đổi giá trị tham số `tongPhaiTra` gửi lên từ trình duyệt.
   - Xác minh thuật toán băm mật khẩu và rủi ro tấn công dự đoán mã OTP (`java.util.Random`).

---

## 5. MA TRẬN TRÁCH NHIỆM VÀ PHÂN ĐỊNH KHU VỰC KIỂM THỬ

| Nhóm Kiểm Thử | Khu Vực / Module Phụ Trách | Mục Tiêu Chính |
|:---|:---|:---|
| **SQL & Database** | `CSDL.sql`, `DBConnect.java`, HikariCP | Tính đồng bộ tên DB, toàn vẹn khóa ngoại, sinh mã Sequence, Views thống kê |
| **Authentication & IAM** | `LoginController`, `RegisterController`, `SecurityUtil`, `NhanVienService` | Cơ chế băm mật khẩu, khóa tài khoản chống brute-force, gửi nhận OTP |
| **Order & POS Flow** | `BanHangPOSController`, `NhanDonOnlineController`, `DonHangService` | Tính toán tiền hàng, lưu trữ đơn hàng, chống gian lận giá, N+1 query |
| **Customer Portal** | `PortalCartController`, `PortalCheckoutController`, `thanh_toan_qr.jsp` | Giỏ hàng, tính chiết khấu voucher, tích điểm CRM, lưu trữ đơn QR |
| **System & Security** | `UploadUtil`, `ImageServlet`, `SePayWebhookController`, `application.properties` | Đọc file tùy ý, upload file độc hại, lộ bí mật hệ thống, phân quyền Filter |

---

## 6. TIÊU CHÍ ĐÁNH GIÁ ĐẠT / KHÔNG ĐẠT (PASS / FAIL CRITERIA)

### 6.1. Tiêu chí Đạt (Pass Criteria)
- 100% các ca kiểm thử cấp độ Critical và High phải ở trạng thái **PASS**.
- Không có bất kỳ ngoại lệ `SQLException`, `NullPointerException` hoặc `ClassNotFoundException` nào xảy ra trong quá trình vận hành luồng chuẩn.
- Dữ liệu tài chính (tiền hàng, giảm giá, điểm thưởng) phải chính xác tuyệt đối ở cấp độ cơ sở dữ liệu.
- Mọi tài khoản trong dữ liệu mẫu (Admin, Staff, Customer) phải đăng nhập thành công.

### 6.2. Tiêu chí Không đạt (Fail Criteria)
- Phát hiện bất kỳ lỗi nào làm ứng dụng không thể khởi động (Blocker) hoặc làm người dùng không thể đăng nhập vào hệ thống.
- Phát hiện lỗi hổng bảo mật cho phép thao túng giá tiền hoặc đọc file tùy ý trên máy chủ.
- Dữ liệu đơn hàng hoặc giỏ hàng bị mất khi máy chủ khởi động lại.
- Tên cơ sở dữ liệu giữa cấu hình và mã SQL không khớp nhau.

### 6.3. Tiêu chí Kết thúc kiểm thử (Suspension & Exit Criteria)
- Đợt kiểm thử bị tạm dừng nếu Cơ sở dữ liệu không thể kết nối hoặc tài khoản quản trị không thể đăng nhập.
- Kiểm thử được coi là hoàn tất khi toàn bộ các khiếm khuyết được lập hồ sơ báo cáo chi tiết kèm giải pháp khắc phục.

---

## 7. QUY TRÌNH QUẢN LÝ KHIẾM KHUYẾT (DEFECT MANAGEMENT PROCESS)

Khi phát hiện lỗi (Bug), Tester tiến hành phân loại theo 4 cấp độ nghiêm trọng:
1. **Critical (Khẩn cấp / Chặn hệ thống):** Lỗi khiến hệ thống không khởi động được, tê liệt tính năng chính, mất mát dữ liệu hoặc rủi ro bảo mật nghiêm trọng cho phép thao túng tiền tệ / đọc file hệ điều hành.
2. **High (Nghiêm trọng):** Lỗi logic nghiệp vụ lớn, giao dịch không được hoàn tác khi lỗi, tràn bộ đếm ID, hỏng layout cuộn trang.
3. **Medium (Trung bình):** Vấn đề hiệu năng N+1 query, thiếu index, lộ giao diện sai vai trò, thiếu kiểm tra đuôi file tải lên.
4. **Low (Thấp / Gợi ý cải tiến):** Nuốt ngoại lệ log, thiếu chú thích code, không đồng nhất phiên bản file cấu hình.

Mọi lỗi phát hiện đều được ghi chép chi tiết vào tệp `BUG_REPORT.md` đi kèm vị trí file, dòng code, nguyên nhân gốc rễ và mã nguồn sửa lỗi chi tiết.
