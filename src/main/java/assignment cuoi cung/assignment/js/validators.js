// ================= BỘ KIỂM TRA & TIỆN ÍCH DÙNG CHUNG (VALIDATORS) =================
// Hỗ trợ kiểm tra họ tên, số điện thoại, CCCD, mật khẩu, và ĐỊA CHỈ (kèm hỗ trợ link Google Maps)

(() => {
  const collapse = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();

  // ---------- Họ tên: chỉ chữ cái và dấu cách ----------
  const sanitizeNameInput = (value) =>
    String(value ?? "")
      .replace(/[^\p{L}\p{M}\s]/gu, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 80);

  const normalizeName = (value) => collapse(value).normalize("NFC");

  const validateName = (value) => {
    const name = normalizeName(value);
    if (!name) return "Vui lòng nhập họ và tên.";
    if (name.length < 3) return "Họ tên quá ngắn, vui lòng nhập đầy đủ.";
    if (name.length > 80) return "Họ tên không được vượt quá 80 ký tự.";
    if (/[^\p{L}\p{M} ]/u.test(name))
      return "Họ tên chỉ được dùng chữ cái và dấu cách, không kèm số hoặc ký tự lạ.";
    const words = name.split(" ").filter(Boolean);
    if (words.length < 2) return "Vui lòng nhập cả họ và tên (ít nhất 2 từ).";
    if (words.some((word) => word.length > 25))
      return "Có từ trong họ tên quá dài bất thường, hãy kiểm tra lại.";
    return "";
  };

  // ---------- Số điện thoại: 10 chữ số, đầu số VN ----------
  const sanitizePhoneInput = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);

  const validatePhone = (value) => {
    const phone = String(value ?? "").trim();
    if (!phone) return "Vui lòng nhập số điện thoại.";
    if (!/^0[35789]\d{8}$/.test(phone))
      return "Số điện thoại cần đúng 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.";
    if (/(\d)\1{5,}/.test(phone)) return "Số điện thoại có chuỗi số lặp bất thường.";
    return "";
  };

  // ---------- Nhận diện Link Google Maps ----------
  const isGoogleMapsUrl = (value) => {
    const s = String(value ?? "").trim();
    if (!s) return false;
    return /^(https?:\/\/)?((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|goo\.gl\/maps|maps\.app\.goo\.gl)\b/i.test(
      s,
    );
  };

  // ---------- Địa chỉ: hỗ trợ cả địa chỉ văn bản và link Google Maps ----------
  const sanitizeAddressInput = (value) => {
    const str = String(value ?? "");
    // Nếu khách dán hoặc gõ link Google Maps thì bảo lưu toàn bộ URL (bao gồm :, /, ?, =, &, %, v.v.)
    if (isGoogleMapsUrl(str) || /^https?:\/\//i.test(str)) {
      return str.trim().slice(0, 300);
    }
    return str
      .replace(/[^\p{L}\p{M}\p{N}\s,.\-/#()]/gu, "")
      .replace(/^[\s,.\-/#)]+/, "")
      .replace(/\s{2,}/g, " ")
      .replace(/([,.\-/#])(?:\s*[,.\-/#])+/g, "$1")
      .slice(0, 200);
  };

  const normalizeAddress = (value) => collapse(value).normalize("NFC");

  const validateAddress = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "Vui lòng nhập địa chỉ nhận hàng.";

    // 1. Nếu khách nhập / dán Link Google Maps
    if (/^https?:\/\//i.test(raw) || isGoogleMapsUrl(raw)) {
      if (isGoogleMapsUrl(raw)) {
        return ""; // Link Google Maps hoàn toàn hợp lệ!
      }
      return "Link bản đồ không đúng định dạng Google Maps (hãy dùng maps.app.goo.gl hoặc google.com/maps).";
    }

    // 2. Kiểm tra địa chỉ văn bản chi tiết
    const address = normalizeAddress(raw);
    if (address.length > 200) return "Địa chỉ tối đa 200 ký tự.";
    if (/[^\p{L}\p{M}\p{N} ,.\-/#()]/u.test(address)) {
      return "Địa chỉ chứa ký tự không hợp lệ. Chỉ dùng chữ, số và các dấu , . - / # ( ) (hoặc dán link Google Maps).";
    }
    if (/[,.\-/#]\s*[,.\-/#]/.test(address)) {
      return "Địa chỉ có dấu câu đứng liền nhau bất thường (ví dụ: ',,' hoặc '.-'), vui lòng kiểm tra lại.";
    }
    const punctuationCount = (address.match(/[^\p{L}\p{M}\p{N} ]/gu) || []).length;
    if (punctuationCount > Math.max(6, Math.floor(address.length * 0.15))) {
      return "Địa chỉ có quá nhiều dấu câu so với độ dài câu.";
    }
    if (/(.)\1{4,}/u.test(address)) {
      return "Địa chỉ có ký tự bị lặp lại bất thường nhiều lần liên tiếp.";
    }

    const tokens = address.split(/[\s,]+/).filter(Boolean);
    for (let i = 2; i < tokens.length; i += 1) {
      if (
        tokens[i].toLowerCase() === tokens[i - 1].toLowerCase() &&
        tokens[i].toLowerCase() === tokens[i - 2].toLowerCase()
      ) {
        return `Địa chỉ có từ "${tokens[i]}" bị lặp lại 3 lần liên tiếp.`;
      }
    }
    const wordCounts = new Map();
    tokens.forEach((token) => {
      if (token.length < 2) return;
      const key = token.toLowerCase();
      wordCounts.set(key, (wordCounts.get(key) || 0) + 1);
    });
    for (const [word, count] of wordCounts.entries()) {
      if (count >= 4) {
        return `Địa chỉ có từ "${word}" bị lặp lại quá nhiều lần (${count} lần).`;
      }
    }

    // 3. Báo lỗi chi tiết chính xác phần thông tin bị thiếu
    const letterCount = (address.match(/\p{L}/gu) || []).length;
    const wordTokens = tokens.filter((token) => /\p{L}{2,}/u.test(token));

    if (address.length < 10) {
      return `Địa chỉ quá ngắn (hiện có ${address.length}/10 ký tự tối thiểu). Vui lòng nhập số nhà và tên đường cụ thể.`;
    }
    if (tokens.length < 3) {
      return `Địa chỉ chưa đủ thông tin (cần tối thiểu 3 thành phần: Số nhà/Tên đường, Phường/Xã, Quận/Huyện/Tỉnh).`;
    }
    if (letterCount < 6) {
      return "Địa chỉ cần có ít nhất 6 chữ cái ghi rõ tên đường và địa danh.";
    }
    if (wordTokens.length < 2) {
      return "Địa chỉ cần có ít nhất 2 từ rõ nghĩa (ví dụ: tên đường và tên phường/quận).";
    }

    return "";
  };

  // ---------- CCCD: 12 chữ số ----------
  const sanitizeCccdInput = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 12);

  const validateCccd = (value) => {
    const cccd = String(value ?? "").trim();
    if (!cccd) return "Vui lòng nhập số căn cước công dân.";
    if (!/^\d{12}$/.test(cccd)) return "Số CCCD phải gồm đúng 12 chữ số.";
    if (/^(\d)\1{11}$/.test(cccd)) return "Số CCCD không được gồm một chữ số lặp lại.";
    return "";
  };

  // ---------- Mật khẩu ----------
  const validatePassword = (value) => {
    const password = String(value ?? "");
    if (!password) return "Vui lòng nhập mật khẩu.";
    if (password.length < 8) return "Mật khẩu tối thiểu 8 ký tự.";
    if (password.length > 50) return "Mật khẩu tối đa 50 ký tự.";
    if (!/[A-Z]/.test(password)) return "Mật khẩu cần ít nhất một chữ in hoa.";
    if (!/[a-z]/.test(password)) return "Mật khẩu cần ít nhất một chữ thường.";
    if (!/\d/.test(password)) return "Mật khẩu cần ít nhất một chữ số.";
    return "";
  };

  // ---------- Tiện ích giao diện ----------
  const shake = (input) => {
    input.classList.remove("istore-shake");
    void input.offsetWidth;
    input.classList.add("istore-shake");
    window.setTimeout(() => input.classList.remove("istore-shake"), 500);
  };

  const ensureErrorEl = (input) => {
    let el = input.parentElement.querySelector(`[data-error-for="${input.id}"]`);
    if (!el) {
      el = document.createElement("small");
      el.className = "account-field-error";
      el.dataset.errorFor = input.id;
      el.setAttribute("role", "alert");
      input.insertAdjacentElement("afterend", el);
    }
    return el;
  };

  const guard = (input, sanitize, message, customErrorEl = null) => {
    if (!input) return;
    const errorEl = customErrorEl || ensureErrorEl(input);
    let alertTimer = null;
    let fallbackMessage = "";

    const flash = (text) => {
      errorEl.textContent = text;
      shake(input);
      window.clearTimeout(alertTimer);
      alertTimer = window.setTimeout(() => {
        if (errorEl.textContent === text) {
          errorEl.textContent = fallbackMessage;
        }
      }, 2500);
    };

    input.addEventListener("input", () => {
      const current = input.value;
      const cleaned = sanitize(current);
      if (current !== cleaned) {
        input.value = cleaned;
        flash(message);
      }
    });

    input.addEventListener("paste", (event) => {
      const pasted = (event.clipboardData || window.clipboardData)?.getData("text") || "";
      const cleaned = sanitize(pasted);
      if (pasted !== cleaned) {
        window.setTimeout(() => flash(message), 0);
      }
    });
  };

  const confirmAction = ({ title, message, confirmText = "Đồng ý", cancelText = "Hủy" }) =>
    new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "istore-confirm-overlay";
      overlay.innerHTML = `
        <div class="istore-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="istore-confirm-title">
          <h3 id="istore-confirm-title">${escapeHTML(title)}</h3>
          <p>${escapeHTML(message)}</p>
          <div class="istore-confirm-actions">
            <button type="button" class="istore-btn-cancel">${escapeHTML(cancelText)}</button>
            <button type="button" class="istore-btn-danger">${escapeHTML(confirmText)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const btnCancel = overlay.querySelector(".istore-btn-cancel");
      const btnConfirm = overlay.querySelector(".istore-btn-danger");
      const cleanup = (result) => {
        overlay.classList.add("fade-out");
        window.setTimeout(() => overlay.remove(), 200);
        resolve(result);
      };
      btnCancel.addEventListener("click", () => cleanup(false));
      btnConfirm.addEventListener("click", () => cleanup(true));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(false);
      });
      btnCancel.focus();
    });

  const escapeHTML = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // ---------- Hộp thoại xác nhận có danh sách thông tin (profile.js đang gọi hàm này) ----------
  if (!document.getElementById("istore-validators-style")) {
    const vStyle = document.createElement("style");
    vStyle.id = "istore-validators-style";
    vStyle.textContent = `
      @keyframes istore-shake {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-7px); }
        30% { transform: translateX(6px); }
        45% { transform: translateX(-5px); }
        60% { transform: translateX(4px); }
        75% { transform: translateX(-2px); }
      }
      .istore-shake { animation: istore-shake 0.45s ease-in-out; }
      .profile-info-form input[aria-invalid="true"] {
        border-color: #d70018;
        box-shadow: 0 0 0 3px rgba(215, 0, 24, 0.12);
      }
      .istore-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 4000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(17, 24, 39, 0.55);
      }
      .istore-confirm-card {
        width: min(440px, 100%);
        background: #fff;
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      }
      .istore-confirm-card h3 { font-size: 18px; color: #111827; margin: 0 0 6px; }
      .istore-confirm-intro { font-size: 13.5px; color: #6b7280; margin: 0 0 14px; line-height: 1.5; }
      .istore-confirm-list {
        display: grid;
        gap: 10px;
        padding: 14px;
        margin: 0 0 18px;
        background: #f9fafb;
        border: 1px solid #edf0f4;
        border-radius: 10px;
      }
      .istore-confirm-list dt { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .istore-confirm-list dd { margin: 0; font-size: 14.5px; font-weight: 600; color: #111827; word-break: break-word; }
      .istore-confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }
      .istore-confirm-actions button {
        padding: 9px 18px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #d70018;
      }
      .istore-confirm-cancel { background: #fff; color: #d70018; }
      .istore-confirm-cancel:hover { background: #fff0f2; }
      .istore-confirm-ok { background: #d70018; color: #fff; }
      .istore-confirm-ok:hover { background: #b50014; }
    `;
    document.head.append(vStyle);
  }

  const confirmDialog = ({
    title,
    intro = "",
    rows = [],
    confirmText = "Xác nhận",
    cancelText = "Kiểm tra lại",
  }) =>
    new Promise((resolve) => {
      const previousFocus = document.activeElement;
      const overlay = document.createElement("div");
      overlay.className = "istore-confirm-overlay";
      overlay.innerHTML = `
        <div class="istore-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="istore-confirm-title">
          <h3 id="istore-confirm-title"></h3>
          <p class="istore-confirm-intro"></p>
          <dl class="istore-confirm-list"></dl>
          <div class="istore-confirm-actions">
            <button type="button" class="istore-confirm-cancel"></button>
            <button type="button" class="istore-confirm-ok"></button>
          </div>
        </div>`;
      overlay.querySelector("h3").textContent = title;
      overlay.querySelector(".istore-confirm-intro").textContent = intro;
      const list = overlay.querySelector(".istore-confirm-list");
      rows.forEach(({ label, value }) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value;
        list.append(dt, dd);
      });
      const cancelButton = overlay.querySelector(".istore-confirm-cancel");
      const okButton = overlay.querySelector(".istore-confirm-ok");
      cancelButton.textContent = cancelText;
      okButton.textContent = confirmText;

      const close = (result) => {
        document.removeEventListener("keydown", onKeyDown, true);
        overlay.remove();
        previousFocus?.focus?.();
        resolve(result);
      };
      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(false);
        } else if (event.key === "Tab") {
          event.preventDefault();
          (document.activeElement === okButton ? cancelButton : okButton).focus();
        }
      };
      cancelButton.addEventListener("click", () => close(false));
      okButton.addEventListener("click", () => close(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close(false);
      });
      document.addEventListener("keydown", onKeyDown, true);
      document.body.append(overlay);
      okButton.focus();
    });

  // Xuất API toàn cục
  window.IStoreValidators = {
    normalizeName,
    normalizeAddress,
    confirmDialog,
    validateName,
    validatePhone,
    validateAddress,
    validateCccd,
    validatePassword,
    sanitizeNameInput,
    sanitizePhoneInput,
    sanitizeAddressInput,
    sanitizeCccdInput,
    isGoogleMapsUrl,
    guard,
    shake,
    ensureErrorEl,
    confirmAction,
    escapeHTML,
  };
})();
