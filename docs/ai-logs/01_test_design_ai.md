# Nhật ký AI: Thiết Kế Đặc Tả Nghiệp Vụ & Sinh Bộ Test Plan & Test Case (Tuần 1 - Y1 & Y2)

- **Môn học:** SOF309 - Kiểm thử nâng cao cùng AI
- **Giảng viên hướng dẫn:** ThS. Trần Quang Bình (binhtq7 - Thầy Mười Giáo)
- **Sinh viên thực hiện:** Nguyễn Nam
- **Mã số sinh viên (MSSV):** TV00363
- **Lớp:** SD21307
- **Dự án Web cá nhân:** TEA POS - Hệ thống Quản Lý & Bán Hàng Trà Sữa / Cà Phê
- **Thời gian thực hiện:** 08/11/2026 - 22:30:00 (GMT+7)
- **Hệ thống AI sử dụng:** **Gemini 3.8 Flash** (Google DeepMind) trên Antigravity Agentic Coding Platform

---

## 1. Ngữ cảnh & Mục tiêu

* **Mục tiêu Tuần 1 (Y1 & Y2):**
  1. Khởi tạo repository chuẩn từ template của giảng viên: `https://github.com/num00363/SOF309_SD21307_Tv00363_NguyenNam.git`.
  2. Tích hợp toàn bộ mã nguồn Web cá nhân (TEA POS - Java Servlet, JSP, SQL Server) vào thư mục `src/main/` và cấu hình `pom.xml`.
  3. Xây dựng tài liệu đặc tả nghiệp vụ `docs/SPECIFICATIONS.md` theo chuẩn IEEE 830.
  4. Sử dụng công nghệ AI RAG (Retrieval-Augmented Generation) kết hợp kỹ thuật Phân vùng tương đương (Equivalence Partitioning) và Phân tích giá trị biên (Boundary Value Analysis) để thiết kế tự động bản Kế hoạch kiểm thử `docs/TEST_PLAN.md` và Bộ 24 Kịch bản kiểm thử chi tiết `docs/TEST_CASES.md`.
  5. Rà soát phát hiện các lỗi tiềm ẩn (UI, Code, SQL, Security) và khắc phục triệt để.

---

## 2. Câu lệnh đã gửi cho AI (Prompt)

### 2.1. Prompt RAG Kiểm thử Toàn diện & Thiết kế Test Plan, Test Cases:
```text
@[d:\DevSquadcuoimon\DevSquadcuoimon] giờ bạn tiến hành test toàn diện từ giao diện, sql, code để lấy kết quả, sau đó tạo ra 3 file, 1 file là ghi câu prompt mà tôi kêu bạn thực hiện test, 2 là phiên bản AI mà tôi đang sử dụng, và cuối cùng là 2 file này, thêm nó vào file project cho tôi TEST_PLAN.md và TEST_CASES.md, và file chứa các lỗi bug phát hiện, nguyên nhân gây lỗi là gì, và khắc phục ra sao, như thế nào, mức độ nghiêm trọng của lỗi, vị trí lỗi
```

### 2.2. Prompt RAG Bổ sung Đặc tả & Khắc phục Lỗi:
```text
SPECIFICATIONS thêm file đặc tả sản phẩm này cho tôi, sửa lại những lỗi bug đó và đồng thời thêm 1 file là fixed bug nữa, và ghi chép lại đầy đủ, bug đó sửa như nào, và cho tôi thêm 1 file nhật ký hoạt động xem ngày mấy tháng mấy năm mấy mình làm những gì
```

### 2.3. Prompt Tích hợp Template SOF309 Tuần 1:
```text
https://github.com/num00363/SOF309_SD21307_Tv00363_NguyenNam.git bạn truy cập vô link git này của tôi, dùng những file báo cáo các kiêu mà chúng ta đã làm với nhau để hoàn thành yêu cầu này (TUẦN 1: KHỞI TẠO REPO CÁ NHÂN & ĐẶC TẢ NGHIỆP VỤ BẰNG AI RAG)
```

---

## 3. Kết quả do AI sinh ra (AI Outputs)

1. **Mô hình AI:** **Gemini 3.8 Flash**
   - **Phiên bản:** Gemini 3.8 Flash (High Reasoning Profile)
   - **Khả năng:** Phân tích cú pháp mã nguồn tĩnh, quét AST, kiểm tra logic ràng buộc SQL và luồng điều khiển nghiệp vụ Java EE.

2. **Các tài liệu chất lượng cao đã sinh:**
   - `docs/SPECIFICATIONS.md`: Đặc tả chi tiết 11 mô-đun nghiệp vụ, sơ đồ luồng, ma trận phân quyền RBAC và bảng từ điển dữ liệu (Data Dictionary).
   - `docs/TEST_PLAN.md`: Bản kế hoạch kiểm thử chuẩn IEEE 829 gồm mục tiêu, môi trường, 5 cấp độ kiểm thử, chiến lược kiểm thử và ma trận rủi ro.
   - `docs/TEST_CASES.md`: Bộ 24 kịch bản kiểm thử chi tiết bao quát Đăng nhập, Giỏ hàng/POS, Đổi mật khẩu, Phân quyền Admin, Khuyến mãi, và Thanh toán SePay.
   - `docs/BUG_REPORT.md`: Báo cáo 10 lỗi bug từ Critical, High đến Medium kèm nguyên nhân gốc rễ.
   - `docs/FIXED_BUGS.md`: Chi tiết mã nguồn Before vs After khi sửa 10 bug.
   - `docs/ACTIVITY_LOG.md`: Nhật ký SDLC chi tiết từng mốc phát triển.

---

## 4. Chỉnh sửa của Sinh viên & Tích hợp vào Repo

1. **Khắc phục cấu trúc thư mục:**
   - Dọn dẹp các tệp tin rác bị tải nhầm lên `src/main/java/` trong các commit trước.
   - Di chuyển và đồng bộ mã nguồn Java chuẩn vào `src/main/java/com/...` và cấu hình kết nối `src/main/resources/application.properties`.
   - Đưa giao diện JSP và tài nguyên tĩnh CSS/JS vào `src/main/webapp/`.

2. **Cập nhật `pom.xml`:**
   - Giữ nguyên cấu hình kiểm thử JUnit 5 (`5.10.2`) và Selenium (`4.20.0`) của template môn học SOF309.
   - Bổ sung các thư viện runtime của Web cũ: Jakarta Servlet API 6.0, JSTL 3.0, MSSQL JDBC 12.4.2, HikariCP 5.0, Gson 2.10.1 và Angus Mail 2.0.3.

3. **Cập nhật cơ sở dữ liệu `CSDL.sql`:**
   - Áp dụng các bản vá bảo mật: cập nhật mật khẩu mã hóa PBKDF2WithHmacSHA512 + Salt cho Admin và Nhân viên.
   - Cung cấp tệp `CSDL.sql` ở thư mục gốc để giảng viên dễ dàng chạy kiểm thử.

4. **Nghiệm thu Tuần 1:**
   - Repo: [https://github.com/num00363/SOF309_SD21307_Tv00363_NguyenNam.git](https://github.com/num00363/SOF309_SD21307_Tv00363_NguyenNam.git)
   - Hoàn thành đầy đủ các tiêu chí yêu cầu trong `HUONG_DAN_CHI_TIET_6_TUAN.md`.
