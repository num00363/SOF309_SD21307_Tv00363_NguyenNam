// ================= TÍNH NĂNG SẢN PHẨM YÊU THÍCH (WISHLIST) & BÁO GIỜ SALE =================
// Độc quyền: Tự động phát hiện và cảnh báo khi sản phẩm trong danh sách yêu thích vào khung giờ SALE

(() => {
  const formatMoney = (amount) => `${Number(amount).toLocaleString("vi-VN")}đ`;

  // ---------- Quản trị Toast thông báo ----------
  function showToast(message, type = "info") {
    let toastContainer = document.getElementById("istore-toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "istore-toast-container";
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement("div");
    toast.className = `istore-toast istore-toast-${type}`;
    const icon =
      type === "success"
        ? "fa-circle-check"
        : type === "info"
          ? "fa-heart"
          : type === "sale"
            ? "fa-fire-flame-curved"
            : "fa-circle-info";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
  window.showToast = showToast;

  // ---------- Quản trị danh sách yêu thích ----------
  function getFavoritesStorageKey() {
    try {
      const user =
        typeof checkAuthSession === "function"
          ? checkAuthSession()
          : JSON.parse(localStorage.getItem("istore_user") || "null");
      return user?.email ? `istore_fav_${user.email}` : "istore_fav_guest";
    } catch {
      return "istore_fav_guest";
    }
  }

  function getFavorites() {
    try {
      const key = getFavoritesStorageKey();
      let list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(list)) list = [];
      if (key !== "istore_fav_guest") {
        const guestRaw = localStorage.getItem("istore_fav_guest");
        const guest = guestRaw ? JSON.parse(guestRaw) : [];
        if (Array.isArray(guest) && guest.length) {
          list = [...new Set([...list, ...guest])];
          localStorage.setItem(key, JSON.stringify(list));
          localStorage.removeItem("istore_fav_guest");
        }
      }
      return list;
    } catch {
      return [];
    }
  }
  window.getFavorites = getFavorites;

  function saveFavorites(favs) {
    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(favs));
    updateFavoritesCount();
    // Sau khi lưu yêu thích mới, lập tức kiểm tra xem sản phẩm đó có đang trong giờ sale không
    checkWishlistSaleAlerts();
  }
  window.saveFavorites = saveFavorites;

  function isProductFavorite(id) {
    return getFavorites().includes(id);
  }
  window.isProductFavorite = isProductFavorite;

  function updateFavoritesCount() {
    const count = getFavorites().length;
    const badge = document.getElementById("favorites-tab-count");
    if (badge) badge.textContent = count;
    const statBadge = document.getElementById("stat-fav-count");
    if (statBadge) statBadge.textContent = count;
  }
  window.updateFavoritesCount = updateFavoritesCount;

  window.toggleFavorite = function (id, btn) {
    let favs = getFavorites();
    const index = favs.indexOf(id);
    const willBeFav = index === -1;
    if (willBeFav) {
      favs.push(id);
    } else {
      favs.splice(index, 1);
    }
    saveFavorites(favs);

    document.querySelectorAll(`.btn-favorite[data-id="${id}"]`).forEach((b) => {
      b.classList.toggle("active", willBeFav);
      const icon = b.querySelector("i");
      if (icon) {
        icon.className = willBeFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
      }
      b.setAttribute("aria-label", willBeFav ? "Bỏ yêu thích" : "Yêu thích");
      b.setAttribute("title", willBeFav ? "Bỏ yêu thích" : "Yêu thích");
    });

    const detailFavBtn = document.getElementById("detail-fav-btn");
    if (detailFavBtn) {
      detailFavBtn.classList.toggle("active", willBeFav);
      const icon = detailFavBtn.querySelector("i");
      const text = detailFavBtn.querySelector("span");
      if (icon) icon.className = willBeFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
      if (text) text.textContent = willBeFav ? "Đã yêu thích" : "Yêu thích";
      detailFavBtn.style.borderColor = willBeFav ? "#ef4444" : "#cbd5e1";
      detailFavBtn.style.color = willBeFav ? "#ef4444" : "#64748b";
    }

    const prod = typeof productsData !== "undefined" ? productsData.find((p) => p.id === id) : null;
    const prodName = prod ? prod.name : "Sản phẩm";
    if (willBeFav) {
      showToast(`Đã thêm "${prodName}" vào danh sách yêu thích!`, "info");
    } else {
      showToast(`Đã bỏ "${prodName}" khỏi danh sách yêu thích.`, "info");
    }

    if (typeof renderFavoritesTab === "function") {
      renderFavoritesTab();
    }
  };

  // ---------- TÍNH NĂNG ĐỘC ĐÁO: BÁO KHI SẢN PHẨM YÊU THÍCH VÀO GIỜ SALE ----------
  function getFavoriteSaleItems() {
    if (typeof productsData === "undefined") return [];
    const favIds = getFavorites();
    if (!favIds.length) return [];

    return productsData.filter((product) => {
      if (!favIds.includes(product.id)) return false;
      const isSale =
        (product.badge && product.badge.toLowerCase().startsWith("sale")) ||
        (product.oldPrice && product.oldPrice > product.price);
      return Boolean(isSale);
    });
  }
  window.getFavoriteSaleItems = getFavoriteSaleItems;

  let isAlertModalShowing = false;

  // Đặt popup báo sale ở GÓC TRÊN PHẢI (dưới thanh header). Ghi đè vị trí cũ trong CSS.
  if (!document.getElementById("wishlist-sale-position-style")) {
    const positionStyle = document.createElement("style");
    positionStyle.id = "wishlist-sale-position-style";
    positionStyle.textContent = `
      .wishlist-sale-modal {
        top: 90px !important;
        right: 20px !important;
        bottom: auto !important;
        left: auto !important;
        transform: translateY(-16px) !important;
      }
      .wishlist-sale-modal.is-visible {
        transform: translateY(0) !important;
      }
      @media (max-width: 600px) {
        .wishlist-sale-modal {
          top: 76px !important;
          right: 12px !important;
          left: 12px !important;
          width: auto !important;
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(positionStyle);
  }

  function showSaleAlertModal(product) {
    if (isAlertModalShowing || document.getElementById("wishlist-sale-modal")) return;
    isAlertModalShowing = true;

    const modal = document.createElement("div");
    modal.id = "wishlist-sale-modal";
    modal.className = "wishlist-sale-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-live", "assertive");

    const discountPercent =
      product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 10;

    modal.innerHTML = `
      <div class="wishlist-sale-card">
        <div class="wishlist-sale-badge-top">
          <i class="fa-solid fa-fire-flame-curved"></i> GIỜ VÀNG SALE: SẢN PHẨM YÊU THÍCH!
        </div>
        <button class="wishlist-sale-close" type="button" aria-label="Đóng thông báo"><i class="fa-solid fa-xmark"></i></button>
        <div class="wishlist-sale-content">
          <div class="wishlist-sale-img-wrap">
            <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(product.image) : product.image}" alt="${product.name}" />
            <span class="wishlist-sale-tag-float">-${discountPercent}%</span>
          </div>
          <div class="wishlist-sale-details">
            <h4 class="wishlist-sale-name">${product.name}</h4>
            <div class="wishlist-sale-pricing">
              <span class="wishlist-sale-price-new">${formatMoney(product.price)}</span>
              ${product.oldPrice ? `<span class="wishlist-sale-price-old">${formatMoney(product.oldPrice)}</span>` : ""}
            </div>
            <p class="wishlist-sale-text">
              Sản phẩm bạn đang lưu trong <strong>Yêu thích</strong> vừa bước vào khung giờ Sale sốc! Hãy tranh thủ sở hữu ngay trước khi hết giờ.
            </p>
          </div>
        </div>
        <div class="wishlist-sale-actions">
          <a href="detail.html?id=${encodeURIComponent(product.id)}" class="wishlist-sale-btn-buy">
            <i class="fa-solid fa-bolt"></i> Xem và Đặt ngay
          </a>
          <button type="button" class="wishlist-sale-btn-dismiss">Để tôi xem sau</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Kích hoạt hiệu ứng xuất hiện
    requestAnimationFrame(() => {
      modal.classList.add("is-visible");
    });

    const closeModal = () => {
      modal.classList.remove("is-visible");
      setTimeout(() => {
        modal.remove();
        isAlertModalShowing = false;
      }, 300);
    };

    modal.querySelector(".wishlist-sale-close")?.addEventListener("click", closeModal);
    modal.querySelector(".wishlist-sale-btn-dismiss")?.addEventListener("click", closeModal);
  }

  function checkWishlistSaleAlerts({ force = false } = {}) {
    const saleItems = getFavoriteSaleItems();
    if (!saleItems.length) return;

    // Chọn sản phẩm có mức giảm giá tốt nhất hoặc đầu tiên
    const topSaleItem = saleItems[0];
    const alertKey = `istore_sale_alerted_${topSaleItem.id}_${topSaleItem.price}`;
    const alreadyAlertedInSession = sessionStorage.getItem(alertKey);

    if (!alreadyAlertedInSession || force) {
      sessionStorage.setItem(alertKey, String(Date.now()));

      // 1. Hiển thị Banner Popup trên màn hình
      setTimeout(() => {
        showSaleAlertModal(topSaleItem);
      }, 1200);

      // 2. Hiện Toast thông báo
      showToast(
        `🔥 Tin vui! "${topSaleItem.name}" trong mục Yêu thích đang SALE còn ${formatMoney(topSaleItem.price)}!`,
        "sale",
      );

      // 3. Gửi Browser Desktop Push Notification (nếu người dùng đã cấp quyền)
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("🔥 SẢN PHẨM YÊU THÍCH VÀO GIỜ SALE!", {
            body: `${topSaleItem.name} đang giảm giá sốc còn ${formatMoney(topSaleItem.price)}. Bấm để xem ngay!`,
            icon: topSaleItem.image,
            tag: `sale-fav-${topSaleItem.id}`,
          });
        } catch (e) {
          console.warn("Không thể gửi notification hệ điều hành:", e);
        }
      }
    }
  }
  window.checkWishlistSaleAlerts = checkWishlistSaleAlerts;

  // Lắng nghe và kiểm tra định kỳ mỗi 60 giây (hoặc sau khi render xong giá giờ vàng)
  window.addEventListener("DOMContentLoaded", () => {
    updateFavoritesCount();
    // Chờ 2s sau khi trang tải xong và đồng bộ giờ sale
    setTimeout(() => {
      checkWishlistSaleAlerts();
    }, 2000);

    // Kiểm tra định kỳ mỗi 60s
    setInterval(() => {
      checkWishlistSaleAlerts();
    }, 60000);
  });
})();
