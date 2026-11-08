# TÀI LIỆU ĐẶC TẢ SẢN PHẨM PHẦN MỀM (PRODUCT SPECIFICATIONS)
**Dự án:** Hệ Thống Quản Lý Quán Trà Sữa & Bán Hàng Trực Tuyến TEA POS  
**Đơn vị phát triển:** Nhóm Kỹ Sư Phần Mềm CodeDevSquad  
**Tiêu chuẩn tài liệu:** Software Requirements Specification (SRS) - IEEE Std 830-1998  
**Phiên bản:** 2.0.0 (Bản hoàn thiện tốt nghiệp)  
**Ngày cập nhật:** 09/11/2026  

---

## 1. GIỚI THIỆU TỔNG QUAN HỆ THỐNG (PRODUCT OVERVIEW)

### 1.1. Mục tiêu và sứ mệnh sản phẩm
TEA POS là hệ sinh thái phần mềm quản lý và bán lẻ chuyên biệt dành cho các thương hiệu F&B (Trà sữa, Cà phê, Trà hoa quả, Đồ uống pha chế). Hệ thống kết hợp hài hòa giữa hai mô hình:
1. **O2O (Online-to-Offline / Click & Collect):** Cho phép khách hàng đặt đồ uống từ xa qua Web Portal, tùy biến đá/đường/toppings, hẹn giờ đến quán lấy nước, tích điểm CRM và thanh toán chuyển khoản tự động qua mã VietQR.
2. **In-Store POS (Point-of-Sale):** Màn hình cảm ứng bán lẻ tại quầy với tốc độ cao, hỗ trợ thu ngân chốt đơn trong vòng 5 giây, tra cứu lịch sử mua sắm của hội viên và tiếp nhận - điều phối đơn đặt online tức thì.
3. **HQ Admin (Headquarters Management):** Bảng điều khiển trung tâm giúp chủ quán giám sát doanh thu theo thời gian thực, điều hành kho đồ uống, phân quyền nhân sự và kiểm soát gian lận qua nhật ký hộp đen (Audit Trail).

```
┌────────────────────────────────────────────────────────────────────────┐
│                    KIẾN TRÚC TỔNG THỂ HỆ THỐNG TEA POS                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[CUSTOMER PORTAL]              [RETAIL POS]                 [CENTRAL ADMIN]
• Xem Menu & Giá Size          • Màn hình bán hàng nhanh     • Báo cáo doanh thu KPI
• Tùy biến Đá / Đường / Topping• Tìm kiếm đồ uống tức thì    • Quản trị thực đơn & Size
• Giỏ hàng & Voucher VIP       • Tạo nhanh hội viên POS      • Quản trị Voucher & Khuyến mãi
• Đặt hàng hẹn giờ lấy nước    • Điều phối đơn Online        • Phân quyền & Quản lý nhân sự
• Cổng thanh toán VietQR       • In hóa đơn & Chốt ca        • Hộp đen kiểm toán (Audit Trail)
```

---

## 2. CHÂN DUNG NGƯỜI DÙNG & VAI TRÒ HỆ THỐNG (USER PERSONAS & ROLES)

| Vai Trò (Role) | Mã VT | Định Danh Hệ Thống | Mô Tả Trách Nhiệm & Quyền Hạn |
|:---|:---:|:---|:---|
| **Khách Hàng Vãng Lai** | - | Guest Customer | Xem thực đơn, tìm kiếm đồ uống, thêm vào giỏ hàng tạm tính, đăng ký tài khoản mới. |
| **Khách Hàng Thành Viên** | - | Registered Member | Đặt hàng Click & Collect, áp dụng mã giảm giá cá nhân, tích lũy điểm CRM, xem lịch sử đơn hàng, thanh toán VietQR. |
| **Nhân Viên Thu Ngân** | 2 | Staff / Cashier | Đăng nhập hệ thống POS, order đồ uống tại quầy, áp voucher/điểm cho khách, nhận đơn online, đổi mật khẩu ca trực. |
| **Quản Trị Viên** | 1 | System Administrator | Toàn quyền quản trị hệ thống: Quản lý danh mục, sản phẩm, toppings, nhân viên, voucher, xem báo cáo doanh thu và nhật ký hệ thống. |

