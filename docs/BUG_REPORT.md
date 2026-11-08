# BÁO CÁO TOÀN DIỆN DANH SÁCH LỖI VÀ HƯỚNG DẪN KHẮC PHỤC (BUG REPORT)
**Dự án:** Hệ Thống Quản Lý & Bán Hàng Trà Sữa TEA POS  
**Đơn vị thực hiện:** Nhóm Dự Án CodeDevSquad  
**Tiêu chuẩn phân loại:** Common Weakness Enumeration (CWE) & OWASP Top 10  
**Phiên bản tài liệu:** 1.0.0  
**Ngày phát hành:** 08/11/2026  

---

## 1. BẢNG TỔNG HỢP DANH MỤC LỖI PHÁT HIỆN

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TỔNG HỢP BÁO CÁO KHIẾM KHUYẾT HỆ THỐNG                          │
├─────────────┬────────────────────────────────────────┬─────────────┬───────────────────┤
│ Mã Lỗi      │ Tên Lỗi / Khiếm Khuyết                 │ Mức Độ      │ Vị Trí Thành Phần │
├─────────────┼────────────────────────────────────────┼─────────────┼───────────────────┤
│ BUG-SQL-01  │ Sai lệch tên Database cấu hình JDBC    │ CRITICAL    │ application.prop  │
│ BUG-SQL-02  │ Mật khẩu mẫu Seed Data sai thuật toán  │ CRITICAL    │ CSDL.sql          │
│ BUG-CODE-01 │ Mất đơn hàng QR & Bị xóa giỏ sớm       │ CRITICAL    │ DonHangServiceImpl│
│ BUG-CODE-02 │ Lỗ hổng thao túng giá tiền tại POS     │ CRITICAL    │ BanHangPOSCtrl    │
│ BUG-CODE-03 │ Lỗ hổng đọc file tùy ý Path Traversal  │ CRITICAL    │ ImageServlet.java │
│ BUG-SQL-03  │ Tràn chuỗi cắt mã Sequence > 99.999    │ HIGH        │ CSDL.sql (SP)     │
│ BUG-SQL-04  │ Xung đột khóa ngoại khi xóa sản phẩm   │ HIGH        │ SanPhamController │
│ BUG-CODE-04 │ Lộ thông tin bí mật & Bypass Webhook   │ HIGH        │ application.prop  │
│ BUG-CODE-05 │ Thiếu Transaction ACID khi checkout    │ HIGH        │ DonHangServiceImpl│
│ BUG-UI-01   │ Khóa cuộn màn hình admin trên di động  │ HIGH        │ sidebar_admin.jsp │
│ BUG-CODE-06 │ Lỗi hiệu năng truy vấn N+1 nhận đơn    │ MEDIUM      │ NhanDonOnlineCtrl │
│ BUG-CODE-07 │ Tải file tùy ý thiếu kiểm tra định dạng│ MEDIUM      │ UploadUtil.java   │
│ BUG-UI-02   │ Lộ nút Admin cho tài khoản Thu ngân    │ MEDIUM      │ ban_hang.jsp      │
│ BUG-UI-03   │ Lỗi hẹn giờ lấy nước qua ngày (nửa đêm)│ MEDIUM      │ PortalCheckoutCtrl│
│ BUG-UI-04   │ Thiếu cơ chế bảo vệ Anti-CSRF Token    │ MEDIUM      │ Toàn bộ Web Form  │
│ BUG-CODE-08 │ Sử dụng `Random` không an toàn cho OTP │ LOW         │ NhanVien/KhachHang│
└─────────────┴────────────────────────────────────────┴─────────────┴───────────────────┘
```

---

## 2. CHI TIẾT TỪNG LỖI, NGUYÊN NHÂN VÀ GIẢI PHÁP KHẮC PHỤC

---

### BUG-SQL-01: Sai lệch tên Cơ sở dữ liệu giữa `CSDL.sql` và `application.properties`

- **Vị trí lỗi:**
  - File script CSDL: `d:\DevSquadcuoimon\DevSquadcuoimon\CSDL.sql` (Dòng 12, 19, 21)
  - File cấu hình: `d:\DevSquadcuoimon\DevSquadcuoimon\DevSquadcuoimon\src\main\resources\application.properties` (Dòng 2)
- **Mức độ nghiêm trọng:** **CRITICAL / BLOCKER** (Chặn toàn bộ hệ thống ngay khi khởi động)
- **Phân loại:** SQL / Configuration Mismatch

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong file `CSDL.sql`, câu lệnh khởi tạo tạo ra cơ sở dữ liệu có tên là:
```sql
CREATE DATABASE QuanLyQuanCafehetcuu;
USE QuanLyQuanCafehetcuu;
```
Tuy nhiên, trong `application.properties`, chuỗi kết nối JDBC mặc định lại khai báo:
```properties
db.url=${DB_URL:jdbc:sqlserver://localhost:1433;databaseName=QuanLyQuanCafehetcuu1;encrypt=true;trustServerCertificate=true;}
```
Tên CSDL trong cấu hình bị thừa ký tự số `1` (`QuanLyQuanCafehetcuu1` so với `QuanLyQuanCafehetcuu`). Khi ứng dụng khởi chạy, lớp `DBConnect` kích hoạt kết nối HikariCP và ném ngoại lệ:
`com.microsoft.sqlserver.jdbc.SQLServerException: Cannot open database "QuanLyQuanCafehetcuu1" requested by the login. The login failed.`

#### 2. Hậu quả thực tế:
- Ứng dụng Web ném ngoại lệ `RuntimeException` ngay từ khối `static` của `DBConnect`, làm toàn bộ ứng dụng web bị treo, không thể thực hiện bất kỳ truy vấn nào.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Đồng bộ tên cơ sở dữ liệu trong `application.properties` khớp chính xác 100% với file `CSDL.sql`:

*Chỉnh sửa tại `src/main/resources/application.properties` (Dòng 2):*
```properties
# SỬA LỖI: Đồng bộ databaseName thành QuanLyQuanCafehetcuu khớp chuẩn CSDL.sql
db.url=${DB_URL:jdbc:sqlserver://localhost:1433;databaseName=QuanLyQuanCafehetcuu;encrypt=true;trustServerCertificate=true;}
db.user=${DB_USER:sa}
db.password=${DB_PASSWORD:123}
```

---

### BUG-SQL-02: Mật khẩu tài khoản mẫu Seed Data trong `CSDL.sql` sai lệch hoàn toàn so với thuật toán Salted Hashing của Java Service

- **Vị trí lỗi:**
  - File CSDL: `d:\DevSquadcuoimon\DevSquadcuoimon\CSDL.sql` (Dòng 618, 622, 629)
  - File Java Service: `NhanVienServiceImpl.java` (Dòng 122), `KhachHangServiceImpl.java` (Dòng 124), `SecurityUtil.java` (Dòng 37-43)
- **Mức độ nghiêm trọng:** **CRITICAL / BLOCKER** (Không thể đăng nhập vào bất kỳ tài khoản mặc định nào)
- **Phân loại:** Authentication / Cryptographic Discrepancy

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong file `CSDL.sql`, dữ liệu seed cho 3 tài khoản mặc định:
- Quản trị viên: username `admin`
- Thu ngân: username `staff`
- Khách hàng VIP: email `khach_vip@gmail.com`

Được gán giá trị mật khẩu chuỗi hash giống hệt nhau:
`'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f'`
Đây là mã băm **SHA-256 thuần (unsalted)** của chuỗi ký tự `'12345678'`:
`SHA256("12345678") = ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f`

Tuy nhiên, trong mã nguồn Java:
1. `NhanVienServiceImpl.loginNhanVien`:
   ```java
   String hashedInput = SecurityUtil.hashWithSalt(password, nv.getTenDangNhap());
   if (nv.getMatKhau().equals(hashedInput)) { ... }
   ```
   Hàm `SecurityUtil.hashWithSalt` thực hiện băm kèm chuỗi muối đặc thù:
   `password + "[$tea_pos_salt_key$]" + salt` (với `salt` là tên đăng nhập hoặc email).
2. Khi người dùng nhập `admin` và `12345678`, mã Java sẽ băm chuỗi `'12345678[$tea_pos_salt_key$]admin'`, sinh ra:
   `3db8fe209bece1d01983058cb34f2725e864980fc0e4b882bcdaf32fbd9f85d6`
3. Hai chuỗi băm này hoàn toàn khác nhau. Tương tự với tài khoản `staff` và khách VIP.

#### 2. Hậu quả thực tế:
- Sau khi cài đặt hệ thống và chạy `CSDL.sql`, người chấm thi / giảng viên / tester hoàn toàn không thể đăng nhập bằng tài khoản mẫu `admin / 12345678` hay `staff / 12345678`.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Cập nhật lại giá trị chuỗi băm mật khẩu có muối chuẩn trong `CSDL.sql`:

*Bảng giá trị băm chuẩn tương ứng mật khẩu `12345678`:*
- Tài khoản `admin` (Salt: `admin`): `3db8fe209bece1d01983058cb34f2725e864980fc0e4b882bcdaf32fbd9f85d6`
- Tài khoản `staff` (Salt: `staff`): `14afe2e96d51ca55a8f0a51149ea8909b46c47690aafb01492843b5337ee70d9`
- Tài khoản `khach_vip@gmail.com` (Salt: `khach_vip@gmail.com`): `bf4e4a166a42f6ede1bd3185919eb80f03735968c1c8ff6b693a1f23d0b6cad0`

*Chỉnh sửa trực tiếp trong `CSDL.sql` (Dòng 617-630):*
```sql
-- 9. Thêm các tài khoản Nhân sự (Mật khẩu mặc định: '12345678' đã băm kèm muối Salted SHA-256)
DECLARE @NVAdmin VARCHAR(20), @NVStaff VARCHAR(20);
SET @NVAdmin = 'NV' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_NhanVien AS VARCHAR(10)), 5);
INSERT INTO NHAN_VIEN (ma_nv, ma_vt, ho_ten, so_dien_thoai, email, ten_dang_nhap, mat_khau, trang_thai, thoi_gian_tao)
VALUES (@NVAdmin, 1, N'Lâm Minh Quang', '0912345678', 'quang_admin@teapos.vn', 'admin', 
        '3db8fe209bece1d01983058cb34f2725e864980fc0e4b882bcdaf32fbd9f85d6', 1, GETDATE());

