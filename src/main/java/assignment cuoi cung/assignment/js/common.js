// ================= MODULE DÙNG CHUNG HỆ THỐNG (COMMON.JS) =================
// Quản lý Header, Footer, Session đăng nhập, Linh vật Mascot, Theme, Thanh tìm kiếm thông minh,
// Đồng bộ API giờ Việt Nam và Tính toán Giờ Vàng Sale theo thời gian thực

(() => {
  // ---------- 1. Tiện ích Định dạng & Thời gian ----------
  function formatMoney(amount) {
    if (!amount || amount === 0) return "Liên hệ / Sắp về";
    return Number(amount).toLocaleString("vi-VN") + "đ";
  }
  window.formatMoney = formatMoney;

  const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
  let serverTimeOffset = 0;

  function getVietnamTimeParts(date) {
    const vietnamTime = new Date(date.getTime() + VIETNAM_OFFSET_MS);
    return {
      year: vietnamTime.getUTCFullYear(),
      month: vietnamTime.getUTCMonth(),
      date: vietnamTime.getUTCDate(),
      day: vietnamTime.getUTCDay(),
      hour: vietnamTime.getUTCHours(),
    };
  }
  window.getVietnamTimeParts = getVietnamTimeParts;

  function makeVietnamTarget(date, daysToAdd, hour) {
    const vietnamTime = getVietnamTimeParts(date);
    return new Date(
      Date.UTC(vietnamTime.year, vietnamTime.month, vietnamTime.date + daysToAdd, hour) -
        VIETNAM_OFFSET_MS,
    );
  }
  window.makeVietnamTarget = makeVietnamTarget;

  // ---------- 2. Quản lý Session Đăng nhập & Cổng Auth Gate ----------
  const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 phút

  function checkAuthSession() {
    try {
      const loggedInUser = localStorage.getItem("istore_user");
      const loginTime = Number(localStorage.getItem("istore_login_time"));
      const user = loggedInUser ? JSON.parse(loggedInUser) : null;
      const sessionDuration =
        localStorage.getItem("istore_remember") === "true"
          ? 7 * 24 * 60 * 60 * 1000
          : SESSION_TIMEOUT;

      if (
        !user ||
        typeof user.email !== "string" ||
        !Number.isFinite(loginTime) ||
        loginTime <= 0 ||
        loginTime > Date.now() ||
        Date.now() - loginTime >= sessionDuration
      ) {
        if (loggedInUser || localStorage.getItem("istore_login_time")) logoutUser();
        return null;
      }
      return user;
    } catch (error) {
      console.error("Không đọc được phiên đăng nhập:", error);
      logoutUser();
      return null;
    }
  }
  window.checkAuthSession = checkAuthSession;

  function logoutUser() {
    localStorage.removeItem("istore_user");
    localStorage.removeItem("istore_login_time");
    localStorage.removeItem("istore_remember");
    window.location.reload();
  }
  window.logoutUser = logoutUser;

  window.requireSignedInUser = function (
    message = "Vui lòng đăng nhập để tiếp tục.",
    { redirect = false, returnTo } = {},
  ) {
    if (checkAuthSession()) return true;

    let notice = document.getElementById("store-auth-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "store-auth-notice";
      notice.className = "store-auth-notice";
      notice.setAttribute("role", "status");
      document.body.append(notice);
    }
    notice.replaceChildren();
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-lock";
    icon.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.textContent = message;
    const login = document.createElement("a");
    const currentPage = `${window.location.pathname.split("/").pop()}${window.location.search}${window.location.hash}`;
    const destination = returnTo ?? currentPage ?? "index.html";
    login.href = `login.html?return=${encodeURIComponent(destination)}`;
    login.textContent = "Đăng nhập";
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.setAttribute("aria-label", "Đóng thông báo");
    dismiss.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    dismiss.addEventListener("click", () => notice.remove());
    notice.append(icon, text, login, dismiss);
    notice.classList.remove("is-visible", "is-redirecting");
    requestAnimationFrame(() => notice.classList.add("is-visible"));

    window.clearTimeout(window.storeAuthNoticeTimer);
    window.clearTimeout(window.storeAuthRedirectTimer);
    if (redirect) {
      notice.classList.add("is-redirecting");
      window.storeAuthRedirectTimer = window.setTimeout(() => {
        window.location.assign(login.href);
      }, 1400);
    }
    window.storeAuthNoticeTimer = window.setTimeout(() => {
      notice.classList.remove("is-visible");
      window.setTimeout(() => notice.remove(), 250);
    }, 6500);
    return false;
  };

  function triggerAuthGateAttempt(target, message, options = {}) {
    if (!target) return;
    target.classList.remove("auth-gate-attempt");
    void target.offsetWidth;
    target.classList.add("auth-gate-attempt");
    if (typeof window.requireSignedInUser === "function") {
      window.requireSignedInUser(message, options);
    }
  }
  window.triggerAuthGateAttempt = triggerAuthGateAttempt;

  function bindAuthGateControls() {
    const authTargets = document.querySelectorAll(
      ".btn-add-cart, .btn-add-cart-large, .assistant-launcher, .cart-link, a[href='cart.html'], a[href='checkout.html'], [data-auth-gate]",
    );

    authTargets.forEach((element) => {
      const target = element;
      const isLocked = !checkAuthSession();
      target.classList.toggle("auth-locked", isLocked);
      target.setAttribute("aria-disabled", String(isLocked));
      target.dataset.authGate = "true";
      if (isLocked && !target.querySelector(".auth-lock-indicator")) {
        const indicator = document.createElement("span");
        indicator.className = "auth-lock-indicator";
        indicator.setAttribute("aria-hidden", "true");
        indicator.innerHTML = '<i class="fa-solid fa-lock" aria-hidden="true"></i>';
        target.append(indicator);
      }

      if (!target.dataset.authBound) {
        target.addEventListener("click", (event) => {
          if (checkAuthSession()) return;
          event.preventDefault();
          event.stopPropagation();
          const isCartLink =
            target.matches("a[href='cart.html']") || target.closest("a[href='cart.html']");
          const isCheckoutLink =
            target.matches("a[href='checkout.html']") || target.closest("a[href='checkout.html']");
          const isAssistant = target.classList.contains("assistant-launcher");
          const message = isCartLink
            ? "Bạn cần đăng nhập để xem giỏ hàng."
            : isCheckoutLink
              ? "Bạn cần đăng nhập để tiếp tục thanh toán."
              : isAssistant
                ? "Đăng nhập để dùng trợ lý tư vấn sản phẩm."
                : "Đăng nhập để thêm sản phẩm vào giỏ hàng.";
          const options =
            isCartLink || isCheckoutLink
              ? { redirect: true, returnTo: isCartLink ? "cart.html" : "checkout.html" }
              : {};
          triggerAuthGateAttempt(target, message, options);
        });
        target.dataset.authBound = "true";
      }
    });
  }
  window.bindAuthGateControls = bindAuthGateControls;

  // ---------- 3. Hệ thống Linh vật Mascot Avatar ----------
  const MASCOT_PRESETS = {
    "astro-bot": {
      name: "AstroBot",
      title: "Robot Phi Hành Gia",
      badge: "VIP AI",
      svg: (size = 36) => `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="istore-mascot-svg">
          <defs>
            <linearGradient id="bg-astro" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="visor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#bg-astro)"/>
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <rect x="47" y="10" width="6" height="14" rx="3" fill="#cbd5e1"/>
          <circle cx="50" cy="9" r="6" fill="#fbbf24"/>
          <rect x="20" y="24" width="60" height="54" rx="27" fill="#f8fafc"/>
          <rect x="13" y="38" width="10" height="24" rx="5" fill="#94a3b8"/>
          <rect x="77" y="38" width="10" height="24" rx="5" fill="#94a3b8"/>
          <circle cx="18" cy="50" r="3" fill="#38bdf8"/>
          <circle cx="82" cy="50" r="3" fill="#38bdf8"/>
          <rect x="26" y="33" width="48" height="35" rx="17.5" fill="url(#visor-grad)"/>
          <circle cx="40" cy="48" r="5" fill="#38bdf8"/>
          <circle cx="42" cy="46" r="2" fill="#fff"/>
          <circle cx="60" cy="48" r="5" fill="#38bdf8"/>
          <circle cx="62" cy="46" r="2" fill="#fff"/>
          <ellipse cx="33" cy="56" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6"/>
          <ellipse cx="67" cy="56" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6"/>
          <path d="M47 54 Q50 58 53 54" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
    },
    "cyber-cat": {
      name: "Cyber Neko",
      title: "Mèo Công Nghệ",
      badge: "Pro Gamer",
      svg: (size = 36) => `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="istore-mascot-svg">
          <defs>
            <linearGradient id="bg-cat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ec4899"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#bg-cat)"/>
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <path d="M22 42 L32 18 L46 32 Z" fill="#fdf2f8"/>
          <path d="M26 40 L33 24 L42 33 Z" fill="#f472b6"/>
          <path d="M78 42 L68 18 L54 32 Z" fill="#fdf2f8"/>
          <path d="M74 40 L67 24 L58 33 Z" fill="#f472b6"/>
          <ellipse cx="50" cy="58" rx="34" ry="28" fill="#fdf2f8"/>
          <path d="M30 48 Q37 44 44 48" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
          <path d="M56 48 Q63 44 70 48" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
          <circle cx="37" cy="52" r="4" fill="#06b6d4"/>
          <circle cx="63" cy="52" r="4" fill="#06b6d4"/>
          <polygon points="50,60 46,64 54,64" fill="#f43f5e"/>
          <path d="M50 64 Q46 68 42 66" stroke="#475569" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M50 64 Q54 68 58 66" stroke="#475569" stroke-width="2" stroke-linecap="round" fill="none"/>
          <ellipse cx="28" cy="62" rx="4" ry="2" fill="#f472b6" opacity="0.6"/>
          <ellipse cx="72" cy="62" rx="4" ry="2" fill="#f472b6" opacity="0.6"/>
        </svg>
      `,
    },
    "apple-fox": {
      name: "Foxi Apple",
      title: "Cáo iStore",
      badge: "Apple Fan",
      svg: (size = 36) => `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="istore-mascot-svg">
          <defs>
            <linearGradient id="bg-fox" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#d70018"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#bg-fox)"/>
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <polygon points="18,48 24,14 44,38" fill="#ea580c"/>
          <polygon points="22,44 26,20 40,36" fill="#fef3c7"/>
          <polygon points="82,48 76,14 56,38" fill="#ea580c"/>
          <polygon points="78,44 74,20 60,36" fill="#fef3c7"/>
          <path d="M18 52 Q50 32 82 52 Q84 76 50 88 Q16 76 18 52 Z" fill="#ea580c"/>
          <path d="M18 54 Q36 50 48 68 Q50 72 50 88 Q16 76 18 54 Z" fill="#fef3c7"/>
          <path d="M82 54 Q64 50 52 68 Q50 72 50 88 Q84 76 82 54 Z" fill="#fef3c7"/>
          <ellipse cx="36" cy="54" rx="4" ry="5" fill="#0f172a"/>
          <ellipse cx="64" cy="54" rx="4" ry="5" fill="#0f172a"/>
          <circle cx="38" cy="52" r="1.5" fill="#fff"/>
          <circle cx="66" cy="52" r="1.5" fill="#fff"/>
          <ellipse cx="50" cy="74" rx="5" ry="3.5" fill="#0f172a"/>
        </svg>
      `,
    },
    "smart-owl": {
      name: "Professor Owl",
      title: "Cú Thông Thái",
      badge: "Reviewer",
      svg: (size = 36) => `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="istore-mascot-svg">
          <defs>
            <linearGradient id="bg-owl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#059669"/>
              <stop offset="100%" stop-color="#047857"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#bg-owl)"/>
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <path d="M26 30 L32 16 L40 28 Z" fill="#065f46"/>
          <path d="M74 30 L68 16 L60 28 Z" fill="#065f46"/>
          <ellipse cx="50" cy="56" rx="34" ry="30" fill="#f0fdf4"/>
          <circle cx="36" cy="48" r="13" fill="#fff" stroke="#d97706" stroke-width="3"/>
          <circle cx="64" cy="48" r="13" fill="#fff" stroke="#d97706" stroke-width="3"/>
          <rect x="47" y="46" width="6" height="4" fill="#d97706"/>
          <circle cx="36" cy="48" r="6" fill="#0f172a"/>
          <circle cx="64" cy="48" r="6" fill="#0f172a"/>
          <circle cx="38" cy="46" r="2" fill="#fff"/>
          <circle cx="66" cy="46" r="2" fill="#fff"/>
          <polygon points="50,56 46,64 54,64" fill="#f59e0b"/>
        </svg>
      `,
    },
  };
  window.MASCOT_PRESETS = MASCOT_PRESETS;

  function getActiveMascotKey() {
    return localStorage.getItem("istore_mascot") || "astro-bot";
  }
  window.getActiveMascotKey = getActiveMascotKey;

  function getMascotSvg(key, size = 36) {
    const preset = MASCOT_PRESETS[key] || MASCOT_PRESETS["astro-bot"];
    return preset.svg(size);
  }
  window.getMascotSvg = getMascotSvg;

  // ---------- 4. Giao diện: Chế độ sáng chuẩn ----------
  function initTheme() {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("theme-toggle-btn")?.remove();
  }
  window.initTheme = initTheme;

  // ---------- 5. Header Auth & Đăng nhập / Đăng xuất ----------
  function renderHeaderAuth() {
    initTheme();
    const user = checkAuthSession();
    const userActionContainer = document.querySelector(".user-actions");
    if (!userActionContainer) return;

    const existingAuthBtn =
      document.getElementById("user-action-btn") ||
      userActionContainer.querySelector("a[href='login.html']") ||
      userActionContainer.querySelector(".logged-in-box");

    if (user) {
      const mascotKey = getActiveMascotKey();
      const mascotSvg = getMascotSvg(mascotKey, 34);
      const displayName = user.username || user.name || "Khách hàng";

      const loggedInHTML = `
        <div class="action-item logged-in-box header-logged-in" id="user-action-btn">
          <a href="profile.html" class="header-profile-link" title="Xem hồ sơ &amp; quản lý tài khoản">
            <div class="header-mascot-avatar" id="header-avatar-container">
              ${mascotSvg}
            </div>
            <div class="header-user-text">
              <span class="header-user-greeting">Chào,</span>
              <strong class="header-user-name" id="header-user-name">${window.IStoreValidators ? window.IStoreValidators.escapeHTML(displayName) : displayName}</strong>
            </div>
          </a>
          <button type="button" id="btn-logout-header" class="btn-header-logout" title="Đăng xuất">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Thoát
          </button>
        </div>
      `;

      if (existingAuthBtn) {
        existingAuthBtn.outerHTML = loggedInHTML;
      }

      document.getElementById("btn-logout-header")?.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
      });
    } else {
      if (existingAuthBtn) {
        existingAuthBtn.outerHTML = `
          <a href="login.html" class="action-item" id="user-action-btn">
            <i class="fa-regular fa-circle-user"></i>
            <span>Đăng nhập<br />Đăng ký</span>
          </a>
        `;
      }
    }
  }
  window.renderHeaderAuth = renderHeaderAuth;

  // ---------- 6. Thanh tìm kiếm thông minh trên Header ----------
  function initHeaderSearch() {
    const searchBox = document.querySelector(".search-box");
    const searchInput = searchBox?.querySelector("input");
    const searchBtn = searchBox?.querySelector("button");
    const searchSuggestions = searchBox?.querySelector(".search-suggestions-container");

    if (!searchBox || !searchInput) return;

    function normalizeSearchTerm(raw) {
      return (raw || "").toLowerCase().trim();
    }

    function getMatchingProducts(keyword) {
      if (!keyword || typeof productsData === "undefined") return [];
      const term = normalizeSearchTerm(keyword);
      const isIphoneAlias = term === "i" || term.startsWith("ip");
      const isMacAlias = term === "m" || term.startsWith("ma");

      return productsData.filter((p) => {
        const pName = (p.name || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        if (pName.includes(term) || pCat.includes(term)) return true;
        if (isIphoneAlias && (pCat.startsWith("iphone") || pName.includes("iphone"))) return true;
        if (isMacAlias && (pCat === "mac" || pName.includes("mac"))) return true;
        return false;
      });
    }

    function renderSearchSuggestions(query) {
      if (!searchSuggestions) return;
      const trimmed = (query || "").trim();
      if (!trimmed) {
        searchSuggestions.hidden = true;
        searchSuggestions.innerHTML = "";
        return;
      }

      const matched = getMatchingProducts(trimmed);
      const term = normalizeSearchTerm(trimmed);
      const isIphone = term === "i" || term.startsWith("ip");
      const isMac = term === "m" || term.startsWith("ma");

      let tags = [];
      if (isIphone) {
        tags = ["iPhone 18 Pro Max", "iPhone 18", "iPhone 17", "iPhone 16", "iPhone 15"];
      } else if (isMac) {
        tags = ["Mac Mini M4", "Mac Mini"];
      } else if (matched.length > 0) {
        tags = [...new Set(matched.slice(0, 3).map((p) => p.name))];
      }

      let html = "";
      if (tags.length > 0) {
        html += `
          <div class="search-quick-tags">
            ${tags
              .map(
                (t) =>
                  `<button type="button" class="search-quick-tag" data-tag="${t}"><i class="fa-solid fa-magnifying-glass"></i> ${t}</button>`,
              )
              .join("")}
          </div>
        `;
      }

      if (matched.length > 0) {
        html += `
          <div class="search-suggestions-list">
            ${matched
              .slice(0, 5)
              .map(
                (p) => `
              <a href="detail.html?id=${encodeURIComponent(p.id)}" class="search-suggestion-item">
                <img src="${formatImagePath(p.image)}" alt="${p.name}" />
                <div class="search-item-info">
                  <strong>${p.name}</strong>
                  <span>${formatMoney(p.price)}</span>
                </div>
              </a>
            `,
              )
              .join("")}
          </div>
        `;
      }

      searchSuggestions.innerHTML = html;
      searchSuggestions.hidden = false;

      searchSuggestions.querySelectorAll(".search-quick-tag").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tag = btn.dataset.tag;
          searchInput.value = tag;
          searchSuggestions.hidden = true;
          window.location.href = `detail.html?q=${encodeURIComponent(tag)}`;
        });
      });
    }

    searchInput.addEventListener("input", () => {
      renderSearchSuggestions(searchInput.value);
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) renderSearchSuggestions(searchInput.value);
    });

    searchBtn?.addEventListener("click", () => {
      const val = searchInput.value.trim();
      if (val) window.location.href = `detail.html?q=${encodeURIComponent(val)}`;
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = searchInput.value.trim();
        if (val) window.location.href = `detail.html?q=${encodeURIComponent(val)}`;
      }
    });

    document.addEventListener("click", (e) => {
      if (!searchBox.contains(e.target)) {
        if (searchSuggestions) searchSuggestions.hidden = true;
      }
    });
  }

  // ---------- 7. Tạo Card Sản Phẩm Toàn Cục ----------
  function formatImagePath(path) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    if (path.startsWith("../image/")) return path;
    if (path.startsWith("image/")) return "../" + path;
    return path;
  }
  window.formatImagePath = formatImagePath;

  function renderCard(product) {
    const isFav =
      typeof window.isProductFavorite === "function" ? window.isProductFavorite(product.id) : false;
    const imgSrc = formatImagePath(product.image);
    return `
      <div class="product-card" data-product-id="${product.id}">
        <button type="button" class="btn-favorite ${isFav ? "active" : ""}" data-id="${product.id}" onclick="toggleFavorite('${product.id}', this)" aria-label="${isFav ? "Bỏ yêu thích" : "Yêu thích"}" title="${isFav ? "Bỏ yêu thích" : "Yêu thích"}">
          <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
        </button>
        ${product.badge ? `<div class="badge ${product.badgeColor}">${product.badge}</div>` : ""}
        ${product.extraBadges ? `<div class="extra-badges-container">${product.extraBadges}</div>` : ""}
        <a class="product-image-link" href="detail.html?id=${encodeURIComponent(product.id)}">
          <img class="product-card-image" src="${imgSrc}" alt="${product.name}" loading="lazy">
        </a>
        <h3>${product.name}</h3>
        <div class="price">
          <span class="new-price">${formatMoney(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price">${formatMoney(product.oldPrice)}</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn-detail" onclick="location.href='detail.html?id=${encodeURIComponent(product.id)}'">Xem chi tiết</button>
          <button class="btn-add-cart" title="Thêm vào giỏ" onclick="addToCart('${product.id}', this)"><i class="fa-solid fa-cart-plus"></i></button>
        </div>
      </div>
    `;
  }
  window.renderCard = renderCard;

  // ---------- 8. Tính toán Giờ Vàng Sale & Đồng bộ Thời gian Hệ thống ----------
  let originalProductValues = null;

  async function applyGoldenHourSaleAndRender() {
    if (typeof productsData === "undefined") return;

    if (!originalProductValues) {
      originalProductValues = new Map(
        productsData.map((p) => [
          p.id,
          {
            price: p.price,
            oldPrice: p.oldPrice,
            badge: p.badge,
            badgeColor: p.badgeColor,
            extraBadges: p.extraBadges,
          },
        ]),
      );
    }

    let serverTime;
    try {
      const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh");
      const data = await response.json();
      serverTime = new Date(data.datetime);
    } catch {
      serverTime = new Date();
    }
    serverTimeOffset = serverTime.getTime() - Date.now();

    const vietnamTime = getVietnamTimeParts(serverTime);
    const currentDay = vietnamTime.day;
    const currentHour = vietnamTime.hour;
    const currentDate = vietnamTime.date;
    const currentMonth = vietnamTime.month + 1;

    const isSpecialDay =
      (currentDate === 1 && currentMonth === 1) ||
      (currentDate === 30 && currentMonth === 4) ||
      (currentDate === 11 && currentMonth === 11);

    productsData.forEach((product) => {
      const original = originalProductValues.get(product.id);
      if (!original) return;

      product.price = original.price;
      product.badge = original.badge;
      product.badgeColor = original.badgeColor;
      product.extraBadges = original.extraBadges;

      if (original.oldPrice === undefined) delete product.oldPrice;
      else product.oldPrice = original.oldPrice;

      let discount = 0;
      let extraBadges = "";

      if (product.category === "mac") {
        if (currentHour === 17) {
          discount = 10;
          extraBadges = `<div class="extra-badge">+6 Tháng BH</div><div class="extra-badge">Sale 17H</div>`;
        }
      } else {
        const isPro =
          product.id.includes("pro") || product.id.includes("pm") || product.id.includes("promax");

        if (isSpecialDay) {
          discount = 15;
          if (isPro)
            extraBadges = `<div class="extra-badge">Free Cover</div><div class="extra-badge">Góp 0%</div>`;
        } else if (
          product.category === "iphone-15" &&
          [1, 3, 5].includes(currentDay) &&
          currentHour === 15
        ) {
          discount = isPro ? 9 : 5;
          if (isPro)
            extraBadges = `<div class="extra-badge">Free Cover</div><div class="extra-badge">Góp 0%</div>`;
        } else if (
          ["iphone-16", "iphone-17"].includes(product.category) &&
          [2, 4, 6].includes(currentDay)
        ) {
          discount = isPro ? 9 : 5;
          if (isPro)
            extraBadges = `<div class="extra-badge">Free Cover</div><div class="extra-badge">Góp 0%</div>`;
        } else if (product.category === "iphone-18" && [0, 6].includes(currentDay)) {
          discount = isPro ? 9 : 5;
          if (isPro)
            extraBadges = `<div class="extra-badge">Free Cover</div><div class="extra-badge">Góp 0%</div>`;
        }
      }

      if (discount > 0) {
        product.oldPrice = original.price;
        product.price = Math.round((original.price * (100 - discount)) / 100);
        product.badge = `Sale ${discount}%`;
        product.badgeColor = "red";
        product.extraBadges = extraBadges;
      }
    });

    bindAuthGateControls();
    if (typeof window.checkWishlistSaleAlerts === "function") {
      window.checkWishlistSaleAlerts();
    }
    if (typeof window.renderHomeCatalog === "function") {
      window.renderHomeCatalog();
    }
    if (typeof window.sortCatalogProducts === "function") {
      window.sortCatalogProducts();
    }
  }
  window.applyGoldenHourSaleAndRender = applyGoldenHourSaleAndRender;

  // ---------- 9. Tiện ích Giỏ Hàng Toàn Cục ----------
  function getCartStorageKey() {
    try {
      const userStr = localStorage.getItem("istore_user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && typeof user.email === "string" && user.email.trim()) {
        return `istore_cart_${user.email.toLowerCase().trim()}`;
      }
    } catch {
      // fallback
    }
    return "istore_cart";
  }
  window.getCartStorageKey = getCartStorageKey;

  function saveCartItems(cart) {
    const key = getCartStorageKey();
    const json = JSON.stringify(cart);
    localStorage.setItem(key, json);
    localStorage.setItem("istore_cart", json);
  }
  window.saveCartItems = saveCartItems;

  function readCartItems() {
    try {
      const key = getCartStorageKey();
      let raw = localStorage.getItem(key);
      if (raw === null) {
        const hasSeeded = localStorage.getItem("istore_seeded_v1");
        if (!hasSeeded) {
          const defaultSampleCart = [
            { id: "ip-18-pm-512", quantity: 1, warrantyPlanId: "none" },
            { id: "ip-16-plus-128", quantity: 2, warrantyPlanId: "none" },
          ];
          saveCartItems(defaultSampleCart);
          localStorage.setItem("istore_seeded_v1", "true");
          raw = JSON.stringify(defaultSampleCart);
        } else {
          saveCartItems([]);
          raw = "[]";
        }
      }
      const savedCart = JSON.parse(raw || "[]");
      if (!Array.isArray(savedCart)) return [];
      if (typeof productsData === "undefined") return [];
      return savedCart.flatMap((item) => {
        if (
          !item ||
          typeof item.id !== "string" ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 99
        ) {
          return [];
        }
        const product = productsData.find((entry) => entry.id === item.id);
        if (!product) return [];
        const plans =
          product.warrantyPlans ?? (typeof warrantyPlans !== "undefined" ? warrantyPlans : []);
        const warrantyPlan =
          plans.find((plan) => plan.id === item.warrantyPlanId) ??
          plans.find((plan) => plan.id === "none");
        return [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            warrantyPlanId: warrantyPlan?.id ?? "none",
            warrantyName: warrantyPlan?.name ?? "Không mua thêm bảo hành",
            warrantyPrice: warrantyPlan?.price ?? 0,
            quantity: item.quantity,
          },
        ];
      });
    } catch (error) {
      console.error("Không thể đọc dữ liệu giỏ hàng:", error);
      return [];
    }
  }
  window.readCartItems = readCartItems;

  function updateCartCount() {
    const cart = readCartItems();
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = totalCount;
    });
    if (typeof window.renderHomeCartPreview === "function") {
      window.renderHomeCartPreview();
    }
  }
  window.updateCartCount = updateCartCount;

  window.buyNow = function (productId, warrantyPlanId = "none") {
    if (typeof productsData === "undefined") return;
    const product = productsData.find((p) => p.id === productId);
    if (!product) return;

    const plans =
      product.warrantyPlans ?? (typeof warrantyPlans !== "undefined" ? warrantyPlans : []);
    const selectedPlan = plans.find((plan) => plan.id === warrantyPlanId) ?? plans[0];
    localStorage.setItem(
      "istore_buy_now",
      JSON.stringify([
        { id: product.id, quantity: 1, warrantyPlanId: selectedPlan?.id ?? "none" },
      ]),
    );

    if (
      !window.requireSignedInUser("Bạn cần đăng nhập để tiến hành mua ngay.", {
        redirect: true,
        returnTo: "checkout.html?mode=buynow",
      })
    ) {
      return;
    }
    window.location.assign("checkout.html?mode=buynow");
  };

  window.addToCart = function (productId, buttonElement, warrantyPlanId = "none") {
    if (!window.requireSignedInUser("Đăng nhập để thêm sản phẩm vào giỏ hàng.")) return;

    if (buttonElement) {
      buttonElement.classList.add("btn-added");
      setTimeout(() => {
        buttonElement.classList.remove("btn-added");
        if (buttonElement.classList.contains("btn-add-cart-large")) {
          buttonElement.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Thêm Vào Giỏ Hàng`;
        } else {
          buttonElement.innerHTML = `<i class="fa-solid fa-cart-plus"></i>`;
        }
      }, 1000);
    }

    const cart = readCartItems();
    const product =
      typeof productsData !== "undefined" ? productsData.find((p) => p.id === productId) : null;

    if (product) {
      const plans =
        product.warrantyPlans ?? (typeof warrantyPlans !== "undefined" ? warrantyPlans : []);
      const selectedPlan = plans.find((plan) => plan.id === warrantyPlanId) ?? plans[0];
      const selectedPlanId = selectedPlan?.id ?? "none";
      const existingItem = cart.find(
        (item) => item.id === productId && (item.warrantyPlanId ?? "none") === selectedPlanId,
      );
      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + 1, 99);
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          warrantyPlanId: selectedPlanId,
          warrantyName: selectedPlan?.name ?? "Không mua thêm bảo hành",
          warrantyPrice: selectedPlan?.price ?? 0,
          quantity: 1,
        });
      }
      saveCartItems(cart);
      updateCartCount();
      if (typeof window.showToast === "function") {
        window.showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
      }
      if (typeof window.renderCartPage === "function" && window.location.pathname.includes("cart.html")) {
        window.renderCartPage();
      }
    }
  };

  // ---------- 10. Tự động khởi chạy tầng Common trên mọi trang ----------
  document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    renderHeaderAuth();
    initHeaderSearch();
    updateCartCount();
    await applyGoldenHourSaleAndRender();

    // Đồng bộ lại mỗi 60 giây
    setInterval(async () => {
      await applyGoldenHourSaleAndRender();
    }, 60000);
  });
})();