---

## 3. ĐẶC TẢ TÍNH NĂNG CHI TIẾT (FUNCTIONAL SPECIFICATIONS)

### 3.1. Phân hệ Khách hàng (Customer Web Portal)
- **UC-C01: Khám phá Thực đơn & Tìm kiếm Đồ uống:**
  - Hiển thị danh sách đồ uống phân chia theo nhóm danh mục: Trà sữa truyền thống, Trà trái cây, Cà phê đậm đà, Bánh ngọt ăn kèm.
  - Bộ lọc nhanh theo nhãn sản phẩm: `Mới ✨` (is_new = 1) và `Bán chạy 🔥` (is_bestseller = 1).
  - Tìm kiếm sản phẩm theo tên theo thời gian thực.
- **UC-C02: Tùy biến Đồ uống Cá nhân hóa (Customization):**
  - Lựa chọn kích cỡ ly: Size S, Size M, Size L (giá tự động cập nhật theo size).
  - Tùy chỉnh mức đá: 0%, 30%, 50%, 70%, 100% (bảo vệ bằng cờ `cho_phep_doi_da`).
  - Tùy chỉnh mức đường: 0%, 30%, 50%, 70%, 100% (bảo vệ bằng cờ `cho_phep_doi_duong`).
  - Chọn danh sách Toppings ăn kèm: Trân châu hoàng kim, Kem cheese phô mai, Thạch dừa, Pudding trứng (tổng tiền món tự động cộng dồn).
  - Nhập ghi chú đặc biệt cho thợ pha chế (Barista Note).
- **UC-C03: Quản lý Giỏ hàng Thông minh (Smart Cart):**
  - Cập nhật số lượng đồ uống realtime qua AJAX không cần reload trang.
  - Tính năng Checkbox chọn mua từng món (Partial Selection Checkout).
  - Xóa từng món hoặc dọn sạch toàn bộ giỏ hàng.
- **UC-C04: Quy trình Đặt hàng & Hẹn giờ Lấy nước (Click & Collect Checkout):**
  - Yêu cầu bắt buộc chọn giờ hẹn nhận nước tại quán (cách thời điểm hiện tại tối thiểu 15 phút, hỗ trợ chọn giờ vượt nửa đêm / qua ngày mới).
  - Áp dụng mã Voucher: Tự động tải kho voucher khả dụng dựa trên giá trị đơn hàng tối thiểu (`don_toi_thieu`) và hạng thành viên.
  - Trừ điểm tích lũy CRM: Quy đổi 1 điểm = 1.000đ trừ trực tiếp vào hóa đơn.
  - Tính thuế VAT tự động (8%) trên tổng tiền sau chiết khấu.
- **UC-C05: Thanh toán Chuyển khoản VietQR Tự động:**
  - Phát sinh mã QR VietQR chuẩn ngân hàng với số tiền chính xác và nội dung chuyển khoản là mã đơn hàng (`TEA-YYYYMMDD-XXXXX`).
  - Đồng hồ đếm ngược 10 phút.
  - Cơ chế Polling tự động kiểm tra trạng thái thanh toán qua API `/api/check-payment`.
  - Tự động chuyển hướng sang trang chi tiết đơn hàng khi nhận tín hiệu chuyển tiền thành công từ cổng Webhook SePay.

---

### 3.2. Phân hệ Bán lẻ tại Quầy (Point of Sale - POS)
- **UC-P01: Giao diện Bán hàng Cảm ứng Tốc độ cao:**
  - Lưới hiển thị đồ uống theo danh mục dạng thẻ trực quan.
  - Modal tùy biến size/đá/đường/toppings hiển thị ngay trên màn hình thu ngân.
  - Bảng hóa đơn tạm tính bên phải cho phép sửa số lượng, đổi ghi chú nhanh.
- **UC-P02: Tra cứu & Tạo nhanh Thành viên tại Quầy:**
  - Tra cứu khách hàng theo số điện thoại: Trả về tên, hạng hội viên, điểm tích lũy hiện có và danh sách voucher sở hữu.
  - Thêm nhanh khách hàng mới ngay tại quầy thu ngân chỉ với Tên + SĐT + Email.