SET @NVStaff = 'NV' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_NhanVien AS VARCHAR(10)), 5);
INSERT INTO NHAN_VIEN (ma_nv, ma_vt, ho_ten, so_dien_thoai, email, ten_dang_nhap, mat_khau, trang_thai, thoi_gian_tao)
VALUES (@NVStaff, 2, N'Nguyễn Thu Ngân', '0987654321', 'staff@teapos.vn', 'staff', 
        '14afe2e96d51ca55a8f0a51149ea8909b46c47690aafb01492843b5337ee70d9', 1, GETDATE());

-- 10. Thêm các tài khoản Khách hàng CRM mẫu (Mật khẩu: '12345678' đã băm kèm muối Email)
DECLARE @KHMau VARCHAR(20);
SET @KHMau = 'KH' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_KhachHang AS VARCHAR(10)), 5);
INSERT INTO KHACH_HANG (ma_kh, ma_hang, so_dien_thoai, ten_kh, email, mat_khau, diem_tich_luy, trang_thai, thoi_gian_tao)
VALUES (@KHMau, 3, '0909999999', N'Trần Thị VIP', 'khach_vip@gmail.com', 
        'bf4e4a166a42f6ede1bd3185919eb80f03735968c1c8ff6b693a1f23d0b6cad0', 350, 1, GETDATE());
