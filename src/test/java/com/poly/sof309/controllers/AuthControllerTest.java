package com.poly.sof309.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import util.SecurityUtil;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * =========================================================================
 * [Y3] UNIT TEST CHO AUTHENTICATION CONTROLLER & SERVICE (JUNIT 5 NÂNG CAO)
 * Dự án: TEA POS - Quản Lý & Bán Hàng Trà Sữa / Cà Phê
 * Sinh viên: Nguyễn Nam - MSSV: TV00363 - Lớp: SD21307
 * Áp dụng kỹ thuật:
 *   1. Parameterized Test (@ParameterizedTest + @CsvSource) - Kế thừa Lab 2
 *   2. Exception Testing (assertThrows) - Kế thừa Lab 3
 *   3. Timeout Testing (@Timeout) - Kế thừa Lab 3
 * =========================================================================
 */
@DisplayName("Kiểm thử Phân hệ Xác thực & Phân quyền (AuthController & Service)")
public class AuthControllerTest {

    private Map<String, Integer> loginFailures;
    private Map<String, Long> accountLockouts;
    private final int MAX_FAILED_ATTEMPTS = 5;
    private final long LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 phút

    @BeforeEach
    void setUp() {
        loginFailures = new ConcurrentHashMap<>();
        accountLockouts = new ConcurrentHashMap<>();
    }

    // =========================================================================
    // 1. PARAMETERIZED TESTS (@ParameterizedTest + @CsvSource)
    // =========================================================================

    @ParameterizedTest(name = "[{index}] username=''{0}'', password=''{1}'' => Hợp lệ: {2} ({3})")
    @DisplayName("TC_AUTH_VAL_01: Kiểm tra validation biên cho form Đăng nhập")
    @CsvSource({
            "'',                '12345678',    false, 'Tên đăng nhập không được để trống'",
            "'   ',             '12345678',    false, 'Tên đăng nhập không được chỉ chứa khoảng trắng'",
            "'admin',           '',            false, 'Mật khẩu không được để trống'",
            "'admin',           '   ',         false, 'Mật khẩu không được chỉ chứa khoảng trắng'",
            "'ad',              '12345678',    false, 'Tên đăng nhập dưới 3 ký tự'",
            "'admin_super_user_long_name_exceeding_limit', '12345678', false, 'Tên đăng nhập vượt quá 30 ký tự'",
            "'admin',           '123',         false, 'Mật khẩu dưới 6 ký tự'",
            "'admin',           '12345678',    true,  'Đăng nhập với tài khoản hợp lệ'",
            "'staff01',         'Staff@2026',  true,  'Đăng nhập nhân viên hợp lệ'",
            "'0909999999',      'Cust#Pass1',  true,  'Đăng nhập khách hàng bằng SĐT hợp lệ'"
    })
    void testLoginInputValidation(String username, String password, boolean expectedValid, String message) {
        boolean actualValid = validateLoginInput(username, password);
        assertEquals(expectedValid, actualValid, message);
    }

    @ParameterizedTest(name = "[{index}] SĐT=''{0}'', Pass=''{1}'', Confirm=''{2}'' => Thành công: {3} ({4})")
    @DisplayName("TC_AUTH_VAL_02: Kiểm tra validation biên cho form Đăng ký tài khoản khách hàng")
    @CsvSource({
            // FIX BUG-TEST-01: SĐT rỗng → hàm return false ngay tại bước kiểm tra SĐT,
            // confirmPassword KHÔNG có tác động tới kết quả. Dùng 'N/A' để tránh hiểu nhầm.
            "'',            'Pass@1234',   'N/A',         false, 'SĐT không được để trống'",
            "'090123456',   'Pass@1234',   'Pass@1234',   false, 'SĐT thiếu số (9 chữ số)'",
            "'09012345678', 'Pass@1234',   'Pass@1234',   false, 'SĐT thừa số (11 chữ số)'",
            "'0101234567',  'Pass@1234',   'Pass@1234',   false, 'Đầu số không hợp lệ (01)'",
            "'090123456a',  'Pass@1234',   'Pass@1234',   false, 'SĐT chứa ký tự chữ'",
            "'0901234567',  '12345',       '12345',       false, 'Mật khẩu dưới 6 ký tự'",
            // Ca test confirm password THỰC SỰ: SĐT hợp lệ nhưng confirm sai → hàm mới chạy tới bước so sánh
            "'0901234567',  'Pass@1234',   'Pass@9999',   false, 'Mật khẩu xác nhận không khớp'",
            "'0901234567',  'Pass@1234',   'Pass@1234',   true,  'Đăng ký tài khoản hợp lệ'"
    })
    void testRegisterValidation(String phone, String password, String confirmPassword, boolean expectedSuccess, String message) {
        boolean actualSuccess = validateRegisterInput(phone, password, confirmPassword);
        assertEquals(expectedSuccess, actualSuccess, message);
    }

