// ================= MODULE TRANG HỒ SƠ CÁ NHÂN (PROFILE.JS) =================
// Quản lý thông tin tài khoản, chọn linh vật đại diện Mascot, thống kê chi tiêu & điểm thưởng,
// Lịch sử sản phẩm đã mua, xác thực form chỉnh sửa với IStoreValidators & Hộp thoại xác nhận

(() => {
  const formatMoney = (amount) =>
    typeof window.formatMoney === "function"
      ? window.formatMoney(amount)
      : `${Number(amount).toLocaleString("vi-VN")}đ`;

  function renderProfilePage() {
    const profileWrapper = document.getElementById("profile-wrapper");
    const profileGate = document.getElementById("profile-gate");
    if (!profileWrapper && !profileGate) return;

    const user = typeof window.checkAuthSession === "function" ? window.checkAuthSession() : null;
    if (!user) {
      if (profileGate) profileGate.hidden = false;
      if (profileWrapper) profileWrapper.hidden = true;
      return;
    }

    if (profileGate) profileGate.hidden = true;
    if (profileWrapper) profileWrapper.hidden = false;

    const userEmail = user.email || "khachhang@istore.com";
    const userName = user.username || user.name || userEmail.split("@")[0].toUpperCase();

    // 1. Render Linh vật Mascot ở Hero Card & Sidebar
    const activeMascot =
      typeof window.getActiveMascotKey === "function" ? window.getActiveMascotKey() : "astro-bot";
    const mascotBigEl = document.getElementById("profile-mascot-avatar");
    const mascotInitialEl = document.getElementById("user-avatar-initial");
    if (mascotBigEl && typeof window.getMascotSvg === "function") {
      mascotBigEl.innerHTML = window.getMascotSvg(activeMascot, 84);
    }
    if (mascotInitialEl && typeof window.getMascotSvg === "function") {
      mascotInitialEl.innerHTML = window.getMascotSvg(activeMascot, 64);
    }

    // 2. Danh sách chọn Linh vật Mascot
    const mascotListEl = document.getElementById("mascot-options-list");
    if (mascotListEl && !mascotListEl.dataset.bound && typeof window.MASCOT_PRESETS === "object") {
      mascotListEl.innerHTML = Object.entries(window.MASCOT_PRESETS)
        .map(
          ([key, data]) => `
          <button type="button" class="mascot-option-btn ${key === activeMascot ? "active" : ""}" data-mascot="${key}" title="${data.name} - ${data.title}">
            ${data.svg(36)}
          </button>
        `,
        )
        .join("");

      mascotListEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".mascot-option-btn");
        if (!btn) return;
        const chosenKey = btn.dataset.mascot;
        if (!chosenKey || !window.MASCOT_PRESETS[chosenKey]) return;

        localStorage.setItem("istore_mascot", chosenKey);
        mascotListEl.querySelectorAll(".mascot-option-btn").forEach((b) => {
          b.classList.toggle("active", b.dataset.mascot === chosenKey);
        });

        if (mascotBigEl && typeof window.getMascotSvg === "function") {
          mascotBigEl.innerHTML = window.getMascotSvg(chosenKey, 84);
        }
        if (mascotInitialEl && typeof window.getMascotSvg === "function") {
          mascotInitialEl.innerHTML = window.getMascotSvg(chosenKey, 64);
        }
        if (typeof window.renderHeaderAuth === "function") {
          window.renderHeaderAuth();
        }
        if (typeof window.showToast === "function") {
          window.showToast(
            `Đã đổi linh vật đại diện thành "${window.MASCOT_PRESETS[chosenKey].name}"!`,
            "success",
          );
        }
      });
      mascotListEl.dataset.bound = "true";
    }

    // 3. Thông tin Hero & Sidebar
    const heroNameEl = document.getElementById("profile-hero-name");
    const heroEmailEl = document.getElementById("profile-hero-email");
    if (heroNameEl) heroNameEl.textContent = userName;
    if (heroEmailEl) heroEmailEl.textContent = userEmail;

    const nameEl = document.getElementById("profile-display-name");
    const emailEl = document.getElementById("profile-display-email");
    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;

    // 4. Các ô nhập liệu form
    const editName = document.getElementById("edit-name");
    const editEmail = document.getElementById("edit-email");
    const editPhone = document.getElementById("edit-phone");
    const editAddress = document.getElementById("edit-address");
    const infoForm = document.getElementById("profile-edit-form");
    const isEditing = infoForm?.dataset.dirty === "true";

    if (editName && !isEditing) editName.value = user.username || user.name || "";
    if (editEmail) editEmail.value = userEmail;

    let savedRecord = {};
    try {
      savedRecord =
        JSON.parse(localStorage.getItem("usersDb") || "{}")[userEmail.toLowerCase()] || {};
    } catch {
      savedRecord = {};
    }

    let lastOrder = null;
    try {
      const savedOrders = JSON.parse(localStorage.getItem(`istore_orders_${userEmail}`) || "[]");
      lastOrder = Array.isArray(savedOrders) ? savedOrders[0] : null;
    } catch {
      lastOrder = null;
    }

    const savedPhone = user.phone || savedRecord.phone || lastOrder?.customerPhone || "";
    const savedAddress = user.address || savedRecord.address || lastOrder?.customerAddress || "";

    if (editPhone && !isEditing) editPhone.value = savedPhone;
    if (editAddress && !isEditing) editAddress.value = savedAddress;

    // 5. Đọc danh sách đơn hàng & Sản phẩm đã mua
    const storageKey = `istore_orders_${userEmail}`;
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      orders = [];
    }

    // Nạp sẵn đơn hàng mẫu cho tài khoản test nếu chưa có đơn nào
    if (orders.length === 0 && (userEmail === "admin@gmail.com" || userEmail.includes("admin"))) {
      orders = [
        {
          id: "IST-892415",
          date: "14:30 - 18/10/2026",
          customerName: userName,
          customerPhone: user.phone || "0912.345.678",
          customerAddress: user.address || "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
          status: "Giao hàng thành công",
          total: 41990000,
          items: [
            {
              id: "ip-18-pm-256",
              name: "iPhone 18 Pro Max 256GB",
              image: "../image/18 pro max.webp",
              price: 36990000,
              quantity: 1,
              warrantyName: "Bảo hành 1 đổi 1 VIP (12 tháng)",
            },
            {
              id: "mac-mini-m4-16",
              name: "Mac Mini M4 (16GB RAM / 256GB SSD)",
              image: "../image/macminim4.jpg",
              price: 5000000,
              quantity: 1,
              warrantyName: "Bảo hành tiêu chuẩn Apple",
            },
          ],
        },
      ];
      localStorage.setItem(storageKey, JSON.stringify(orders));
    }

    // 6. Tính toán Thống kê: Số đơn, Tổng chi tiêu, Điểm tích lũy, Yêu thích
    const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
    const points = Math.floor(totalSpent / 10000);
    const favCount = typeof window.getFavorites === "function" ? window.getFavorites().length : 0;

    const statOrder = document.getElementById("stat-order-count");
    const statSpent = document.getElementById("stat-total-spent");
    const statPoints = document.getElementById("stat-user-points");
    const statFav = document.getElementById("stat-fav-count");

    if (statOrder) statOrder.textContent = orders.length;
    if (statSpent) statSpent.textContent = totalSpent > 0 ? formatMoney(totalSpent) : "0đ";
    if (statPoints) statPoints.textContent = `${points.toLocaleString("vi-VN")} điểm`;
    if (statFav) statFav.textContent = favCount;

    // 7. Bảng danh sách sản phẩm đã mua
    const ordersContainer = document.getElementById("orders-list-container");
    if (ordersContainer) {
      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="empty-favorites-box">
            <i class="fa-solid fa-box-open" style="font-size: 54px; color: #cbd5e1; margin-bottom: 15px;"></i>
            <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 8px;">Bạn chưa có đơn hàng nào</h3>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Hãy dạo một vòng iStore để chọn cho mình những thiết bị công nghệ tuyệt vời nhé.</p>
            <a href="detail.html" class="btn-repurchase" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
              <i class="fa-solid fa-bag-shopping"></i> Khám phá sản phẩm
            </a>
          </div>
        `;
      } else {
        const purchased = new Map();
        orders.forEach((order) => {
          (order.items || []).forEach((item) => {
            const key = `${item.id}|${item.warrantyName || ""}`;
            const qty = Number(item.quantity) || 1;
            const current = purchased.get(key);
            if (current) current.quantity += qty;
            else purchased.set(key, { ...item, quantity: qty });
          });
        });

        const rowsHTML = [...purchased.values()]
          .map((item, index) => {
            const unitPrice = Number(item.price) || 0;
            const matched =
              typeof productsData !== "undefined"
                ? productsData.find((p) => p.id === item.id) ||
                  productsData.find(
                    (p) =>
                      p.name &&
                      item.name &&
                      (item.name.startsWith(p.name) || p.name.startsWith(item.name)),
                  )
                : null;
            const href = matched ? `detail.html?id=${encodeURIComponent(matched.id)}` : "";
            const thumb = `<img src="${item.image || "../image/18 pro max.webp"}" alt="${item.name}" style="width: 70px; border-radius: 8px; border: 1px solid #eee;">`;
            const thumbHTML = href
              ? `<a class="purchase-link" href="${href}" title="Xem chi tiết sản phẩm">${thumb}</a>`
              : thumb;
            const nameHTML = href
              ? `<a class="purchase-link" href="${href}" title="Xem chi tiết sản phẩm">${item.name}</a>`
              : item.name;
            const warrantyHTML = item.warrantyName
              ? `<div class="cart-warranty">${item.warrantyName}</div>`
              : "";

            return `
              <tr>
                <td>${index + 1}</td>
                <td>${thumbHTML}</td>
                <td style="font-weight: 500; text-align: left; line-height: 1.4;">${nameHTML}${warrantyHTML}</td>
                <td style="color: #d70018; font-weight: bold;">${formatMoney(unitPrice)}</td>
                <td>x${item.quantity}</td>
                <td style="color: #d70018; font-weight: bold;">${formatMoney(unitPrice * item.quantity)}</td>
              </tr>
            `;
          })
          .join("");

        ordersContainer.innerHTML = `
          <div class="cart-table-scroll" role="region" aria-label="Danh sách sản phẩm đã mua" tabindex="0">
            <table class="cart-table">
              <thead>
                <tr>
                  <th width="6%">STT</th>
                  <th width="16%">Hình Ảnh</th>
                  <th width="34%">Tên Sản Phẩm</th>
                  <th width="16%">Đơn Giá</th>
                  <th width="12%">Số Lượng</th>
                  <th width="16%">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>${rowsHTML}</tbody>
            </table>
          </div>
          <div class="profile-history-summary">
            Tổng tiền đã mua: <strong>${formatMoney(totalSpent)}</strong>
          </div>
        `;
      }
    }

    // 8. Chuyển đổi Tabs trong Profile
    const tabOrdersBtn = document.getElementById("btn-tab-orders");
    const tabInfoBtn = document.getElementById("btn-tab-info");
    const panelOrders = document.getElementById("panel-orders");
    const panelInfo = document.getElementById("panel-info");

    if (tabOrdersBtn && tabInfoBtn && panelOrders && panelInfo) {
      if (!tabOrdersBtn.dataset.bound) {
        tabOrdersBtn.addEventListener("click", () => {
          tabOrdersBtn.classList.add("active");
          tabInfoBtn.classList.remove("active");
          panelOrders.style.display = "block";
          panelInfo.style.display = "none";
        });
        tabOrdersBtn.dataset.bound = "true";
      }
      if (!tabInfoBtn.dataset.bound) {
        tabInfoBtn.addEventListener("click", () => {
          tabInfoBtn.classList.add("active");
          tabOrdersBtn.classList.remove("active");
          panelOrders.style.display = "none";
          panelInfo.style.display = "block";
        });
        tabInfoBtn.dataset.bound = "true";
      }
    }

    // 9. Xử lý Form Lưu thông tin với IStoreValidators
    const profileForm = document.getElementById("profile-edit-form");
    if (profileForm && !profileForm.dataset.bound) {
      const V = window.IStoreValidators || {
        normalizeName: (s) => (s || "").trim(),
        validateName: () => "",
        sanitizeNameInput: (s) => s,
        validatePhone: () => "",
        sanitizePhoneInput: (s) => s,
        normalizeAddress: (s) => (s || "").trim(),
        validateAddress: () => "",
        sanitizeAddressInput: (s) => s,
        ensureErrorEl: () => null,
        shake: () => {},
        guard: () => {},
        confirmDialog: async () => true,
      };

      if (editName) editName.maxLength = 80;
      if (editAddress) editAddress.maxLength = 300; // đủ chỗ cho link Google Maps

      const fieldDefs = [
        {
          input: editName,
          normalize: V.normalizeName,
          validate: (val) => V.validateName(val),
          sanitize: V.sanitizeNameInput,
          message: "Họ tên chỉ gồm chữ cái, các từ cách nhau một dấu cách.",
        },
        {
          input: editPhone,
          normalize: (val) => val.trim(),
          validate: (val) => (val ? V.validatePhone(val) : ""),
          sanitize: V.sanitizePhoneInput,
          message: "Số điện thoại chỉ gồm chữ số (tối đa 10 số).",
        },
        {
          input: editAddress,
          normalize: V.normalizeAddress,
          validate: (val) => (val ? V.validateAddress(val) : ""),
          sanitize: V.sanitizeAddressInput,
          message: "Địa chỉ cần rõ ràng, có thể dán link Google Maps của bạn.",
        },
      ].filter((f) => f.input);

      fieldDefs.forEach((field) => {
        field.error = V.ensureErrorEl(field.input);
      });

      const runValidation = (field) => {
        const msg = field.validate(field.normalize(field.input.value));
        if (field.error) field.error.textContent = msg;
        field.input.setAttribute("aria-invalid", String(Boolean(msg)));
        return msg;
      };

      profileForm.addEventListener("input", () => {
        profileForm.dataset.dirty = "true";
      });

      fieldDefs.forEach((field) => {
        field.input.addEventListener("input", () => {
          if (field.input.getAttribute("aria-invalid") === "true") runValidation(field);
        });
        field.input.addEventListener("blur", () => {
          field.input.value = field.normalize(field.input.value);
          runValidation(field);
        });
        V.guard(field.input, field.sanitize, field.message, field.error);
      });

      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (profileForm.dataset.saving === "true") return;

        let firstInvalid = null;
        fieldDefs.forEach((field) => {
          field.input.value = field.normalize(field.input.value);
          if (runValidation(field) && !firstInvalid) firstInvalid = field.input;
        });

        if (firstInvalid) {
          V.shake(firstInvalid);
          firstInvalid.focus();
          if (typeof window.showToast === "function") {
            window.showToast("Vui lòng sửa các mục được đánh dấu đỏ trước khi lưu.", "error");
          }
          return;
        }

        const newName = V.normalizeName(editName?.value || "");
        const newPhone = (editPhone?.value || "").trim();
        const newAddress = V.normalizeAddress(editAddress?.value || "");

        const freshUser =
          (typeof window.checkAuthSession === "function" ? window.checkAuthSession() : null) ||
          user;
        const currentName = freshUser.username || freshUser.name || "";
        const currentPhone = freshUser.phone || savedRecord.phone || "";
        const currentAddress = freshUser.address || savedRecord.address || "";

        if (newName === currentName && newPhone === currentPhone && newAddress === currentAddress) {
          profileForm.dataset.dirty = "false";
          if (typeof window.showToast === "function") {
            window.showToast("Chưa có thay đổi nào để lưu.", "info");
          }
          return;
        }

        // Hộp thoại xác nhận trước khi lưu
        profileForm.dataset.saving = "true";
        const confirmed = await V.confirmDialog({
          title: "Xác nhận lưu thông tin?",
          intro:
            "Thông tin này sẽ được dùng để tự điền khi bạn đặt hàng hoặc mua ngay. Vui lòng kiểm tra kỹ trước khi xác nhận.",
          rows: [
            { label: "Họ và tên", value: newName },
            { label: "Số điện thoại", value: newPhone || "Chưa nhập" },
            { label: "Địa chỉ giao hàng", value: newAddress || "Chưa nhập" },
          ],
          confirmText: "Xác nhận lưu",
          cancelText: "Kiểm tra lại",
        });
        profileForm.dataset.saving = "false";
        if (!confirmed) return;

        const updatedUser = {
          ...freshUser,
          username: newName,
          name: newName,
          phone: newPhone,
          address: newAddress,
        };
        localStorage.setItem("istore_user", JSON.stringify(updatedUser));

        try {
          const db = JSON.parse(localStorage.getItem("usersDb") || "{}");
          const key = userEmail.toLowerCase();
          if (db && db[key]) {
            db[key] = { ...db[key], username: newName, phone: newPhone, address: newAddress };
            localStorage.setItem("usersDb", JSON.stringify(db));
          }
        } catch (err) {
          console.warn("Không cập nhật được usersDb:", err);
        }

        if (editName) editName.value = newName;
        if (editAddress) editAddress.value = newAddress;
        profileForm.dataset.dirty = "false";

        if (typeof window.renderHeaderAuth === "function") window.renderHeaderAuth();
        if (nameEl) nameEl.textContent = newName;
        if (heroNameEl) heroNameEl.textContent = newName;

        if (typeof window.showToast === "function") {
          window.showToast("Đã lưu thông tin tài khoản thành công!", "success");
        }
      });
      profileForm.dataset.bound = "true";
    }

    // 10. Nút Đăng xuất trong Profile
    const logoutBtn = document.getElementById("btn-profile-logout");
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.addEventListener("click", () => {
        if (typeof window.logoutUser === "function") {
          window.logoutUser();
        } else {
          localStorage.removeItem("istore_user");
          localStorage.removeItem("istore_login_time");
          localStorage.removeItem("istore_remember");
          window.location.href = "login.html";
        }
      });
      logoutBtn.dataset.bound = "true";
    }
  }
  window.renderProfilePage = renderProfilePage;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("profile-wrapper") || document.getElementById("profile-gate")) {
      renderProfilePage();
    }
  });
})();
