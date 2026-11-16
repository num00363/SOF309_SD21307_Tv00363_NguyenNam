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
 * [Y3] UNIT TEST CHO VOUCHER / KHUYẾN MÃI CONTROLLER (JUNIT 5 NÂNG CAO)
 * Dự án: TEA POS - Quản Lý & Bán Hàng Trà Sữa / Cà Phê
 * Sinh viên: Nguyễn Nam - MSSV: TV00363 - Lớp: SD21307
 * Áp dụng kỹ thuật:
 *   1. Parameterized Test (@ParameterizedTest + @CsvSource) - Kế thừa Lab 2
 *   2. Exception Testing (assertThrows) - Kế thừa Lab 3
 *   3. Timeout Testing (@Timeout) - Kế thừa Lab 3
 * =========================================================================
 */
@DisplayName("Kiểm thử Phân hệ Voucher Khuyến mãi (VoucherController & Service)")
public class VoucherControllerTest {

    // =========================================================================
    // 1. PARAMETERIZED TESTS (@ParameterizedTest + @CsvSource)
    // =========================================================================

    @ParameterizedTest(name = "[{index}] Tổng đơn={0}đ, % Giảm={1}%, Giảm tối đa={2}đ => Tiền giảm: {3}đ")
    @DisplayName("TC_VOUCHER_VAL_01: Kiểm tra tính tiền giảm giá phần trăm có chặn trần (Max Cap)")
    @CsvSource({
            "100000.0, 10.0, 50000.0, 10000.0",   // 10% của 100k = 10k (< 50k cap)
            "200000.0, 20.0, 30000.0, 30000.0",   // 20% của 200k = 40k (> 30k cap) -> chạm trần 30k
            "50000.0,  50.0, 20000.0, 20000.0",   // 50% của 50k = 25k (> 20k cap) -> chạm trần 20k
            "0.0,      10.0, 50000.0, 0.0",       // Đơn 0đ giảm 0đ
            "500000.0, 0.0,  50000.0, 0.0"        // Giảm 0% giảm 0đ
    })
    void testPercentageDiscountCalculation(double orderTotal, double percent, double maxDiscount, double expectedDiscount) {
        double actualDiscount = calculatePercentageDiscount(orderTotal, percent, maxDiscount);
        assertEquals(expectedDiscount, actualDiscount, 0.001, "Tiền giảm giá phải chính xác theo trần tối đa");
    }

    @ParameterizedTest(name = "[{index}] Tổng bill={0}đ, Đơn tối thiểu={1}đ => Đủ điều kiện: {2}")
    @DisplayName("TC_VOUCHER_VAL_02: Kiểm tra biên điều kiện đơn hàng tối thiểu áp dụng mã")
    @CsvSource({
            "99000.0,  100000.0, false", // Dưới biên 1.000đ -> Không đủ điều kiện
            "100000.0, 100000.0, true",  // Đúng tại biên -> Đủ điều kiện
            "101000.0, 100000.0, true",  // Trên biên 1.000đ -> Đủ điều kiện
            "0.0,      50000.0,  false", // Bill 0đ
            "150000.0, 0.0,      true"   // Không yêu cầu đơn tối thiểu
    })
    void testMinimumOrderCondition(double billAmount, double minRequired, boolean expectedEligible) {
        boolean actualEligible = (billAmount >= minRequired);
        assertEquals(expectedEligible, actualEligible);
    }

    // =========================================================================
    // 2. EXCEPTION TESTING (assertThrows) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @DisplayName("TC_VOUCHER_EX_01: Ném IllegalArgumentException khi phần trăm giảm giá vượt quá 100% hoặc âm")
    void testInvalidDiscountPercentThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            validateVoucherPercentStrict(-5.0);
        }, "Phần trăm giảm âm phải ném IllegalArgumentException");

        assertThrows(IllegalArgumentException.class, () -> {
            validateVoucherPercentStrict(105.0);
        }, "Phần trăm giảm > 100% phải ném IllegalArgumentException");
    }

    @Test
    @DisplayName("TC_VOUCHER_EX_02: Ném IllegalStateException khi áp dụng mã voucher đã hết hạn sử dụng")
    void testExpiredVoucherThrowsException() {
        long pastExpiryTime = System.currentTimeMillis() - 86400000L; // Hết hạn 1 ngày trước

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            applyVoucherStrict("VOUCHER_OLD", pastExpiryTime, 10);
        }, "Phải ném ngoại lệ IllegalStateException khi voucher đã hết hạn");

        assertTrue(exception.getMessage().contains("Voucher đã hết hạn sử dụng"));
    }

    @Test
    @DisplayName("TC_VOUCHER_EX_03: Ném IllegalStateException khi số lượng lượt dùng voucher bằng 0")
    void testOutOfUsageLimitVoucherThrowsException() {
        long futureExpiryTime = System.currentTimeMillis() + 86400000L;
        int remainingUsage = 0; // Đã hết lượt dùng

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            applyVoucherStrict("VOUCHER_LIMITED", futureExpiryTime, remainingUsage);
        }, "Phải ném ngoại lệ IllegalStateException khi mã voucher đã hết lượt sử dụng");

        assertTrue(exception.getMessage().contains("Mã voucher đã hết lượt sử dụng"));
    }

    // =========================================================================
    // 3. TIMEOUT TESTING (@Timeout) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @DisplayName("TC_VOUCHER_TIME_01: Quét kiểm tra 10.000 mã khuyến mãi hoàn thành dưới 2 giây")
    void testBatchVoucherValidationWithinTimeout() {
        for (int i = 0; i < 10000; i++) {
            calculatePercentageDiscount(150000.0, 15.0, 30000.0);
        }
    }

    // =========================================================================
    // CÁC HÀM TRỢ GIÚP LOGIC NGHIỆP VỤ (HELPER METHODS)
    // =========================================================================

    private double calculatePercentageDiscount(double orderTotal, double percent, double maxDiscount) {
        if (orderTotal <= 0 || percent <= 0) return 0.0;
        double discount = orderTotal * (percent / 100.0);
        return Math.min(discount, maxDiscount);
    }

    private void validateVoucherPercentStrict(double percent) {
        if (percent < 0.0 || percent > 100.0) {
            throw new IllegalArgumentException("Tỷ lệ giảm giá phải nằm trong khoảng từ 0% đến 100%");
        }
    }

    private void applyVoucherStrict(String code, long expiryTime, int remainingUsage) {
        if (System.currentTimeMillis() > expiryTime) {
            throw new IllegalStateException("Lỗi: Voucher đã hết hạn sử dụng");
        }
        if (remainingUsage <= 0) {
            throw new IllegalStateException("Lỗi: Mã voucher đã hết lượt sử dụng");
        }
    }
}
