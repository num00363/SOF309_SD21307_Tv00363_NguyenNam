# Nhật ký AI: Viết Unit Test Cho Controller Với JUnit 5 Nâng Cao (Tuần 2 - Y3)

- **Môn học:** SOF309 - Kiểm thử nâng cao cùng AI
- **Giảng viên hướng dẫn:** ThS. Trần Quang Bình (binhtq7 - Thầy Mười Giáo)
- **Sinh viên thực hiện:** Nguyễn Nam
- **Mã số sinh viên (MSSV):** TV00363
- **Lớp:** SD21307
- **Dự án Web cá nhân:** TEA POS - Hệ thống Quản Lý & Bán Hàng Trà Sữa / Cà Phê
- **Thời gian thực hiện:** 16/11/2026 - 09:10:00 (GMT+7)
- **Hệ thống AI sử dụng:** **Gemini 3.8 Flash** (Google DeepMind) trên Antigravity Agentic Platform

---

## 1. Ngữ cảnh & Mục tiêu

* **Mục tiêu Tuần 2 (Y3):**
  1. Xây dựng toàn diện bộ kịch bản Unit Test cho các Controller và Service trọng tâm của dự án TEA POS trong thư mục `src/test/java/com/poly/sof309/controllers/`.
  2. Kế thừa các kỹ thuật kiểm thử cốt lõi từ các bài Lab môn Kiểm thử nâng cao:
     - **Parameterized Test (`@ParameterizedTest` + `@CsvSource`):** Quét qua các giá trị biên của form Đăng nhập, Đăng ký, Đơn giá sản phẩm, Số lượng giỏ hàng, và Tỷ lệ voucher (Lab 2).
     - **Exception Testing (`assertThrows`):** Kiểm thử khả năng bắt và ném ngoại lệ nghiệp vụ chính xác khi có vi phạm (`DuplicatePhone`, `AccountLockout`, `PriceTampering`, `ExpiredVoucher`) (Lab 3).
     - **Timeout Testing (`@Timeout`):** Đảm bảo thuật toán mã hóa mật khẩu, tìm kiếm sản phẩm và tính toán bill hoàn thành dưới 2 giây, không bị treo thread (Lab 3).
  3. Đạt tiêu chí nghiệm thu: Lệnh `mvn test -Dtest=*ControllerTest` đạt **100% Pass (0 Failure, 0 Error)**.

---

## 2. Câu lệnh đã gửi cho AI (Prompt)

### Prompt yêu cầu AI sinh mã nguồn Unit Test JUnit 5:
```text
Bạn là Senior Automation QA Lead am hiểu sâu sắc JUnit 5. Dưới đây là đặc tả nghiệp vụ dự án TEA POS của tôi (docs/SPECIFICATIONS.md và docs/TEST_CASES.md).
Hãy viết bộ Unit Test toàn diện cho các Controller và Service trong thư mục src/test/java/com/poly/sof309/controllers/ thỏa mãn các điều kiện nghiêm ngặt sau:
1. Áp dụng kỹ thuật Parameterized Test (@ParameterizedTest + @CsvSource) để kiểm tra các giá trị biên form (Đăng nhập, Đăng ký, Giá sản phẩm, Số lượng giỏ hàng, Voucher).
2. Áp dụng kỹ thuật Exception Testing (assertThrows) để kiểm tra các ngoại lệ vi phạm nghiệp vụ (Trùng lặp SĐT, Khóa tài khoản sau 5 lần sai, Thao túng giá tiền BUG-CODE-02, Voucher hết hạn).
3. Áp dụng Timeout Testing (@Timeout(value = 2, unit = TimeUnit.SECONDS)) để đảm bảo không bị nghẽn hiệu năng.
4. Đảm bảo mã nguồn biên dịch mượt mà bằng Maven và chạy pass 100% không phụ thuộc database ngoài.
```

---

## 3. Kết quả do AI sinh ra (Raw Output)

Mô hình **Gemini 3.8 Flash** đã tự động phân tích đặc tả nghiệp vụ và sinh ra 4 lớp kiểm thử chuyên sâu:
1. `AuthControllerTest.java` (26 tests):
   - `@ParameterizedTest` kiểm tra biên thông tin đăng nhập (rỗng, khoảng trắng, độ dài < 3 hoặc > 30, mật khẩu < 6).
   - `@ParameterizedTest` kiểm tra định dạng số điện thoại Việt Nam (đầu số 03, 05, 07, 08, 09) và khớp mật khẩu xác nhận.
   - `@ParameterizedTest` kiểm tra tính tất định của thuật toán băm mật khẩu kèm muối (Salted SHA-256) qua `SecurityUtil.hashWithSalt`.
   - `assertThrows(IllegalArgumentException.class)` khi đăng ký trùng số điện thoại.
   - `assertThrows(SecurityException.class)` khi đăng nhập sai quá 5 lần liên tiếp (khóa 5 phút theo `TC-CODE-07`).
   - `assertThrows(IllegalArgumentException.class)` khi truyền tham số null.
   - `@Timeout(value = 2, unit = TimeUnit.SECONDS)` băm mật khẩu 1.000 lần và xác thực 500 lần.

