// ================= ISTORE APPLICATION ENTRYPOINT (APP.JS) =================
// Dự án đã được tái cấu trúc và phân tách module chuẩn hóa theo từng giao diện:
// 1. common.js             : Tầng dùng chung (Session, Header Auth, Mascot, Search, Giờ Vàng Sale, Tiền tệ, Giỏ hàng)
// 2. home.js               : Logic riêng trang chủ index.html (Banner slider, Spotlight, Top rẻ nhất, Series list)
// 3. detail.js             : Logic riêng trang detail.html (Giao diện Shopee, 2 Tab bên dưới, Bộ lọc Catalog)
// 4. cart.js               : Logic riêng trang cart.html (Tích chọn thanh toán lẻ, Chọn tất cả, Tính lại tổng tiền)
// 5. profile.js            : Logic riêng trang profile.html (Đổi linh vật Mascot, Thống kê, Lịch sử mua hàng, Form xác thực)
// 6. checkout.js           : Logic riêng trang checkout.html (Nhận diện Google Maps, Bắt lỗi địa chỉ, Xóa món đã mua)
// 7. validators.js         : Thư viện xác thực biểu mẫu toàn diện (Họ tên, SĐT, CCCD, Mật khẩu, Địa chỉ, Google Maps)
// 8. wishlist-sale-alert.js: Quản lý sản phẩm yêu thích & Cảnh báo Flash Sale thời gian thực
// 9. chatbot.js            : Trợ lý AI so sánh thông minh 2-4 sản phẩm (danh sách tự đọc hoặc bảng cuộn tích chọn)

console.info("iStore: Modular system loaded successfully.");
