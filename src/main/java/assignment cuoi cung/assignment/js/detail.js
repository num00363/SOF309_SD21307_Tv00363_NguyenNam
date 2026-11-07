// ================= MODULE TRANG CHI TIẾT & BỘ LỌC DANH MỤC (DETAIL.JS) =================
// Quản lý Catalog Filter (dropdown dòng máy, thanh trượt khoảng giá min-max, sắp xếp giá),
// Tự động lọc series từ Banner Index, Giao diện Chi tiết Shopee-style với 2 Tab bên dưới sản phẩm

(() => {
  let priceSort = "none"; // "none" | "asc" | "desc"
  let searchKeyword = (new URLSearchParams(window.location.search).get("q") ?? "")
    .toLowerCase()
    .trim();
  let activeRelatedBadgeFilter = "all";
  let detailImageResizeObserver = null;

  // ---------- 1. Bộ Lọc Catalog & Thanh Kéo Giá ----------
  function initCatalogFilters() {
    const searchInput = document.querySelector(".search-box input");
    if (searchKeyword && searchInput) searchInput.value = searchKeyword;

    const categoryDropdown = document.getElementById("category-dropdown");
    const categoryDropdownBtn = document.getElementById("category-dropdown-btn");
    const selectedCatText = document.getElementById("selected-category-text");
    const catButtons = document.querySelectorAll(".cat-btn");

    function updateCategoryDropdownSelection(selectedBtn) {
      if (!selectedBtn) return;
      catButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      selectedBtn.classList.add("active");
      selectedBtn.setAttribute("aria-selected", "true");
      if (selectedCatText) {
        selectedCatText.innerHTML = selectedBtn.innerHTML;
      }
      if (categoryDropdown) {
        categoryDropdown.classList.remove("is-open");
        categoryDropdownBtn?.setAttribute("aria-expanded", "false");
      }
    }
    window.updateCategoryDropdownSelection = updateCategoryDropdownSelection;

    if (categoryDropdownBtn && categoryDropdown && !categoryDropdownBtn.dataset.bound) {
      categoryDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = categoryDropdown.classList.toggle("is-open");
        categoryDropdownBtn.setAttribute("aria-expanded", String(isOpen));
      });
      categoryDropdownBtn.dataset.bound = "true";
    }

    catButtons.forEach((btn) => {
      if (!btn.dataset.bound) {
        btn.addEventListener("click", () => {
          updateCategoryDropdownSelection(btn);
          sortCatalogProducts({ animate: true, shouldScroll: false });
        });
        btn.dataset.bound = "true";
      }
    });

    // Shortcuts danh mục
    document.querySelectorAll(".catalog-shortcuts a").forEach((link) => {
      if (!link.dataset.bound) {
        link.addEventListener("click", (e) => {
          const targetHash = link.getAttribute("href") || "";
          const catKey = targetHash.replace("#", "");
          const targetId = catKey === "mac-mini" ? "mac" : catKey;
          const matchedBtn = document.querySelector(`.cat-btn[data-cat="${targetId}"]`);
          if (matchedBtn) {
            e.preventDefault();
            updateCategoryDropdownSelection(matchedBtn);
            sortCatalogProducts({ animate: true, shouldScroll: false });
          }
        });
        link.dataset.bound = "true";
      }
    });

    // Thanh kéo giá Min - Max
    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");
    const priceDisplay = document.getElementById("price-display");

    function updatePriceDisplay() {
      if (priceMin && priceMax && priceDisplay) {
        let minVal = parseInt(priceMin.value, 10);
        let maxVal = parseInt(priceMax.value, 10);
        if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];
        const fmt = (n) => (typeof window.formatMoney === "function" ? window.formatMoney(n) : `${n}đ`);
        priceDisplay.textContent = `${fmt(minVal)} - ${fmt(maxVal)}`;
      }
    }

    if (priceMin && priceMax && !priceMin.dataset.bound) {
      priceMin.addEventListener("input", updatePriceDisplay);
      priceMax.addEventListener("input", updatePriceDisplay);
      priceMin.addEventListener("change", () => {
        const result = sortCatalogProducts({ animate: true });
        document.getElementById("catalog-filter-feedback")?.classList.toggle("is-no-match", result.matchingCount === 0);
      });
      priceMax.addEventListener("change", () => {
        const result = sortCatalogProducts({ animate: true });
        document.getElementById("catalog-filter-feedback")?.classList.toggle("is-no-match", result.matchingCount === 0);
      });
      priceMin.dataset.bound = "true";
    }

    // Nút Sắp xếp theo giá
    document.querySelectorAll(".sort-btn").forEach((btn) => {
      if (!btn.dataset.bound) {
        btn.addEventListener("click", () => {
          priceSort = priceSort === btn.dataset.sort ? "none" : btn.dataset.sort;
          document.querySelectorAll(".sort-btn").forEach((b) => {
            const on = b.dataset.sort === priceSort;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", String(on));
          });
          sortCatalogProducts({ animate: true });
        });
        btn.dataset.bound = "true";
      }
    });

    // Nút "Đặt lại bộ lọc"
    const btnFilter = document.getElementById("btn-filter");
    if (btnFilter && !btnFilter.dataset.bound) {
      btnFilter.addEventListener("click", () => {
        const allCatBtn = document.querySelector('.cat-btn[data-cat="all"]');
        if (allCatBtn) {
          updateCategoryDropdownSelection(allCatBtn);
        } else {
          catButtons.forEach((b) => b.classList.toggle("active", b.dataset.cat === "all"));
        }
        if (priceMin) priceMin.value = priceMin.min;
        if (priceMax) priceMax.value = priceMax.max;
        updatePriceDisplay();
        priceSort = "none";
        document.querySelectorAll(".sort-btn").forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        searchKeyword = "";
        if (searchInput) searchInput.value = "";
        if (!new URLSearchParams(window.location.search).get("id")) {
          window.history.replaceState({}, "", window.location.pathname);
        }
        document.getElementById("catalog-filter-feedback")?.classList.remove("is-no-match");
        sortCatalogProducts({ animate: true });
      });
      btnFilter.dataset.bound = "true";
    }

    document.addEventListener("click", (e) => {
      if (categoryDropdown && !categoryDropdown.contains(e.target)) {
        categoryDropdown.classList.remove("is-open");
        categoryDropdownBtn?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function getSelectedPriceRange() {
    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");
    let min = Number.parseInt(priceMin?.value ?? "0", 10);
    let max = Number.parseInt(priceMax?.value ?? "50000000", 10);
    if (min > max) [min, max] = [max, min];
    return { min, max };
  }

  function sortCatalogProducts({ animate = false, shouldScroll = false } = {}) {
    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");
    const { min, max } = getSelectedPriceRange();
    const hasPriceFilter =
      min > Number.parseInt(priceMin?.min ?? "0", 10) ||
      max < Number.parseInt(priceMax?.max ?? "50000000", 10);
    const activeCatBtn = document.querySelector(".cat-btn.active");
    const currentCat = activeCatBtn?.dataset.cat ?? "all";
    const allSections = [...document.querySelectorAll(".catalog-section")];
    const targetSectionId = currentCat === "mac" ? "mac-mini" : currentCat;

    // Ẩn/Hiện section theo danh mục được chọn
    allSections.forEach((section) => {
      const isVisible = currentCat === "all" || section.id === targetSectionId;
      section.hidden = !isVisible;
      section.style.display = isVisible ? "" : "none";
    });

    if (shouldScroll && currentCat !== "all") {
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const sections =
      currentCat === "all"
        ? allSections
        : allSections.filter((section) => section.id === targetSectionId);

    let matchingCount = 0;
    let activeSaleCount = 0;
    let searchHitCount = 0;

    sections.forEach((section) => {
      section.querySelector(".catalog-filter-empty")?.remove();
      const productList = section.querySelector(".product-list");
      if (!productList) return;

      const cards = [...productList.querySelectorAll(".product-card")];
      cards.forEach((card, index) => {
        if (!card.dataset.catalogOrder) card.dataset.catalogOrder = String(index);
        const cardTitle = card.querySelector("h3")?.textContent.toLowerCase() ?? "";
        let matchesKeyword = !searchKeyword;
        if (searchKeyword) {
          const term = searchKeyword.toLowerCase().trim();
          const isIphoneAlias = term === "i" || term.startsWith("ip") || term.includes("iphone");
          const isMacAlias =
            term === "m" || term.startsWith("ma") || term.includes("mac") || term.includes("mini");
          if (cardTitle.includes(term)) {
            matchesKeyword = true;
          } else if (isIphoneAlias && cardTitle.includes("iphone")) {
            matchesKeyword = true;
          } else if (
            isMacAlias &&
            (cardTitle.includes("mac") || cardTitle.includes("mini") || section.id === "mac-mini")
          ) {
            matchesKeyword = true;
          }
        }
        card.hidden = false;
        card.style.display = matchesKeyword ? "" : "none";
        card.dataset.searchMatch = String(matchesKeyword);
        card.classList.remove("is-filter-match", "is-sale-priority");
      });

      if (searchKeyword) {
        const hasMatchingCard = cards.some((card) => card.dataset.searchMatch !== "false");
        section.hidden = !hasMatchingCard;
        section.style.display = hasMatchingCard ? "" : "none";
      }

      const rankedCards = cards.map((card) => {
        const priceText = card.querySelector(".new-price")?.textContent ?? "";
        const price = Number.parseInt(priceText.replace(/[^\d]/g, ""), 10);
        const inPriceRange = Number.isFinite(price) && price >= min && price <= max;
        const matchesRange = hasPriceFilter && inPriceRange;
        const badge = card.querySelector(".badge")?.textContent.trim().toLowerCase() ?? "";
        const isOnSale = badge.startsWith("sale");
        const isSearchHit = card.dataset.searchMatch !== "false";
        if (isSearchHit) searchHitCount++;
        if (inPriceRange && isSearchHit) matchingCount++;
        if (isOnSale) activeSaleCount++;
        card.dataset.filterMatch = String(matchesRange);
        card.dataset.salePriority = String(isOnSale);
        return { card, matchesRange, isOnSale, price };
      });

      rankedCards
        .sort((first, second) => {
          if (priceSort !== "none") {
            const priceDiff =
              priceSort === "asc" ? first.price - second.price : second.price - first.price;
            if (priceDiff) return priceDiff;
          }
          const firstScore = Number(first.matchesRange) * 2 + Number(first.isOnSale);
          const secondScore = Number(second.matchesRange) * 2 + Number(second.isOnSale);
          return (
            secondScore - firstScore ||
            Number(first.card.dataset.catalogOrder) - Number(second.card.dataset.catalogOrder)
          );
        })
        .forEach(({ card, matchesRange, isOnSale }, index) => {
          productList.append(card);
          if (matchesRange && animate) {
            card.classList.add("is-filter-match");
            card.style.setProperty("--filter-stagger", `${Math.min(index, 8) * 65}ms`);
          } else if (isOnSale && animate) {
            card.classList.add("is-sale-priority");
            card.style.setProperty("--filter-stagger", `${Math.min(index, 8) * 65}ms`);
          } else {
            card.style.removeProperty("--filter-stagger");
          }
        });
    });

    const feedback = document.getElementById("catalog-filter-feedback");
    if (feedback) {
      if (searchKeyword) {
        feedback.textContent = searchHitCount
          ? `Tìm thấy ${searchHitCount} sản phẩm cho từ khóa "${searchKeyword}".`
          : `Không tìm thấy sản phẩm nào cho từ khóa "${searchKeyword}".`;
        feedback.classList.add("is-visible");
        feedback.classList.toggle("is-no-match", searchHitCount === 0);
        return { matchingCount, activeSaleCount, sections };
      }
      const catTitle = activeCatBtn?.textContent.trim() ?? "Tất cả";
      if (currentCat !== "all") {
        feedback.textContent = `Đang lọc danh mục: ${catTitle} (${matchingCount} sản phẩm phù hợp).`;
      } else if (matchingCount === 0) {
        feedback.textContent = `Chưa có sản phẩm trong khoảng giá đã chọn.`;
      } else if (animate) {
        feedback.textContent = hasPriceFilter
          ? `Đã tìm thấy ${matchingCount} sản phẩm phù hợp trong khoảng giá đã chọn.`
          : `Hiện tất cả ${matchingCount} sản phẩm${activeSaleCount ? `; ${activeSaleCount} sản phẩm đang sale được ưu tiên` : ""}.`;
      } else if (activeSaleCount > 0) {
        feedback.textContent = `${activeSaleCount} sản phẩm đang sale được ưu tiên ở đầu danh mục.`;
      }
      feedback.classList.add("is-visible");
      feedback.classList.remove("is-no-match");
    }

    return { matchingCount, activeSaleCount, sections };
  }
  window.sortCatalogProducts = sortCatalogProducts;

  // ---------- 2. Xử lý Tự Động Lọc Series từ Banner Index ----------
  function handleBannerSeriesFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedSeries =
      urlParams.get("series") ||
      urlParams.get("cat") ||
      (window.location.hash ? window.location.hash.replace("#", "") : "");

    if (requestedSeries && !urlParams.get("id")) {
      const targetCatId = requestedSeries === "mac-mini" ? "mac" : requestedSeries;
      const matchedBtn = document.querySelector(`.cat-btn[data-cat="${targetCatId}"]`);
      if (matchedBtn) {
        if (typeof window.updateCategoryDropdownSelection === "function") {
          window.updateCategoryDropdownSelection(matchedBtn);
        }
        sortCatalogProducts({ animate: true, shouldScroll: true });
        const dashboard = document.getElementById("dashboard");
        if (dashboard) {
          setTimeout(() => {
            const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
            const top = dashboard.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          }, 150);
        }
      }
    }
  }

  // ---------- 3. Render Chi Tiết Sản Phẩm (Shopee-Style + 2 Tab Bên Dưới) ----------
  function renderDetailPage() {
    const detailContainer = document.getElementById("detail-container");
    if (!detailContainer) return;
    detailImageResizeObserver?.disconnect();
    detailImageResizeObserver = null;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const detailView = document.getElementById("detail-view");
    const isProductDetail = Boolean(productId);
    const catalogShortcut = document.getElementById("catalog-shortcut");
    const catalogElements = [
      document.querySelector(".catalog-hero"),
      document.querySelector(".catalog-shortcuts"),
      document.getElementById("flash-sale-strip-section"),
      document.getElementById("dashboard"),
      ...document.querySelectorAll(".catalog-section"),
    ];

    catalogElements.forEach((element) => {
      if (element) element.hidden = isProductDetail;
    });

    if (catalogShortcut) {
      catalogShortcut.href = isProductDetail ? "detail.html" : "#dashboard";
      catalogShortcut.innerHTML = isProductDetail
        ? `<i class="fa-solid fa-arrow-left"></i> Quay lại danh sách sản phẩm`
        : `<i class="fa-solid fa-arrow-up"></i> Lên bộ lọc`;
      catalogShortcut.setAttribute(
        "aria-label",
        isProductDetail ? "Quay lại danh sách sản phẩm" : "Cuộn lên bộ lọc",
      );
    }

    if (!productId) {
      detailContainer.innerHTML = "";
      if (detailView) detailView.hidden = true;
      return;
    }

    if (detailView) detailView.hidden = false;
    if (typeof productsData === "undefined") return;

    const product = productsData.find((p) => p.id === productId);

    if (product) {
      const selectedWarrantyId = document.getElementById("warranty-plan")?.value ?? "none";
      const productWarrantyPlans =
        product.warrantyPlans ?? (typeof warrantyPlans !== "undefined" ? warrantyPlans : []);
      const productVariants = productsData.filter(
        (variant) => variant.variantGroup === product.variantGroup,
      );
      const variantByStorage = new Map();
      productVariants.forEach((variant) => {
        const existingVariant = variantByStorage.get(variant.storageOption);
        if (
          !existingVariant ||
          variant.id === product.id ||
          (existingVariant.id !== product.id && variant.price < existingVariant.price)
        ) {
          variantByStorage.set(variant.storageOption, variant);
        }
      });

      const storageToBytes = (storage) => {
        const match = (storage || "").match(/^([\d.]+)(GB|TB)$/);
        if (!match) return Number.MAX_SAFE_INTEGER;
        return parseFloat(match[1]) * (match[2] === "TB" ? 1024 : 1);
      };

      const variantOptionsHTML = [...variantByStorage.values()]
        .sort((a, b) => storageToBytes(a.storageOption) - storageToBytes(b.storageOption))
        .map(
          (variant) => `
            <button
              class="storage-option ${variant.id === product.id ? "active" : ""}"
              type="button"
              aria-pressed="${variant.id === product.id}"
              onclick="selectProductVariant('${variant.id}')"
            >
              <span>${variant.storageOption || "Phiên bản"}</span>
              <strong>${typeof window.formatMoney === "function" ? window.formatMoney(variant.price) : `${variant.price}đ`}</strong>
            </button>
          `,
        )
        .join("");

      const specLabels = {
        screen: "Màn hình",
        chip: "Chip xử lý",
        ram: "RAM",
        storage: "Bộ nhớ trong",
        camera: "Camera",
        battery: "Pin / nguồn",
        material: "Chất liệu",
        features: "Tính năng",
        connection: "Kết nối",
      };

      const detailHighlights = [
        ["Màn hình", product.specs?.screen],
        ["Hiệu năng", product.specs?.chip],
        ["Camera", product.specs?.camera],
        ["Pin / nguồn", product.specs?.battery],
      ]
        .filter(([, value]) => value && value !== "Không")
        .map(
          ([label, value]) => `
            <article class="detail-highlight-card">
              <h4>${label}</h4>
              <p>${value}</p>
            </article>
          `,
        )
        .join("");

      const storageGuidance =
        {
          "128GB": "Phù hợp nếu bạn chủ yếu dùng ứng dụng, chụp ảnh và lưu trữ ở mức cơ bản.",
          "256GB": "Cân bằng cho ứng dụng, ảnh, video và nhu cầu sử dụng hằng ngày.",
          "512GB": "Thoải mái hơn nếu bạn thường quay video, chơi game hoặc lưu nhiều nội dung trên máy.",
          "1TB": "Dành cho người cần lưu trữ nhiều dự án, ảnh và video chất lượng cao trực tiếp trên thiết bị.",
          "2TB": "Không gian lớn nhất trong các lựa chọn, phù hợp với thư viện nội dung và tệp dung lượng lớn.",
        }[product.storageOption] ?? "Dung lượng lưu trữ có thể thay đổi theo phiên bản đang chọn.";

      const productUseCase = product.name.includes("Pro Max")
        ? "Màn hình lớn và cấu hình dòng Pro phù hợp với người ưu tiên không gian hiển thị, chụp ảnh/quay video và làm nhiều việc trên điện thoại."
        : /\bPro\b/.test(product.name)
          ? "Dòng Pro phù hợp với người muốn có cấu hình và hệ thống camera nâng cao trong thiết kế gọn hơn Pro Max."
          : "Phù hợp cho nhu cầu liên lạc, giải trí, chụp ảnh và sử dụng các ứng dụng hằng ngày.";

      const warrantyOptionsHTML = productWarrantyPlans
        .map(
          (plan) =>
            `<option value="${plan.id}" ${plan.id === selectedWarrantyId ? "selected" : ""}>${plan.name} (+${plan.price && typeof window.formatMoney === "function" ? window.formatMoney(plan.price) : "0đ"})</option>`,
        )
        .join("");

      const fmt = (n) => (typeof window.formatMoney === "function" ? window.formatMoney(n) : `${n}đ`);
      const isFav = typeof window.isProductFavorite === "function" ? window.isProductFavorite(product.id) : false;

      // Render bố cục chính sản phẩm (Phần mua ngay tách biệt khỏi 2 Tab bên dưới)
      detailContainer.innerHTML = `
        <div class="detail-grid">
          <div class="detail-image-box">
            <div class="detail-main-image-frame">
              <img id="detail-main-image" src="${typeof window.formatImagePath === "function" ? window.formatImagePath(product.image) : product.image}" alt="${product.name}">
            </div>
          </div>
          <div class="detail-info-box">
            <h2 style="font-size: 24px; font-weight: 500;">
              <span style="background:#ee4d2d; color:white; font-size:12px; padding: 2px 6px; border-radius: 2px; vertical-align: middle; margin-right: 5px;">Mall</span> 
              ${product.name}
            </h2>

            <!-- KHU VỰC BANNER ĐỘNG VÀ ĐẾM NGƯỢC SALE -->
            <div id="dynamic-sale-banner"></div>

            <div class="detail-price-box" style="background: #fafafa; padding: 20px; margin-bottom: 20px;">
              ${product.oldPrice && product.price < product.oldPrice ? `<span class="detail-old-price" style="font-size:16px; color:#929292; text-decoration:line-through; margin-right: 10px;">${fmt(product.oldPrice)}</span>` : ""}
              <span class="detail-new-price" style="font-size: 30px; font-weight: 500; color: #ee4d2d;">${fmt(product.price)}</span>
              ${product.badge ? `<span style="background:#ee4d2d; color:white; font-size:12px; padding: 2px 6px; border-radius: 2px; margin-left:10px;">${product.badge} GIẢM</span>` : ""}
            </div>

            ${
              variantByStorage.size > 1
                ? `
            <div class="storage-variant-picker">
              <div class="storage-variant-heading">
                <h3>Chọn dung lượng</h3>
                <span>Giá thay đổi theo phiên bản</span>
              </div>
              <div class="storage-variant-options">${variantOptionsHTML}</div>
            </div>`
                : ""
            }

            <section class="detail-highlights">
              <h3>Điểm nổi bật của sản phẩm</h3>
              <div class="detail-highlights-grid">${detailHighlights}</div>
            </section>

            <div class="warranty-selector">
              <label for="warranty-plan"><i class="fa-solid fa-shield-halved"></i> Chọn gói bảo hành</label>
              <select id="warranty-plan">${warrantyOptionsHTML}</select>
              <p>Phí bảo hành được cộng vào đơn giá và tổng tiền giỏ hàng.</p>
            </div>

            <div class="detail-selected-total">
              <span>Giá sản phẩm + bảo hành:</span>
              <strong id="detail-selected-total">${fmt(product.price)}</strong>
            </div>

            <div class="detail-actions" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
              <button class="btn-add-cart-large" onclick="addToCart('${product.id}', this, document.getElementById('warranty-plan').value)" style="background: #ffefe8; border: 1px solid #ee4d2d; color: #ee4d2d; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; transition: 0.25s;"><i class="fa-solid fa-cart-shopping"></i> Thêm Vào Giỏ Hàng</button>
              <button class="btn-buy-now-large" onclick="buyNow('${product.id}', document.getElementById('warranty-plan').value)" style="background: linear-gradient(135deg, #d70018, #f53d2d); border: none; color: #fff; padding: 12px 26px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; box-shadow: 0 4px 14px rgba(215, 0, 24, 0.35); transition: 0.25s;"><i class="fa-solid fa-bolt"></i> Mua Ngay</button>
              <button class="btn-favorite-detail ${isFav ? "active" : ""}" id="detail-fav-btn" onclick="toggleFavorite('${product.id}', this)" style="background: #fff; border: 1.5px solid ${isFav ? "#ef4444" : "#cbd5e1"}; color: ${isFav ? "#ef4444" : "#64748b"}; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; transition: 0.25s;">
                <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
                <span>${isFav ? "Đã yêu thích" : "Yêu thích"}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2 TAB BÊN DƯỚI SẢN PHẨM: THÔNG SỐ KỸ THUẬT & MÔ TẢ CHI TIẾT -->
        <section class="detail-bottom-tabs-section">
          <div class="detail-bottom-tabs-nav" role="tablist">
            <button type="button" class="detail-bottom-tab-btn active" data-tab="specs" role="tab" aria-selected="true">
              <i class="fa-solid fa-microchip"></i> Thông số kỹ thuật
            </button>
            <button type="button" class="detail-bottom-tab-btn" data-tab="desc" role="tab" aria-selected="false">
              <i class="fa-solid fa-file-lines"></i> Mô tả chi tiết &amp; Hướng dẫn
            </button>
          </div>
          <div class="detail-bottom-tab-content">
            <div class="detail-bottom-tab-pane active" id="detail-tab-specs" role="tabpanel">
              <table class="detail-specs-table">
                <tbody>
                  ${Object.entries(product.specs ?? {})
                    .map(([key, value]) => `<tr><td><strong>${specLabels[key] ?? key}</strong></td><td>${value}</td></tr>`)
                    .join("") || "<tr><td colspan='2'>Thông số đang được cập nhật.</td></tr>"}
                </tbody>
              </table>
            </div>
            <div class="detail-bottom-tab-pane" id="detail-tab-desc" role="tabpanel">
              <div class="detail-desc-box">
                <h3>Mô tả chi tiết sản phẩm</h3>
                <p>${product.description || "Thông tin giới thiệu đang được cập nhật."}</p>
                <div class="detail-desc-use-cases">
                  <p><i class="fa-solid fa-bullseye" style="color: var(--primary-red);"></i> <strong>Phù hợp với nhu cầu:</strong> ${productUseCase}</p>
                  <p><i class="fa-solid fa-hard-drive" style="color: var(--primary-red);"></i> <strong>Gợi ý dung lượng ${product.storageOption || ""}:</strong> ${storageGuidance}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      // Cập nhật tổng tiền khi chọn bảo hành
      const warrantySelect = document.getElementById("warranty-plan");
      const selectedTotal = document.getElementById("detail-selected-total");
      const updateSelectedTotal = () => {
        const plan = productWarrantyPlans.find((item) => item.id === warrantySelect.value);
        selectedTotal.textContent = fmt(product.price + (plan?.price ?? 0));
      };
      warrantySelect?.addEventListener("change", updateSelectedTotal);
      updateSelectedTotal();

      // Sự kiện chuyển giữa 2 tab bên dưới sản phẩm
      detailContainer.querySelectorAll(".detail-bottom-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          detailContainer.querySelectorAll(".detail-bottom-tab-btn").forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
          });
          detailContainer.querySelectorAll(".detail-bottom-tab-pane").forEach((p) => {
            p.classList.remove("active");
            p.style.display = "none";
          });
          btn.classList.add("active");
          btn.setAttribute("aria-selected", "true");
          const targetPane = detailContainer.querySelector(`#detail-tab-${btn.dataset.tab}`);
          if (targetPane) {
            targetPane.classList.add("active");
            targetPane.style.display = "block";
          }
        });
      });

      renderRelatedProducts(product);
      startCountdownTimer(product);
      if (typeof window.bindAuthGateControls === "function") {
        window.bindAuthGateControls();
      }
    } else {
      detailContainer.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h2>❌ Không tìm thấy sản phẩm!</h2>
          <a href="detail.html" style="color: var(--primary-red); font-weight: bold; text-decoration: underline;">Quay về danh sách sản phẩm</a>
        </div>
      `;
    }
  }
  window.renderDetailPage = renderDetailPage;

  // 4. Chọn phiên bản dung lượng
  window.selectProductVariant = function (variantId) {
    if (typeof productsData === "undefined") return;
    const variant = productsData.find((item) => item.id === variantId);
    if (!variant) return;

    const query = new URLSearchParams(window.location.search);
    query.set("id", variant.id);
    window.history.pushState({}, "", `${window.location.pathname}?${query.toString()}`);
    renderDetailPage();
    document.getElementById("detail-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 5. Render Sản phẩm tương tự
  function renderRelatedProducts(currentProduct) {
    const relatedList = document.getElementById("related-product-list");
    const badgeFilterContainer = document.getElementById("related-badge-filters");
    if (!relatedList || !badgeFilterContainer || typeof productsData === "undefined") return;

    const renderFiltered = () => {
      const filtered = productsData.filter((p) => {
        if (p.id === currentProduct.id) return false;
        if (activeRelatedBadgeFilter === "all") return true;
        if (activeRelatedBadgeFilter === "Sale") return p.badge?.startsWith("Sale") ?? false;
        return p.badge === activeRelatedBadgeFilter;
      });

      relatedList.innerHTML = filtered.length
        ? filtered.map(window.renderCard).join("")
        : `<p class="empty-state">Chưa có sản phẩm phù hợp với nhãn này.</p>`;
    };

    if (!badgeFilterContainer.dataset.bound) {
      badgeFilterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".badge-filter-btn");
        if (!btn) return;
        activeRelatedBadgeFilter = btn.dataset.badge;
        badgeFilterContainer
          .querySelectorAll(".badge-filter-btn")
          .forEach((item) => item.classList.toggle("active", item === btn));
        const selected = productsData.find(
          (item) => item.id === new URLSearchParams(window.location.search).get("id"),
        );
        if (selected) renderRelatedProducts(selected);
      });
      badgeFilterContainer.dataset.bound = "true";
    }

    badgeFilterContainer.querySelectorAll(".badge-filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.badge === activeRelatedBadgeFilter);
    });
    renderFiltered();
  }

  // 6. Đếm ngược Flash Sale cho sản phẩm chi tiết
  function startCountdownTimer(product) {
    const bannerContainer = document.getElementById("dynamic-sale-banner");
    if (!bannerContainer) return;

    if (window.currentSaleInterval) clearInterval(window.currentSaleInterval);

    const updateTimer = () => {
      const now = new Date();
      const parts = typeof window.getVietnamTimeParts === "function"
        ? window.getVietnamTimeParts(now)
        : { day: now.getDay(), hour: now.getHours(), date: now.getDate(), month: now.getMonth() };
      const currentDay = parts.day;
      const currentHour = parts.hour;
      const currentDate = parts.date;
      const currentMonth = parts.month + 1;

      const makeTarget = typeof window.makeVietnamTarget === "function"
        ? window.makeVietnamTarget
        : (d, add, h) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add, h);

      let isSaleActive = false;
      let target = new Date(now);

      const getNextTargetDay = (validDays, targetHour) => {
        let daysToAdd = 1;
        while (!validDays.includes((currentDay + daysToAdd) % 7)) daysToAdd++;
        return makeTarget(now, daysToAdd, targetHour);
      };

      if (product.category === "mac") {
        if (currentHour === 17) {
          isSaleActive = true;
          target = makeTarget(now, 0, 18);
        } else {
          isSaleActive = false;
          target = currentHour < 17 ? makeTarget(now, 0, 17) : getNextTargetDay([0, 1, 2, 3, 4, 5, 6], 17);
        }
      } else if (product.category === "iphone-15") {
        const validDays = [1, 3, 5];
        if (validDays.includes(currentDay) && currentHour === 15) {
          isSaleActive = true;
          target = makeTarget(now, 0, 16);
        } else {
          isSaleActive = false;
          target = validDays.includes(currentDay) && currentHour < 15
            ? makeTarget(now, 0, 15)
            : getNextTargetDay(validDays, 15);
        }
      } else if (product.category === "iphone-16" || product.category === "iphone-17") {
        const validDays = [2, 4, 6];
        if (validDays.includes(currentDay)) {
          isSaleActive = true;
          target = makeTarget(now, 1, 0);
        } else {
          isSaleActive = false;
          target = getNextTargetDay(validDays, 0);
        }
      } else if (product.category === "iphone-18") {
        const validDays = [0, 6];
        if (validDays.includes(currentDay)) {
          isSaleActive = true;
          target = makeTarget(now, 1, 0);
        } else {
          isSaleActive = false;
          target = getNextTargetDay(validDays, 0);
        }
      }

      const isSpecialDay =
        (currentDate === 1 && currentMonth === 1) ||
        (currentDate === 30 && currentMonth === 4) ||
        (currentDate === 11 && currentMonth === 11);

      if (isSpecialDay && product.category !== "mac") {
        isSaleActive = true;
        target = makeTarget(now, 1, 0);
      }

      const diff = Math.max(0, target - now);
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
      const timeString = `${h}:${m}:${s}`;

      if (isSaleActive) {
        bannerContainer.innerHTML = `
          <div class="flash-sale-banner" style="background: linear-gradient(135deg, #ee4d2d, #ff7337); color: #fff; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div><i class="fa-solid fa-bolt"></i> <strong>ĐANG TRONG KHUNG GIỜ GIẢM GIÁ!</strong></div>
            <div style="font-weight: bold; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 5px; color: #fff;">Kết thúc sau: <span>${timeString}</span></div>
          </div>
        `;
      } else {
        bannerContainer.innerHTML = `
          <div class="flash-sale-banner" style="background: #2c3e50; color: #fff; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div><i class="fa-regular fa-clock"></i> <strong>FLASH SALE SẼ TRỞ LẠI SAU</strong></div>
            <div style="font-weight: bold; color: #ffd700;">Đếm ngược: <span>${timeString}</span></div>
          </div>
        `;
      }
    };

    updateTimer();
    window.currentSaleInterval = setInterval(updateTimer, 1000);
  }

  // Khởi chạy khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    // Chỉ kích hoạt nếu ở trang detail.html
    if (!document.getElementById("detail-container") && !document.getElementById("dashboard")) {
      return;
    }

    initCatalogFilters();
    renderDetailPage();
    handleBannerSeriesFilter();
    sortCatalogProducts();
  });

  window.addEventListener("popstate", () => {
    renderDetailPage();
    handleBannerSeriesFilter();
  });
})();