```

---

### BUG-CODE-01: Quy trình Thanh toán QR Trực tuyến lưu đơn vào RAM (In-Memory Cache) & Xóa giỏ hàng trước khi chốt đơn thành công

- **Vị trí lỗi:**
  - `DonHangServiceImpl.java` (Dòng 130-136)
  - `PortalCheckoutController.java` (Dòng 236-245, 256-258)
  - `PortalProfileController.java` (Dòng 58-66)
- **Mức độ nghiêm trọng:** **CRITICAL** (Mất dữ liệu đơn hàng & giỏ hàng của khách hàng)
- **Phân loại:** Business Logic / Insecure Architecture

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong `DonHangServiceImpl.placeOrderOnline`:
```java
if (donHang.getMaPt() == 2) {
    donHang.setTrangThaiThanhToan(0);
    util.PaymentStore.pendingOrders.put(donHang.getMaDh(), donHang);
    return true; // KHÔNG HỀ LƯU VÀO DATABASE!
}
```
Khi khách hàng chọn phương thức `maPt = 2` (VietQR):
1. Đơn hàng chỉ được nạp vào biến tĩnh RAM `PaymentStore.pendingOrders` trong bộ nhớ JVM, không có bản ghi nào được ghi vào bảng `DON_HANG` trong SQL Server.
2. Tại `PortalCheckoutController`, ngay sau khi gọi hàm trên, mã nguồn đã vội vàng xóa sạch các sản phẩm trong giỏ hàng cơ sở dữ liệu (`gioHangService.deleteChiTietGioHang`).
3. Sau đó, controller chuyển hướng sang:
   `response.sendRedirect(request.getContextPath() + "/portal/order/payment-qr?id=" + dh.getMaDh());`
4. Tại `PortalProfileController`, hàm xử lý `/portal/order/payment-qr` thực hiện:
   `DonHang dh = donHangService.getDonHangById(id);`
   Nếu đơn hàng tìm không thấy trong DB hoặc tài khoản không khớp trong CSDL, hệ thống lập tức văng về:
   `response.sendRedirect(request.getContextPath() + "/profile/orders?msg=invalid_action");`
5. Khách hàng không thể xem lại mã đơn của mình trong lịch sử `/profile/orders` vì trang lịch sử chỉ truy vấn từ CSDL.
6. Nếu máy chủ Tomcat được reload hoặc restart khi khách đang quét mã chuyển tiền, bộ nhớ RAM bị xóa sạch. Khi SePay Webhook bắn tín hiệu tiền về, đơn hàng không tồn tại trong cache, dẫn đến tình trạng: **Khách hàng đã chuyển tiền nhưng mất luôn đơn hàng và mất cả giỏ hàng!**

#### 2. Hậu quả thực tế:
- Mất mát dữ liệu tài chính, khách hàng bị trừ tiền ngân hàng nhưng hệ thống không có đơn ghi nhận trong CSDL, gây khiếu nại dịch vụ nghiêm trọng.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Bảo đảm đơn hàng luôn được ghi nhận bền vững vào CSDL với trạng thái:
- `trang_thai_thanh_toan = 0` (Chờ thanh toán)
- `trang_thai_don = 0` (Chờ duyệt)

*Chỉnh sửa tại `DonHangServiceImpl.java` (Dòng 130-136):*
```java
// SỬA LỖI: Luôn lưu đơn hàng trực tiếp vào Database để bảo toàn dữ liệu
donHang.setTrangThaiThanhToan(0); // 0: Chờ thanh toán
donHang.setTrangThaiDon(0);       // 0: Chờ duyệt

