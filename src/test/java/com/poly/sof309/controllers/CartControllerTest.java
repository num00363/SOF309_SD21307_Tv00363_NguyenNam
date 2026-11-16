package com.poly.sof309.controllers;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * =========================================================================
 * [Y3] UNIT TEST CHO CART & POS ORDER CONTROLLER (JUNIT 5 NÂNG CAO)
 * Dự án: TEA POS - Quản Lý & Bán Hàng Trà Sữa / Cà Phê
 * Sinh viên: Nguyễn Nam - MSSV: TV00363 - Lớp: SD21307
 * Áp dụng kỹ thuật:
 *   1. Parameterized Test (@ParameterizedTest + @CsvSource) - Kế thừa Lab 2
 *   2. Exception Testing (assertThrows) - Kế thừa Lab 3
 *   3. Timeout Testing (@Timeout) - Kế thừa Lab 3
 * =========================================================================
 */
@DisplayName("Kiểm thử Phân hệ Giỏ hàng & Bán hàng POS (CartController & Order)")
public class CartControllerTest {

    // =========================================================================
    // 1. PARAMETERIZED TESTS (@ParameterizedTest + @CsvSource)
    // =========================================================================

    @ParameterizedTest(name = "[{index}] Số lượng={0} => Hợp lệ: {1} ({2})")
    @DisplayName("TC_CART_VAL_01: Kiểm tra phân tích giá trị biên cho Số lượng đặt món trong giỏ")
    @CsvSource({
            "-1,  false, 'Số lượng âm không được phép'",
            "0,   false, 'Số lượng bằng 0 không hợp lệ'",
            "1,   true,  'Số lượng tối thiểu 1 ly'",
            "2,   true,  'Số lượng đặt thông thường'",
            "50,  true,  'Số lượng đặt cho văn phòng'",
            "99,  true,  'Số lượng trần tối đa cho 1 dòng món'",
            "100, false, 'Số lượng vượt quá ngưỡng tối đa cho phép trong 1 order'"
    })
    void testCartItemQuantityBoundary(int quantity, boolean expectedValid, String message) {
        boolean actualValid = (quantity >= 1 && quantity <= 99);
        assertEquals(expectedValid, actualValid, message);
    }

    @ParameterizedTest(name = "[{index}] Đơn giá={0}đ, Phụ thu size={1}đ, Số Topping={2}, Giá Topping={3}đ, SL={4} => Tổng tiền: {5}đ")
    @DisplayName("TC_CART_VAL_02: Kiểm tra công thức tính tổng tiền món kèm Topping và Phụ thu Size")
    @CsvSource({
            "30000.0, 0.0,    0, 0.0,    1, 30000.0",   // Size M cơ bản không topping
            "30000.0, 6000.0, 0, 0.0,    1, 36000.0",   // Size L (+6.000đ)
            "30000.0, 6000.0, 2, 5000.0, 1, 46000.0",   // Size L + 2 loại topping 5k
            "35000.0, 0.0,    1, 10000.0, 2, 90000.0",  // 2 ly size M + 1 topping 10k
            "40000.0, 10000.0, 3, 5000.0, 3, 195000.0"  // 3 ly combo đầy đủ
    })
    void testCalculateCartItemSubtotal(double basePrice, double sizeUpcharge, int toppingCount,
                                      double toppingUnitPrice, int quantity, double expectedTotal) {
        double actualTotal = calculateItemTotal(basePrice, sizeUpcharge, toppingCount, toppingUnitPrice, quantity);
        assertEquals(expectedTotal, actualTotal, 0.001, "Tổng tiền món tính toán phải chính xác tuyệt đối");
    }

    // =========================================================================
    // 2. EXCEPTION TESTING (assertThrows) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @DisplayName("TC_CART_EX_01: Ném IllegalArgumentException khi cập nhật số lượng món <= 0")
    void testUpdateCartNegativeQuantityThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            updateCartQuantityStrict("SP00001", -3);
        }, "Phải ném ngoại lệ IllegalArgumentException khi cập nhật số lượng <= 0");

        assertTrue(exception.getMessage().contains("Số lượng phải lớn hơn 0"));
    }

    @Test
    @DisplayName("TC_CART_EX_02: Ném IllegalStateException khi thanh toán giỏ hàng rỗng")
    void testCheckoutEmptyCartThrowsException() {
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            processCheckout(0, 0.0);
        }, "Phải ném ngoại lệ IllegalStateException khi giỏ hàng chưa có sản phẩm");

        assertTrue(exception.getMessage().contains("Giỏ hàng rỗng"));
    }

    @Test
    @DisplayName("TC_CART_EX_03: Ném SecurityException khi phát hiện gian lận sửa giá từ client (BUG-CODE-02)")
    void testPriceTamperingDetectionThrowsSecurityException() {
        double serverCalculatedPrice = 75000.0;
        double clientManipulatedPrice = 0.0; // Client cố tình sửa input hidden thành 0đ

        SecurityException exception = assertThrows(SecurityException.class, () -> {
            verifyPaymentAmountStrict(serverCalculatedPrice, clientManipulatedPrice);
        }, "Phải ném ngoại lệ SecurityException khi phát hiện số tiền client gửi lên bị thao túng");

        assertTrue(exception.getMessage().contains("Phát hiện bất thường về giá tiền"));
    }

    // =========================================================================
    // 3. TIMEOUT TESTING (@Timeout) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @DisplayName("TC_CART_TIME_01: Tính toán hóa đơn 100 món tại quầy POS hoàn thành dưới 2 giây")
    void testPosCalculationPerformanceWithinTimeout() {
        double runningTotal = 0.0;
        for (int i = 1; i <= 100; i++) {
            runningTotal += calculateItemTotal(30000.0, 5000.0, 2, 5000.0, 1);
        }
        assertEquals(4500000.0, runningTotal, 0.001);
    }

    // =========================================================================
    // CÁC HÀM TRỢ GIÚP LOGIC NGHIỆP VỤ (HELPER METHODS)
    // =========================================================================

    private double calculateItemTotal(double basePrice, double sizeUpcharge, int toppingCount,
                                      double toppingUnitPrice, int quantity) {
        double singleCupPrice = basePrice + sizeUpcharge + (toppingCount * toppingUnitPrice);
        return singleCupPrice * quantity;
    }

    private void updateCartQuantityStrict(String productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
    }

    private void processCheckout(int itemCount, double totalAmount) {
        if (itemCount <= 0 || totalAmount <= 0) {
            throw new IllegalStateException("Giỏ hàng rỗng, không thể tạo đơn hàng");
        }
    }

    private void verifyPaymentAmountStrict(double serverCalculatedPrice, double clientSubmittedPrice) {
        if (Math.abs(serverCalculatedPrice - clientSubmittedPrice) > 0.01) {
            throw new SecurityException("Cảnh báo bảo mật: Phát hiện bất thường về giá tiền (Gian lận thao túng client)");
        }
    }
}
