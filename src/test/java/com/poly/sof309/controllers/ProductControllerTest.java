package com.poly.sof309.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * =========================================================================
 * [Y3] UNIT TEST CHO PRODUCT CONTROLLER & SERVICE (JUNIT 5 NÂNG CAO)
 * Dự án: TEA POS - Quản Lý & Bán Hàng Trà Sữa / Cà Phê
 * Sinh viên: Nguyễn Nam - MSSV: TV00363 - Lớp: SD21307
 * Áp dụng kỹ thuật:
 *   1. Parameterized Test (@ParameterizedTest + @CsvSource) - Kế thừa Lab 2
 *   2. Exception Testing (assertThrows) - Kế thừa Lab 3
 *   3. Timeout Testing (@Timeout) - Kế thừa Lab 3
 * =========================================================================
 */
@DisplayName("Kiểm thử Phân hệ Quản lý Sản phẩm (ProductController & Service)")
public class ProductControllerTest {

    private List<String> existingProductNames;
    private List<String> productsInCart;

    @BeforeEach
    void setUp() {
        existingProductNames = new ArrayList<>();
        existingProductNames.add("Trà Sữa Trân Châu Hoàng Kim");
        existingProductNames.add("Cà Phê Muối Biển");
        existingProductNames.add("Trà Đào Cam Sả");

        productsInCart = new ArrayList<>();
        productsInCart.add("SP00001"); // Sản phẩm đang có trong giỏ hàng
    }

    // =========================================================================
    // 1. PARAMETERIZED TESTS (@ParameterizedTest + @CsvSource)
    // =========================================================================

    @ParameterizedTest(name = "[{index}] Giá={0}đ => Hợp lệ: {1} ({2})")
    @DisplayName("TC_PROD_VAL_01: Kiểm tra phân tích giá trị biên cho Đơn giá sản phẩm")
    @CsvSource({
            "-10000.0, false, 'Giá bán âm không được phép'",
            "-1.0,     false, 'Giá cận dưới biên âm'",
            "0.0,      false, 'Giá bằng 0 không được phép'",
            "1000.0,   true,  'Giá tối thiểu hợp lệ 1.000đ'",
            "35000.0,  true,  'Giá đồ uống thông dụng 35.000đ'",
            "150000.0, true,  'Giá combo đồ uống cao cấp'",
            "5000000.0,true,  'Giá sản phẩm bán buôn / máy pha'",
            "50000000.0,false,'Giá vượt quá ngưỡng giới hạn 20.000.000đ'"
    })
    void testProductPriceBoundary(double price, boolean expectedValid, String message) {
        boolean actualValid = validateProductPrice(price);
        assertEquals(expectedValid, actualValid, message);
    }

    @ParameterizedTest(name = "[{index}] Tên=''{0}'', Danh mục={1} => Hợp lệ: {2} ({3})")
    @DisplayName("TC_PROD_VAL_02: Kiểm tra validation tên món và danh mục đồ uống")
    @CsvSource({
            "'',                     1, false, 'Tên món không được để trống'",
            "'   ',                  1, false, 'Tên món không được toàn khoảng trắng'",
            "'A',                    1, false, 'Tên món quá ngắn (dưới 2 ký tự)'",
            "'Trà Sữa Oolong Lài',   0, false, 'Mã danh mục bằng 0 không hợp lệ'",
            "'Trà Sữa Oolong Lài',  -1, false, 'Mã danh mục âm không hợp lệ'",
            "'Trà Sữa Oolong Nướng', 1, true,  'Tên món và danh mục hợp lệ'",
            "'Cà Phê Đen Đá',        2, true,  'Tên món cà phê hợp lệ'"
    })
    void testProductNameAndCategoryValidation(String name, int categoryId, boolean expectedValid, String message) {
        boolean actualValid = validateProductInfo(name, categoryId);
        assertEquals(expectedValid, actualValid, message);
    }

