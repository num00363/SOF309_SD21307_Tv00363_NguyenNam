-- =========================================================================
-- HỆ THỐNG QUẢN LÝ VÀ BÁN HÀNG TRÀ SỮA TEA POS (QuanLyQuanCafecma)
-- BẢN THIẾT KẾ CƠ SỞ DỮ LIỆU ĐẦY ĐỦ VÀ HOÀN CHỈNH - KHÔNG CẮT BỚT
-- Thiết kế chuyên biệt dành riêng cho đồ án tốt nghiệp nhóm CodeDevSquad
-- Khớp 100% với cấu hình DBConnect.java (QuanLyQuanCafecma)
-- =========================================================================

-- STREAMING_CHUNK:Configuring the database environment...
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyQuanCafehetcuu')
BEGIN
    ALTER DATABASE QuanLyQuanCafehetcuu SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyQuanCafehetcuu;
END;
GO

CREATE DATABASE QuanLyQuanCafehetcuu;
GO
USE QuanLyQuanCafehetcuu;
GO

-- =========================================================================
-- I. DỌN DẸP BẢNG CŨ THEO THỨ TỰ TRÁNH LỖI RÀNG BUỘC KHÓA NGOẠI (DROP TABLES)
-- =========================================================================
-- STREAMING_CHUNK:Cleaning up old tables to prevent foreign key conflicts...
IF OBJECT_ID('dbo.THONG_KE_NGAY', 'U') IS NOT NULL DROP TABLE dbo.THONG_KE_NGAY;
IF OBJECT_ID('dbo.NHAT_KY_HOAT_DONG', 'U') IS NOT NULL DROP TABLE dbo.NHAT_KY_HOAT_DONG;
IF OBJECT_ID('dbo.CHI_TIET_TOPPING', 'U') IS NOT NULL DROP TABLE dbo.CHI_TIET_TOPPING;
IF OBJECT_ID('dbo.CHI_TIET_DON_HANG', 'U') IS NOT NULL DROP TABLE dbo.CHI_TIET_DON_HANG;
IF OBJECT_ID('dbo.DON_HANG', 'U') IS NOT NULL DROP TABLE dbo.DON_HANG;
IF OBJECT_ID('dbo.CHI_TIET_TOPPING_GIO_HANG', 'U') IS NOT NULL DROP TABLE dbo.CHI_TIET_TOPPING_GIO_HANG;
IF OBJECT_ID('dbo.CHI_TIET_GIO_HANG', 'U') IS NOT NULL DROP TABLE dbo.CHI_TIET_GIO_HANG;
IF OBJECT_ID('dbo.GIO_HANG', 'U') IS NOT NULL DROP TABLE dbo.GIO_HANG;
IF OBJECT_ID('dbo.KHACH_HANG', 'U') IS NOT NULL DROP TABLE dbo.KHACH_HANG;
IF OBJECT_ID('dbo.NHAN_VIEN', 'U') IS NOT NULL DROP TABLE dbo.NHAN_VIEN;
IF OBJECT_ID('dbo.TOPPING', 'U') IS NOT NULL DROP TABLE dbo.TOPPING;
IF OBJECT_ID('dbo.SAN_PHAM_KICH_CO', 'U') IS NOT NULL DROP TABLE dbo.SAN_PHAM_KICH_CO;
IF OBJECT_ID('dbo.SAN_PHAM', 'U') IS NOT NULL DROP TABLE dbo.SAN_PHAM;
IF OBJECT_ID('dbo.DANH_MUC', 'U') IS NOT NULL DROP TABLE dbo.DANH_MUC;
IF OBJECT_ID('dbo.PHUONG_THUC_THANH_TOAN', 'U') IS NOT NULL DROP TABLE dbo.PHUONG_THUC_THANH_TOAN;
IF OBJECT_ID('dbo.KICH_CO', 'U') IS NOT NULL DROP TABLE dbo.KICH_CO;
IF OBJECT_ID('dbo.HANG_THANH_VIEN', 'U') IS NOT NULL DROP TABLE dbo.HANG_THANH_VIEN;
IF OBJECT_ID('dbo.VAI_TRO', 'U') IS NOT NULL DROP TABLE dbo.VAI_TRO;
IF OBJECT_ID('dbo.CHUONG_TRINH_KHUYEN_MAI', 'U') IS NOT NULL DROP TABLE dbo.CHUONG_TRINH_KHUYEN_MAI;
GO