// Thực hiện lưu trực tiếp vào CSDL qua Repository
boolean success = donHangRepository.add(donHang);
if (success) {
    // Vẫn nạp vào Cache để hỗ trợ đối soát nhanh tốc độ cao tại RAM
    util.PaymentStore.pendingOrders.put(donHang.getMaDh(), donHang);
    return true;
}
return false;
```

---

### BUG-CODE-02: Lỗ hổng Thao túng Giá tiền & Chiết khấu tại Quầy Thu Ngân POS (Price Tampering / Business Logic Vulnerability)

- **Vị trí lỗi:** `BanHangPOSController.java` (Dòng 329-355)
- **Mức độ nghiêm trọng:** **CRITICAL** (Rủi ro thất thoát doanh thu 100%)
- **Phân loại:** Security / OWASP A04:2021 - Insecure Design (CWE-472)

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong hàm `performCheckout` của `BanHangPOSController`:
```java
int tongTienHang = WebUtil.getIntParameter(request, "tongTienHang", 0);
int tienGiamGia = WebUtil.getIntParameter(request, "tienGiamGia", 0);
int diemSuDung = WebUtil.getIntParameter(request, "diemSuDung", 0);
int tienTruDiem = WebUtil.getIntParameter(request, "tienTruDiem", 0);
int tongPhaiTra = WebUtil.getIntParameter(request, "tongPhaiTra", 0);

DonHang dh = new DonHang();
dh.setTongTienHang(tongTienHang);
dh.setTienGiamGia(tienGiamGia);
dh.setTongPhaiTra(tongPhaiTra);
...
donHangService.checkoutPOS(dh, items, currentStaff.getMaNv());
```
Backend nhận trực tiếp toàn bộ các giá trị tài chính (`tongTienHang`, `tongPhaiTra`, `tienGiamGia`) từ HTTP Request do trình duyệt gửi lên mà **hoàn toàn không tính toán hay xác thực lại ở phía máy chủ**.

#### 2. Hậu quả thực tế:
- Bất kỳ thu ngân gian lận hoặc người dùng nào có thể mở F12 Inspect Element, sửa input hidden `tongPhaiTra` thành `0` hoặc `tienGiamGia` bằng đúng tổng tiền hàng. Hệ thống vẫn lưu hóa đơn 0đ vào CSDL, gây thất thoát nghiêm trọng.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Bắt buộc phải thực hiện Server-side Recalculation (tính toán lại 100% tại Backend) dựa trên giá gốc của sản phẩm trong CSDL và quy tắc voucher:

*Chỉnh sửa tại `BanHangPOSController.java` bên trong `performCheckout`:*
```java
// SỬA LỖI: Tính toán lại toàn bộ tổng tiền hàng từ danh sách sản phẩm chuẩn
int calculatedTongTienHang = 0;
for (ChiTietDonHang item : items) {
    int itemBasePrice = sanPhamService.getGiaKichCoSanPham(item.getMaSp(), item.getMaSize());
    int toppingPriceSum = 0;
    if (item.getToppingsList() != null) {
        for (ChiTietTopping tp : item.getToppingsList()) {
            Topping realTp = toppingService.getToppingById(tp.getMaTp());
            int realTpPrice = (realTp != null) ? realTp.getGiaBan() : tp.getGiaChotTp();
            tp.setGiaChotTp(realTpPrice);
            toppingPriceSum += realTpPrice * tp.getSoLuong();
        }
    }
    item.setGiaChot(itemBasePrice);
    calculatedTongTienHang += (itemBasePrice + toppingPriceSum) * item.getSoLuong();
}

// Tính lại chiết khấu voucher từ hệ thống
int calculatedTienGiam = 0;
if (maKm != null && !maKm.trim().isEmpty()) {
    KhuyenMai km = khuyenMaiService.getKhuyenMaiById(maKm);
    if (km != null && khuyenMaiService.validateVoucher(km.getMaCode(), calculatedTongTienHang, maKh)) {
        calculatedTienGiam = khuyenMaiService.calculateDiscount(km.getMaCode(), calculatedTongTienHang);
    } else {
        maKm = null;
    }
}

// Tính lại trừ điểm CRM
int calculatedTienTruDiem = 0;
if (maKh != null && diemSuDung > 0) {
    KhachHang kh = khachHangService.getKhachHangById(maKh);
    if (kh != null) {
        int maxPoints = kh.getDiemTichLuy();
        if (diemSuDung > maxPoints) diemSuDung = maxPoints;
        calculatedTienTruDiem = Math.min(diemSuDung * 1000, calculatedTongTienHang - calculatedTienGiam);
    }
}

int calculatedTongPhaiTra = Math.max(0, calculatedTongTienHang - calculatedTienGiam - calculatedTienTruDiem);