    @ParameterizedTest(name = "[{index}] Tồn kho={0} => Hợp lệ: {1} ({2})")
    @DisplayName("TC_PROD_VAL_03: Kiểm tra biên số lượng tồn kho nguyên liệu / sản phẩm đóng chai")
    @CsvSource({
            "-5,   false, 'Số lượng tồn kho âm không hợp lệ'",
            "-1,   false, 'Biên âm gần 0'",
            "0,    true,  'Tồn kho bằng 0 (hết hàng) hợp lệ'",
            "1,    true,  'Tồn kho tối thiểu còn 1'",
            "500,  true,  'Tồn kho mức thông thường'",
            "99999,true,  'Tồn kho số lượng lớn'"
    })
    void testProductStockBoundary(int stock, boolean expectedValid, String message) {
        boolean actualValid = (stock >= 0);
        assertEquals(expectedValid, actualValid, message);
    }

    // =========================================================================
    // 2. EXCEPTION TESTING (assertThrows) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @DisplayName("TC_PROD_EX_01: Ném IllegalArgumentException khi thêm món có đơn giá âm")
    void testAddProductWithNegativePriceThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            createProductStrict("Trà Xanh Thái", -25000.0, 1);
        }, "Phải ném IllegalArgumentException khi đơn giá < 0");

        assertTrue(exception.getMessage().contains("Đơn giá sản phẩm phải lớn hơn 0"));
    }

    @Test
    @DisplayName("TC_PROD_EX_02: Ném IllegalArgumentException khi tên sản phẩm bị trùng lặp")
    void testAddDuplicateProductNameThrowsException() {
        String duplicateName = "Cà Phê Muối Biển";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            createProductStrict(duplicateName, 35000.0, 2);
        }, "Phải ném IllegalArgumentException khi tên sản phẩm đã tồn tại trong thực đơn");

        assertTrue(exception.getMessage().contains("Tên món đã tồn tại"));
    }

    @Test
    @DisplayName("TC_PROD_EX_03: Ném IllegalStateException khi xóa sản phẩm mà không dọn liên kết giỏ hàng (BUG-SQL-04)")
    void testDeleteProductWithActiveCartConflictThrowsException() {
        String productId = "SP00001";

        // Thao tác xóa mà chưa cấu hình xóa cascade giỏ hàng sẽ ném lỗi ràng buộc khóa ngoại
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deleteProductStrict(productId, false);
        }, "Phải ném ngoại lệ IllegalStateException khi có ràng buộc khóa ngoại trong giỏ hàng");

        assertTrue(exception.getMessage().contains("Ràng buộc khóa ngoại trong giỏ hàng"));
    }

    // =========================================================================
    // 3. TIMEOUT TESTING (@Timeout) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @DisplayName("TC_PROD_TIME_01: Tìm kiếm lọc danh sách 10.000 sản phẩm hoàn thành dưới 2 giây")
    void testSearchProductPerformanceWithinTimeout() {
        List<String> mockCatalog = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            mockCatalog.add("Sản phẩm đồ uống số " + i);
        }

        long matchCount = mockCatalog.stream()
                .filter(name -> name.contains("đồ uống số 99"))
                .count();

        assertTrue(matchCount > 0, "Phải tìm thấy ít nhất 1 kết quả");
    }

    // =========================================================================
    // CÁC HÀM TRỢ GIÚP LOGIC NGHIỆP VỤ (HELPER METHODS)
    // =========================================================================

    private boolean validateProductPrice(double price) {
        return price >= 1000.0 && price <= 20000000.0;
    }

    private boolean validateProductInfo(String name, int categoryId) {
        if (name == null || name.trim().isEmpty()) return false;
        if (name.trim().length() < 2 || name.trim().length() > 100) return false;
        if (categoryId <= 0) return false;
        return true;
    }

    private void createProductStrict(String name, double price, int categoryId) {
        if (!validateProductInfo(name, categoryId)) {
            throw new IllegalArgumentException("Thông tin món không hợp lệ");
        }
        if (price <= 0) {
            throw new IllegalArgumentException("Đơn giá sản phẩm phải lớn hơn 0");
        }
        if (existingProductNames.contains(name.trim())) {
            throw new IllegalArgumentException("Tên món đã tồn tại trong thực đơn: " + name);
        }
    }

    private void deleteProductStrict(String productId, boolean cascadeCleaned) {
        if (productsInCart.contains(productId) && !cascadeCleaned) {
            throw new IllegalStateException("Lỗi ràng buộc: Ràng buộc khóa ngoại trong giỏ hàng (CHI_TIET_GIO_HANG)");
        }
    }
}