-- =========================================================================
-- II. DỌN DẸP & KHỞI TẠO HỆ THỐNG SEQUENCES PHÁT SINH MÃ ĐỘNG (NO CACHE)
-- =========================================================================
-- STREAMING_CHUNK:Initializing sequences for dynamic ID generation...
IF OBJECT_ID('dbo.seq_NhanVien', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_NhanVien;
IF OBJECT_ID('dbo.seq_KhachHang', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_KhachHang;
IF OBJECT_ID('dbo.seq_DonHang', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_DonHang;
IF OBJECT_ID('dbo.seq_SanPham', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_SanPham;
IF OBJECT_ID('dbo.seq_DanhMuc', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_DanhMuc;
IF OBJECT_ID('dbo.seq_Voucher', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_Voucher;
IF OBJECT_ID('dbo.seq_Topping', 'SO') IS NOT NULL DROP SEQUENCE dbo.seq_Topping;
GO

CREATE SEQUENCE seq_NhanVien START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_KhachHang START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_DonHang START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_SanPham START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_DanhMuc START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_Voucher START WITH 1 INCREMENT BY 1 NO CACHE;
CREATE SEQUENCE seq_Topping START WITH 1 INCREMENT BY 1 NO CACHE;
GO

-- =========================================================================
-- III. THIẾT KẾ CẤU TRÚC BẢNG VẬT LÝ CHI TIẾT (CREATING TABLES)
-- =========================================================================

-- STREAMING_CHUNK:Creating core reference tables (Roles, Memberships, Sizes, Payment)...
-- 1. Bảng Vai trò Nhân sự
CREATE TABLE VAI_TRO (
    ma_vt INT PRIMARY KEY,
    ten_vt NVARCHAR(50) NOT NULL,
    mo_ta NVARCHAR(255) NULL
);

-- 2. Bảng Phân Hạng Thành Viên CRM
CREATE TABLE HANG_THANH_VIEN (
    ma_hang INT PRIMARY KEY,
    ten_hang NVARCHAR(50) NOT NULL,
    diem_toi_thieu INT NOT NULL DEFAULT 0
);

-- 3. Bảng Master Kích Cỡ Ly Nước
CREATE TABLE KICH_CO (
    ma_size INT IDENTITY(1,1) PRIMARY KEY,
    ten_size NVARCHAR(50) NOT NULL UNIQUE,
    thu_tu_hien_thi INT NOT NULL DEFAULT 1
);

-- 4. Bảng Phương Thức Thanh Toán
CREATE TABLE PHUONG_THUC_THANH_TOAN (
    ma_pt INT IDENTITY(1,1) PRIMARY KEY,
    ten_pt NVARCHAR(100) NOT NULL,
    trang_thai BIT NOT NULL DEFAULT 1
);

-- STREAMING_CHUNK:Creating product catalog tables...
-- 5. Bảng Nhóm Danh Mục Đồ Uống
CREATE TABLE DANH_MUC (
    ma_dm VARCHAR(20) NOT NULL PRIMARY KEY,
    ten_dm NVARCHAR(100) NOT NULL UNIQUE,
    hinh_anh VARCHAR(500) NULL,
    thu_tu_hien_thi INT NOT NULL DEFAULT 0,
    trang_thai BIT NOT NULL DEFAULT 1
);

-- 6. Bảng Thực Đơn Sản Phẩm Mẹ
CREATE TABLE SAN_PHAM (
    ma_sp VARCHAR(20) NOT NULL PRIMARY KEY,
    ma_dm VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES DANH_MUC(ma_dm),
    ten_sp NVARCHAR(200) NOT NULL UNIQUE,
    mo_ta NVARCHAR(MAX) NULL,
    hinh_anh VARCHAR(500) NULL,
    cho_phep_doi_da BIT NOT NULL DEFAULT 1,
    cho_phep_doi_duong BIT NOT NULL DEFAULT 1,
    is_new BIT NOT NULL DEFAULT 0,
    is_bestseller BIT NOT NULL DEFAULT 0,
    trang_thai BIT NOT NULL DEFAULT 1,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME NULL,
    cho_phep_topping BIT NOT NULL DEFAULT 1,
    thu_tu_hien_thi INT NOT NULL DEFAULT 0
);

-- STREAMING_CHUNK:Creating product variants and topping tables...
-- 7. Bảng Bản đồ Biến thể Kích cỡ & Giá bán của Sản phẩm
CREATE TABLE SAN_PHAM_KICH_CO (
    ma_sp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES SAN_PHAM(ma_sp),
    ma_size INT NOT NULL FOREIGN KEY REFERENCES KICH_CO(ma_size),
    gia_ban INT NOT NULL CHECK (gia_ban >= 0),
    dinh_luong NVARCHAR(100) NULL,
    trang_thai BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (ma_sp, ma_size)
);

-- 8. Bảng Danh Sách Toppings Ăn Kèm
CREATE TABLE TOPPING (
    ma_tp VARCHAR(20) NOT NULL PRIMARY KEY,
    ten_tp NVARCHAR(150) NOT NULL UNIQUE,
    dinh_luong NVARCHAR(100) NULL,
    gia_ban INT NOT NULL CHECK (gia_ban >= 0),
    thu_tu_hien_thi INT NOT NULL DEFAULT 0,
    trang_thai BIT NOT NULL DEFAULT 1,
    hinh_anh VARCHAR(500) NULL
);

-- STREAMING_CHUNK:Creating user accounts and customer profiling tables...
-- 9. Bảng Hồ Sơ Nhân Viên
CREATE TABLE NHAN_VIEN (
    ma_nv VARCHAR(20) NOT NULL PRIMARY KEY,
    ma_vt INT NOT NULL FOREIGN KEY REFERENCES VAI_TRO(ma_vt),
    ho_ten NVARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    mat_khau VARCHAR(256) NOT NULL,
    trang_thai BIT NOT NULL DEFAULT 1,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME NULL
);

-- 10. Bảng Hồ Sơ Khách Hàng CRM & Ví Loyalty
CREATE TABLE KHACH_HANG (
    ma_kh VARCHAR(20) NOT NULL PRIMARY KEY,
    ma_hang INT NOT NULL FOREIGN KEY REFERENCES HANG_THANH_VIEN(ma_hang) DEFAULT 1,
    so_dien_thoai VARCHAR(20) NOT NULL UNIQUE,
    ten_kh NVARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mat_khau VARCHAR(256) NOT NULL,
    ngay_sinh DATE NULL,
    gioi_tinh NVARCHAR(20) NULL,
    dia_chi_lien_he NVARCHAR(500) NULL,
    hinh_anh_url VARCHAR(500) NULL,
    diem_tich_luy INT NOT NULL DEFAULT 0 CHECK (diem_tich_luy >= 0),
    trang_thai BIT NOT NULL DEFAULT 0,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME NULL
);

-- STREAMING_CHUNK:Creating cart and cart details tables...
-- 11. Bảng Giỏ Hàng Tổng Quát Trực Tuyến
CREATE TABLE GIO_HANG (
    ma_gh INT IDENTITY(1,1) PRIMARY KEY,
    ma_kh VARCHAR(20) NOT NULL UNIQUE FOREIGN KEY REFERENCES KHACH_HANG(ma_kh),
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_cap_nhat DATETIME NULL
);

-- 12. Bảng Chi Tiết Ly Nước Trong Giỏ Hàng
CREATE TABLE CHI_TIET_GIO_HANG (
    ma_ctgh BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_gh INT NOT NULL FOREIGN KEY REFERENCES GIO_HANG(ma_gh),
    ma_sp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES SAN_PHAM(ma_sp),
    ma_size INT NOT NULL FOREIGN KEY REFERENCES KICH_CO(ma_size),
    so_luong INT NOT NULL CHECK (so_luong > 0),
    muc_da VARCHAR(20) NOT NULL DEFAULT '100%',
    muc_duong VARCHAR(20) NOT NULL DEFAULT '100%',
    ghi_chu_mon NVARCHAR(255) NULL,
    is_chon_mua BIT NOT NULL DEFAULT 1,
    thoi_gian_them DATETIME NOT NULL DEFAULT GETDATE()
);

-- 13. Bảng Chi Tiết Topping Đi Kèm Của Cốc Trong Giỏ Hàng
CREATE TABLE CHI_TIET_TOPPING_GIO_HANG (
    ma_ctgh BIGINT NOT NULL FOREIGN KEY REFERENCES CHI_TIET_GIO_HANG(ma_ctgh),
    ma_tp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES TOPPING(ma_tp),
    so_luong_tp INT NOT NULL CHECK (so_luong_tp > 0) DEFAULT 1,
    PRIMARY KEY (ma_ctgh, ma_tp)
);

-- STREAMING_CHUNK:Creating promotions and order processing tables...
-- 14. Bảng Chương Trình Khuyến Mãi (Vouchers VIP)
CREATE TABLE CHUONG_TRINH_KHUYEN_MAI (
    ma_km VARCHAR(20) NOT NULL PRIMARY KEY,
    ten_km NVARCHAR(200) NOT NULL,
    ma_code VARCHAR(50) NOT NULL UNIQUE,
    mo_ta_dieu_kien NVARCHAR(MAX) NULL,
    hinh_anh_url VARCHAR(500) NULL,
    loai_giam INT NOT NULL CHECK (loai_giam IN (1, 2)),
    gia_tri_giam INT NOT NULL CHECK (gia_tri_giam >= 0),
    giam_toi_da INT NOT NULL DEFAULT 0,
    don_toi_thieu INT NOT NULL DEFAULT 0,
    is_public BIT NOT NULL DEFAULT 1,
    so_luong INT NOT NULL CHECK (so_luong >= 0),
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    trang_thai BIT NOT NULL DEFAULT 1,
    so_luot_dung_ca_nhan INT NOT NULL DEFAULT 0
);

-- 15. Bảng Hóa Đơn Đơn Hàng (Chính)
CREATE TABLE DON_HANG (
    ma_dh VARCHAR(50) NOT NULL PRIMARY KEY,
    ma_kh VARCHAR(20) NULL FOREIGN KEY REFERENCES KHACH_HANG(ma_kh),
    ma_nv VARCHAR(20) NULL FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv),
    ma_pt INT NOT NULL FOREIGN KEY REFERENCES PHUONG_THUC_THANH_TOAN(ma_pt),
    ma_km VARCHAR(20) NULL FOREIGN KEY REFERENCES CHUONG_TRINH_KHUYEN_MAI(ma_km),
    loai_don_hang INT NOT NULL DEFAULT 1,
    thoi_gian_hen_lay DATETIME NULL,
    tong_tien_hang INT NOT NULL,
    tien_giam_gia INT NOT NULL DEFAULT 0,
    diem_su_dung INT NOT NULL DEFAULT 0,
    tien_tru_diem INT NOT NULL DEFAULT 0,
    tong_phai_tra INT NOT NULL,
    ghi_chu_don NVARCHAR(255) NULL,
    ly_do_huy NVARCHAR(255) NULL,
    trang_thai_thanh_toan INT NOT NULL DEFAULT 0,
    trang_thai_don INT NOT NULL DEFAULT 0,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_hoan_thanh DATETIME NULL
);

-- STREAMING_CHUNK:Creating order detail tables...
-- 16. Bảng Chi Tiết Cốc Nước Trong Đơn Hàng
CREATE TABLE CHI_TIET_DON_HANG (
    ma_ctdh BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_dh VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES DON_HANG(ma_dh),
    ma_sp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES SAN_PHAM(ma_sp),
    ma_size INT NOT NULL FOREIGN KEY REFERENCES KICH_CO(ma_size),
    so_luong INT NOT NULL CHECK (so_luong > 0),
    gia_chot INT NOT NULL,
    muc_da VARCHAR(20) NOT NULL DEFAULT '100%',
    muc_duong VARCHAR(20) NOT NULL DEFAULT '100%',
    ghi_chu_mon NVARCHAR(255) NULL
);

-- 17. Bảng Chi Tiết Topping Ăn Kèm Của Cốc Trong Đơn Hàng
CREATE TABLE CHI_TIET_TOPPING (
    ma_ctdh BIGINT NOT NULL FOREIGN KEY REFERENCES CHI_TIET_DON_HANG(ma_ctdh),
    ma_tp VARCHAR(20) NOT NULL FOREIGN KEY REFERENCES TOPPING(ma_tp),
    so_luong INT NOT NULL CHECK (so_luong > 0) DEFAULT 1,
    gia_chot_tp INT NOT NULL,
    PRIMARY KEY (ma_ctdh, ma_tp)
);

-- STREAMING_CHUNK:Creating audit and statistics tables...
-- 18. Bảng Nhật Ký Hoạt Động (Hộp Đen Kiểm Toán Audit Trail)
CREATE TABLE NHAT_KY_HOAT_DONG (
    ma_log BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_nv VARCHAR(20) NULL FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv),
    hanh_dong NVARCHAR(100) NOT NULL,
    bang_tac_dong VARCHAR(100) NULL,
    du_lieu_cu NVARCHAR(MAX) NULL,
    du_lieu_moi NVARCHAR(MAX) NULL,
    ip_address VARCHAR(50) NULL,
    thoi_gian DATETIME NOT NULL DEFAULT GETDATE()
);

-- 19. Bảng Data Warehouse Thống Kê Gộp Đêm
CREATE TABLE THONG_KE_NGAY (
    ngay_thong_ke DATE PRIMARY KEY,
    tong_doanh_thu BIGINT NOT NULL DEFAULT 0,
    so_luong_don INT NOT NULL DEFAULT 0,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================================
-- IV. BIÊN DỊCH BỘ THỦ TỤC TRẢ ID TỰ SINH CHUẨN KẾT NỐI JDBC (STORED PROCEDURES)
-- =========================================================================

-- STREAMING_CHUNK:Compiling Stored Procedures for Category and Product insertion...
-- 1. Thủ tục thêm Danh mục (Mã tự sinh dạng DM00001) - ĐÃ FIX LỖI DAN_MUC
CREATE PROCEDURE sp_ThemDanhMuc
    @ten_dm NVARCHAR(100),
    @hinh_anh VARCHAR(500),
    @thu_tu INT,
    @trang_thai BIT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_dm VARCHAR(20);
    DECLARE @val_dm BIGINT = NEXT VALUE FOR seq_DanhMuc; SET @ma_dm = 'DM' + CASE WHEN @val_dm <= 99999 THEN RIGHT('00000' + CAST(@val_dm AS VARCHAR(10)), 5) ELSE CAST(@val_dm AS VARCHAR(10)) END;
    
    INSERT INTO DANH_MUC (ma_dm, ten_dm, hinh_anh, thu_tu_hien_thi, trang_thai)
    VALUES (@ma_dm, @ten_dm, @hinh_anh, @thu_tu, @trang_thai);
    
    SELECT @ma_dm AS ma_dm;
END;
GO

-- 2. Thủ tục thêm Sản phẩm (Mã tự sinh dạng SP00001)
CREATE PROCEDURE sp_ThemSanPham
    @ma_dm VARCHAR(20),
    @ten_sp NVARCHAR(200),
    @mo_ta NVARCHAR(MAX),
    @hinh_anh VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_sp VARCHAR(20);
    DECLARE @val_sp BIGINT = NEXT VALUE FOR seq_SanPham; SET @ma_sp = 'SP' + CASE WHEN @val_sp <= 99999 THEN RIGHT('00000' + CAST(@val_sp AS VARCHAR(10)), 5) ELSE CAST(@val_sp AS VARCHAR(10)) END;
    
    INSERT INTO SAN_PHAM (ma_sp, ma_dm, ten_sp, mo_ta, hinh_anh, cho_phep_doi_da, cho_phep_doi_duong, is_new, is_bestseller, trang_thai, thoi_gian_tao, cho_phep_topping)
    VALUES (@ma_sp, @ma_dm, @ten_sp, @mo_ta, @hinh_anh, 1, 1, 0, 0, 1, GETDATE(), 1);
    
    SELECT @ma_sp AS ma_sp;
END;
GO

-- STREAMING_CHUNK:Compiling Stored Procedures for Voucher and Employee insertion...
-- 3. Thủ tục thêm Voucher (Mã tự sinh dạng KM00001)
CREATE PROCEDURE sp_ThemVoucher
    @ten_km NVARCHAR(200),
    @ma_code VARCHAR(50),
    @mo_ta NVARCHAR(MAX),
    @hinh_anh VARCHAR(500),
    @loai_giam INT,
    @gia_tri_giam INT,
    @giam_toi_da INT,
    @don_toi_thieu INT,
    @is_public BIT,
    @so_luong INT,
    @ngay_bd DATETIME,
    @ngay_kt DATETIME,
    @trang_status BIT,
    @so_luot_dung_ca_nhan INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_km VARCHAR(20);
    DECLARE @val_km BIGINT = NEXT VALUE FOR seq_Voucher; SET @ma_km = 'KM' + CASE WHEN @val_km <= 99999 THEN RIGHT('00000' + CAST(@val_km AS VARCHAR(10)), 5) ELSE CAST(@val_km AS VARCHAR(10)) END;
    
    INSERT INTO CHUONG_TRINH_KHUYEN_MAI (ma_km, ten_km, ma_code, mo_ta_dieu_kien, hinh_anh_url, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, is_public, so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai, so_luot_dung_ca_nhan)
    VALUES (@ma_km, @ten_km, @ma_code, @mo_ta, @hinh_anh, @loai_giam, @gia_tri_giam, @giam_toi_da, @don_toi_thieu, @is_public, @so_luong, @ngay_bd, @ngay_kt, @trang_status, @so_luot_dung_ca_nhan);
    
    SELECT @ma_km AS ma_km;
END;
GO

-- 4. Thủ tục thêm Nhân viên (Mã tự sinh dạng NV00001)
CREATE PROCEDURE sp_ThemNhanVien
    @ma_vt INT,
    @ho_ten NVARCHAR(100),
    @sdt VARCHAR(20),
    @email VARCHAR(150),
    @username VARCHAR(50),
    @password VARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_nv VARCHAR(20);
    DECLARE @val_nv BIGINT = NEXT VALUE FOR seq_NhanVien; SET @ma_nv = 'NV' + CASE WHEN @val_nv <= 99999 THEN RIGHT('00000' + CAST(@val_nv AS VARCHAR(10)), 5) ELSE CAST(@val_nv AS VARCHAR(10)) END;
    
    INSERT INTO NHAN_VIEN (ma_nv, ma_vt, ho_ten, so_dien_thoai, email, ten_dang_nhap, mat_khau, trang_thai, thoi_gian_tao)
    VALUES (@ma_nv, @ma_vt, @ho_ten, @sdt, @email, @username, @password, 1, GETDATE());
    
    SELECT @ma_nv AS ma_nv;
END;
GO

-- STREAMING_CHUNK:Compiling Stored Procedures for Customer, Topping, and Order Payment...
-- 5. Thủ tục thêm Khách hàng CRM (Mã tự sinh dạng KH00001)
CREATE PROCEDURE sp_ThemKhachHang
    @ten_kh NVARCHAR(100),
    @sdt VARCHAR(20),
    @email VARCHAR(150),
    @password VARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_kh VARCHAR(20);
    DECLARE @val_kh BIGINT = NEXT VALUE FOR seq_KhachHang; SET @ma_kh = 'KH' + CASE WHEN @val_kh <= 99999 THEN RIGHT('00000' + CAST(@val_kh AS VARCHAR(10)), 5) ELSE CAST(@val_kh AS VARCHAR(10)) END;
    
    INSERT INTO KHACH_HANG (ma_kh, ma_hang, so_dien_thoai, ten_kh, email, mat_khau, diem_tich_luy, trang_thai, thoi_gian_tao)
    VALUES (@ma_kh, 1, @sdt, @ten_kh, @email, @password, 0, 0, GETDATE());
    
    SELECT @ma_kh AS ma_kh;
END;
GO

-- 6. Thủ tục thêm Topping (Mã tự sinh dạng TP00001)
CREATE PROCEDURE sp_ThemTopping
    @ten_tp NVARCHAR(150),
    @dinh_luong NVARCHAR(100),
    @gia_ban INT,
    @thu_tu INT,
    @trang_thai BIT,
    @hinh_anh VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_tp VARCHAR(20);
    DECLARE @val_tp BIGINT = NEXT VALUE FOR seq_Topping; SET @ma_tp = 'TP' + CASE WHEN @val_tp <= 99999 THEN RIGHT('00000' + CAST(@val_tp AS VARCHAR(10)), 5) ELSE CAST(@val_tp AS VARCHAR(10)) END;
    
    INSERT INTO TOPPING (ma_tp, ten_tp, dinh_luong, gia_ban, thu_tu_hien_thi, trang_thai, hinh_anh)
    VALUES (@ma_tp, @ten_tp, @dinh_luong, @gia_ban, @thu_tu, @trang_thai, @hinh_anh);
    
    SELECT @ma_tp AS ma_tp;
END;
GO

-- 7. Thủ tục đồng bộ hóa thanh toán đơn hàng POS & Online
CREATE PROCEDURE sp_ThanhToanDonHang
    @ma_dh VARCHAR(50),
    @trang_thai_tt INT,
    @trang_thai_don INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DON_HANG 
    SET trang_thai_thanh_toan = @trang_thai_tt,
        trang_thai_don = @trang_thai_don,
        thoi_gian_hoan_thanh = CASE WHEN @trang_thai_don = 4 THEN GETDATE() ELSE thoi_gian_hoan_thanh END
    WHERE ma_dh = @ma_dh;
END;
GO

-- =========================================================================
-- V. THIẾT LẬP CÁC VIEWS TỐI ƯU HÓA TRUY VẤN BIỂU ĐỒ (DASHBOARD VIEWS)
-- =========================================================================

-- STREAMING_CHUNK:Creating Views for Analytical Dashboards...
CREATE VIEW vw_DoanhThuNgay AS
SELECT 
    CAST(thoi_gian_tao AS DATE) AS Ngay,
    COUNT(ma_dh) AS SoLuongDon,
    SUM(tong_phai_tra) AS TongDoanhThu
FROM DON_HANG
WHERE trang_thai_don = 4
GROUP BY CAST(thoi_gian_tao AS DATE);
GO

CREATE VIEW vw_DoanhThuThang AS
SELECT 
    YEAR(thoi_gian_tao) AS Nam,
    MONTH(thoi_gian_tao) AS Thang,
    COUNT(ma_dh) AS SoLuongDon,
    SUM(tong_phai_tra) AS TongDoanhThu
FROM DON_HANG
WHERE trang_thai_don = 4
GROUP BY YEAR(thoi_gian_tao), MONTH(thoi_gian_tao);
GO

CREATE VIEW vw_TopSanPham AS
SELECT 
    ct.ma_sp,
    sp.ten_sp,
    dm.ten_dm,
    SUM(ct.so_luong) AS TongSoLuongBan,
    SUM(ct.so_luong * ct.gia_chot) AS DoanhThuMangLai
FROM CHI_TIET_DON_HANG ct
JOIN SAN_PHAM sp ON ct.ma_sp = sp.ma_sp
JOIN DANH_MUC dm ON sp.ma_dm = dm.ma_dm
JOIN DON_HANG dh ON ct.ma_dh = dh.ma_dh
WHERE dh.trang_thai_don = 4
GROUP BY ct.ma_sp, sp.ten_sp, dm.ten_dm;
GO

CREATE VIEW vw_TopNhanVien AS
SELECT 
    dh.ma_nv,
    nv.ho_ten,
    COUNT(dh.ma_dh) AS SoDonHoanThanh,
    SUM(dh.tong_phai_tra) AS DoanhThuTaoRa
FROM DON_HANG dh
JOIN NHAN_VIEN nv ON dh.ma_nv = nv.ma_nv
WHERE dh.trang_thai_don = 4
GROUP BY dh.ma_nv, nv.ho_ten;
GO

CREATE VIEW vw_DoanhThuTheoDanhMuc AS
SELECT 
    dm.ma_dm,
    dm.ten_dm,
    SUM(ct.so_luong) AS TongSanPhamBan,
    SUM(ct.so_luong * ct.gia_chot) AS TongDoanhThu
FROM CHI_TIET_DON_HANG ct
JOIN SAN_PHAM sp ON ct.ma_sp = sp.ma_sp
JOIN DANH_MUC dm ON sp.ma_dm = dm.ma_dm
JOIN DON_HANG dh ON ct.ma_dh = dh.ma_dh
WHERE dh.trang_thai_don = 4
GROUP BY dm.ma_dm, dm.ten_dm;
GO


-- =========================================================================
-- VI. NẠP DỮ LIỆU SEED KHỞI CHẠY HỆ THỐNG MẪU (SEEDING MASTER DATA)
-- =========================================================================

-- STREAMING_CHUNK:Seeding default roles, memberships, sizes and categories...
-- 1. Thêm Vai trò
INSERT INTO VAI_TRO (ma_vt, ten_vt, mo_ta) VALUES (1, N'Quản lý (Admin)', N'Toàn quyền quản trị và xem báo cáo tài chính');
INSERT INTO VAI_TRO (ma_vt, ten_vt, mo_ta) VALUES (2, N'Thu ngân (Staff)', N'Thực hiện bán hàng trực tiếp tại quầy POS');

-- 2. Thêm Hạng thành viên
INSERT INTO HANG_THANH_VIEN (ma_hang, ten_hang, diem_toi_thieu) VALUES (1, N'Hạng Đồng', 0);
INSERT INTO HANG_THANH_VIEN (ma_hang, ten_hang, diem_toi_thieu) VALUES (2, N'Hạng Bạc', 50);
INSERT INTO HANG_THANH_VIEN (ma_hang, ten_hang, diem_toi_thieu) VALUES (3, N'Hạng Vàng', 200);
INSERT INTO HANG_THANH_VIEN (ma_hang, ten_hang, diem_toi_thieu) VALUES (4, N'Hạng Kim Cương', 500);

-- 3. Thêm Phương thức thanh toán
INSERT INTO PHUONG_THUC_THANH_TOAN (ten_pt, trang_thai) VALUES (N'Tiền mặt', 1);
INSERT INTO PHUONG_THUC_THANH_TOAN (ten_pt, trang_thai) VALUES (N'Chuyển khoản QR', 1);

-- 4. Thêm Kích cỡ ly nước master
INSERT INTO KICH_CO (ten_size, thu_tu_hien_thi) VALUES ('S', 1);
INSERT INTO KICH_CO (ten_size, thu_tu_hien_thi) VALUES ('M', 2);
INSERT INTO KICH_CO (ten_size, thu_tu_hien_thi) VALUES ('L', 3);

-- 5. Thêm Danh mục mẫu
DECLARE @DMSua VARCHAR(20), @DMTra VARCHAR(20), @DMCafe VARCHAR(20), @DMBanh VARCHAR(20);
SET @DMSua = 'DM' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_DanhMuc AS VARCHAR(10)), 5);
INSERT INTO DANH_MUC (ma_dm, ten_dm, hinh_anh, thu_tu_hien_thi, trang_thai) VALUES (@DMSua, N'Trà Sữa Truyền Thống', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300', 1, 1);

SET @DMTra = 'DM' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_DanhMuc AS VARCHAR(10)), 5);
INSERT INTO DANH_MUC (ma_dm, ten_dm, hinh_anh, thu_tu_hien_thi, trang_thai) VALUES (@DMTra, N'Trà Trái Cây Thanh Mát', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=300', 2, 1);

SET @DMCafe = 'DM' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_DanhMuc AS VARCHAR(10)), 5);
INSERT INTO DANH_MUC (ma_dm, ten_dm, hinh_anh, thu_tu_hien_thi, trang_thai) VALUES (@DMCafe, N'Cà Phê Đậm Đà', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300', 3, 1);

SET @DMBanh = 'DM' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_DanhMuc AS VARCHAR(10)), 5);
INSERT INTO DANH_MUC (ma_dm, ten_dm, hinh_anh, thu_tu_hien_thi, trang_thai) VALUES (@DMBanh, N'Bánh Ngọt Ăn Kèm', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300', 4, 1);

-- STREAMING_CHUNK:Seeding default toppings and products...
-- 6. Thêm Topping mẫu
DECLARE @TPTranChau VARCHAR(20), @TPCheese VARCHAR(20), @TPDua VARCHAR(20), @TPPudding VARCHAR(20);
SET @TPTranChau = 'TP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_Topping AS VARCHAR(10)), 5);
INSERT INTO TOPPING (ma_tp, ten_tp, dinh_luong, gia_ban, thu_tu_hien_thi, trang_thai, hinh_anh) VALUES (@TPTranChau, N'Trân Châu Hoàng Kim', '30g', 5000, 1, 1, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100');

SET @TPCheese = 'TP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_Topping AS VARCHAR(10)), 5);
INSERT INTO TOPPING (ma_tp, ten_tp, dinh_luong, gia_ban, thu_tu_hien_thi, trang_thai, hinh_anh) VALUES (@TPCheese, N'Kem Cheese Phô Mai', '40ml', 10000, 2, 1, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100');

SET @TPDua = 'TP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_Topping AS VARCHAR(10)), 5);
INSERT INTO TOPPING (ma_tp, ten_tp, dinh_luong, gia_ban, thu_tu_hien_thi, trang_thai, hinh_anh) VALUES (@TPDua, N'Thạch Dừa Giòn', '30g', 6000, 3, 1, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=100');

SET @TPPudding = 'TP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_Topping AS VARCHAR(10)), 5);
INSERT INTO TOPPING (ma_tp, ten_tp, dinh_luong, gia_ban, thu_tu_hien_thi, trang_thai, hinh_anh) VALUES (@TPPudding, N'Pudding Trứng Mịn', '1 Hộp', 8000, 4, 1, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=100');

-- 7. Thêm Sản phẩm mẫu
DECLARE @SPTS VARCHAR(20), @SPTraDao VARCHAR(20), @SPCafeMuoi VARCHAR(20), @SPBanh VARCHAR(20);
SET @SPTS = 'SP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_SanPham AS VARCHAR(10)), 5);
INSERT INTO SAN_PHAM (ma_sp, ma_dm, ten_sp, mo_ta, hinh_anh, cho_phep_doi_da, cho_phep_doi_duong, is_new, is_bestseller, trang_thai, thoi_gian_tao, cho_phep_topping)
VALUES (@SPTS, @DMSua, N'Trà Sữa Trân Châu Đường Đen', N'Trà sữa béo ngậy kết hợp dòng sốt đường đen đậm đà và trân châu sần sật.', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400', 1, 1, 1, 1, 1, GETDATE(), 1);

SET @SPTraDao = 'SP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_SanPham AS VARCHAR(10)), 5);
INSERT INTO SAN_PHAM (ma_sp, ma_dm, ten_sp, mo_ta, hinh_anh, cho_phep_doi_da, cho_phep_doi_duong, is_new, is_bestseller, trang_thai, thoi_gian_tao, cho_phep_topping)
VALUES (@SPTraDao, @DMTra, N'Hồng Trà Đào Cam Sả', N'Vị thanh mát của trà đào hòa quyện cùng hương cam sả thơm lừng sảng khoái.', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', 1, 1, 0, 1, 1, GETDATE(), 1);

SET @SPCafeMuoi = 'SP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_SanPham AS VARCHAR(10)), 5);
INSERT INTO SAN_PHAM (ma_sp, ma_dm, ten_sp, mo_ta, hinh_anh, cho_phep_doi_da, cho_phep_doi_duong, is_new, is_bestseller, trang_thai, thoi_gian_tao, cho_phep_topping)
VALUES (@SPCafeMuoi, @DMCafe, N'Cà Phê Sương Muối', N'Cà phê phin thơm nồng kết hợp lớp kem phô mai sương muối mằn mặn béo bùi.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1, 1, 1, 0, 1, GETDATE(), 1);

SET @SPBanh = 'SP' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_SanPham AS VARCHAR(10)), 5);
INSERT INTO SAN_PHAM (ma_sp, ma_dm, ten_sp, mo_ta, hinh_anh, cho_phep_doi_da, cho_phep_doi_duong, is_new, is_bestseller, trang_thai, thoi_gian_tao, cho_phep_topping)
VALUES (@SPBanh, @DMBanh, N'Bánh Sừng Bò Croissant', N'Bánh sừng bò nướng bơ tỏi thơm lừng, vỏ giòn xốp bên trong mềm mịn béo bùi.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 0, 0, 0, 0, 1, GETDATE(), 0); -- TẮT TOPPING CHO BÁNH!

-- STREAMING_CHUNK:Seeding product sizes and demo user accounts...
-- 8. Thêm biến thể kích cỡ ly nước và đơn giá
-- Trà sữa đường đen: S (25k), M (30k), L (35k)
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTS, 1, 25000, '350ml', 1);
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTS, 2, 30000, '500ml', 1);
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTS, 3, 35000, '700ml', 1);

-- Trà đào cam sả: S (29k), M (35k), L (39k)
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTraDao, 1, 29000, '350ml', 1);
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTraDao, 2, 35000, '500ml', 1);
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPTraDao, 3, 39000, '700ml', 1);

-- Cafe muối: S (25k), M (30k)
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPCafeMuoi, 1, 25000, '250ml', 1);
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPCafeMuoi, 2, 30000, '350ml', 1);

