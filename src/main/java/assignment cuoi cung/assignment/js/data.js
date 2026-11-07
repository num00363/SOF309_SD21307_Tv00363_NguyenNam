// Dữ liệu Banners
const bannersData = [
  {
    id: 1,
    category: "iphone-15",
    image: "../image/banner1.webp",
    title: "Đặt Trước iPhone 15 Series",
  },
  {
    id: 2,
    category: "iphone-16",
    image: "../image/banner2.jpg",
    title: "Đặt Trước iPhone 16 Series",
    wideBanner: {
      image: "../image/banner2.jpg",
      eyebrow: "THIẾT KẾ ĐẲNG CẤP · HIỆU NĂNG MƯỢT MÀ",
      heading: "iPhone 16 Series",
      description: "Khám phá lựa chọn phù hợp cho công việc, sáng tạo và giải trí mỗi ngày.",
      highlights: ["Camera ấn tượng", "Hiệu năng mạnh mẽ", "Nhiều phiên bản lựa chọn"],
    },
  },
  {
    id: 3,
    category: "iphone-17",
    image: "../image/banner3.png",
    title: "Đặt Trước iPhone 17 Series",
  },
  {
    id: 4,
    category: "iphone-18",
    image: "../image/banner4.jpg",
    title: "Đặt Trước iPhone 18 Series",
    wideBanner: {
      image: "../image/banner4.jpg",
      eyebrow: "TRẢI NGHIỆM CÔNG NGHỆ THẾ HỆ MỚI",
      heading: "iPhone 18 Series",
      description: "Khám phá phiên bản Pro, Pro Max hoặc iPhone phù hợp với phong cách của bạn.",
      highlights: ["ProMotion 120Hz", "Camera chuyên nghiệp", "Bộ nhớ đến 2TB"],
    },
  },
];

