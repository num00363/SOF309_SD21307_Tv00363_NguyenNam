// ================= MODULE TRANG GIỎ HÀNG (CART.JS) =================
// Hỗ trợ chọn từng sản phẩm (checkbox) để thanh toán lẻ, tính lại tổng tiền linh hoạt,
// Quản lý số lượng, xóa sản phẩm, và Tab chuyển đổi Giỏ hàng - Sản phẩm yêu thích

(() => {
  const formatMoney = (amount) =>
    typeof window.formatMoney === "function"
      ? window.formatMoney(amount)
      : `${Number(amount).toLocaleString("vi-VN")}đ`;

  const readCart = () =>
    typeof window.readCartItems === "function" ? window.readCartItems() : [];
  const saveCart = (c) =>
    typeof window.saveCartItems === "function" ? window.saveCartItems(c) : null;
  const syncCartCount = () =>
    typeof window.updateCartCount === "function" ? window.updateCartCount() : null;

  // ---------- TRANG GIỎ HÀNG: TÍCH CHỌN SẢN PHẨM THANH TOÁN LẺ ----------
  let selectedCartKeys = new Set();

  function getItemKey(id, warrantyPlanId) {
    return `${id}_${warrantyPlanId || "none"}`;
  }

  function getCheckedItems(cart) {
    if (selectedCartKeys.size === 0) {
      cart.forEach((it) => selectedCartKeys.add(getItemKey(it.id, it.warrantyPlanId)));
    }
    return cart.filter((it) => selectedCartKeys.has(getItemKey(it.id, it.warrantyPlanId)));
  }

  function recalculateSelectedCartTotal() {
    const cart = readCart();
    const cartTotal = document.getElementById("cart-total");
    const selectedCountEl = document.getElementById("cart-selected-count");
    const checkAllInput = document.getElementById("cart-check-all");

    if (!cartTotal) return;

    const checkedItems = getCheckedItems(cart);
    let totalMoney = 0;

    checkedItems.forEach((item) => {
      const realProduct = typeof productsData !== "undefined"
        ? productsData.find((p) => p.id === item.id)
        : null;
      if (!realProduct) return;

      const currentPrice = realProduct.price;
      const warrantyPlan =
        realProduct.warrantyPlans?.find((p) => p.id === item.warrantyPlanId) ?? null;
      const warrantyPrice = warrantyPlan?.price ?? 0;
      const itemTotal = (currentPrice + warrantyPrice) * item.quantity;
      totalMoney += itemTotal;
    });

    cartTotal.textContent = formatMoney(totalMoney);
    if (selectedCountEl) {
      selectedCountEl.textContent = checkedItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
    }

    if (checkAllInput && cart.length > 0) {
      checkAllInput.checked = checkedItems.length === cart.length;
      checkAllInput.indeterminate = checkedItems.length > 0 && checkedItems.length < cart.length;
    }

    // Lưu danh sách sản phẩm được tích chọn để trang checkout chỉ xử lý những mục này
    localStorage.setItem("istore_checkout_items", JSON.stringify(checkedItems));
  }

  function renderCartPage() {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartGate = document.getElementById("cart-gate");
    const cartWrapper = document.getElementById("cart-wrapper");

    if (!cartContainer || !cartTotal) return;

    const user = typeof window.checkAuthSession === "function" ? window.checkAuthSession() : null;
    if (!user) {
      if (cartGate) cartGate.hidden = false;
      if (cartWrapper) cartWrapper.hidden = true;
      return;
    }

    if (cartGate) cartGate.hidden = true;
    if (cartWrapper) cartWrapper.hidden = false;

    setupCartTabs();
    if (typeof renderFavoritesTab === "function") renderFavoritesTab();

    const cart = readCart();
    localStorage.setItem("istore_cart", JSON.stringify(cart));

    const cartTabCount = document.getElementById("cart-tab-count");
    if (cartTabCount) {
      cartTabCount.textContent = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    }

    if (cart.length === 0) {
      cartContainer.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 50px;">Giỏ hàng của bạn đang trống! <br><br> <a href="index.html" style="color: var(--primary-red); font-weight: bold; text-decoration: underline;"><i class="fa-solid fa-arrow-left"></i> Tiếp tục mua sắm</a></td></tr>`;
      cartTotal.textContent = "0đ";
      selectedCartKeys.clear();
      localStorage.removeItem("istore_checkout_items");
      return;
    }

    if (selectedCartKeys.size === 0) {
      cart.forEach((it) => selectedCartKeys.add(getItemKey(it.id, it.warrantyPlanId)));
    }

    cartContainer.innerHTML = cart
      .map((item, index) => {
        const realProduct = typeof productsData !== "undefined"
          ? productsData.find((p) => p.id === item.id)
          : null;
        if (!realProduct) return "";

        const currentPrice = realProduct.price;
        const oldPrice =
          realProduct.oldPrice && realProduct.oldPrice > currentPrice
            ? realProduct.oldPrice
            : null;
        const warrantyPlanId = item.warrantyPlanId ?? "none";
        const currentWarrantyPlan =
          realProduct.warrantyPlans?.find((plan) => plan.id === warrantyPlanId) ?? null;
        const warrantyPrice = currentWarrantyPlan?.price ?? 0;
        const warrantyName = currentWarrantyPlan?.name ?? "Không mua thêm bảo hành";
        const unitTotal = currentPrice + warrantyPrice;
        const itemTotal = unitTotal * item.quantity;
        const itemKey = getItemKey(item.id, warrantyPlanId);
        const isChecked = selectedCartKeys.has(itemKey);

        const priceHTML = oldPrice
          ? `<div style="color: #999; text-decoration: line-through; font-size: 13px;">${formatMoney(oldPrice)}</div>
             <div style="color: #d70018; font-weight: bold; font-size: 16px;">${formatMoney(currentPrice)}</div>`
          : `<div style="color: #d70018; font-weight: bold; font-size: 16px;">${formatMoney(currentPrice)}</div>`;

        const warrantyHTML =
          warrantyPrice > 0
            ? `<div class="cart-warranty">${warrantyName}: <strong>+${formatMoney(warrantyPrice)}</strong></div>`
            : `<div class="cart-warranty">${warrantyName}</div>`;

        const badgeHTML = realProduct.badge
          ? `<div style="display:inline-block; margin-top:5px; background:var(--primary-red); color:white; font-size:11px; padding:2px 6px; border-radius:4px;">${realProduct.badge}</div>`
          : "";

        return `
        <tr class="cart-row ${isChecked ? "is-selected" : ""}" data-item-key="${itemKey}">
          <td style="text-align: center;">
            <input 
              type="checkbox" 
              class="cart-item-checkbox" 
              data-id="${item.id}" 
              data-plan="${warrantyPlanId}" 
              ${isChecked ? "checked" : ""}
              aria-label="Chọn thanh toán sản phẩm ${realProduct.name}"
            />
          </td>
          <td>${index + 1}</td>
          <td>
              <a href="detail.html?id=${encodeURIComponent(realProduct.id)}">
                  <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(realProduct.image) : realProduct.image}" alt="${realProduct.name}" style="width: 70px; border-radius: 8px; border: 1px solid #eee;">
              </a>
          </td>
          <td style="font-weight: 500; text-align: left; line-height: 1.4;">
              <a href="detail.html?id=${encodeURIComponent(realProduct.id)}" style="color: inherit; text-decoration: none;">${realProduct.name}</a><br>
              ${badgeHTML}
              ${warrantyHTML}
          </td>
          <td>${priceHTML}${warrantyPrice > 0 ? `<div class="cart-unit-total" style="font-size:12px; color:#666; margin-top:3px;">Tổng đơn giá: ${formatMoney(unitTotal)}</div>` : ""}</td>
          <td>
            <div class="qty-control" style="display:inline-flex; align-items:center; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
              <button onclick="changeQty('${item.id}', -1, '${warrantyPlanId}')" style="padding: 5px 10px; border:none; background:#f5f5f5; cursor:pointer; font-weight:bold;">-</button>
              <input type="text" value="${item.quantity}" readonly style="width: 40px; text-align: center; border:none; outline:none; font-weight:bold;">
              <button onclick="changeQty('${item.id}', 1, '${warrantyPlanId}')" style="padding: 5px 10px; border:none; background:#f5f5f5; cursor:pointer; font-weight:bold;">+</button>
            </div>
          </td>
          <td style="color: #d70018; font-weight: bold; font-size: 16px;">${formatMoney(itemTotal)}</td>
          <td><button class="btn-remove" onclick="removeItem('${item.id}', '${warrantyPlanId}')" style="background: none; border: none; color: #d70018; cursor: pointer; font-size: 18px; transition: 0.3s;" title="Xóa khỏi giỏ"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
      `;
      })
      .join("");

    // Bắt sự kiện chọn checkbox từng dòng
    cartContainer.querySelectorAll(".cart-item-checkbox").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.id;
        const plan = cb.dataset.plan;
        const key = getItemKey(id, plan);
        const row = cb.closest(".cart-row");

        if (cb.checked) {
          selectedCartKeys.add(key);
          row?.classList.add("is-selected");
        } else {
          selectedCartKeys.delete(key);
          row?.classList.remove("is-selected");
        }
        recalculateSelectedCartTotal();
      });
    });

    // Checkbox Chọn tất cả
    const checkAllInput = document.getElementById("cart-check-all");
    if (checkAllInput && !checkAllInput.dataset.bound) {
      checkAllInput.addEventListener("change", () => {
        const isChecked = checkAllInput.checked;
        cart.forEach((it) => {
          const key = getItemKey(it.id, it.warrantyPlanId);
          if (isChecked) {
            selectedCartKeys.add(key);
          } else {
            selectedCartKeys.delete(key);
          }
        });
        cartContainer.querySelectorAll(".cart-item-checkbox").forEach((cb) => {
          cb.checked = isChecked;
          cb.closest(".cart-row")?.classList.toggle("is-selected", isChecked);
        });
        recalculateSelectedCartTotal();
      });
      checkAllInput.dataset.bound = "true";
    }

    // Nút Thanh toán
    const checkoutBtn = document.querySelector(".btn-checkout");
    if (checkoutBtn && !checkoutBtn.dataset.boundSelection) {
      checkoutBtn.addEventListener("click", (e) => {
        const checkedItems = getCheckedItems(readCart());
        if (checkedItems.length === 0) {
          e.preventDefault();
          if (typeof window.showToast === "function") {
            window.showToast("Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán!", "info");
          } else {
            alert("Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán!");
          }
        }
      });
      checkoutBtn.dataset.boundSelection = "true";
    }

    recalculateSelectedCartTotal();
  }
  window.renderCartPage = renderCartPage;

  window.changeQty = function (id, delta, warrantyPlanId = "none") {
    if (![1, -1].includes(delta)) return;
    const cart = readCart();
    const item = cart.find(
      (i) =>
        String(i.id) === String(id) && (i.warrantyPlanId ?? "none") === (warrantyPlanId ?? "none"),
    );

    if (item) {
      item.quantity = Math.min(99, Math.max(1, item.quantity + delta));
      if (item.quantity <= 0) item.quantity = 1;
      saveCart(cart);
      renderCartPage();
      syncCartCount();
    }
  };

  window.removeItem = function (id, warrantyPlanId = "none") {
    let cart = readCart();
    const key = getItemKey(id, warrantyPlanId);
    selectedCartKeys.delete(key);
    cart = cart.filter(
      (item) =>
        !(String(item.id) === String(id) && (item.warrantyPlanId ?? "none") === warrantyPlanId),
    );
    saveCart(cart);
    renderCartPage();
    syncCartCount();
  };

  function setupCartTabs() {
    const btnCart = document.getElementById("tab-btn-cart");
    const btnFav = document.getElementById("tab-btn-favorites");
    const panelCart = document.getElementById("cart-tab-content");
    const panelFav = document.getElementById("favorites-tab-content");

    if (!btnCart || !btnFav || !panelCart || !panelFav) return;

    function switchTab(activeTab) {
      const isCart = activeTab === "cart";
      btnCart.classList.toggle("active", isCart);
      btnCart.setAttribute("aria-selected", isCart ? "true" : "false");

      btnFav.classList.toggle("active", !isCart);
      btnFav.setAttribute("aria-selected", !isCart ? "true" : "false");

      panelCart.style.display = isCart ? "block" : "none";
      panelFav.style.display = !isCart ? "block" : "none";

      if (!isCart && typeof renderFavoritesTab === "function") {
        renderFavoritesTab();
      }
    }

    if (!btnCart.dataset.bound) {
      btnCart.addEventListener("click", () => switchTab("cart"));
      btnCart.dataset.bound = "true";
    }
    if (!btnFav.dataset.bound) {
      btnFav.addEventListener("click", () => switchTab("favorites"));
      btnFav.dataset.bound = "true";
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("tab") === "favorites") {
      switchTab("favorites");
    }
  }
  window.setupCartTabs = setupCartTabs;

  function renderFavoritesTab() {
    const container = document.getElementById("favorites-container");
    const countBadge = document.getElementById("favorites-tab-count");
    const favIds = typeof window.getFavorites === "function" ? window.getFavorites() : [];

    if (countBadge) {
      countBadge.textContent = favIds.length;
    }
    if (!container) return;

    if (favIds.length === 0) {
      container.innerHTML = `
        <div class="empty-favorites-box">
          <i class="fa-regular fa-heart"></i>
          <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 8px;">Chưa có sản phẩm yêu thích nào</h3>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Hãy bấm vào biểu tượng trái tim trên các sản phẩm bạn quan tâm để lưu lại tại đây.</p>
          <a href="detail.html" class="btn-repurchase" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
            <i class="fa-solid fa-compass"></i> Khám phá sản phẩm ngay
          </a>
        </div>
      `;
      return;
    }

    const favProducts = (typeof productsData !== "undefined" ? productsData : []).filter((p) =>
      favIds.includes(p.id),
    );

    container.innerHTML = `
      <div class="cart-table-scroll">
        <table class="cart-table">
          <thead>
            <tr>
              <th width="8%">STT</th>
              <th width="16%">Hình ảnh</th>
              <th width="32%">Tên sản phẩm</th>
              <th width="20%">Giá hiện tại</th>
              <th width="14%">Trạng thái Sale</th>
              <th width="10%">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${favProducts
              .map((p, idx) => {
                const isSale =
                  (p.badge && p.badge.toLowerCase().startsWith("sale")) ||
                  (p.oldPrice && p.oldPrice > p.price);
                const saleBadge = isSale
                  ? `<span class="fav-sale-fire-badge"><i class="fa-solid fa-fire"></i> Đang Giờ Sale</span>`
                  : `<span style="color:#64748b; font-size:12px;">Giá ổn định</span>`;

                return `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <a href="detail.html?id=${encodeURIComponent(p.id)}">
                    <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(p.image) : p.image}" alt="${p.name}" style="width: 65px; border-radius: 6px; border: 1px solid #eee;" />
                  </a>
                </td>
                <td style="text-align: left; font-weight: 500;">
                  <a href="detail.html?id=${encodeURIComponent(p.id)}" style="color: inherit; text-decoration: none;">${p.name}</a>
                </td>
                <td>
                  <strong style="color: #d70018;">${formatMoney(p.price)}</strong>
                  ${p.oldPrice ? `<div style="font-size: 12px; color: #94a3b8; text-decoration: line-through;">${formatMoney(p.oldPrice)}</div>` : ""}
                </td>
                <td>${saleBadge}</td>
                <td>
                  <div class="fav-actions">
                    <button class="fav-btn fav-btn-buy" onclick="buyNow('${p.id}')">Mua ngay</button>
                    <button class="fav-btn fav-btn-cart" onclick="addToCart('${p.id}', this)">Thêm giỏ</button>
                    <button class="btn-remove" onclick="toggleFavorite('${p.id}', this)" title="Bỏ yêu thích" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:14px; margin-top:4px;">Bỏ lưu</button>
                  </div>
                </td>
              </tr>
            `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  window.renderFavoritesTab = renderFavoritesTab;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("cart-items") || document.getElementById("cart-wrapper")) {
      renderCartPage();
    }
  });
})();
