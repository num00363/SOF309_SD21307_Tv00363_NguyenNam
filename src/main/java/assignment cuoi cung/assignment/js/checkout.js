(() => {
  document.documentElement.setAttribute("data-theme", "light");

  const form = document.getElementById("checkout-form");
  const layout = document.getElementById("checkout-layout");
  if (!form || !layout) return;

  const gate = document.getElementById("checkout-gate");
  const success = document.getElementById("checkout-success");
  const itemsContainer = document.getElementById("checkout-order-items");
  const submitButton = form.querySelector('[type="submit"]');
  const money = (amount) => `${Number(amount).toLocaleString("vi-VN")}đ`;

  const hasActiveSession = () => {
    try {
      const user = JSON.parse(localStorage.getItem("istore_user") || "null");
      const loginTime = Number(localStorage.getItem("istore_login_time"));
      const keepSignedIn = localStorage.getItem("istore_remember") === "true";
      const duration = keepSignedIn ? 7 * 24 * 60 * 60 * 1000 : 20 * 60 * 1000;
      if (
        typeof user?.email === "string" &&
        Number.isFinite(loginTime) &&
        loginTime > 0 &&
        loginTime <= Date.now() &&
        Date.now() - loginTime < duration
      ) {
        return true;
      }
      localStorage.removeItem("istore_user");
      localStorage.removeItem("istore_login_time");
      localStorage.removeItem("istore_remember");
      return false;
    } catch (error) {
      console.error("Không thể đọc phiên đăng nhập khi mở checkout:", error);
      return false;
    }
  };

  if (!hasActiveSession()) {
    gate.hidden = false;
    layout.hidden = true;
    const loginLink = document.getElementById("checkout-login-link");
    const loginUrl = `login.html?return=${encodeURIComponent(`checkout.html${window.location.search}`)}`;
    if (loginLink) loginLink.href = loginUrl;
    return;
  }

  const isBuyNow = new URLSearchParams(window.location.search).get("mode") === "buynow";
  let cart = [];

  try {
    if (isBuyNow) {
      cart = JSON.parse(localStorage.getItem("istore_buy_now") || "[]");
    } else {
      // Ưu tiên lấy các sản phẩm đã được tích chọn trong giỏ hàng
      const selectedCart = JSON.parse(localStorage.getItem("istore_checkout_items") || "null");
      if (Array.isArray(selectedCart) && selectedCart.length > 0) {
        cart = selectedCart;
      } else {
        cart = JSON.parse(localStorage.getItem("istore_cart") || "[]");
      }
    }

    cart = Array.isArray(cart)
      ? cart.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 99 &&
            (typeof productsData !== "undefined"
              ? productsData.some((product) => product.id === item.id)
              : true),
        )
      : [];
  } catch (error) {
    console.error("Không thể đọc giỏ hàng cho trang thanh toán:", error);
    cart = [];
  }

  let total = 0;
  if (!cart.length) {
    itemsContainer.innerHTML =
      '<p class="checkout-empty-cart">Chưa có sản phẩm nào được chọn để thanh toán. <a href="cart.html">Quay lại giỏ hàng</a></p>';
    document.getElementById("checkout-item-count").textContent = "Chưa có sản phẩm";
    submitButton.disabled = true;
  } else {
    itemsContainer.replaceChildren();
    cart.forEach((item) => {
      const product =
        typeof productsData !== "undefined"
          ? productsData.find((entry) => entry.id === item.id)
          : null;
      if (!product) return;
      const name = product.name;
      const imageSrc = product.image;
      const productPrice = product.price;
      const warrantyPlan =
        product.warrantyPlans?.find((plan) => plan.id === item.warrantyPlanId) ??
        product.warrantyPlans?.find((plan) => plan.id === "none");
      const warrantyPrice = warrantyPlan?.price ?? 0;
      const lineTotal = (productPrice + warrantyPrice) * item.quantity;
      total += lineTotal;

      const row = document.createElement("article");
      row.className = "checkout-order-item";
      const image = document.createElement("img");
      image.src = typeof window.formatImagePath === "function" ? window.formatImagePath(imageSrc) : imageSrc;
      image.alt = name;
      image.loading = "lazy";
      const details = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = name;
      const quantity = document.createElement("span");
      quantity.textContent = `Số lượng: ${item.quantity}`;
      details.append(title, quantity);
      if (warrantyPlan && warrantyPrice > 0) {
        const warranty = document.createElement("span");
        warranty.textContent = `${warrantyPlan.name}: +${money(warrantyPrice)}`;
        details.append(warranty);
      }
      const price = document.createElement("b");
      price.textContent = money(lineTotal);
      row.append(image, details, price);
      itemsContainer.append(row);
    });
    document.getElementById("checkout-item-count").textContent =
      `${cart.reduce((count, item) => count + item.quantity, 0)} sản phẩm`;
    document.getElementById("checkout-subtotal").textContent = money(total);
    document.getElementById("checkout-total").textContent = money(total);
  }

  const V = window.IStoreValidators;
  const fields = [
    {
      input: document.getElementById("checkout-name"),
      error: document.getElementById("checkout-name-error"),
      validate: (value) => V.validateName(value),
      sanitize: V.sanitizeNameInput,
      message: "Họ tên chỉ gồm chữ cái, các từ cách nhau một dấu cách.",
    },
    {
      input: document.getElementById("checkout-phone"),
      error: document.getElementById("checkout-phone-error"),
      validate: (value) => V.validatePhone(value),
      sanitize: V.sanitizePhoneInput,
      message: "Số điện thoại chỉ gồm chữ số (tối đa 10 số).",
    },
    {
      input: document.getElementById("checkout-address"),
      error: document.getElementById("checkout-address-error"),
      validate: (value) => V.validateAddress(value),
      sanitize: V.sanitizeAddressInput,
      message:
        "Địa chỉ chỉ dùng chữ, số và các dấu , . - / # ( ) hoặc dán link Google Maps.",
    },
  ];

  fields[0].input.maxLength = 80;
  fields[2].input.maxLength = 300;
  const formError = document.getElementById("checkout-form-error");

  // Xử lý xem trước Link Google Maps nếu khách dán link
  const addressInput = fields[2].input;
  const mapPreviewBox = document.getElementById("checkout-map-preview");
  const mapLinkBtn = document.getElementById("checkout-map-link-btn");

  const syncMapLinkPreview = () => {
    const val = addressInput.value.trim();
    if (V.isGoogleMapsUrl(val)) {
      if (mapPreviewBox) mapPreviewBox.classList.add("is-active");
      if (mapLinkBtn) mapLinkBtn.href = val.startsWith("http") ? val : `https://${val}`;
    } else {
      if (mapPreviewBox) mapPreviewBox.classList.remove("is-active");
    }
  };

  addressInput.addEventListener("input", syncMapLinkPreview);
  addressInput.addEventListener("blur", syncMapLinkPreview);

  // Đọc thông tin nhận hàng đã lưu trong hồ sơ tài khoản
  const readSavedProfile = () => {
    try {
      const user = JSON.parse(localStorage.getItem("istore_user") || "null") || {};
      const db = JSON.parse(localStorage.getItem("usersDb") || "{}");
      const record = db?.[String(user.email || "").toLowerCase()] || {};
      return {
        name: user.name || user.username || record.username || "",
        phone: user.phone || record.phone || "",
        address: user.address || record.address || "",
      };
    } catch {
      return { name: "", phone: "", address: "" };
    }
  };

  // Tự điền sẵn họ tên, số điện thoại, địa chỉ cho khách (chỉ điền khi dữ liệu hợp lệ)
  const savedProfile = readSavedProfile();
  [savedProfile.name, savedProfile.phone, savedProfile.address].forEach((value, index) => {
    const field = fields[index];
    if (value && !field.input.value && !field.validate(value)) {
      field.input.value = value;
    }
  });
  syncMapLinkPreview();

  fields.forEach(({ input, error, validate }) => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") {
        const message = validate(input.value);
        error.textContent = message;
        input.setAttribute("aria-invalid", String(Boolean(message)));
      }
    });
  });

  fields.forEach(({ input, error, validate }) => {
    input.addEventListener("blur", () => {
      // Không collapse khoảng trắng nếu là link Google Maps
      if (!V.isGoogleMapsUrl(input.value)) {
        input.value = input.value.trim().replace(/\s+/g, " ");
      }
      const message = validate(input.value);
      error.textContent = message;
      input.setAttribute("aria-invalid", String(Boolean(message)));
    });
  });

  // Lọc ký tự ngay khi gõ/dán
  fields.forEach(({ input, error, sanitize, message }) =>
    V.guard(input, sanitize, message, error),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formError.hidden = true;
    let firstInvalidField;
    let hasErrors = false;

    fields.forEach(({ input, error, validate }) => {
      const message = validate(input.value);
      error.textContent = message;
      input.setAttribute("aria-invalid", String(Boolean(message)));
      if (message) {
        hasErrors = true;
        firstInvalidField ??= input;
      }
    });

    if (!cart.length) {
      formError.textContent = "Không có sản phẩm nào được chọn. Hãy quay lại giỏ hàng và tích chọn sản phẩm.";
      formError.hidden = false;
      return;
    }

    if (hasErrors) {
      formError.textContent =
        "Có thông tin nhận hàng chưa chính xác. Vui lòng kiểm tra mục được đánh dấu đỏ bên dưới.";
      formError.hidden = false;
      firstInvalidField?.focus();
      firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Lưu lịch sử đơn hàng vào LocalStorage cho Profile
    try {
      const activeUser = JSON.parse(localStorage.getItem("istore_user") || "null");
      const userEmail = activeUser?.email || "guest@istore.com";
      const orderId = "IST-" + Date.now().toString().slice(-6);
      const now = new Date();
      const orderDate = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

      const orderItems = cart.map((item) => {
        const prod =
          typeof productsData !== "undefined"
            ? productsData.find((p) => p.id === item.id)
            : null;
        const plan = prod?.warrantyPlans?.find((wp) => wp.id === item.warrantyPlanId);
        return {
          id: item.id,
          name: prod?.name || item.id,
          image: prod?.image || "",
          price: (prod?.price || 0) + (plan?.price || 0),
          quantity: item.quantity,
          warrantyName: plan?.name || "Bảo hành tiêu chuẩn 12 tháng",
        };
      });

      const orderData = {
        id: orderId,
        date: orderDate,
        items: orderItems,
        total: total,
        customerName: fields[0].input.value.trim(),
        customerPhone: fields[1].input.value.trim(),
        customerAddress: fields[2].input.value.trim(),
        status: "Đang xử lý",
      };

      const storageKey = `istore_orders_${userEmail}`;
      const existingOrders = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existingOrders.unshift(orderData);
      localStorage.setItem(storageKey, JSON.stringify(existingOrders));

      // CHỈ XÓA NHỮNG SẢN PHẨM ĐÃ ĐƯỢC MUA KHỎI GIỎ HÀNG
      if (isBuyNow) {
        localStorage.removeItem("istore_buy_now");
      } else {
        const fullCart = JSON.parse(localStorage.getItem("istore_cart") || "[]");
        const remainingCart = fullCart.filter(
          (cartItem) =>
            !cart.some(
              (paidItem) =>
                paidItem.id === cartItem.id &&
                (paidItem.warrantyPlanId ?? "none") === (cartItem.warrantyPlanId ?? "none"),
            ),
        );

        localStorage.setItem("istore_cart", JSON.stringify(remainingCart));
        if (userEmail) {
          localStorage.setItem(
            `istore_cart_${userEmail.toLowerCase().trim()}`,
            JSON.stringify(remainingCart),
          );
        }
        localStorage.removeItem("istore_checkout_items");
      }
    } catch (e) {
      console.warn("Không thể lưu đơn hàng vào lịch sử:", e);
    }

    layout.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