-- Bánh Croissant: S (35k)
INSERT INTO SAN_PHAM_KICH_CO (ma_sp, ma_size, gia_ban, dinh_luong, trang_thai) VALUES (@SPBanh, 1, 35000, '1 Cái', 1);

-- 9. Thêm các tài khoản Nhân sự (Mật khẩu mặc định: '12345678' đã hash SHA-256)
DECLARE @NVAdmin VARCHAR(20), @NVStaff VARCHAR(20);
SET @NVAdmin = 'NV' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_NhanVien AS VARCHAR(10)), 5);
INSERT INTO NHAN_VIEN (ma_nv, ma_vt, ho_ten, so_dien_thoai, email, ten_dang_nhap, mat_khau, trang_thai, thoi_gian_tao)
VALUES (@NVAdmin, 1, N'Lâm Minh Quang', '0912345678', 'quang_admin@teapos.vn', 'admin', '3db8fe209bece1d01983058cb34f2725e864980fc0e4b882bcdaf32fbd9f85d6', 1, GETDATE());

SET @NVStaff = 'NV' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_NhanVien AS VARCHAR(10)), 5);
INSERT INTO NHAN_VIEN (ma_nv, ma_vt, ho_ten, so_dien_thoai, email, ten_dang_nhap, mat_khau, trang_thai, thoi_gian_tao)
VALUES (@NVStaff, 2, N'Nguyễn Thu Ngân', '0987654321', 'staff@teapos.vn', 'staff', '14afe2e96d51ca55a8f0a51149ea8909b46c47690aafb01492843b5337ee70d9', 1, GETDATE());