- **UC-P03: Chốt Giao dịch & Bảo vệ Tính toàn vẹn Giá (Price Tampering Defense):**
  - Hỗ trợ thanh toán Tiền mặt (hoàn thành đơn ngay lập tức) hoặc Chuyển khoản VietQR tại quầy.
  - Phía máy chủ tự động tính toán lại toàn bộ đơn giá, toppings, chiết khấu và điểm thưởng, ngăn chặn tuyệt đối can thiệp sửa đổi giá từ trình duyệt.
  - Tự động cộng điểm tích lũy cho khách hàng: 10.000đ = 1 điểm.
  - Tự động kích hoạt cơ chế thăng hạng hội viên CRM (Đồng -> Bạc -> Vàng -> Kim Cương).
- **UC-P04: Tiếp nhận & Điều phối Đơn hàng Trực tuyến (Online Order Dispatcher):**
  - Quản lý luồng vòng đời đơn hàng: Chờ xác nhận (0) -> Đã xác nhận (1) -> Đang pha chế (2) -> Sẵn sàng giao khách (3) -> Hoàn tất (4) -> Đã hủy (5).
  - Tính năng hoàn tiền (Refund Operation) cho các đơn hàng chuyển khoản online bị hủy.

---

### 3.3. Phân hệ Quản trị Trung tâm (Admin Dashboard)
- **UC-A01: Báo cáo Doanh thu & Thống kê Thời gian thực:**
  - Thẻ chỉ số KPI: Tổng doanh thu hôm nay, số lượng đơn hoàn thành, số cốc nước đã bán, tổng số thành viên mới.
  - Biểu đồ đường doanh thu 7 ngày gần nhất và biểu đồ cột doanh thu 12 tháng.
  - Bảng xếp hạng Top 5 Sản phẩm bán chạy nhất và Top Nhân viên thu ngân xuất sắc nhất.
- **UC-A02: Quản trị Thực đơn Đồ uống & Kích cỡ Ly:**
  - Thêm mới, cập nhật, xóa mềm (Soft Delete) và xóa cứng (Hard Delete) sản phẩm.
  - Thiết lập giá bán độc lập theo từng kích cỡ ly (Size S/M/L) cho mỗi món.
  - Tải lên hình ảnh sản phẩm được kiểm tra an toàn định dạng (Whitelist: jpg, png, webp).
- **UC-A03: Quản trị Chương trình Khuyến mãi Voucher:**
  - Thiết lập mã Code, loại giảm giá (Giảm theo % hoặc Giảm tiền trực tiếp), mức giảm tối đa, giá trị đơn tối thiểu.
  - Giới hạn lượt sử dụng cá nhân và thời hạn hiệu lực của voucher.
- **UC-A04: Quản lý Nhân sự & Phân quyền:**
  - Quản lý danh sách nhân viên: Họ tên, SĐT, Email, Tên đăng nhập, Vai trò (Quản lý / Thu ngân).
  - Tự động khóa tài khoản sau 5 lần đăng nhập thất bại liên tiếp (chống tấn công Brute-force).
  - Reset mật khẩu nhân viên với mật khẩu mới được băm kèm muối Salted SHA-256 chuẩn xác.
- **UC-A05: Nhật ký Hộp đen Kiểm toán (Audit Trail):**
  - Ghi nhận tự động mọi thao tác nhạy cảm: Đăng nhập, Đăng xuất, Thêm/Sửa/Xóa sản phẩm, Đổi trạng thái đơn hàng, Hoàn tiền.
  - Lưu trữ địa chỉ IP máy khách, thời gian chính xác, dữ liệu trước và sau khi thay đổi (JSON Snapshot).

---

## 4. ĐẶC TẢ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU (DATABASE SPECIFICATIONS)