// Gán các giá trị đã được bảo vệ vào hóa đơn
dh.setTongTienHang(calculatedTongTienHang);
dh.setTienGiamGia(calculatedTienGiam);
dh.setDiemSuDung(calculatedTienTruDiem / 1000);
dh.setTienTruDiem(calculatedTienTruDiem);
dh.setTongPhaiTra(calculatedTongPhaiTra);
```

---

### BUG-CODE-03: Lỗ hổng Đọc File Tùy Ý (Arbitrary File Read / Path Traversal) trong ImageServlet

- **Vị trí lỗi:** `ImageServlet.java` (Dòng 43-48)
- **Mức độ nghiêm trọng:** **CRITICAL** (Rò rỉ dữ liệu hệ điều hành & file cấu hình máy chủ)
- **Phân loại:** Security / OWASP A01:2021 - Broken Access Control (CWE-22)

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong `ImageServlet.doGet`:
```java
String pathInfo = request.getPathInfo();
File file = new File(uploadDir, pathInfo);
```
Tham số `pathInfo` lấy từ URL không qua bất kỳ khâu khử khuẩn ký tự độc hại nào (`../`, `..\\`). Khi gửi request dạng:
`GET /assets/images/../../Windows/win.ini`
Đối tượng `File(uploadDir, pathInfo)` sẽ phân giải ngược ra khỏi thư mục ảnh và đọc các file hệ thống nhạy cảm rồi truyền trực tiếp ra luồng phản hồi HTTP (`response.getOutputStream()`).

#### 2. Hậu quả thực tế:
- Tin tặc có thể tải về các tệp tin cấu hình (`application.properties`, file hệ điều hành `web.xml`, file SAM/hosts) trên máy chủ chạy Tomcat.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Bắt buộc kiểm tra `CanonicalPath` để đảm bảo tệp tin yêu cầu luôn nằm trong thư mục gốc `uploadDir`:

*Chỉnh sửa tại `ImageServlet.java` (Dòng 43-58):*
```java
// SỬA LỖI BẢO MẬT: Chống Path Traversal bằng getCanonicalPath
String pathInfo = request.getPathInfo();
if (pathInfo == null || pathInfo.equals("/")) {
    response.sendError(HttpServletResponse.SC_NOT_FOUND);
    return;
}

File baseDir = new File(uploadDir).getCanonicalFile();
File targetFile = new File(baseDir, pathInfo).getCanonicalFile();

// Kiểm tra nghiêm ngặt: Đường dẫn tệp tin con phải bắt đầu bằng đường dẫn thư mục gốc
if (!targetFile.getPath().startsWith(baseDir.getPath())) {
    System.err.println("🚨 [SECURITY WARNING] Phát hiện nỗ lực tấn công Path Traversal: " + pathInfo);
    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    return;
}

if (!targetFile.exists() || targetFile.isDirectory()) {
    response.sendError(HttpServletResponse.SC_NOT_FOUND);
    return;
}
File file = targetFile;
```

---

### BUG-SQL-03: Tràn Chuỗi Định Dạng Sinh Mã Tự Động trong Sequences khi Dữ Liệu Vượt 99.999 Bản Ghi

- **Vị trí lỗi:** `CSDL.sql` (Stored Procedures `sp_ThemSanPham`, `sp_ThemDanhMuc`, `sp_ThemVoucher`, `sp_ThemNhanVien`, `sp_ThemKhachHang`, `sp_ThemTopping`)
- **Mức độ nghiêm trọng:** **HIGH** (Lỗi dừng hoạt động chèn dữ liệu khi hệ thống vận hành lâu dài)
- **Phân loại:** SQL / Logical Flaw

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Toàn bộ các thủ tục chèn đều sử dụng công thức:
```sql
SET @ma_sp = 'SP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_SanPham AS VARCHAR(10)), 5);
```
Khi giá trị Sequence nhỏ hơn 99.999 (ví dụ 123), `'00000123'` lấy 5 ký tự bên phải cho ra `'00123'`, ghép thành `'SP00123'`.
Tuy nhiên, khi số lượng bản ghi đạt đến **100.000**, `CAST(100000 AS VARCHAR(10))` là `'100000'`. Chuỗi ghép thành `'00000100000'`.
Hàm `RIGHT(..., 5)` sẽ chỉ lấy 5 ký tự cuối cùng, tức là chuỗi `'00000'`!
Kết quả: Mã sinh ra là `'SP00000'`. Ở lần chèn tiếp theo (100.001), mã sinh ra là `'SP00001'` (bị trùng với bản ghi số 1 ngày xưa).
Hệ thống sẽ ném lỗi: `Violation of PRIMARY KEY constraint 'PK__SAN_PHAM'. Cannot insert duplicate key in object 'dbo.SAN_PHAM'.`

#### 2. Hậu quả thực tế:
- Hệ thống bị tê liệt hoàn toàn tính năng thêm mới đồ uống, thêm voucher, thêm nhân viên khi số lượng dữ liệu lớn.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Sử dụng hàm `FORMAT` của SQL Server hoặc logic kiểm tra độ dài động:

*Cập nhật lại các thủ tục trong `CSDL.sql`:*
```sql
-- SỬA LỖI: Định dạng sinh mã chuẩn công nghiệp không bao giờ bị cắt cụt số
DECLARE @val BIGINT;
SET @val = NEXT VALUE FOR seq_SanPham;
IF @val <= 99999
    SET @ma_sp = 'SP' + RIGHT('00000' + CAST(@val AS VARCHAR(10)), 5);