// Kho sản phẩm
const productsData = [
  // ================= IPHONE 18 SERIES =================
  {
    id: "ip-18-pm-512",
    name: "iPhone 18 Pro Max 512GB",
    category: "iphone-18",
    price: 39990000,
    oldPrice: 41990000,
    image: "../image/18 pro max.webp",
    badge: "Hot",
    badgeColor: "red",
    specs: {
      screen:
        "6.9 inch Super Retina XDR OLED, 1-120Hz ProMotion, Độ sáng đỉnh 3000 nits, Kính Ceramic Shield thế hệ 3",
      chip: "Apple A20 Pro (2nm) với lõi Neural Engine 32-core siêu trí tuệ nhân tạo",
      ram: "12GB LPDDR6X băng thông siêu tốc",
      storage: "512GB NVMe tốc độ cao",
      camera:
        "Cụm 3 camera 48MP (Chính f/1.4 + Siêu rộng 48MP + Tele 48MP zoom quang 5x), Quay video 8K Spatial",
      battery: "5000 mAh, Sạc nhanh 45W, MagSafe thế hệ mới 25W",
      material: "Khung viền Titanium Grade 5 đánh bóng cao cấp, Mặt lưng kính nhám",
      features: "Apple Intelligence Pro, Nút Chụp Ảnh (Camera Control) cảm ứng lực đa điểm",
    },
    description:
      "Phiên bản bộ nhớ lớn 512GB dành cho giới chuyên nghiệp. Mang trong mình sức mạnh không tưởng từ chip A20 Pro, thời lượng pin lớn nhất lịch sử iPhone và khả năng quay phim chuẩn điện ảnh.",
  },
  {
    id: "ip-18-pm-1tb",
    name: "iPhone 18 Pro Max 1TB",
    category: "iphone-18",
    price: 44990000,
    oldPrice: 46990000,
    image: "../image/18 pro max.webp",
    badge: "New",
    badgeColor: "red",
    specs: {
      screen: "6.9 inch Super Retina XDR OLED, 1-120Hz ProMotion, Độ sáng đỉnh 3000 nits",
      chip: "Apple A20 Pro (2nm) kiến trúc GPU 7-core ray tracing phần cứng",
      ram: "12GB LPDDR6X",
      storage: "1TB NVMe - Lưu trữ không giới hạn",
      camera: "Hệ thống 3 camera 48MP thế hệ mới, hỗ trợ định dạng ProRAW và ProRes 8K",
      battery: "5000 mAh, Sạc qua USB-C 4.0 chuẩn Thunderbolt",
      material: "Khung viền Titanium chuẩn hàng không vũ trụ",
      features: "FaceID ẩn dưới màn hình, Tản nhiệt Graphene buồng hơi cực mát",
    },
    description:
      "Tuyệt tác công nghệ cao cấp nhất của Apple với dung lượng khổng lồ 1TB. Sự kết hợp hoàn hảo giữa thiết kế Titanium bền bỉ và bộ não AI Apple Intelligence siêu việt.",
  },
  {
    id: "ip-18-pro-256",
    name: "iPhone 18 Pro 256GB",
    category: "iphone-18",
    price: 28990000,
    oldPrice: 30990000,
    image: "../image/18 pro.webp",
    badge: "New",
    badgeColor: "blue",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 1-120Hz ProMotion, Viền màn hình siêu mỏng 1.15mm",
      chip: "Apple A20 Pro (2nm) mạnh mẽ",
      ram: "12GB LPDDR6X tối ưu cho đa nhiệm và AI",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 48MP, Tele 5x 12MP. Hỗ trợ quay Spatial Video cho Vision Pro",
      battery: "3800 mAh, Hỗ trợ sạc nhanh 40W, MagSafe 25W",
      material: "Khung viền Titanium siêu nhẹ, Kính cường lực Ceramic Shield thế hệ 3",
      features: "Apple Intelligence, Nút Action và Nút Camera Control tích hợp",
    },
    description:
      "Nhỏ gọn nhưng mang sức mạnh của gã khổng lồ. Thiết kế 6.3 inch vừa vặn tay cầm với khung viền Titanium mỏng nhất từ trước đến nay, tối ưu tuyệt đối cho trí tuệ nhân tạo.",
  },
  {
    id: "ip-18-pro-512",
    name: "iPhone 18 Pro 512GB",
    category: "iphone-18",
    price: 33990000,
    oldPrice: 35990000,
    image: "../image/18 pro.webp",
    badge: "New",
    badgeColor: "blue",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision",
      chip: "Apple A20 Pro (2nm) Bionic",
      ram: "12GB LPDDR6X",
      storage: "512GB NVMe",
      camera: "3 Camera chuyên nghiệp: Chính 48MP, Góc rộng 48MP, Telephoto 12MP (Zoom quang 5x)",
      battery: "3800 mAh, USB-C 4.0, Sạc nhanh 50% trong 25 phút",
      material: "Khung Titanium Grade 5, chống nước IP68 (độ sâu 6m trong 30 phút)",
      features: "Tản nhiệt buồng hơi Vapor Chamber, Wi-Fi 7, Bluetooth 5.4",
    },
    description:
      "Bộ nhớ 512GB rộng rãi cho các nhà sáng tạo nội dung. Sức mạnh chip A20 Pro giúp xử lý mượt mà các tác vụ render video 4K hay chơi game AAA sắc nét.",
  },
  {
    id: "ip-18-std-128",
    name: "iPhone 18 128GB",
    category: "iphone-18",
    price: 22990000,
    oldPrice: 24990000,
    image: "../image/17.webp",
    badge: "New",
    badgeColor: "green",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, 60Hz, Độ sáng 2000 nits ngoài trời",
      chip: "Apple A19 Bionic (3nm thế hệ 2)",
      ram: "8GB chuẩn LPDDR5X",
      storage: "128GB NVMe",
      camera: "Camera kép: Chính 48MP, Góc rộng 12MP. Bố trí cụm dọc mới lạ.",
      battery: "3500 mAh, Sạc nhanh 30W qua cổng USB-C",
      material: "Khung viền nhôm hàng không, mặt lưng kính pha màu nguyên khối",
      features: "Dynamic Island, Action Button, Apple Intelligence phiên bản tiêu chuẩn",
    },
    description:
      "Sự lựa chọn quốc dân mới với thiết kế màu sắc trẻ trung, hiện đại. Nâng cấp vượt bậc với chip A19 và RAM 8GB để chạy mượt mà Apple Intelligence.",
  },
  {
    id: "ip-18-std-256",
    name: "iPhone 18 256GB",
    category: "iphone-18",
    price: 25990000,
    oldPrice: 27990000,
    image: "../image/17.webp",
    badge: "New",
    badgeColor: "green",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, hiển thị True Tone, Haptic Touch",
      chip: "Apple A19 Bionic (3nm)",
      ram: "8GB LPDDR5X",
      storage: "256GB NVMe",
      camera: "Hệ thống camera kép 48MP, Chụp chân dung thế hệ mới, Chế độ Ban đêm thông minh",
      battery: "3500 mAh, thời lượng xem video lên đến 22 giờ",
      material: "Khung nhôm tái chế 100%, Thân thiện môi trường",
      features: "Phát hiện va chạm, SOS qua vệ tinh, Wi-Fi 7",
    },
    description:
      "Bản nâng cấp dung lượng 256GB hoàn hảo cho nhu cầu chụp ảnh, quay video hàng ngày. Hệ thống camera kép xếp dọc mang đến làn gió thiết kế mới đầy cá tính.",
  },
  {
    id: "ip-18-promax",
    name: "iPhone 18 Pro Max 256GB",
    category: "iphone-18",
    price: 36990000,
    oldPrice: 38990000,
    image: "../image/18 pro max.webp",
    badge: "New",
    badgeColor: "red",
    specs: {
      screen:
        "6.9 inch Super Retina XDR OLED, 120Hz ProMotion, Màn hình lớn nhất từng có trên iPhone",
      chip: "Apple A20 Pro (2nm) đỉnh cao hiệu năng",
      ram: "12GB LPDDR6X - Tối ưu cho mô hình ngôn ngữ lớn AI",
      storage: "256GB NVMe siêu tốc",
      camera: "Cụm 3 camera 48MP, Zoom quang học 5x, Lớp phủ chống lóa ống kính mới",
      battery: "5000 mAh - Pin trâu nhất lịch sử Apple, Sạc siêu tốc 45W",
      material: "Titanium Grade 5 siêu bền, siêu nhẹ",
      features: "Apple Intelligence đột phá, Nút điều khiển Camera thông minh, Tản nhiệt Graphene",
    },
    description:
      "Siêu phẩm mới nhất từ Apple với kích thước 6.9 inch siêu khủng. Chip A20 Pro mang đến hiệu năng không đối thủ cùng hệ thống tản nhiệt tiên tiến giúp chiến mọi tựa game AAA.",
  },
  {
    id: "ip-18-pro",
    name: "iPhone 18 Pro 256GB",
    category: "iphone-18",
    price: 30990000,
    oldPrice: 32990000,
    image: "../image/18 pro.webp",
    badge: "New",
    badgeColor: "blue",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 120Hz ProMotion, Always-On Display",
      chip: "Apple A20 Pro (2nm) đột phá",
      ram: "12GB LPDDR6X - Đa nhiệm hoàn hảo",
      storage: "256GB NVMe",
      camera: "3 Camera chuyên nghiệp 48MP/48MP/12MP, Hỗ trợ quay video chuẩn điện ảnh 8K",
      battery: "3800 mAh, MagSafe 25W, Cổng sạc USB-C 4.0 chuẩn Thunderbolt",
      material: "Khung Titanium nhám sang trọng, Mặt kính Ceramic Shield chống xước x4 lần",
      features: "Trợ lý ảo Siri tích hợp AI sâu rộng, Công nghệ làm mát buồng hơi",
    },
    description:
      "Thiết kế titan cao cấp được tinh chỉnh với viền màn hình siêu mỏng. Mang trong mình bộ xử lý A20 Pro, đây là công cụ đắc lực cho cả công việc sáng tạo lẫn giải trí đỉnh cao.",
  },

  // ================= IPHONE 17 SERIES =================
  {
    id: "ip-17-pm-256",
    name: "iPhone 17 Pro Max 256GB",
    category: "iphone-17",
    price: 29990000,
    oldPrice: 32990000,
    image: "../image/17 pro max.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen: "6.9 inch Super Retina XDR OLED, 120Hz ProMotion, Độ sáng 2500 nits",
      chip: "Apple A19 Pro (3nm)",
      ram: "12GB - Cấu hình tối ưu cho Apple Intelligence",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 48MP, Telephoto 12MP (Zoom quang 5x)",
      battery: "4676 mAh, Sạc nhanh 35W qua USB-C",
      material: "Khung viền Titanium đánh bóng, Kính cường lực Ceramic Shield",
      features: "Camera FaceID thu nhỏ dưới màn hình, Nút Action đa năng, Wi-Fi 7",
    },
    description:
      "Mức giá quá hời cho một siêu phẩm màn hình 6.9 inch. Viền siêu mỏng, chip A19 Pro xử lý cực nhanh, hỗ trợ đầy đủ bộ tính năng AI thông minh từ Apple.",
  },
  {
    id: "ip-17-pm-512",
    name: "iPhone 17 Pro Max 512GB",
    category: "iphone-17",
    price: 34990000,
    oldPrice: 37990000,
    image: "../image/17 pro max.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen: "6.9 inch Super Retina XDR OLED, 1-120Hz ProMotion, Always-On Display",
      chip: "Apple A19 Pro (3nm) kiến trúc tiết kiệm điện",
      ram: "12GB",
      storage: "512GB NVMe",
      camera: "Cụm 3 camera 48MP tiên tiến, quay phim Spatial Video, Chống rung quang học OIS 3D",
      battery: "4676 mAh, Hỗ trợ sạc MagSafe 25W, Pin dùng thoải mái 2 ngày",
      material: "Titanium chuẩn hàng không vũ trụ",
      features: "Hệ thống tản nhiệt graphene kết hợp vỏ pin kim loại",
    },
    description:
      "Không gian lưu trữ 512GB khổng lồ trên thiết kế Titanium đẳng cấp. Thoải mái quay video 4K ProRes và tận hưởng màn hình 6.9 inch đỉnh cao của thế giới di động.",
  },
  {
    id: "ip-17-pro-256",
    name: "iPhone 17 Pro 256GB",
    category: "iphone-17",
    price: 25990000,
    oldPrice: 27990000,
    image: "../image/17 pro.webp",
    badge: "Hot",
    badgeColor: "blue",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 120Hz ProMotion, True Tone",
      chip: "Apple A19 Pro (3nm)",
      ram: "8GB",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 48MP, Tele 12MP (Zoom 5x) công nghệ lăng kính tứ giác",
      battery: "3400 mAh, Sạc nhanh Type-C 30W",
      material: "Khung Titanium nhám nhẹ nhàng, sang trọng",
      features: "Apple Intelligence tích hợp sâu, Tốc độ truyền tải USB-C 10Gbps",
    },
    description:
      "Phiên bản Pro kích thước 6.3 inch mang lại cảm giác cầm nắm hoàn hảo. Sở hữu hệ thống camera đẳng cấp Pro Max nhưng trong một thân hình nhỏ gọn và cơ động hơn.",
  },
  {
    id: "ip-17-std-128",
    name: "iPhone 17 128GB",
    category: "iphone-17",
    price: 19990000,
    oldPrice: 21990000,
    image: "../image/17.webp",
    badge: "Shocking Price",
    badgeColor: "green",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, 60Hz",
      chip: "Apple A19 Bionic (3nm)",
      ram: "8GB (Nâng cấp lớn để hỗ trợ AI)",
      storage: "128GB NVMe",
      camera: "Camera kép xếp dọc: Chính 48MP, Góc rộng 12MP. Hỗ trợ quay Spatial Video",
      battery: "3300 mAh, tối ưu hóa năng lượng xuất sắc",
      material: "Khung nhôm, mặt lưng kính pha màu",
      features: "Dynamic Island, Action Button thay thế công tắc gạt rung",
    },
    description:
      "Cơ hội sở hữu iPhone 17 thế hệ mới với mức giá cực kỳ dễ tiếp cận. Thiết kế cụm camera dọc độc đáo, màu sắc thời thượng và hỗ trợ đầy đủ các tính năng AI thông minh.",
  },
  {
    id: "ip-17-promax",
    name: "iPhone 17 Pro Max 256GB",
    category: "iphone-17",
    price: 34990000,
    oldPrice: 36990000,
    image: "../image/17 pro max.webp",
    badge: "Hot",
    badgeColor: "red",
    specs: {
      screen: "6.9 inch Super Retina XDR OLED, 120Hz ProMotion, Viền siêu mỏng",
      chip: "Apple A19 Pro (2nm) siêu mạnh mẽ",
      ram: "12GB đa nhiệm xuất sắc",
      storage: "256GB NVMe",
      camera: "Cụm 3 ống kính cao cấp: 48MP + 48MP + 12MP telephoto 5x",
      battery: "4676 mAh, sạc nhanh qua cổng USB-C chuẩn Thunderbolt",
      material: "Titanium Grade 5, kính mặt trước Ceramic Shield thế hệ 2",
      features:
        "Công nghệ tản nhiệt buồng hơi Vapor Chamber đột phá, cụm FaceID thu gọn ẩn một phần dưới màn hình.",
    },
    description:
      "Siêu phẩm gây bão toàn cầu với công nghệ tản nhiệt buồng hơi Vapor Chamber đột phá giúp máy luôn mát mẻ. Thiết kế cụm camera FaceID tinh tế ẩn dưới màn hình 6.9 inch rộng lớn.",
  },
  {
    id: "ip-17-pro",
    name: "iPhone 17 Pro 256GB",
    category: "iphone-17",
    price: 28990000,
    oldPrice: 30990000,
    image: "../image/17 pro.webp",
    badge: "Hot",
    badgeColor: "blue",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 120Hz ProMotion",
      chip: "Apple A19 Pro (2nm)",
      ram: "8GB",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 48MP, Zoom quang 5x sắc nét",
      battery: "3400 mAh, công nghệ pin mật độ cao",
      material: "Khung viền Titanium siêu mỏng nhẹ",
      features: "Apple Intelligence toàn diện, Kết nối vệ tinh hai chiều, Wi-Fi 7 siêu tốc",
    },
    description:
      "Khung viền Titanium mỏng nhẹ, kích thước màn hình 6.3 inch tối ưu hóa hiển thị. Trái tim A19 Pro thổi bùng sức mạnh xử lý với các công cụ Apple Intelligence tiện ích.",
  },
  {
    id: "ip-17-plus",
    name: "iPhone 17 Plus 128GB",
    category: "iphone-17",
    price: 25990000,
    oldPrice: 27990000,
    image: "../image/17.webp",
    badge: "Shocking Price",
    badgeColor: "green",
    specs: {
      screen: "6.7 inch Super Retina XDR OLED, không gian hiển thị cực lớn",
      chip: "Apple A19 Bionic",
      ram: "8GB",
      storage: "128GB NVMe",
      camera: "Camera kép dọc: 48MP + 12MP, chụp đêm xuất sắc",
      battery: "4500 mAh - Trở thành vị vua thời lượng pin mới",
      material: "Khung nhôm cao cấp, đa dạng tùy chọn màu sắc pastel",
      features: "Dynamic Island, Action Button, Sạc MagSafe",
    },
    description:
      "Chiếc iPhone có thời lượng pin khủng nhất trong phân khúc. Màn hình cực lớn 6.7 inch kết hợp cùng loa kép Stereo đáp ứng hoàn hảo mọi nhu cầu giải trí và cày phim.",
  },
  {
    id: "ip-17-std",
    name: "iPhone 17 128GB",
    category: "iphone-17",
    price: 22990000,
    oldPrice: 24990000,
    image: "../image/17.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED sắc nét",
      chip: "Apple A19 Bionic",
      ram: "8GB để tương thích hoàn toàn Apple Intelligence",
      storage: "128GB NVMe",
      camera: "Camera kép dọc: 48MP + 12MP",
      battery: "3300 mAh, hỗ trợ sạc nhanh 27W",
      material: "Khung viền nhôm nguyên khối bo cong",
      features: "Hỗ trợ quay video 3D Spatial Video để xem trên kính Vision Pro",
    },
    description:
      "Sự đột phá về ngoại hình với thiết kế cụm camera xếp dọc hoàn toàn mới. Máy hỗ trợ khả năng quay video 3D Spatial Video - tính năng từng chỉ có trên dòng Pro.",
  },

  // ================= IPHONE 16 SERIES =================
  {
    id: "ip-16-pm",
    name: "iPhone 16 Pro Max 256GB",
    category: "iphone-16",
    price: 33990000,
    oldPrice: 35990000,
    image: "../image/16 pro max.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen:
        "6.9 inch Super Retina XDR OLED, 120Hz ProMotion, Viền màn hình mỏng nhất thế giới (1.15mm)",
      chip: "Apple A18 Pro (3nm thế hệ 2)",
      ram: "8GB",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 48MP, Telephoto 12MP (Zoom quang 5x)",
      battery: "4685 mAh, Sạc nhanh USB-C",
      material: "Titanium Grade 5 đánh bóng cực đẹp",
      features:
        "Nút Điều khiển Camera (Camera Control) điện dung hoàn toàn mới, Apple Intelligence",
    },
    description:
      "Bước nhảy vọt về kích thước màn hình lên 6.9 inch cực đã mắt. Đánh dấu sự xuất hiện của nút chạm cảm ứng Camera Control siêu tiện lợi cho dân đam mê nhiếp ảnh.",
  },
  {
    id: "ip-16-pro",
    name: "iPhone 16 Pro 128GB",
    category: "iphone-16",
    price: 27990000,
    oldPrice: 29990000,
    image: "../image/16 pro.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen: "6.3 inch Super Retina XDR OLED, 120Hz ProMotion",
      chip: "Apple A18 Pro (3nm)",
      ram: "8GB",
      storage: "128GB NVMe",
      camera:
        "Chính 48MP, Siêu rộng 48MP, Lần đầu tiên trang bị Telephoto 12MP Zoom 5x lên dòng Pro",
      battery: "3582 mAh, Sạc nhanh 30W",
      material: "Khung Titanium cao cấp",
      features: "Camera Control, Action Button, Hỗ trợ AI mạnh mẽ với Neural Engine nâng cấp",
    },
    description:
      "Nhỏ gọn nhưng sở hữu trọn vẹn cụm camera zoom 5x quang học lăng kính tứ giác từ bản Max. Màu sắc Titanium Sa Mạc (Desert Titanium) mới lạ và sang trọng.",
  },
  {
    id: "ip-16-plus",
    name: "iPhone 16 Plus 128GB",
    category: "iphone-16",
    price: 23990000,
    oldPrice: 25990000,
    image: "../image/16 plus.webp",
    badge: "Hot",
    badgeColor: "red",
    specs: {
      screen: "6.7 inch Super Retina XDR OLED",
      chip: "Apple A18 Bionic (3nm)",
      ram: "8GB (Tăng 2GB so với thế hệ trước)",
      storage: "128GB NVMe",
      camera: "Camera kép dọc: Chính 48MP thế hệ mới, Siêu rộng 12MP",
      battery: "4006 mAh, thời gian xem video 27 giờ",
      material: "Nhôm và mặt lưng kính pha màu rực rỡ",
      features: "Được trang bị Action Button và Camera Control như dòng Pro",
    },
    description:
      "Màn hình 6.7 inch to, pin siêu khỏe. Nâng cấp ngoạn mục với việc được trang bị cả nút Action và nút Camera Control, xóa nhòa khoảng cách với dòng Pro đắt tiền.",
  },
  {
    id: "ip-16-std",
    name: "iPhone 16 128GB",
    category: "iphone-16",
    price: 21990000,
    oldPrice: 23990000,
    image: "../image/16.webp",
    badge: "Hot",
    badgeColor: "blue",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, hiển thị sắc nét dưới nắng 2000 nits",
      chip: "Apple A18 Bionic (3nm)",
      ram: "8GB",
      storage: "128GB NVMe",
      camera: "Kép xếp dọc: Chính 48MP f/1.6, Góc siêu rộng 12MP tích hợp Macro",
      battery: "3561 mAh",
      material: "Khung nhôm, thiết kế siêu nhẹ 170g",
      features: "Quay video 3D không gian, Apple Intelligence, Action Button",
    },
    description:
      "Thiết kế cụm camera hình viên thuốc độc đáo, hỗ trợ quay video không gian. Hiệu năng vượt bật với chip A18 nhảy cóc 2 thế hệ, mạnh mẽ, mượt mà và thông minh.",
  },
  {
    id: "ip-16e",
    name: "iPhone 16e 128GB",
    category: "iphone-16",
    price: 16990000,
    oldPrice: 18990000,
    image: "../image/16e.webp",
    badge: "Shocking Price",
    badgeColor: "green",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, 60Hz",
      chip: "Apple A18 Bionic (Tùy biến tối ưu hóa tiết kiệm pin)",
      ram: "8GB - Hỗ trợ mượt mà Apple Intelligence",
      storage: "128GB NVMe",
      camera: "Camera đơn 48MP chất lượng cao, zoom crop 2x sắc nét như zoom quang",
      battery: "3561 mAh, Cổng sạc USB-C 2.0",
      material: "Khung nhôm tái chế, mặt lưng kính cường lực",
      features: "Action Button, Dynamic Island, Trải nghiệm AI giá rẻ nhất của Apple",
    },
    description:
      "Phiên bản 'e' (SE thế hệ mới) tái định nghĩa smartphone tầm trung của Apple. Mang thiết kế hiện đại với Dynamic Island, 1 camera 48MP đỉnh cao và cấu hình 8GB RAM để chạy mượt AI.",
  },

  // ================= IPHONE 15 SERIES =================
  {
    id: "ip-15-pm",
    name: "iPhone 15 Pro Max 512GB",
    category: "iphone-15",
    price: 31990000,
    oldPrice: 34990000,
    image: "../image/15 pro max.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen:
        "6.7 inch Super Retina XDR OLED, 120Hz ProMotion, Độ sáng tối đa 2000 nits ngoài trời, Lớp phủ Oleophobic chống bám vân tay.",
      chip: "Apple A17 Pro (3nm), CPU 6 lõi, GPU 6 lõi hỗ trợ Ray Tracing phần cứng, 16-core Neural Engine.",
      ram: "8GB LPDDR5",
      storage: "512GB NVMe tốc độ cao",
      camera:
        "Chính 48MP (f/1.78, OIS thế hệ 2) + Siêu rộng 12MP (f/2.2, 120 độ) + Telephoto 12MP (Zoom quang 5x, lăng kính tứ giác). Hỗ trợ quay Smart HDR 5, ProRes 4K 60fps.",
      battery: "4422 mAh, Sạc nhanh 50% trong 35 phút (củ sạc 20W+), Sạc MagSafe 15W.",
      connection:
        "Cổng USB-C hỗ trợ USB 3 (tốc độ truyền dữ liệu lên đến 10Gb/s), Wi-Fi 6E, Bluetooth 5.3, 5G NR.",
      material:
        "Khung Titanium chuẩn hàng không vũ trụ, Mặt lưng kính nhám, Mặt trước Ceramic Shield.",
    },
    description:
      "Kỷ nguyên mới của khung viền Titanium và cổng sạc Type-C siêu tiện lợi. Sức mạnh phần cứng từ chip A17 Pro đem lại khả năng chơi game đồ họa Console cực đỉnh.",
  },
  {
    id: "ip-15-pm-256",
    name: "iPhone 15 Pro Max 256GB",
    category: "iphone-15",
    price: 28990000,
    oldPrice: 31990000,
    image: "../image/15 pro max.webp",
    badge: "Shocking Price",
    badgeColor: "orange",
    specs: {
      screen: "6.7 inch Super Retina XDR OLED, 120Hz ProMotion",
      chip: "Apple A17 Pro (3nm đầu tiên trên thế giới)",
      ram: "8GB",
      storage: "256GB NVMe",
      camera: "Chính 48MP, Siêu rộng 12MP, Tele 12MP Zoom quang học 5x (Lăng kính tứ giác)",
      battery: "4422 mAh, Sạc USB-C chuẩn Thunderbolt 3",
      material: "Khung Titanium chải xước siêu nhẹ, độ bền cao",
      features: "Action Button thay thế cần gạt rung, Dynamic Island, Cổng Type-C mới",
    },
    description:
      "Kỷ nguyên mới của khung viền Titanium và cổng sạc Type-C siêu tiện lợi. Sức mạnh phần cứng từ chip A17 Pro đem lại khả năng chơi game đồ họa Console cực đỉnh.",
  },
  {
    id: "ip-15-pro",
    name: "iPhone 15 Pro 128GB",
    category: "iphone-15",
    price: 24990000,
    oldPrice: 27990000,
    image: "../image/15 pro.webp",
    badge: "Hot",
    badgeColor: "red",
    specs: {
      screen: "6.1 inch Super Retina XDR OLED, 120Hz ProMotion",
      chip: "Apple A17 Pro (3nm)",
      ram: "8GB",
      storage: "128GB NVMe",
      camera: "Chính 48MP, Siêu rộng 12MP, Tele 12MP Zoom quang 3x",
      battery: "3274 mAh, USB-C (USB 3 tốc độ truyền tải 10Gb/s)",
      material: "Titanium Grade 5",
      features: "Nút Hành động (Action Button) tùy chỉnh đa dạng chức năng",
    },
    description:
      "Nhẹ hơn bao giờ hết nhờ vật liệu Titanium, nhỏ gọn dễ cầm nắm. Dù nhỏ bé nhưng lại mang trong mình con chip A17 Pro có khả năng dò tia phần cứng (Ray Tracing).",
  },
  {
    id: "ip-15-plus",
    name: "iPhone 15 Plus 128GB",
    category: "iphone-15",
    price: 21990000,
    oldPrice: 24490000,
    image: "../image/15 plus.webp",
    badge: "Shocking Price",
    badgeColor: "blue",
    specs: {
      screen: "6.7 inch Super Retina XDR OLED, Độ sáng 2000 nits",
      chip: "Apple A16 Bionic (4nm)",
      ram: "6GB",
      storage: "128GB NVMe",
      camera: "Kép chéo: Chính 48MP chụp siêu nét, Góc rộng 12MP",
      battery: "4383 mAh - Pin cực kỳ bền bỉ",
      material: "Nhôm nguyên khối, Mặt lưng kính pha màu nhám chống bám vân tay",
      features: "Dynamic Island đã xuất hiện trên bản thường, cổng sạc USB-C tiện lợi",
    },
    description:
      "Màn hình lớn 6.7 inch hiển thị Dynamic Island tuyệt đẹp. Đổi mới ngoạn mục với mặt lưng kính nhám pastel thanh lịch và nâng cấp camera chính lên độ phân giải 48MP.",
  },

  // ================= MAC MINI SERIES =================
  {
    id: "mac-m1",
    name: "Mac mini M1 8GB 256GB",
    category: "mac",
    price: 10990000,
    oldPrice: 12990000,
    image: "../image/macminim1.webp",
    badge: "Hot",
    badgeColor: "blue",
    specs: {
      screen: "Không có màn hình đi kèm (Hỗ trợ xuất 1 màn hình 6K và 1 màn hình 4K)",
      chip: "Apple M1 (CPU 8 lõi, GPU 8 lõi, 16 lõi Neural Engine)",
      ram: "8GB Unified Memory",
      storage: "256GB SSD siêu tốc",
      camera: "Không",
      battery: "Sử dụng nguồn điện trực tiếp AC (150W)",
      material: "Vỏ nhôm nguyên khối màu Bạc (Silver) cổ điển, tản nhiệt quạt êm ái",
      features: "2 cổng Thunderbolt/USB 4, HDMI 2.0, Gigabit Ethernet, Wi-Fi 6",
    },
    description:
      "Chiếc máy tính bàn nhỏ gọn làm thay đổi cục diện công nghệ với chip Apple Silicon M1. Hiệu năng vượt trội trong tầm giá cực rẻ, phù hợp làm văn phòng, học tập và code cơ bản.",
  },
  {
    id: "mac-m2",
    name: "Mac mini M2 8GB 256GB",
    category: "mac",
    price: 13990000,
    oldPrice: 15990000,
    image: "../image/macminim2.webp",
    badge: "Hot",
    badgeColor: "blue",
    specs: {
      screen: "Hỗ trợ xuất 2 màn hình (lên đến 6K 60Hz qua Thunderbolt và 4K 60Hz qua HDMI)",
      chip: "Apple M2 (CPU 8 lõi, GPU 10 lõi băng thông 100GB/s)",
      ram: "8GB Unified Memory (LPDDR5)",
      storage: "256GB SSD",
      camera: "Không",
      battery: "Nguồn AC trực tiếp",
      material: "Khung nhôm nguyên khối truyền thống vuông vức 19.7cm",
      features: "Wi-Fi 6E, Bluetooth 5.3, Jack tai nghe 3.5mm hỗ trợ trở kháng cao",
    },
    description:
      "Bản nâng cấp mạnh mẽ từ M1, chip M2 cung cấp GPU 10 nhân xử lý đồ họa mượt mà hơn. Lựa chọn tuyệt vời cho dân Edit Video Full HD/4K nhẹ nhàng, làm đồ họa 2D.",
  },
  {
    id: "mac-m4",
    name: "Mac mini M4 16GB 256GB",
    category: "mac",
    price: 16990000,
    oldPrice: 18990000,
    image: "../image/macminim4.jpg",
    badge: "New",
    badgeColor: "red",
    specs: {
      screen: "Hỗ trợ xuất 3 màn hình độ phân giải cao (2 x 6K và 1 x 4K)",
      chip: "Apple M4 thế hệ mới (CPU 10 lõi, GPU 10 lõi) hỗ trợ Ray Tracing",
      ram: "16GB Unified Memory tối thiểu - Tuyệt vời cho đa nhiệm",
      storage: "256GB SSD",
      camera: "Không",
      battery: "Nguồn điện siêu tiết kiệm",
      material: "Thiết kế hoàn toàn mới, thu nhỏ siêu gọn chỉ 12.7 x 12.7 cm. Khung nhôm.",
      features:
        "Tích hợp 3 cổng Thunderbolt 4 phía sau, 2 cổng USB-C phía trước, tản nhiệt khí động học đột phá.",
    },
    description:
      "Sự lột xác về thiết kế sau hơn 1 thập kỷ, Mac mini M4 cực kỳ nhỏ gọn chỉ bằng một chiếc Apple TV. Dung lượng RAM tiêu chuẩn đã được nâng cấp lên 16GB, sức mạnh M4 không ngán bất kỳ tác vụ nào.",
  },
  {
    id: "mac-m4-pro",
    name: "Mac mini M4 Pro 24GB 512GB",
    category: "mac",
    price: 34990000,
    oldPrice: 36990000,
    image: "../image/macminim4.jpg",
    badge: "New",
    badgeColor: "red",
    specs: {
      screen: "Hỗ trợ xuất cực khủng: Tối đa 3 màn hình 6K ở 60Hz qua cổng Thunderbolt",
      chip: "Apple M4 Pro mạnh bạo (CPU 14 lõi, GPU 20 lõi), Băng thông bộ nhớ 273GB/s",
      ram: "24GB Unified Memory dung lượng lớn",
      storage: "512GB SSD chuẩn PCIe tốc độ cực cao",
      camera: "Không",
      battery: "Nguồn trực tiếp",
      material: "Khung nhôm tản nhiệt cấu trúc siêu nén, Thiết kế nhỏ gọn 12.7cm vuông",
      features:
        "Hỗ trợ chuẩn Thunderbolt 5 băng thông 120Gbps siêu tốc, Cổng Ethernet 10 Gigabit tùy chọn",
    },
    description:
      "Quái vật sức mạnh thực sự ẩn trong một thân hình bé hạt tiêu. Vi xử lý M4 Pro và cổng Thunderbolt 5 băng thông cực đại biến chiếc máy này thành máy trạm render 3D và xử lý code hạng nặng chuyên nghiệp.",
  },
];