### 4.1. Danh mục 19 Bảng Dữ liệu Vật lý
1. `VAI_TRO`: Lưu trữ danh mục quyền hạn nhân sự (1: Quản lý, 2: Thu ngân).
2. `HANG_THANH_VIEN`: Bảng cấu hình các mốc điểm xếp hạng CRM (Đồng, Bạc, Vàng, Kim Cương).
3. `KICH_CO`: Bảng master kích thước cốc nước (Size S, Size M, Size L).
4. `PHUONG_THUC_THANH_TOAN`: Danh mục hình thức chi trả (1: Tiền mặt, 2: Chuyển khoản QR).
5. `DANH_MUC`: Phân loại nhóm đồ uống (Mã tự sinh dạng `DM00001`).
6. `SAN_PHAM`: Thực đơn đồ uống mẹ (Mã tự sinh dạng `SP00001`).
7. `SAN_PHAM_KICH_CO`: Bản đồ giá bán và định lượng theo kích cỡ của sản phẩm.
8. `TOPPING`: Danh sách các loại topping ăn kèm (Mã tự sinh dạng `TP00001`).
9. `NHAN_VIEN`: Hồ sơ tài khoản nhân viên và thông tin bảo mật (Mã `NV00001`).
10. `KHACH_HANG`: Hồ sơ khách hàng, ví tích điểm và phân hạng hội viên (Mã `KH00001`).
11. `GIO_HANG`: Bảng giỏ hàng đại diện cho mỗi khách hàng thành viên.
12. `CHI_TIET_GIO_HANG`: Danh sách các cốc nước trong giỏ hàng.
13. `CHI_TIET_TOPPING_GIO_HANG`: Danh sách topping đi kèm cốc nước trong giỏ.
14. `CHUONG_TRINH_KHUYEN_MAI`: Bảng voucher giảm giá (Mã `KM00001`).
15. `DON_HANG`: Bảng hóa đơn chính (Mã tự sinh định dạng `TEA-YYYYMMDD-XXXXX`).
16. `CHI_TIET_DON_HANG`: Các cốc nước chốt mua trong hóa đơn.
17. `CHI_TIET_TOPPING`: Danh sách topping đi kèm từng cốc nước trong hóa đơn.
18. `NHAT_KY_HOAT_DONG`: Hộp đen ghi vết kiểm toán toàn diện hệ thống.
19. `THONG_KE_NGAY`: Bảng kết chuyển dữ liệu gộp phục vụ báo cáo phân tích nhanh.

---

## 5. ĐẶC TẢ PHI CHỨC NĂNG (NON-FUNCTIONAL SPECIFICATIONS)

### 5.1. Hiệu năng & Khả năng tải (Performance & Scalability)
- **Connection Pool:** HikariCP duy trì tối thiểu 5 kết nối nhàn rỗi và tối đa 20 kết nối đồng thời, thời gian timeout fail-fast 20 giây.
- **Thời gian phản hồi:**
  - Thao tác bán hàng POS: Dưới 200ms cho mỗi lượt thêm món / áp voucher.
  - Tải trang danh mục sản phẩm: Dưới 500ms khi có trên 1.000 sản phẩm trong CSDL.
  - Polling kiểm tra trạng thái chuyển khoản: Tần suất 3 giây/lần không làm quá tải CPU máy chủ.

### 5.2. An toàn thông tin & Bảo mật (Security Specifications)
- **Mã hóa Mật khẩu:** Thuật toán Salted SHA-256 độc bản: `SHA256(password + "[$tea_pos_salt_key$]" + salt)` với salt là tên đăng nhập hoặc email người dùng.
- **Chống SQL Injection:** 100% câu truy vấn dữ liệu động phải sử dụng đối tượng tham số hóa `PreparedStatement` hoặc Stored Procedure.
- **Chống Path Traversal:** Chuẩn hóa đường dẫn tập tin tệp ảnh bằng `getCanonicalPath()` trước khi đọc từ ổ đĩa.
- **Kiểm soát Tải tệp (File Upload Validation):** Chỉ chấp nhận định dạng ảnh trong danh sách an toàn (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`), sinh tên ngẫu nhiên kết hợp Timestamp và UUID.
- **Chống Brute-force:** Tự động khóa tài khoản tạm thời 5 phút sau 5 lần nhập sai mật khẩu liên tiếp.
- **Tạo mã OTP an toàn:** Sử dụng thuật toán `java.security.SecureRandom` tạo mã OTP 6 chữ số ngẫu nhiên không thể dự đoán.