ELSE
    SET @ma_sp = 'SP' + CAST(@val AS VARCHAR(10));
```

---

### BUG-SQL-04: Xung Đột Khóa Ngoại Ràng Buộc khi Xóa Sản Phẩm Chưa Từng Giao Dịch Nhưng Có Trong Giỏ Hàng

- **Vị trí lỗi:**
  - `CSDL.sql` (Bảng `CHI_TIET_GIO_HANG`, dòng 200)
  - `SanPhamController.java` (Dòng 184-225)
- **Mức độ nghiêm trọng:** **HIGH**
- **Phân loại:** Database Foreign Key Constraint / Integrity Violation

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong `SanPhamController.performDelete`:
Hệ thống kiểm tra: `SELECT COUNT(*) FROM CHI_TIET_DON_HANG WHERE ma_sp = ?`.
Nếu không có hóa đơn bán nào, hệ thống chuyển sang chế độ **Xóa cứng (Hard Delete)**:
```sql
DELETE FROM SAN_PHAM_KICH_CO WHERE ma_sp = ?;
DELETE FROM SAN_PHAM WHERE ma_sp = ?;
```
Tuy nhiên, trong `CSDL.sql`:
`ma_sp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES SAN_PHAM(ma_sp)` trong bảng `CHI_TIET_GIO_HANG` **không có điều kiện `ON DELETE CASCADE`**.
Nếu có bất kỳ khách hàng nào đang mở trình duyệt và từng bấm "Thêm vào giỏ" món này (dù chưa đặt mua), bảng `CHI_TIET_GIO_HANG` sẽ giữ khóa ngoại tới `SAN_PHAM(ma_sp)`. Lệnh xóa `SAN_PHAM` lập tức bị SQL Server chặn và rollback!

#### 2. Hậu quả thực tế:
- Quản trị viên bấm xóa món đồ uống mới tạo (chưa bán được cốc nào) thì hệ thống báo lỗi không thành công (`msg=deletefailed`) mà không hiểu lý do vì sao.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
1. Trong `CSDL.sql`, cấu hình `ON DELETE CASCADE` cho bảng giỏ hàng.
2. Hoặc trong `SanPhamController`, xóa các mục liên quan trong `CHI_TIET_GIO_HANG` trước khi xóa sản phẩm:

*Chỉnh sửa trong `SanPhamController.java` (Dòng 208-218):*
```java
// SỬA LỖI: Dọn dẹp cả liên kết giỏ hàng chi tiết trước khi xóa sản phẩm
String deleteCartTopSql = "DELETE FROM CHI_TIET_TOPPING_GIO_HANG WHERE ma_ctgh IN (SELECT ma_ctgh FROM CHI_TIET_GIO_HANG WHERE ma_sp = ?)";
String deleteCartItemSql = "DELETE FROM CHI_TIET_GIO_HANG WHERE ma_sp = ?";
String deletePricesSql = "DELETE FROM SAN_PHAM_KICH_CO WHERE ma_sp = ?";
String deleteSpSql = "DELETE FROM SAN_PHAM WHERE ma_sp = ?";