-- STREAMING_CHUNK:Seeding demo VIP customer and promotional vouchers...
-- 10. Thêm các tài khoản Khách hàng CRM mẫu (Trạng thái = 1 là hoạt động, Mật khẩu: '12345678' đã hash SHA-256)
DECLARE @KHMau VARCHAR(20);
SET @KHMau = 'KH' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_KhachHang AS VARCHAR(10)), 5);
INSERT INTO KHACH_HANG (ma_kh, ma_hang, so_dien_thoai, ten_kh, email, mat_khau, diem_tich_luy, trang_thai, thoi_gian_tao)
VALUES (@KHMau, 3, '0909999999', N'Trần Thị VIP', 'khach_vip@gmail.com', 'bf4e4a166a42f6ede1bd3185919eb80f03735968c1c8ff6b693a1f23d0b6cad0', 350, 1, GETDATE()); -- Hạng Vàng, 350 điểm sẵn có

-- Tự động tạo giỏ hàng cho khách hàng VIP mẫu
INSERT INTO GIO_HANG (ma_kh, thoi_gian_tao) VALUES (@KHMau, GETDATE());

-- 11. Thêm Voucher VIP mẫu (KM00001 - Hộp thư Voucher VIP, giới hạn dùng 1 lần/Cá nhân, đơn hàng tối thiểu 30k)
DECLARE @KMVip VARCHAR(20);
SET @KMVip = 'KM' + RIGHT('00000' + CAST(NEXT VALUE FOR seq_Voucher AS VARCHAR(10)), 5);
INSERT INTO CHUONG_TRINH_KHUYEN_MAI (ma_km, ten_km, ma_code, mo_ta_dieu_kien, hinh_anh_url, loai_giam, gia_tri_giam, giam_toi_da, don_toi_thieu, is_public, so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai, so_luot_dung_ca_nhan)
VALUES (@KMVip, N'Ưu Đãi Đặc Quyền Hội Viên VIP', 'TEA_VIP20K', N'Giảm ngay 20.000đ cho đơn hàng đạt mốc tối thiểu 30.000đ. Đặc quyền chỉ dành cho hạng Vàng và Kim Cương.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200', 1, 20000, 0, 30000, 0, 500, GETDATE(), DATEADD(month, 3, GETDATE()), 1, 1);

PRINT N'Chúc mừng: Cơ sở dữ liệu QuanLyQuanCafecma All-In-One hoàn chỉnh đã được khởi tạo mượt mà!';