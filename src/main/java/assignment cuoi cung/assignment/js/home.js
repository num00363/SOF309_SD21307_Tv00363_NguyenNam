// ================= MODULE TRANG CHỦ (HOME.JS) =================
// Quản lý Hero Banner Slider, Wide Banner Slider, Khung giờ Flash Sale,
// Spotlight Carousel, Top giá rẻ, Danh sách iPhone 15-18 & Mac Mini, Xem trước giỏ hàng

(() => {
  let currentSlide = 0;
  let currentWideSlide = 0;
  let currentSaleCards = [];

  const saleBannerConfigs = [
    [
      "iphone-18",
      "iPhone 18 Series",
      [0, 6],
      0,
      "Cuối tuần",
      "Pro / Pro Max giảm 9% + quà tặng; máy thường giảm 5%.",
    ],
    [
      "iphone-17",
      "iPhone 17 Series",
      [2, 4, 6],
      0,
      "Thứ Ba, Năm, Bảy",
      "Pro / Pro Max giảm 9% + quà tặng; máy thường giảm 5%.",
    ],
    [
      "iphone-16",
      "iPhone 16 Series",
      [2, 4, 6],
      0,
      "Thứ Ba, Năm, Bảy",
      "Pro / Pro Max giảm 9% + quà tặng; máy thường giảm 5%.",
    ],
    [
      "iphone-15",
      "iPhone 15 Series",
      [1, 3, 5],
      15,
      "Thứ Hai, Tư, Sáu lúc 15:00",
      "Pro / Pro Max giảm 9% + quà tặng; máy thường giảm 5%.",
    ],
    [
      "mac",
      "Mac Mini",
      [0, 1, 2, 3, 4, 5, 6],
      17,
      "Hằng ngày lúc 17:00",
      "Mac Mini giảm 10% và tặng thêm 6 tháng bảo hành.",
    ],
  ];

  // 1. Chuyển đổi hiển thị Grid / Stack cho từng series
  window.toggleSeriesView18 = function () {
    const el = document.getElementById("iphone-18-list");
    if (el) {
      el.classList.toggle("view-grid");
      el.classList.toggle("view-stack");
    }
  };
  window.toggleSeriesView17 = function () {
    const el = document.getElementById("iphone-17-list");
    if (el) {
      el.classList.toggle("view-grid");
      el.classList.toggle("view-stack");
    }
  };
  window.toggleSeriesView16 = function () {
    const el = document.getElementById("iphone-16-list");
    if (el) {
      el.classList.toggle("view-grid");
      el.classList.toggle("view-stack");
    }
  };
  window.toggleSeriesView15 = function () {
    const el = document.getElementById("iphone-15-list");
    if (el) {
      el.classList.toggle("view-grid");
      el.classList.toggle("view-stack");
    }
  };

  // 2. Render Hero Slider đầu trang
  function initHeroSlider() {
    const sliderContainer = document.getElementById("slider-container");
    if (!sliderContainer || typeof bannersData === "undefined" || !bannersData.length) return;

    sliderContainer.innerHTML = bannersData
      .map(
        (b, idx) => `
        <div class="slide ${idx === 0 ? "active" : ""}">
          <a href="detail.html?series=${encodeURIComponent(b.category)}" style="display:block; width: 100%; height: 320px; text-decoration: none;">
            <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(b.image) : b.image}" alt="${b.title}" style="width: 100%; height: 320px; object-fit: cover; border-radius: 10px;">
          </a>
        </div>
      `,
      )
      .join("");

    const sliderWrapper = sliderContainer.closest(".hero-slider");
    const prevBtn = sliderWrapper?.querySelector(".prev-btn");
    const nextBtn = sliderWrapper?.querySelector(".next-btn");
    const slides = sliderContainer.querySelectorAll(".slide");

    function showSlide(index) {
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
    }

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % bannersData.length;
        showSlide(currentSlide);
      });
      prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + bannersData.length) % bannersData.length;
        showSlide(currentSlide);
      });

      setInterval(() => {
        currentSlide = (currentSlide + 1) % bannersData.length;
        showSlide(currentSlide);
      }, 4000);
    }
  }

  // 3. Render Wide Banner Slider
  function initWideBannerSlider() {
    const wideBannerSlider = document.getElementById("wide-banner-slider");
    const wideBannerDots = document.getElementById("wide-banner-dots");
    if (!wideBannerSlider || typeof bannersData === "undefined" || !bannersData.length) return;

    wideBannerSlider.innerHTML = bannersData
      .map((banner, index) => {
        const category = banner.category ?? "iphone-18";
        if (banner.wideBanner) {
          return `
            <a class="wide-banner-slide wide-banner-slide-custom wide-banner-slide-${category}" href="detail.html?series=${category}" aria-label="Khám phá ${banner.wideBanner.heading}">
              <img class="wide-banner-artwork" src="${typeof window.formatImagePath === "function" ? window.formatImagePath(banner.wideBanner.image) : banner.wideBanner.image}" alt="" aria-hidden="true" />
              <div class="wide-banner-content">
                <p class="wide-banner-eyebrow">${banner.wideBanner.eyebrow}</p>
                <h2>${banner.wideBanner.heading}</h2>
                <p class="wide-banner-description">${banner.wideBanner.description}</p>
                <span class="wide-banner-cta"><i class="fa-brands fa-apple" aria-hidden="true"></i> Khám phá sản phẩm <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
              </div>
            </a>
          `;
        }
        return `
          <a class="wide-banner-slide ${index === 0 ? "active" : ""}" href="detail.html?series=${category}" aria-label="Khám phá ${banner.title}">
            <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(banner.image) : banner.image}" alt="${banner.title}" />
          </a>
        `;
      })
      .join("");

    if (wideBannerDots) {
      wideBannerDots.innerHTML = bannersData
        .map(
          (_, index) =>
            `<button type="button" class="wide-banner-dot ${index === 0 ? "active" : ""}" aria-label="Hiện banner ${index + 1}" data-slide="${index}"></button>`,
        )
        .join("");
    }

    const wideSlides = wideBannerSlider.querySelectorAll(".wide-banner-slide");
    const wideDots = wideBannerDots?.querySelectorAll(".wide-banner-dot") ?? [];
    const prevBtn = document.querySelector(".wide-banner-prev");
    const nextBtn = document.querySelector(".wide-banner-next");

    const showWideBanner = (index) => {
      currentWideSlide = (index + wideSlides.length) % wideSlides.length;
      wideSlides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentWideSlide);
      });
      wideDots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentWideSlide);
      });
    };

    prevBtn?.addEventListener("click", () => showWideBanner(currentWideSlide - 1));
    nextBtn?.addEventListener("click", () => showWideBanner(currentWideSlide + 1));
    wideDots.forEach((dot) => {
      dot.addEventListener("click", () => showWideBanner(Number(dot.dataset.slide)));
    });

    setInterval(() => showWideBanner(currentWideSlide + 1), 5000);
  }

  // 4. Xem trước giỏ hàng (Home Cart Preview) hoặc Khung giờ Sale
  function renderHomeCartPreview() {
    const preview = document.getElementById("home-cart-preview");
    const track = document.getElementById("home-cart-preview-track");
    const title = document.getElementById("home-cart-preview-title");
    const description = document.getElementById("home-cart-preview-description");
    if (!preview || !track || !title || !description) return;

    const user = typeof window.checkAuthSession === "function" ? window.checkAuthSession() : null;
    const cartSignature = user ? (localStorage.getItem("istore_cart") ?? "[]") : "";
    const saleSignature = currentSaleCards
      .map((sale) => `${sale.category}:${sale.isSaleActive}:${sale.schedule}:${sale.benefits}`)
      .join("|");
    const catalogPriceSignature = user && typeof productsData !== "undefined"
      ? productsData.map((product) => `${product.id}:${product.price}`).join("|")
      : "";
    const signature = user
      ? `cart:${cartSignature}:prices:${catalogPriceSignature}`
      : `sales:${saleSignature}`;
    const mode = user ? "cart" : "sales";

    if (track.dataset.mode !== mode || track.dataset.signature !== signature) {
      track.replaceChildren();
      track.dataset.mode = mode;
      track.dataset.signature = signature;

      if (user) {
        title.textContent = "Giỏ hàng của bạn";
        description.textContent = "Vuốt ngang để xem sản phẩm đã lưu trong giỏ.";
        let cart = [];
        try {
          const savedCart = JSON.parse(cartSignature);
          cart = Array.isArray(savedCart)
            ? savedCart.filter(
                (item) =>
                  item &&
                  typeof item.id === "string" &&
                  Number.isSafeInteger(item.quantity) &&
                  item.quantity > 0,
              )
            : [];
        } catch {
          cart = [];
        }

        if (!cart.length) {
          const empty = document.createElement("p");
          empty.className = "home-cart-empty";
          empty.textContent = "Giỏ hàng đang trống. Hãy khám phá sản phẩm bạn yêu thích.";
          track.append(empty);
        } else {
          cart.forEach((item) => {
            const product = (typeof productsData !== "undefined")
              ? productsData.find((entry) => entry.id === item.id)
              : null;
            if (!product) return;
            const card = document.createElement("article");
            card.className = "home-cart-card";
            const imageLink = document.createElement("a");
            imageLink.href = `detail.html?id=${encodeURIComponent(product.id)}`;
            const image = document.createElement("img");
            image.src = typeof window.formatImagePath === "function" ? window.formatImagePath(product.image) : product.image;
            image.alt = product.name;
            image.loading = "lazy";
            imageLink.append(image);
            const details = document.createElement("div");
            details.className = "home-cart-card-details";
            const name = document.createElement("a");
            name.className = "home-cart-card-name";
            name.href = imageLink.href;
            name.textContent = product.name;
            const price = document.createElement("strong");
            price.textContent = typeof window.formatMoney === "function" ? window.formatMoney(product.price) : `${product.price}đ`;
            const quantity = document.createElement("span");
            quantity.textContent = `Số lượng: ${item.quantity}`;
            const openCart = document.createElement("a");
            openCart.className = "home-cart-card-link";
            openCart.href = "cart.html";
            openCart.textContent = "Mở giỏ hàng";
            details.append(name, price, quantity, openCart);
            card.append(imageLink, details);
            track.append(card);
          });
        }
      } else {
        title.textContent = "Lịch khung giờ ưu đãi";
        description.textContent =
          "Đăng nhập để lưu sản phẩm vào giỏ. Trong lúc đó, xem các đợt sale sắp tới.";
        currentSaleCards.forEach((sale) => {
          const card = document.createElement("article");
          card.className = `sale-strip-card home-sale-strip-card ${sale.isSaleActive ? "is-active" : ""}`;
          card.dataset.category = sale.category;
          const top = document.createElement("div");
          top.className = "sale-strip-card-top";
          const state = document.createElement("span");
          state.className = "sale-strip-state";
          state.textContent = sale.isSaleActive ? "● ĐANG SALE" : "SẮP DIỄN RA";
          const schedule = document.createElement("span");
          schedule.className = "sale-strip-schedule";
          schedule.textContent = sale.schedule;
          top.append(state, schedule);
          const heading = document.createElement("h3");
          heading.textContent = sale.title;
          const benefits = document.createElement("p");
          benefits.className = "sale-strip-benefits";
          benefits.textContent = sale.benefits;
          const bottom = document.createElement("div");
          bottom.className = "sale-strip-card-bottom";
          const countdown = document.createElement("span");
          countdown.textContent = `${sale.isSaleActive ? "Kết thúc sau" : "Bắt đầu sau"} `;
          const timer = document.createElement("strong");
          timer.className = "sale-strip-countdown";
          countdown.append(timer);
          const link = document.createElement("a");
          link.href = `detail.html#${sale.category === "mac" ? "mac-mini" : sale.category}`;
          link.innerHTML = 'Xem sản phẩm <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
          bottom.append(countdown, link);
          card.append(top, heading, benefits, bottom);
          track.append(card);
        });
      }
    }

    if (mode === "sales") {
      const now = new Date();
      currentSaleCards.forEach((sale) => {
        const card = track.querySelector(`[data-category="${sale.category}"]`);
        const timer = card?.querySelector(".sale-strip-countdown");
        if (!timer) return;
        const diff = Math.max(0, sale.target - now.getTime());
        const hours = Math.floor(diff / 3_600_000).toString().padStart(2, "0");
        const minutes = Math.floor((diff / 60_000) % 60).toString().padStart(2, "0");
        const seconds = Math.floor((diff / 1_000) % 60).toString().padStart(2, "0");
        timer.textContent = `${hours}:${minutes}:${seconds}`;
      });
    }
  }
  window.renderHomeCartPreview = renderHomeCartPreview;

  // 5. Cập nhật Banner Lịch Sale & Đếm ngược
  function updateCategoryBanners() {
    const now = new Date();
    const parts = typeof window.getVietnamTimeParts === "function"
      ? window.getVietnamTimeParts(now)
      : {
          year: now.getFullYear(),
          month: now.getMonth(),
          date: now.getDate(),
          day: now.getDay(),
          hour: now.getHours(),
        };

    const currentDay = parts.day;
    const currentHour = parts.hour;
    const currentDate = parts.date;
    const currentMonth = parts.month + 1;
    const isSpecialDay =
      (currentDate === 1 && currentMonth === 1) ||
      (currentDate === 30 && currentMonth === 4) ||
      (currentDate === 11 && currentMonth === 11);

    const makeTarget = typeof window.makeVietnamTarget === "function"
      ? window.makeVietnamTarget
      : (d, add, h) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add, h);

    const getNextTargetDay = (validDays, targetHour) => {
      let daysToAdd = 1;
      while (!validDays.includes((currentDay + daysToAdd) % 7)) {
        daysToAdd++;
      }
      return makeTarget(now, daysToAdd, targetHour);
    };

    const activeSales = [];
    const upcomingSales = [];
    const saleCards = [];

    saleBannerConfigs.forEach(([category, title, validDays, targetHour, schedule, benefits]) => {
      let isSaleActive = false;
      let target;

      if (category === "mac") {
        if (currentHour === 17) {
          isSaleActive = true;
          target = makeTarget(now, 0, 18);
        } else if (currentHour < 17) {
          target = makeTarget(now, 0, 17);
        } else {
          target = getNextTargetDay([0, 1, 2, 3, 4, 5, 6], 17);
        }
      } else if (category === "iphone-15") {
        if (validDays.includes(currentDay) && currentHour === 15) {
          isSaleActive = true;
          target = makeTarget(now, 0, 16);
        } else if (validDays.includes(currentDay) && currentHour < 15) {
          target = makeTarget(now, 0, 15);
        } else {
          target = getNextTargetDay(validDays, 15);
        }
      } else if (category === "iphone-16" || category === "iphone-17") {
        if (validDays.includes(currentDay)) {
          isSaleActive = true;
          target = makeTarget(now, 1, 0);
        } else {
          target = getNextTargetDay(validDays, 0);
        }
      } else if (category === "iphone-18") {
        if (validDays.includes(currentDay)) {
          isSaleActive = true;
          target = makeTarget(now, 1, 0);
        } else {
          target = getNextTargetDay(validDays, 0);
        }
      }

      if (isSpecialDay && category !== "mac") {
        isSaleActive = true;
        target = makeTarget(now, 1, 0);
      }

      if (isSaleActive) {
        activeSales.push({ title, target, category });
      } else {
        upcomingSales.push({ title, target, category });
      }

      saleCards.push({
        category,
        title,
        target,
        schedule: isSpecialDay && category !== "mac" ? "Ngày siêu sale" : schedule,
        benefits:
          isSpecialDay && category !== "mac"
            ? "Pro / Pro Max và máy thường giảm 15% trong ngày đặc biệt."
            : benefits,
        isSaleActive,
      });
    });

    saleCards.sort(
      (a, b) => Number(b.isSaleActive) - Number(a.isSaleActive) || a.target - b.target,
    );
    currentSaleCards = saleCards;
    renderHomeCartPreview();

    // Sale strip track
    const saleStripTrack = document.getElementById("sale-strip-track");
    if (saleStripTrack) {
      const cardsSignature = saleCards
        .map((sale) => `${sale.category}:${sale.isSaleActive}`)
        .join("|");
      if (saleStripTrack.dataset.signature !== cardsSignature) {
        saleStripTrack.innerHTML = saleCards
          .map(
            (sale) => `
              <article class="sale-strip-card ${sale.isSaleActive ? "is-active" : ""}" data-category="${sale.category}">
                <div class="sale-strip-card-top">
                  <span class="sale-strip-state">${sale.isSaleActive ? "● ĐANG SALE" : "SẮP DIỄN RA"}</span>
                  <span class="sale-strip-schedule">${sale.schedule}</span>
                </div>
                <h3>${sale.title}</h3>
                <p class="sale-strip-benefits">${sale.benefits}</p>
                <div class="sale-strip-card-bottom">
                  <span>${sale.isSaleActive ? "Kết thúc sau" : "Bắt đầu sau"} <strong class="sale-strip-countdown"></strong></span>
                  <a href="detail.html?series=${sale.category}">Xem sản phẩm <i class="fa-solid fa-arrow-right"></i></a>
                </div>
              </article>
            `,
          )
          .join("");
        saleStripTrack.dataset.signature = cardsSignature;
      }

      saleCards.forEach((sale) => {
        const card = saleStripTrack.querySelector(`[data-category="${sale.category}"]`);
        const countdown = card?.querySelector(".sale-strip-countdown");
        if (!countdown) return;

        const diff = Math.max(0, sale.target - now.getTime());
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
        const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
        countdown.textContent = `${hours}:${minutes}:${seconds}`;
      });

      const prevBtn = document.getElementById("sale-strip-prev");
      const nextBtn = document.getElementById("sale-strip-next");
      if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.addEventListener("click", () => {
          saleStripTrack.scrollBy({ left: -saleStripTrack.clientWidth * 0.8, behavior: "smooth" });
        });
        prevBtn.dataset.bound = "true";
      }
      if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.addEventListener("click", () => {
          saleStripTrack.scrollBy({ left: saleStripTrack.clientWidth * 0.8, behavior: "smooth" });
        });
        nextBtn.dataset.bound = "true";
      }
    }

    // Home highlight panel
    const homeSaleBanner = document.getElementById("home-sale-highlight");
    if (homeSaleBanner) {
      const activeSalesSig = activeSales.map((s) => s.title).join("|");
      const state = activeSales.length > 0 ? `active:${activeSalesSig}` : "upcoming";
      if (homeSaleBanner.dataset.saleState !== state) {
        if (activeSales.length > 0) {
          const nextEnding = activeSales.reduce((min, s) => (s.target < min.target ? s : min));
          homeSaleBanner.innerHTML = `
            <div class="home-sale-panel is-live">
              <div class="home-sale-copy">
                <p><i class="fa-solid fa-bolt"></i> ƯU ĐÃI ĐANG DIỄN RA</p>
                <h2>Đang trong khung giờ Flash Sale</h2>
                <span>${activeSales.map((s) => s.title).join(" · ")}</span>
              </div>
              <div class="home-sale-countdown">
                <span>Kết thúc đợt sale gần nhất sau</span>
                <strong class="home-sale-timer"></strong>
              </div>
              <a href="detail.html" class="home-sale-link">Mua ngay <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          `;
          homeSaleBanner.dataset.saleTarget = String(nextEnding.target.getTime());
        } else if (upcomingSales.length > 0) {
          const nextSale = upcomingSales.reduce((min, s) => (s.target < min.target ? s : min));
          homeSaleBanner.innerHTML = `
            <div class="home-sale-panel is-upcoming">
              <div class="home-sale-copy">
                <p><i class="fa-regular fa-clock"></i> FLASH SALE SẮP TỚI</p>
                <h2>${nextSale.title}</h2>
                <span>Hãy quay lại đúng khung giờ để xem ưu đãi.</span>
              </div>
              <div class="home-sale-countdown">
                <span>Bắt đầu sau</span>
                <strong class="home-sale-timer"></strong>
              </div>
              <a href="detail.html" class="home-sale-link">Xem sản phẩm <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          `;
          homeSaleBanner.dataset.saleTarget = String(nextSale.target.getTime());
        }
        homeSaleBanner.dataset.saleState = state;
      }

      const homeTimer = homeSaleBanner.querySelector(".home-sale-timer");
      if (homeTimer && homeSaleBanner.dataset.saleTarget) {
        const diff = Math.max(0, Number(homeSaleBanner.dataset.saleTarget) - now.getTime());
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
        const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
        homeTimer.textContent = `${hours}:${minutes}:${seconds}`;
      }
    }
  }

  // 6. Render Danh sách Sản phẩm Trang Chủ (Spotlight, Cheapest, iPhone 15-18, Mac)
  function renderHomeCatalog() {
    if (typeof productsData === "undefined" || !window.renderCard) return;

    // Series lists
    const iphone18List = document.getElementById("iphone-18-list");
    const iphone17List = document.getElementById("iphone-17-list");
    const iphone16List = document.getElementById("iphone-16-list");
    const iphone15List = document.getElementById("iphone-15-list");
    const macList = document.getElementById("mac-list");

    if (iphone18List) {
      iphone18List.innerHTML = productsData
        .filter((p) => p.category === "iphone-18")
        .map(window.renderCard)
        .join("");
    }
    if (iphone17List) {
      iphone17List.innerHTML = productsData
        .filter((p) => p.category === "iphone-17")
        .map(window.renderCard)
        .join("");
    }
    if (iphone16List) {
      iphone16List.innerHTML = productsData
        .filter((p) => p.category === "iphone-16")
        .map(window.renderCard)
        .join("");
    }
    if (iphone15List) {
      iphone15List.innerHTML = productsData
        .filter((p) => p.category === "iphone-15")
        .map(window.renderCard)
        .join("");
    }
    if (macList) {
      macList.innerHTML = productsData
        .filter((p) => p.category === "mac")
        .map(window.renderCard)
        .join("");
    }

    // Spotlight Carousel
    const spotlightProducts = document.getElementById("spotlight-products");
    const spotlightTitle = document.getElementById("spotlight-title");
    const spotlightDesc = document.getElementById("spotlight-description");

    if (spotlightProducts) {
      const saleProducts = productsData.filter((p) => p.badge?.startsWith("Sale"));
      let productSet = [];
      let secTitle = "Sản phẩm đang giảm giá (Flash Sale)";
      let secDesc = "Các sản phẩm thuộc khung giờ ưu đãi hiện tại.";

      if (saleProducts.length > 0) {
        productSet = saleProducts;
      } else {
        const now = new Date();
        const parts = typeof window.getVietnamTimeParts === "function"
          ? window.getVietnamTimeParts(now)
          : { day: now.getDay(), hour: now.getHours() };
        const curDay = parts.day;
        const curHour = parts.hour;
        const makeTarget = typeof window.makeVietnamTarget === "function"
          ? window.makeVietnamTarget
          : (d, add, h) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add, h);

        let nearest = null;
        let minDiff = Infinity;

        saleBannerConfigs.forEach(([cat, catTitle, validDays, targetHour]) => {
          let tDate;
          if (cat === "mac") {
            tDate = curHour < 17 ? makeTarget(now, 0, 17) : makeTarget(now, 1, 17);
          } else if (cat === "iphone-15") {
            if (validDays.includes(curDay) && curHour < 15) {
              tDate = makeTarget(now, 0, 15);
            } else {
              let add = 1;
              while (!validDays.includes((curDay + add) % 7)) add++;
              tDate = makeTarget(now, add, 15);
            }
          } else {
            if (validDays.includes(curDay)) {
              tDate = makeTarget(now, 0, 0);
            } else {
              let add = 1;
              while (!validDays.includes((curDay + add) % 7)) add++;
              tDate = makeTarget(now, add, 0);
            }
          }
          const diff = tDate.getTime() - now.getTime();
          if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nearest = { cat, catTitle, diff };
          }
        });

        if (nearest) {
          const up = productsData.filter((p) => p.category === nearest.cat);
          productSet = up.length > 0 ? up : productsData.slice(0, 6);
          secTitle = `Sản phẩm sắp mở Flash Sale: ${nearest.catTitle}`;
          secDesc = `Sản phẩm thuộc khung giờ ưu đãi gần nhất theo lịch Flash Sale của iStore.`;
        } else {
          productSet = productsData.slice(0, 6);
          secTitle = "Sản phẩm ưu đãi nổi bật";
          secDesc = "Khám phá các dòng máy hot được quan tâm nhiều nhất.";
        }
      }

      if (spotlightTitle) spotlightTitle.textContent = secTitle;
      if (spotlightDesc) spotlightDesc.textContent = secDesc;

      spotlightProducts.innerHTML = productSet.length
        ? productSet.map(window.renderCard).join("")
        : `<p class="empty-state">Hiện chưa có sản phẩm trong khung giờ này.</p>`;

      const prevBtn = document.getElementById("spotlight-prev");
      const nextBtn = document.getElementById("spotlight-next");
      if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.addEventListener("click", () => {
          spotlightProducts.scrollBy({ left: -320, behavior: "smooth" });
        });
        prevBtn.dataset.bound = "true";
      }
      if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.addEventListener("click", () => {
          spotlightProducts.scrollBy({ left: 320, behavior: "smooth" });
        });
        nextBtn.dataset.bound = "true";
      }
    }

    // Cheapest Products (Top 4 giá rẻ)
    const cheapestProducts = document.getElementById("cheapest-products");
    if (cheapestProducts) {
      const cheapest = [...productsData].sort((a, b) => a.price - b.price).slice(0, 4);
      cheapestProducts.innerHTML = cheapest.map(window.renderCard).join("");
    }

    if (typeof window.bindAuthGateControls === "function") {
      window.bindAuthGateControls();
    }
  }

  // Khởi chạy khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    // Chỉ kích hoạt nếu đang ở trang chủ (có hero slider hoặc danh mục trang chủ)
    if (!document.getElementById("slider-container") && !document.getElementById("iphone-18-list")) {
      return;
    }

    initHeroSlider();
    initWideBannerSlider();
    renderHomeCatalog();
    updateCategoryBanners();

    if (!window.categoryBannerInterval) {
      window.categoryBannerInterval = setInterval(updateCategoryBanners, 1000);
    }
  });

  // Xuất ra window để common.js có thể gọi lại sau khi tính giá Sale
  window.renderHomeCatalog = renderHomeCatalog;
})();