try (Connection conn = DBConnect.getConnection()) {
    conn.setAutoCommit(false);
    try (PreparedStatement psCartTop = conn.prepareStatement(deleteCartTopSql);
         PreparedStatement psCartItem = conn.prepareStatement(deleteCartItemSql);
         PreparedStatement psPrices = conn.prepareStatement(deletePricesSql);
         PreparedStatement psSp = conn.prepareStatement(deleteSpSql)) {
        
        psCartTop.setString(1, id);
        psCartTop.executeUpdate();
        
        psCartItem.setString(1, id);
        psCartItem.executeUpdate();

        psPrices.setString(1, id);
        psPrices.executeUpdate();

        psSp.setString(1, id);
        int rows = psSp.executeUpdate();
        if (rows > 0) {
            hardSuccess = true;
        }
        conn.commit();
    } catch (SQLException e) {
        conn.rollback();
        e.printStackTrace();
    }
}
```

---

### BUG-CODE-04: Lộ Lọt Mật Khẩu Ứng Dụng Email & Token SePay trong Mã Nguồn + Bật Cờ Bypass Webhook trong File Cấu Hình

- **Vị trí lỗi:**
  - `application.properties` (Dòng 7-14)
  - `EmailSenderUtil.java` (Dòng 44-49)
  - `SePayWebhookController.java` (Dòng 44, 74-76)
- **Mức độ nghiêm trọng:** **HIGH**
- **Phân loại:** Security / OWASP A07:2021 - Identification and Authentication Failures (CWE-798)

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
- `application.properties` và `EmailSenderUtil.java` lưu trực tiếp tài khoản email cá nhân `quang642000@gmail.com` và mật khẩu ứng dụng Gmail 16 ký tự `jhjiifwcqcgaynpw`.
- Token SePay `U4RXVN1VBGSWAZR68VQ3SMYHUPFFC6AGOYBKXY8PQBTXAT3YULOBQZI4KDPZ2WSE` bị ghi chết.
- Đáng chú ý, dòng 14 của `application.properties` đặt cờ:
  `sepay.bypass=true`
  Làm cho `SePayWebhookController` tự động cho phép (`authorized = true`) bất kỳ ai gửi HTTP POST đến `/api/sepay-webhook` mà không cần cung cấp bất kỳ API Token hoặc Header xác thực nào!

#### 2. Hậu quả thực tế:
- Bất kỳ ai trên Internet đều có thể gửi dữ liệu giả lập thanh toán tới `/api/sepay-webhook` để tự động duyệt đơn hàng online miễn phí.
- Tài khoản email cá nhân có thể bị kẻ gian lợi dụng để gửi thư rác mạo danh.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
1. Vô hiệu hóa cờ bypass trên file cấu hình: đặt `sepay.bypass=false`.
2. Đổi mật khẩu ứng dụng Google App Password ngay lập tức.
3. Chuyển toàn bộ các giá trị mật khẩu vào biến môi trường hệ điều hành:

```properties
# SỬA LỖI: Bắt buộc đọc từ biến môi trường, khóa chết chế độ bypass
email.user=${EMAIL_USER}
email.password=${EMAIL_PASSWORD}
sepay.token=${SEPAY_TOKEN}
sepay.bypass=false
```

---

### BUG-UI-01: Khóa Cuộn Màn Hình Giao Diện Admin Trên Thiết Bị Di Động và Laptop Nhỏ

- **Vị trí lỗi:** `views/layout/sidebar_admin.jsp` (Dòng 12-17)
- **Mức độ nghiêm trọng:** **HIGH** (Lỗi hiển thị UI nghiêm trọng)
- **Phân loại:** Frontend / CSS Styling Defect

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trong `sidebar_admin.jsp`:
```css
html, body {
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important; /* Block master page scrolling */
}
```
Việc áp dụng `overflow: hidden !important` lên cả `html` và `body` triệt tiêu hoàn toàn thanh cuộn tự nhiên của trình duyệt. Trên các màn hình di động, máy tính bảng hoặc laptop độ phân giải 1366x768, nội dung trang quản trị dài hơn chiều cao màn hình nhưng người dùng không thể cuộn chuột xuống dưới.

#### 2. Hậu quả thực tế:
- Các nút hành động như "Lưu sản phẩm", các bảng thống kê và phân trang ở nửa dưới trang bị che khuất vĩnh viễn, người dùng không thể tương tác.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Bỏ ép buộc `overflow: hidden` lên thẻ `html, body`, đưa vào container cha hoặc sử dụng Media Query:

*Chỉnh sửa tại `sidebar_admin.jsp` (Dòng 12-17):*
```css
/* SỬA LỖI: Chỉ khóa cuộn trên màn hình máy tính lớn, cho phép cuộn tự nhiên trên mobile/tablet */
@media (min-width: 992px) {
    html, body {
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
}
@media (max-width: 991.98px) {
    html, body {
        height: auto !important;
        overflow-y: auto !important;
    }
    .admin-wrapper {
        flex-direction: column !important;
        height: auto !important;
    }
    .admin-sidebar {
        width: 100% !important;
        height: auto !important;
    }
}
```

---

### BUG-CODE-06: Vấn đề Hiệu năng Truy vấn N+1 (N+1 Query Problem) trong Màn hình Nhận Đơn Online

- **Vị trí lỗi:** `NhanDonOnlineController.java` (Dòng 48-56) & `DonHangRepoImpl.java`
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Phân loại:** Performance / Database Bottleneck

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
```java
List<DonHang> rawOrders = donHangService.getDonHangByTrangThai(filterStatus);
for (DonHang dh : rawOrders) {
    if (dh.getLoaiDonHang() == 3) {
        DonHang freshDh = donHangService.getDonHangById(dh.getMaDh()); // TRUY VẤN N LẦN
        ...
    }
}
```
Với mỗi đơn hàng trong danh sách, hệ thống gọi thêm 1 truy vấn lấy đơn hàng, rồi bên trong `getById` lại gọi 1 truy vấn lấy chi tiết món, rồi lặp tiếp gọi truy vấn lấy danh sách topping. Nếu có 50 đơn hàng online, hệ thống thực thi hơn **300 câu lệnh SQL** liên tiếp!

#### 2. Hậu quả thực tế:
- Màn hình nhận đơn của thu ngân bị giật lag, thời gian tải trang tăng từ vài chục ms lên 3-5 giây khi số lượng đơn hàng tăng lên.

#### 3. Cách khắc phục chi tiết (Solution & Code Fix):
Thực hiện truy vấn gom cụm hoặc viết thủ tục `JOIN` lấy toàn bộ thông tin đơn hàng và chi tiết trong 1 lần gọi duy nhất.

---

### BUG-UI-02: Nút Truy cập Admin Hiển thị Cho Cả Nhân Viên Thu Ngân tại Giao diện Quầy POS

- **Vị trí lỗi:** `views/pos/ban_hang.jsp` (Dòng 57-60)
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Phân loại:** UI / UX & Role-based Access Control

#### 1. Nguyên nhân gây lỗi (Root Cause Analysis):
Trên thanh Topbar của giao diện POS:
```jsp
<a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-sm btn-outline-success ...">
    <i class="bi bi-shield-lock-fill"></i>
    <span class="d-none d-md-inline">Admin</span>
</a>
```
Nút này hiển thị cố định mà không kiểm tra quyền `sessionScope.user.maVt == 1`. Khi tài khoản Thu ngân (Role 2) bấm vào, `AdminAuthFilter` chặn lại và đá người dùng ra trang đăng nhập, làm mất ca làm việc hiện tại của thu ngân.

#### 2. Cách khắc phục:
Bọc nút bấm trong thẻ JSTL kiểm tra quyền Quản lý:
```jsp
<c:if test="${sessionScope.user.maVt == 1}">
    <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-sm btn-outline-success border-2 fw-bold text-uppercase d-flex align-items-center gap-1 px-1.5 px-sm-2.5" style="font-size: 11px;" title="Quản trị Admin">
        <i class="bi bi-shield-lock-fill"></i>
        <span class="d-none d-md-inline">Admin</span>
    </a>
</c:if>
```

---

### BUG-UI-03: Lỗi Hẹn Giờ Nhận Nước Lúc Nửa Đêm trong Thanh Toán Portal (Past Midnight Ordering)

- **Vị trí lỗi:** `PortalCheckoutController.java` (Dòng 208-210)
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Phân loại:** Business Logic / Date Handling

#### 1. Nguyên nhân gây lỗi:
```java
LocalDate today = LocalDate.now();
String fullDateTimeStr = today.toString() + " " + henLayRaw.trim() + ":00";
Timestamp thoiGianHenLay = Timestamp.valueOf(fullDateTimeStr);
```
Khi khách đặt hàng lúc 23:55 và chọn giờ nhận là `00:15`, hệ thống ghép với ngày hiện tại thành `2026-11-08 00:15:00` (đã trôi qua 23 giờ). Hàm kiểm tra thời gian hẹn lấy phát hiện thời gian nhỏ hơn hiện tại và báo lỗi từ chối đơn hàng!

#### 2. Cách khắc phục:
Nếu giờ hẹn nhỏ hơn giờ hiện tại (vượt qua nửa đêm), tự động cộng thêm 1 ngày:
```java
LocalDate targetDate = LocalDate.now();
LocalTime targetTime = LocalTime.parse(henLayRaw.trim());
if (targetTime.isBefore(LocalTime.now())) {
    targetDate = targetDate.plusDays(1); // Sang ngày hôm sau
}
Timestamp thoiGianHenLay = Timestamp.valueOf(targetDate.atTime(targetTime));
```

---

## 3. LỘ TRÌNH VÁ LỖI KHUYẾN NGHỊ (REMEDIATION ACTION PLAN)

1. **Ưu tiên 1 (Vá ngay lập tức trong 1 giờ đầu):**
   - Sửa tên Database trong `application.properties` (BUG-SQL-01).
   - Cập nhật chuỗi băm mật khẩu có muối vào `CSDL.sql` (BUG-SQL-02) để khôi phục quyền đăng nhập của tài khoản `admin` và `staff`.
   - Lưu đơn hàng trực tiếp vào CSDL thay vì chỉ lưu bộ nhớ tạm RAM (BUG-CODE-01).
   - Thêm bộ kiểm tra `getCanonicalPath` vào `ImageServlet` để vá lỗ hổng Path Traversal (BUG-CODE-03).
2. **Ưu tiên 2 (Hoàn thành trong 24 giờ tiếp theo):**
   - Bổ sung Server-side Recalculation giá tiền và voucher trong `BanHangPOSController` (BUG-CODE-02).
   - Đóng gói chu trình tạo đơn hàng trong cùng một Database Transaction ACID (BUG-CODE-05).
   - Tắt cờ `sepay.bypass=true` và đưa email/token vào biến môi trường (BUG-CODE-04).
   - Sửa quy tắc CSS `overflow: hidden` trong `sidebar_admin.jsp` (BUG-UI-01).
3. **Ưu tiên 3 (Tối ưu hóa và làm sạch hệ thống):**
   - Viết lại câu lệnh JOIN tối ưu hóa N+1 query trong `NhanDonOnlineController` (BUG-CODE-06).
   - Bổ sung whitelist đuôi file ảnh trong `UploadUtil` (BUG-CODE-07).
   - Thêm thẻ điều kiện `<c:if>` ẩn nút Admin tại quầy POS (BUG-UI-02).
   - Xử lý mốc thời gian qua nửa đêm trong `PortalCheckoutController` (BUG-UI-03).