2. `ProductControllerTest.java` (25 tests):
   - `@ParameterizedTest` kiểm tra biên giá sản phẩm (-10.000đ, 0đ, 1.000đ, 35.000đ, 150.000đ, > 20.000.000đ).
   - `@ParameterizedTest` kiểm tra tên món (rỗng, < 2 ký tự) và mã danh mục.
   - `@ParameterizedTest` kiểm tra tồn kho (âm, 0, số dương).
   - `assertThrows(IllegalArgumentException.class)` khi giá bán âm hoặc trùng lặp tên món trong thực đơn.
   - `assertThrows(IllegalStateException.class)` khi xóa sản phẩm đang tồn tại trong giỏ hàng mà chưa xử lý cascade (`BUG-SQL-04`).
   - `@Timeout` tìm kiếm trên danh mục 10.000 sản phẩm dưới 2 giây.

3. `CartControllerTest.java` (16 tests):
   - `@ParameterizedTest` kiểm tra số lượng đặt món biên (<= 0, 1 đến 99, >= 100).
   - `@ParameterizedTest` kiểm tra tính toán tổng tiền món kèm Topping và phụ thu Size (M, L).
   - `assertThrows(IllegalArgumentException.class)` khi cập nhật số lượng <= 0.
   - `assertThrows(IllegalStateException.class)` khi thanh toán giỏ hàng rỗng.
   - `assertThrows(SecurityException.class)` khi phát hiện gian lận sửa input hidden `tongPhaiTra` thành 0đ (`BUG-CODE-02`).
   - `@Timeout` tính toán hóa đơn 100 món tại quầy POS.

4. `VoucherControllerTest.java` (14 tests):
   - `@ParameterizedTest` kiểm tra tính giảm giá phần trăm có chặn trần (Max Cap).
   - `@ParameterizedTest` kiểm tra điều kiện đơn hàng tối thiểu áp dụng voucher.
   - `assertThrows(IllegalArgumentException.class)` khi % giảm âm hoặc > 100%.
   - `assertThrows(IllegalStateException.class)` khi voucher hết hạn hoặc hết lượt dùng.
   - `@Timeout` quét xác thực 10.000 voucher.

---

## 4. Chỉnh sửa của Sinh viên & Lý do sửa

1. **Hiệu chỉnh bộ dữ liệu đầu số điện thoại Việt Nam:**
   - Trong bản sinh ban đầu, AI đặt test case số điện thoại `0801234567` là không hợp lệ (`expected = false`). Tuy nhiên theo quy hoạch viễn thông Việt Nam, đầu số `08` là hợp lệ (mạng Vinaphone/Viettel như 081, 082, 083, 086, 088).
   - *Khắc phục:* Sinh viên đã cập nhật lại ca kiểm thử đầu số không hợp lệ sang `0101234567` (đầu số 11 số cũ đã bị thu hồi) để đảm bảo tính logic và độ chính xác thực tế.

2. **Cách ly Unit Test khỏi Database trực tiếp:**
   - Để pipeline Maven surefire và CI/CD GitHub Actions có thể chạy độc lập không phụ thuộc vào việc máy local đã bật SQL Server hay chưa, các Controller Test được thiết kế mô phỏng nghiệp vụ thuần (Pure Business Logic & Helpers) kết hợp trực tiếp với các lớp bảo mật cốt lõi (`util.SecurityUtil`).

3. **Kết quả nghiệm thu thực tế bằng Maven:**
   ```text
   [INFO] Running com.poly.sof309.controllers.AuthControllerTest
   [INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
   [INFO] Running com.poly.sof309.controllers.CartControllerTest
   [INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
   [INFO] Running com.poly.sof309.controllers.ProductControllerTest
   [INFO] Tests run: 25, Failures: 0, Errors: 0, Skipped: 0
   [INFO] Running com.poly.sof309.controllers.SampleControllerTest
   [INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
   [INFO] Running com.poly.sof309.controllers.VoucherControllerTest
   [INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0
   [INFO] ------------------------------------------------------------------------
   [INFO] BUILD SUCCESS
   [INFO] Tests run: 83, Failures: 0, Errors: 0, Skipped: 0
   [INFO] ------------------------------------------------------------------------
   ```
   $\rightarrow$ Đạt **100% Pass** cho toàn bộ 83 Unit Tests.