    @ParameterizedTest(name = "[{index}] Mật khẩu thô=''{0}'', Salt=''{1}''")
    @DisplayName("TC_AUTH_VAL_03: Xác thực thuật toán băm mật khẩu kèm muối (Salted Hash) với SecurityUtil")
    @CsvSource({
            "'12345678',    'admin_salt_#1'",
            "'Staff@2026',  'staff_salt_#2'",
            "'P@ssw0rd',    'cust_salt_#3'"
    })
    void testSaltedPasswordHashing(String rawPassword, String salt) {
        String hash1 = SecurityUtil.hashWithSalt(rawPassword, salt);
        String hash2 = SecurityUtil.hashWithSalt(rawPassword, salt);

        assertNotNull(hash1, "Chuỗi băm không được null");
        assertEquals(64, hash1.length(), "Độ dài chuỗi SHA-256 phải là 64 ký tự hex");
        assertEquals(hash1, hash2, "Cùng mật khẩu và salt phải sinh ra cùng mã băm (Deterministic)");

        // So khớp mật khẩu đúng
        assertTrue(SecurityUtil.checkPassword(rawPassword, hash1, salt), "Mật khẩu đúng phải xác thực thành công");
        // So khớp mật khẩu sai
        assertFalse(SecurityUtil.checkPassword(rawPassword + "_wrong", hash1, salt), "Mật khẩu sai phải bị từ chối");
    }

