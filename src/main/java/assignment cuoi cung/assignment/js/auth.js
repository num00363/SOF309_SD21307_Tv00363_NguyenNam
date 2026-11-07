(() => {
  document.documentElement.setAttribute("data-theme", "light");

  const feedback = document.getElementById("auth-feedback");
  const showFeedback = (message, type = "error") => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `account-feedback is-${type}`;
    feedback.hidden = false;
  };
  // ===== Hiệu ứng lắc + báo đỏ khi người dùng nhập ký tự không hợp lệ =====
  const shakeStyle = document.createElement("style");
  shakeStyle.textContent = `
    @keyframes istore-field-shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-7px); }
      30% { transform: translateX(6px); }
      45% { transform: translateX(-5px); }
      60% { transform: translateX(4px); }
      75% { transform: translateX(-2px); }
    }
    .account-input-wrap.is-shaking { animation: istore-field-shake 0.45s ease-in-out; }
  `;
  document.head.append(shakeStyle);

  const flagInvalidInput = (input, message) => {
    const wrap = input.closest(".account-input-wrap") || input;
    wrap.classList.remove("is-shaking");
    void wrap.offsetWidth;
    wrap.classList.add("is-shaking");
    window.setTimeout(() => wrap.classList.remove("is-shaking"), 500);
    input.setAttribute("aria-invalid", "true");
    const errorEl = input.closest(".account-field")?.querySelector(".account-field-error");
    if (errorEl) errorEl.textContent = message;
    else showFeedback(message);
  };
  // Chặn mọi khoảng trắng: gõ phím cách hoặc dán chuỗi có khoảng trắng đều bị loại và báo đỏ
  const forbidWhitespace = (input, message) => {
    if (!input) return;
    input.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        flagInvalidInput(input, message);
      }
    });
    input.addEventListener("input", () => {
      if (/\s/.test(input.value)) {
        input.value = input.value.replace(/\s+/g, "");
        flagInvalidInput(input, message);
      }
    });
  };

  // Lọc ký tự không hợp lệ ngay khi gõ/dán: ký tự bị loại thì ô lắc và báo đỏ
  const restrictInput = (input, sanitize, message) => {
    if (!input) return;
    input.addEventListener("input", (event) => {
      if (event.isComposing) return;
      const cleaned = sanitize(input.value);
      if (cleaned !== input.value) {
        input.value = cleaned;
        flagInvalidInput(input, message);
      }
    });
  };

  const simpleHash = (str, salt = "istore_salt") => {
    let hash = 0;
    const combined = str + salt;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return "h_" + Math.abs(hash).toString(16).padStart(8, "0");
  };

  const readUsers = () => {
    try {
      let users = JSON.parse(localStorage.getItem("usersDb") || "{}");
      if (!users || typeof users !== "object" || Array.isArray(users)) users = {};
      if (!users["admin@gmail.com"]) {
        users["admin@gmail.com"] = {
          username: "Giáo viên Demo",
          passwordHash: "demo_hash_123456",
          passwordSalt: "istore_salt",
          passwordIterations: 1,
        };
        localStorage.setItem("usersDb", JSON.stringify(users));
      }
      return users;
    } catch (error) {
      console.error("Không đọc được dữ liệu tài khoản demo:", error);
      return {
        "admin@gmail.com": {
          username: "Giáo viên Demo",
          passwordHash: "demo_hash_123456",
          passwordSalt: "istore_salt",
          passwordIterations: 1,
        },
      };
    }
  };

  const hashPassword = async (password, salt, iterations = 100_000) => {
    if (window.crypto?.subtle && window.crypto?.getRandomValues) {
      try {
        const saltBytes = salt
          ? Uint8Array.from(salt.match(/.{1,2}/g), (byte) => Number.parseInt(byte, 16))
          : window.crypto.getRandomValues(new Uint8Array(16));
        const key = await window.crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveBits"],
        );
        const bits = await window.crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
          key,
          256,
        );
        const hash = Array.from(new Uint8Array(bits), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
        return {
          hash,
          salt:
            salt ?? Array.from(saltBytes, (byte) => byte.toString(16).padStart(2, "0")).join(""),
          iterations,
        };
      } catch (err) {
        console.warn("Subtle crypto fallback to simple hash:", err);
      }
    }
    const usedSalt = salt ?? "istore_salt";
    return {
      hash: simpleHash(password, usedSalt),
      salt: usedSalt,
      iterations: 1,
    };
  };

  const safeReturnTarget = () => {
    const requested = new URLSearchParams(window.location.search).get("return");
    if (!requested) return "index.html";
    const allowedPages = ["index.html", "detail.html", "cart.html", "checkout.html", "guide.html"];
    const pageName = requested.split("?")[0].split("#")[0].split("/").pop();
    if (allowedPages.includes(pageName)) {
      return requested;
    }
    return "index.html";
  };
  const startSession = (email, username, extra = {}) => {
    localStorage.setItem("istore_user", JSON.stringify({ email, username, ...extra }));
    localStorage.setItem("istore_login_time", Date.now().toString());
    const remember = document.getElementById("remember-me")?.checked ?? false;
    localStorage.setItem("istore_remember", String(remember));
  };
  const redirectAfterLogin = (message) => {
    showFeedback(message, "success");
    window.setTimeout(() => {
      window.location.assign(safeReturnTarget());
    }, 600);
  };

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const password = document.getElementById(button.dataset.passwordToggle);
      if (!password) return;
      const showPassword = password.type === "password";
      password.type = showPassword ? "text" : "password";
      button.setAttribute("aria-label", showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu");
      button.querySelector("i").className = showPassword
        ? "fa-regular fa-eye-slash"
        : "fa-regular fa-eye";
    });
  });

  const registerForm = document.getElementById("register-form");
  const registrationFields = [
    {
      input: document.getElementById("fullname"),
      error: document.getElementById("fullname-error"),
      // Tự bỏ khoảng trắng 2 đầu và gộp khoảng trắng thừa ở giữa khi nhập xong
      normalize: (value) => value.trim().replace(/\s+/g, " "),
      validate: (value) => {
        const name = value.trim().replace(/\s+/g, " ");
        return /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)+$/u.test(name) &&
          name.length <= 80 &&
          !/(.)\1{3,}/u.test(name)
          ? ""
          : "Nhập họ tên đầy đủ (ít nhất 2 từ, tối đa 80 ký tự), chỉ gồm chữ cái và dấu cách.";
      },
    },
    {
      input: document.getElementById("reg-phone"),
      error: document.getElementById("reg-phone-error"),
      validate: (value) =>
        /^0[35789]\d{8}$/.test(value) && !/(\d)\1{5,}/.test(value)
          ? ""
          : "Nhập số di động Việt Nam hợp lệ gồm 10 chữ số; không dùng chuỗi số lặp bất thường.",
    },
    {
      input: document.getElementById("reg-email"),
      error: document.getElementById("reg-email-error"),
      normalize: (value) => value.trim().toLowerCase(),
      validate: (value) => {
        const email = value.trim().toLowerCase();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? ""
          : "Vui lòng nhập địa chỉ email hợp lệ (ví dụ: tenban@gmail.com).";
      },
    },
    {
      input: document.getElementById("reg-password"),
      error: document.getElementById("reg-password-error"),
      validate: (value) => {
        if (/\s/.test(value)) return "Mật khẩu không được chứa khoảng trắng.";
        return value.length >= 6 && value.length <= 128
          ? ""
          : "Mật khẩu phải có tối thiểu 6 ký tự.";
      },
    },
    {
      input: document.getElementById("reg-password-confirm"),
      error: document.getElementById("reg-password-confirm-error"),
      validate: (value) => {
        if (/\s/.test(value)) return "Mật khẩu không được chứa khoảng trắng.";
        return value && value === document.getElementById("reg-password").value
          ? ""
          : "Mật khẩu nhập lại chưa khớp.";
      },
    },
  ];
  const validateRegistrationField = ({ input, error, validate }) => {
    if (!input || !error) return "";
    const message = validate(input.value);
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return message;
  };

  registrationFields.forEach((field) => {
    field.input?.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") {
        validateRegistrationField(field);
      }
      if (field.input.id === "reg-password") {
        const confirmation = registrationFields[4];
        if (confirmation.input.value) validateRegistrationField(confirmation);
      }
    });
    field.input?.addEventListener("blur", () => {
      if (field.normalize && field.input) field.input.value = field.normalize(field.input.value);
      validateRegistrationField(field);
    });
  });

  // Họ tên: không cho phép bắt đầu bằng khoảng trắng
  [registrationFields[0]].forEach((field) => {
    field.input?.addEventListener("input", () => {
      if (/^\s/.test(field.input.value)) {
        field.input.value = field.input.value.replace(/^\s+/, "");
        field.error.textContent = "Không được bắt đầu bằng khoảng trắng.";
        field.input.setAttribute("aria-invalid", "true");
      }
    });
  });

  // Email và mật khẩu tuyệt đối không có khoảng trắng
  forbidWhitespace(document.getElementById("reg-email"), "Email không được chứa khoảng trắng.");
  forbidWhitespace(
    document.getElementById("reg-password"),
    "Mật khẩu không được chứa khoảng trắng.",
  );
  forbidWhitespace(
    document.getElementById("reg-password-confirm"),
    "Mật khẩu không được chứa khoảng trắng.",
  );
  forbidWhitespace(document.getElementById("login-email"), "Email không được chứa khoảng trắng.");

  // Họ tên chỉ chữ cái + dấu cách; số điện thoại chỉ chữ số
  restrictInput(
    document.getElementById("fullname"),
    (value) =>
      value
        .replace(/[^\p{L}\p{M}\s]/gu, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " "),
    "Họ tên chỉ gồm chữ cái, các từ cách nhau một dấu cách.",
  );
  restrictInput(
    document.getElementById("reg-phone"),
    (value) => value.replace(/\D/g, "").slice(0, 10),
    "Số điện thoại chỉ gồm chữ số (tối đa 10 số).",
  );

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    let firstInvalid;
    let hasValidationErrors = false;
    registrationFields.forEach((field) => {
      if (validateRegistrationField(field)) {
        hasValidationErrors = true;
        firstInvalid ??= field.input;
      }
    });
    if (hasValidationErrors) {
      showFeedback("Vui lòng sửa các mục được đánh dấu đỏ rồi thử lại.");
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const name = document.getElementById("fullname").value.trim().replace(/\s+/g, " ");
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const phone = document.getElementById("reg-phone").value.trim();

    const users = readUsers();
    if (!users) return;
    if (users[email]) {
      showFeedback("Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.");
      return;
    }
    const submit = registerForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const credentials = await hashPassword(password);
      users[email] = {
        username: name,
        phone,
        passwordHash: credentials.hash,
        passwordSalt: credentials.salt,
        passwordIterations: credentials.iterations,
      };
      localStorage.setItem("usersDb", JSON.stringify(users));
      showFeedback("Tạo tài khoản thành công. Chuyển đến trang đăng nhập...", "success");
      window.setTimeout(() => {
        window.location.assign(`login.html?return=${encodeURIComponent(safeReturnTarget())}`);
      }, 900);
    } catch (error) {
      console.error("Không tạo được tài khoản demo:", error);
      showFeedback(error.message || "Không thể tạo tài khoản. Vui lòng thử lại.");
    } finally {
      submit.disabled = false;
    }
  });

  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      showFeedback("Vui lòng nhập email hợp lệ và mật khẩu.");
      return;
    }

    const users = readUsers();
    if (!users) return;
    const user = users[email];
    if (!user) {
      showFeedback("Không tìm thấy tài khoản này. Kiểm tra email hoặc tạo tài khoản mới.");
      return;
    }

    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      let passwordMatches = false;
      if (email === "admin@gmail.com" && password === "123456") {
        passwordMatches = true;
      } else if (user.passwordHash === "demo_hash_123456" && password === "123456") {
        passwordMatches = true;
      } else if (user.passwordHash && user.passwordHash.startsWith("h_")) {
        passwordMatches =
          user.passwordHash === simpleHash(password, user.passwordSalt || "istore_salt");
      } else if (user.passwordHash && user.passwordSalt) {
        // Sửa đoạn này:
        const iterations =
          Number.isSafeInteger(user.passwordIterations) &&
          user.passwordIterations >= 100_000 && // Sửa 120_000 thành 100_000
          user.passwordIterations <= 1_000_000
            ? user.passwordIterations
            : 100_000; // Sửa 120_000 thành 100_000
        const hashedAttempt = await hashPassword(password, user.passwordSalt, iterations);
        passwordMatches = hashedAttempt.hash === user.passwordHash;
      } else if (typeof user.password === "string") {
        passwordMatches = user.password === password;
      }
      if (!passwordMatches) {
        showFeedback("Mật khẩu chưa chính xác. Vui lòng thử lại.");
        return;
      }
      startSession(email, user.username || email.split("@")[0], {
        phone: user.phone || "",
        address: user.address || "",
      });
      redirectAfterLogin("Đăng nhập thành công. Đang mở trang của bạn...");
    } catch (error) {
      console.error("Không đăng nhập được tài khoản demo:", error);
      showFeedback(error.message || "Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      submit.disabled = false;
    }
  });
})();