const warrantyPlans = [
  { id: "none", name: "Không mua thêm bảo hành", price: 0, durationMonths: 0 },
  { id: "warranty-1y", name: "Bảo hành mở rộng 1 năm", price: 199000, durationMonths: 12 },
  { id: "warranty-2y", name: "Bảo hành mở rộng 2 năm", price: 399000, durationMonths: 24 },
];

productsData.forEach((product) => {
  product.warrantyPlans = warrantyPlans;
  const storageMatches = [...product.name.matchAll(/\b\d+(?:\.\d+)?\s?(?:GB|TB)\b/gi)];
  const storageMatch = storageMatches[storageMatches.length - 1];
  product.storageOption = storageMatch ? storageMatch[0].replace(/\s+/g, "").toUpperCase() : "";
  product.variantGroup = `${product.category}:${product.name
    .replace(/\b\d+(?:\.\d+)?\s?(?:GB|TB)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()}`;
});

const proStoragePriceOffsets = {
  "256GB": 0,
  "512GB": 3000000,
  "1TB": 8000000,
  "2TB": 18000000,
};
const proStorageCapacityBytes = (storage) => {
  const match = storage.match(/^([\d.]+)(GB|TB)$/);
  if (!match) return 0;
  return Number.parseFloat(match[1]) * (match[2] === "TB" ? 1024 : 1);
};
const proProductsByModel = new Map();