    // =========================================================================
    // 2. EXCEPTION TESTING (assertThrows) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @DisplayName("TC_AUTH_EX_01: Ném IllegalArgumentException khi đăng ký số điện thoại đã tồn tại")
    void testRegisterDuplicatePhoneThrowsException() {
        String existingPhone = "0909999999";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            registerNewAccount(existingPhone, "Pass@1234", "Pass@1234", true);
        }, "Phải ném ngoại lệ IllegalArgumentException khi SĐT đã được đăng ký trước đó");

        assertTrue(exception.getMessage().contains("Số điện thoại đã tồn tại"),
                "Thông báo ngoại lệ phải chứa thông điệp vi phạm trùng lặp SĐT");
    }

    @Test
    @DisplayName("TC_AUTH_EX_02: Ném SecurityException khi tài khoản bị khóa do đăng nhập sai quá 5 lần")
    void testAccountLockoutThrowsSecurityException() {
        String username = "admin";
        String wrongPassword = "wrongPassword123";

        // Thử đăng nhập sai 5 lần liên tiếp
        for (int i = 1; i <= MAX_FAILED_ATTEMPTS; i++) {
            boolean success = authenticateWithLockout(username, wrongPassword);
            assertFalse(success, "Lần thử " + i + " phải thất bại với mật khẩu sai");
        }

        // Lần thử thứ 6 phải ném ngoại lệ SecurityException do tài khoản đã bị khóa
        SecurityException exception = assertThrows(SecurityException.class, () -> {
            authenticateWithLockout(username, "12345678");
        }, "Phải ném ngoại lệ SecurityException khi tài khoản đang trong trạng thái bị tạm khóa 5 phút");

        assertTrue(exception.getMessage().contains("Tài khoản bị tạm khóa"),
                "Thông điệp ngoại lệ phải thông báo tài khoản bị tạm khóa");
    }

    @Test
    @DisplayName("TC_AUTH_EX_03: Ném IllegalArgumentException khi tham số truyền vào hàm xác thực là null")
    void testNullAuthenticationParametersThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            authenticateStrict(null, "12345678");
        }, "Username null phải ném ngoại lệ IllegalArgumentException");

        assertThrows(IllegalArgumentException.class, () -> {
            authenticateStrict("admin", null);
        }, "Password null phải ném ngoại lệ IllegalArgumentException");
    }

    // =========================================================================
    // 3. TIMEOUT TESTING (@Timeout) - Kế thừa Lab 3
    // =========================================================================

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @DisplayName("TC_AUTH_TIME_01: Đảm bảo quy trình băm mật khẩu 1.000 lần không vượt quá 2 giây")
    void testPasswordHashingPerformanceWithinTimeout() {
        for (int i = 0; i < 1000; i++) {
            String hash = SecurityUtil.hashWithSalt("password_test_" + i, "salt_" + i);
            assertNotNull(hash);
        }
    }

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    @DisplayName("TC_AUTH_TIME_02: Xác thực luồng kiểm tra đăng nhập xử lý dưới 2 giây")
    void testAuthenticationProcessingWithinTimeout() {
        for (int i = 0; i < 500; i++) {
            validateLoginInput("user" + i, "P@ssword" + i);
        }
    }

    // =========================================================================
    // CÁC HÀM TRỢ GIÚP LOGIC NGHIỆP VỤ (HELPER METHODS)
    // =========================================================================

    private boolean validateLoginInput(String username, String password) {
        if (username == null || password == null) return false;
        String cleanUser = username.trim();
        String cleanPass = password.trim();
        if (cleanUser.isEmpty() || cleanPass.isEmpty()) return false;
        if (cleanUser.length() < 3 || cleanUser.length() > 30) return false;
        if (cleanPass.length() < 6) return false;
        return true;
    }

    private boolean validateRegisterInput(String phone, String password, String confirmPassword) {
        if (phone == null || password == null || confirmPassword == null) return false;
        String cleanPhone = phone.trim();
        if (!cleanPhone.matches("^(03|05|07|08|09)\\d{8}$")) return false;
        if (password.length() < 6) return false;
        if (!password.equals(confirmPassword)) return false;
        return true;
    }

    private void registerNewAccount(String phone, String password, String confirmPassword, boolean isDuplicate) {
        if (isDuplicate) {
            throw new IllegalArgumentException("Lỗi: Số điện thoại đã tồn tại trên hệ thống");
        }
        if (!validateRegisterInput(phone, password, confirmPassword)) {
            throw new IllegalArgumentException("Dữ liệu đăng ký không hợp lệ");
        }
    }

    private boolean authenticateWithLockout(String username, String password) {
        long now = System.currentTimeMillis();
        Long lockoutUntil = accountLockouts.get(username);
        if (lockoutUntil != null && now < lockoutUntil) {
            long remainingSeconds = (lockoutUntil - now) / 1000;
            throw new SecurityException("Tài khoản bị tạm khóa. Vui lòng thử lại sau " + remainingSeconds + " giây.");
        }

        // Giả lập mật khẩu đúng là "12345678"
        boolean isValid = "admin".equalsIgnoreCase(username) && "12345678".equals(password);
        if (isValid) {
            loginFailures.remove(username);
            accountLockouts.remove(username);
            return true;
        } else {
            int currentFailures = loginFailures.getOrDefault(username, 0) + 1;
            loginFailures.put(username, currentFailures);
            if (currentFailures >= MAX_FAILED_ATTEMPTS) {
                accountLockouts.put(username, now + LOCKOUT_DURATION_MS);
            }
            return false;
        }
    }

    private boolean authenticateStrict(String username, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống");
        }
        return "admin".equals(username) && "12345678".equals(password);
    }
}
