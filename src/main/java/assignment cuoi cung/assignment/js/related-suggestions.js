// ================= GỢI Ý "SẢN PHẨM THEO NHÃN" Ở CÁC TRANG GIỎ HÀNG / HỒ SƠ =================
// Tự chèn khối gợi ý (có lọc theo nhãn Mới / Hot / Giá sốc / Đang sale) ngay phía trên footer
// để khách xem thêm và mua thêm. Dùng lại window.renderCard của common.js nên nút tim,
// "Xem chi tiết", "Thêm vào giỏ" hoạt động giống mọi nơi khác.
// Nạp SAU common.js. Cách dùng ở HTML: <script src="../js/related-suggestions.js"></script>

(() => {
  if (typeof productsData === "undefined") return;
  const footer = document.querySelector("footer.footer");
  if (!footer || document.getElementById("related-suggestions-section")) return;

  const MAX_ITEMS = 8;
  const onCartPage = Boolean(document.getElementById("cart-wrapper"));
  let activeBadge = "all";
  let lastSignature = "";

  const style = document.createElement("style");
  style.textContent = `
    #related-suggestions-section { width: 100%; margin-top: 10px; margin-bottom: 40px; }
    #related-suggestions-section .related-suggestions-more { white-space: nowrap; }
  `;
  document.head.append(style);

  const section = document.createElement("section");
  section.className = "related-products-section container";
  section.id = "related-suggestions-section";
  section.setAttribute("aria-labelledby", "related-suggestions-title");
  section.innerHTML = `
    <div class="section-intro">
      <div>
        <p class="home-eyebrow">Gợi ý cho bạn</p>
        <h2 id="related-suggestions-title">Sản phẩm theo nhãn</h2>
        <p>Lọc nhanh sản phẩm nổi bật, hàng mới, giá sốc hoặc đang sale để mua thêm.</p>
      </div>
      <a class="text-link related-suggestions-more" href="detail.html">
        Xem tất cả sản phẩm <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
    <div class="related-badge-filters" id="related-suggestions-filters" aria-label="Lọc sản phẩm theo nhãn">
      <button type="button" class="badge-filter-btn active" data-badge="all">Tất cả</button>
      <button type="button" class="badge-filter-btn" data-badge="New">Mới</button>
      <button type="button" class="badge-filter-btn" data-badge="Hot">Hot</button>
      <button type="button" class="badge-filter-btn" data-badge="Shocking Price">Giá sốc</button>
      <button type="button" class="badge-filter-btn" data-badge="Sale">Đang sale</button>
    </div>
    <div class="product-list view-grid related-products-grid" id="related-suggestions-list"></div>
  `;
  footer.before(section);

  const filters = section.querySelector("#related-suggestions-filters");
  const list = section.querySelector("#related-suggestions-list");

  const matchesBadge = (product) => {
    if (activeBadge === "all") return true;
    if (activeBadge === "Sale") return String(product.badge || "").startsWith("Sale");
    return product.badge === activeBadge;
  };

  const pickProducts = () => {
    // Trang giỏ hàng: không gợi ý lại những món đã nằm trong giỏ
    const inCart = new Set();
    if (onCartPage && typeof window.readCartItems === "function") {
      try {
        window.readCartItems().forEach((item) => inCart.add(item.id));
      } catch {
        /* bỏ qua */
      }
    }

    // Mỗi dòng máy (variantGroup) chỉ hiện 1 phiên bản rẻ nhất để không bị lặp lại
    const bestPerModel = new Map();
    productsData.forEach((product) => {
      if (inCart.has(product.id) || !matchesBadge(product)) return;
      const group = product.variantGroup ?? product.id;
      const current = bestPerModel.get(group);
      if (!current || product.price < current.price) bestPerModel.set(group, product);
    });

    // Xen kẽ theo từng series (iPhone 18, 17, 16, Mac...) để danh sách đa dạng
    const byCategory = new Map();
    [...bestPerModel.values()].forEach((product) => {
      const bucket = byCategory.get(product.category) ?? [];
      bucket.push(product);
      byCategory.set(product.category, bucket);
    });
    const mixed = [];
    for (let index = 0, more = true; more; index += 1) {
      more = false;
      byCategory.forEach((bucket) => {
        if (bucket[index]) {
          mixed.push(bucket[index]);
          more = true;
        }
      });
    }
    return mixed.slice(0, MAX_ITEMS);
  };

  const render = () => {
    // Đang hiện khung "Vui lòng đăng nhập" thì ẩn khối gợi ý
    const gate = document.getElementById("cart-gate") || document.getElementById("profile-gate");
    section.hidden = Boolean(gate && !gate.hidden);
    if (section.hidden || typeof window.renderCard !== "function") return;

    const items = pickProducts();
    const signature = `${activeBadge}#${items.map((p) => `${p.id}:${p.price}:${p.badge || ""}`).join("|")}`;
    if (signature === lastSignature) return; // không đổi thì khỏi vẽ lại (tránh nháy)
    lastSignature = signature;

    list.innerHTML = items.length
      ? items.map((product) => window.renderCard(product)).join("")
      : '<p class="empty-state">Chưa có sản phẩm phù hợp với nhãn này.</p>';
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest(".badge-filter-btn");
    if (!button) return;
    activeBadge = button.dataset.badge;
    filters.querySelectorAll(".badge-filter-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    lastSignature = "";
    render();
  });

  // Giá/nhãn sale được common.js cập nhật bất đồng bộ (sau khi lấy giờ VN) và giỏ hàng có thể đổi,
  // nên kiểm tra lại định kỳ; chỉ vẽ lại khi dữ liệu thật sự thay đổi.
  render();
  window.setTimeout(render, 800);
  window.setTimeout(render, 2500);
  window.setInterval(render, 4000);
})();