productsData
  .filter(
    (product) =>
      product.category.startsWith("iphone-") &&
      /\biPhone\s+\d+\s+Pro(?:\s+Max)?\b/i.test(product.name),
  )
  .forEach((product) => {
    const variants = proProductsByModel.get(product.variantGroup) ?? [];
    variants.push(product);
    proProductsByModel.set(product.variantGroup, variants);
  });

proProductsByModel.forEach((variants, variantGroup) => {
  const baseProduct =
    variants.find((product) => product.storageOption === "256GB") ??
    [...variants].sort(
      (first, second) =>
        proStorageCapacityBytes(first.storageOption) -
        proStorageCapacityBytes(second.storageOption),
    )[0];
  if (!baseProduct) return;

  const baseOffset = proStoragePriceOffsets[baseProduct.storageOption] ?? -1500000;
  const basePrice = baseProduct.price - baseOffset;
  const baseOldPrice = baseProduct.oldPrice
    ? basePrice + (baseProduct.oldPrice - baseProduct.price)
    : undefined;

  Object.entries(proStoragePriceOffsets).forEach(([storageOption, priceOffset]) => {
    if (variants.some((product) => product.storageOption === storageOption)) return;

    const modelSlug = variantGroup
      .split(":")[1]
      .replace(/^iphone\s+\d+\s*/, "")
      .replace(/\s+/g, "-");
    const id = `${variantGroup.split(":")[0]}-${modelSlug}-${storageOption.toLowerCase()}`;
    if (productsData.some((product) => product.id === id)) return;

    const storageDescription = storageOption.replace(/(\d+)(GB|TB)/, "$1 $2");
    productsData.push({
      ...baseProduct,
      id,
      name: baseProduct.name.replace(/\b\d+(?:\.\d+)?\s?(?:GB|TB)\b/gi, storageDescription),
      price: basePrice + priceOffset,
      ...(baseOldPrice === undefined ? {} : { oldPrice: baseOldPrice + priceOffset }),
      specs: {
        ...baseProduct.specs,
        storage: `${storageDescription} NVMe`,
      },
      description: `${baseProduct.description} Phiên bản ${storageDescription} cung cấp thêm không gian lưu trữ cho ứng dụng, ảnh và video.`,
      storageOption,
      variantGroup,
    });
  });
});
