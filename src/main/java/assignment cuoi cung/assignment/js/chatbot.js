(() => {
  if (typeof productsData === "undefined" || document.getElementById("istore-assistant")) return;

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase();

  const capacityInGb = (storage) => {
    const match = storage?.match(/^([\d.]+)(GB|TB)$/);
    return match ? Number.parseFloat(match[1]) * (match[2] === "TB" ? 1024 : 1) : Infinity;
  };

  const modelsByGroup = new Map();
  productsData.forEach((product) => {
    const group = product.variantGroup ?? product.id;
    const variants = modelsByGroup.get(group) ?? [];
    variants.push(product);
    modelsByGroup.set(group, variants);
  });

  const models = [...modelsByGroup.values()]
    .map((variants) => {
      const sortedVariants = [...variants].sort(
        (first, second) => capacityInGb(first.storageOption) - capacityInGb(second.storageOption),
      );
      const representative =
        sortedVariants.find((product) => product.storageOption === "256GB") ?? sortedVariants[0];
      return {
        title: representative.name.replace(/\s+\d+(?:\.\d+)?\s?(?:GB|TB)\b/i, "").trim(),
        variants: sortedVariants,
        representative,
      };
    })
    .sort((first, second) => second.title.length - first.title.length);

  const assistant = document.createElement("aside");
  assistant.className = "istore-assistant";
  if (document.querySelector(".chatbot-widget")) assistant.classList.add("has-floating-actions");
  assistant.id = "istore-assistant";
  assistant.innerHTML = `
    <section class="assistant-panel" id="assistant-panel" aria-label="Tư vấn nhanh iStore" hidden>
      <header class="assistant-header">
        <div class="assistant-avatar"><i class="fa-solid fa-headset" aria-hidden="true"></i></div>
        <div class="assistant-title">
          <strong>Trợ lý iStore AI</strong>
          <span><i class="assistant-status-dot" aria-hidden="true"></i> So sánh thông minh & Tra cứu sale</span>
        </div>
        <button class="assistant-clear" type="button" aria-label="Xóa nội dung trò chuyện" title="Xóa nội dung trò chuyện"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>
        <button class="assistant-close" type="button" aria-label="Đóng tư vấn"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </header>
      <div class="assistant-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="assistant-prompts-wrap">
        <button class="assistant-prompts-arrow" type="button" data-dir="-1" aria-label="Xem các gợi ý phía trước" title="Trước"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
      <div class="assistant-prompts" aria-label="Câu hỏi gợi ý">
        <button type="button" data-question="So sánh iPhone 17 Pro và iPhone 18 Pro"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> So sánh 2 máy</button>
        <button type="button" data-question="So sánh iPhone 16 Pro, iPhone 17 Pro và iPhone 18 Pro dạng bảng"><i class="fa-solid fa-table-columns" aria-hidden="true"></i> Lập bảng so sánh 3 máy</button>
        <button type="button" data-question="Sản phẩm yêu thích của tôi có sale không?"><i class="fa-solid fa-fire-flame-curved" aria-hidden="true"></i> Kiểm tra sale yêu thích</button>
        <button type="button" data-question="Gợi ý máy dưới 25 triệu"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Gợi ý theo ngân sách</button>
      </div>
        <button class="assistant-prompts-arrow" type="button" data-dir="1" aria-label="Xem thêm gợi ý" title="Tiếp"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
      </div>
      <form class="assistant-form">
        <label class="sr-only" for="assistant-question">Nhập câu hỏi về sản phẩm</label>
        <input id="assistant-question" name="question" maxlength="240" placeholder="So sánh iPhone 17 và 18, kiểm tra sale..." autocomplete="off" required>
        <button type="submit" aria-label="Gửi câu hỏi"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
      </form>
      <p class="assistant-disclaimer"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Trợ lý so sánh tối đa 4 sản phẩm cùng lúc dạng danh sách hoặc bảng cuộn tương tác.</p>
    </section>
    <button class="assistant-launcher" type="button" aria-expanded="false" aria-controls="assistant-panel">
      <i class="fa-regular fa-comments" aria-hidden="true"></i><span>Tư vấn sản phẩm</span>
    </button>
  `;
  document.body.append(assistant);

  // ---------- Giao diện khung chat: nới rộng + mũi tên chuyển gợi ý ----------
  if (!document.getElementById("istore-assistant-layout-style")) {
    const layoutStyle = document.createElement("style");
    layoutStyle.id = "istore-assistant-layout-style";
    layoutStyle.textContent = `
      .istore-assistant { width: min(560px, calc(100vw - 28px)); }
      .istore-assistant .assistant-panel:not([hidden]),
      .istore-assistant.has-floating-actions .assistant-panel:not([hidden]) {
        height: min(700px, calc(100dvh - 300px));
        min-height: 400px;
        max-height: calc(100dvh - 120px);
      }
      @media (max-width: 600px) {
        .istore-assistant { width: calc(100vw - 20px); }
        .istore-assistant .assistant-panel:not([hidden]),
        .istore-assistant.has-floating-actions .assistant-panel:not([hidden]) {
          height: min(640px, calc(100dvh - 260px));
          min-height: 340px;
        }
      }
      .assistant-prompts-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 8px;
        background: #f7f8fb;
      }
      .assistant-prompts-wrap .assistant-prompts {
        flex: 1;
        min-width: 0;
        padding: 10px 2px 8px;
        scroll-behavior: smooth;
        background: transparent;
      }
      .assistant-prompts-arrow {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: 1px solid #d9dfe9;
        border-radius: 50%;
        background: #fff;
        color: #d70018;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(35, 50, 73, 0.1);
        transition: background 0.2s, opacity 0.2s;
      }
      .assistant-prompts-arrow:hover:not(:disabled) { background: #fff0f2; }
      .assistant-prompts-arrow:disabled { opacity: 0.35; cursor: default; box-shadow: none; }
      [data-theme="dark"] .assistant-prompts-wrap { background: #131d31; }
      [data-theme="dark"] .assistant-prompts-arrow { background: #1e293b; border-color: #334155; }
    `;
    document.head.append(layoutStyle);
  }

  const floatingActions = document.querySelector(".chatbot-widget");
  const launcherElement = assistant.querySelector(".assistant-launcher");
  if (floatingActions && launcherElement) floatingActions.append(launcherElement);

  const panel = assistant.querySelector(".assistant-panel");
  const launcher = launcherElement;
  const closeButton = assistant.querySelector(".assistant-close");
  const clearButton = assistant.querySelector(".assistant-clear");
  const messages = assistant.querySelector(".assistant-messages");
  const prompts = assistant.querySelector(".assistant-prompts");
  const form = assistant.querySelector(".assistant-form");
  const promptArrows = assistant.querySelectorAll(".assistant-prompts-arrow");
  const updatePromptArrows = () => {
    const [prevArrow, nextArrow] = promptArrows;
    if (!prevArrow || !nextArrow) return;
    prevArrow.disabled = prompts.scrollLeft <= 2;
    nextArrow.disabled = prompts.scrollLeft + prompts.clientWidth >= prompts.scrollWidth - 2;
  };
  promptArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      const direction = Number(arrow.dataset.dir) || 1;
      prompts.scrollBy({
        left: direction * Math.max(160, prompts.clientWidth * 0.7),
        behavior: "smooth",
      });
    });
  });
  prompts.addEventListener("scroll", updatePromptArrows, { passive: true });
  window.addEventListener("resize", updatePromptArrows);
  const input = assistant.querySelector("#assistant-question");

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "đ";

  // Tìm các model máy được nhắc tới trong câu hỏi (loại trừ model trùng lặp)
  const findMentionedModels = (question) => {
    const normalizedQuestion = normalize(question);
    const matched = models
      .filter((model) => normalizedQuestion.includes(normalize(model.title)))
      .sort(
        (first, second) =>
          normalizedQuestion.indexOf(normalize(first.title)) -
          normalizedQuestion.indexOf(normalize(second.title)),
      );

    return matched.filter(
      (model) =>
        !matched.some(
          (other) =>
            other !== model &&
            normalize(other.title).includes(normalize(model.title)) &&
            other.title.length > model.title.length,
        ),
    );
  };

  const requestedVariant = (model, question) => {
    const normalizedQuestion = normalize(question).replace(/\s/g, "");
    const requestedStorage = ["2tb", "1tb", "512gb", "256gb", "128gb"].find((storage) =>
      normalizedQuestion.includes(storage),
    );
    return (
      model.variants.find((variant) => variant.storageOption === requestedStorage?.toUpperCase()) ??
      model.representative
    );
  };

  const productLinkToken = (product) => `[[product:${product.id}|${product.name}]]`;

  const specsSummary = (product) => {
    const specs = product.specs ?? {};
    return [
      specs.screen && `• Màn hình: ${specs.screen}`,
      specs.chip && `• Chip: ${specs.chip}`,
      specs.ram && `• RAM: ${specs.ram}`,
      specs.storage && `• Bộ nhớ: ${specs.storage}`,
      specs.camera && `• Camera: ${specs.camera}`,
      specs.battery && `• Pin & Sạc: ${specs.battery}`,
      specs.features && `• Tính năng: ${specs.features}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  // ================= SO SÁNH DẠNG 1: DANH SÁCH TỰ ĐỌC =================
  const renderComparisonList = (modelsToCompare, question) => {
    const products = modelsToCompare.map((m) => requestedVariant(m, question));
    let text = `📋 **SO SÁNH CHI TIẾT ${products.length} SẢN PHẨM**:\n\n`;

    products.forEach((p, idx) => {
      text += `**${idx + 1}. ${p.name}**\n`;
      text += `• Giá bán: **${formatPrice(p.price)}** ${p.oldPrice && p.oldPrice > p.price ? `(Giá gốc: ${formatPrice(p.oldPrice)})` : ""}\n`;
      text += specsSummary(p) + "\n";
      text += `${productLinkToken(p)}\n\n`;
    });

    // So sánh nhanh về giá
    const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
    const cheapest = sortedByPrice[0];
    const mostExpensive = sortedByPrice[sortedByPrice.length - 1];

    if (cheapest.id !== mostExpensive.id) {
      const diff = mostExpensive.price - cheapest.price;
      text += `💡 **Nhận xét nhanh**:\n`;
      text += `• Mức giá thấp nhất: **${cheapest.name}** (${formatPrice(cheapest.price)}).\n`;
      text += `• Chênh lệch với bản cao cấp nhất: **${formatPrice(diff)}**.\n`;
    }

    text += `\n*Bạn cũng có thể bấm "Lập bảng so sánh" bên dưới để xem dạng bảng có tích chọn và cuộn.*`;
    return text;
  };

  // ================= SO SÁNH DẠNG 2: BẢNG SO SÁNH CÓ TÍCH CHỌN & CUỘN (TỐI ĐA 4 MÁY) =================
  const renderComparisonTableHTML = (modelsToCompare, question) => {
    // Tối đa 4 sản phẩm
    const effectiveModels = modelsToCompare.slice(0, 4);
    const products = effectiveModels.map((m) => requestedVariant(m, question));

    const tableRows = [
      {
        label: "Tích chọn so sánh",
        render: (p) => `
          <label class="bot-table-check-label">
            <input type="checkbox" class="bot-product-select-check" data-id="${p.id}" checked>
            <span>Chọn máy này</span>
          </label>
        `,
      },
      {
        label: "Hình ảnh",
        render: (p) => `
          <div class="bot-table-product-thumb">
            <img src="${typeof window.formatImagePath === "function" ? window.formatImagePath(p.image) : p.image}" alt="${p.name}" loading="lazy" />
          </div>
        `,
      },
      {
        label: "Tên sản phẩm",
        render: (p) => `<strong>${p.name}</strong>`,
      },
      {
        label: "Giá bán",
        render: (p) => `
          <div class="bot-table-price">
            <strong>${formatPrice(p.price)}</strong>
            ${p.oldPrice && p.oldPrice > p.price ? `<span class="bot-table-old-price">${formatPrice(p.oldPrice)}</span>` : ""}
          </div>
        `,
      },
      {
        label: "Màn hình",
        render: (p) => p.specs?.screen || "Chưa có thông tin",
      },
      {
        label: "Chip xử lý",
        render: (p) => p.specs?.chip || "Chưa có thông tin",
      },
      {
        label: "RAM",
        render: (p) => p.specs?.ram || "Chưa có thông tin",
      },
      {
        label: "Bộ nhớ trong",
        render: (p) => p.specs?.storage || p.storageOption || "Chưa có",
      },
      {
        label: "Camera",
        render: (p) => p.specs?.camera || "Chưa có thông tin",
      },
      {
        label: "Pin & Sạc",
        render: (p) => p.specs?.battery || "Chưa có thông tin",
      },
      {
        label: "Chất liệu",
        render: (p) => p.specs?.material || "Chưa có thông tin",
      },
      {
        label: "Tính năng",
        render: (p) => p.specs?.features || "Apple Intelligence",
      },
      {
        label: "Thao tác",
        render: (p) => `
          <div class="bot-table-actions">
            <a href="detail.html?id=${encodeURIComponent(p.id)}" class="bot-btn-view" target="_blank">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Xem chi tiết
            </a>
            <button type="button" class="bot-btn-buy" onclick="window.addToCart('${p.id}', this)">
              <i class="fa-solid fa-cart-plus"></i> Thêm giỏ
            </button>
          </div>
        `,
      },
    ];

    const count = products.length;
    const scrollHint =
      count >= 3
        ? `<div class="bot-table-scroll-hint"><i class="fa-solid fa-arrows-left-right"></i> Vuốt ngang để xem đủ ${count} sản phẩm | Cuộn dọc xem thông số</div>`
        : `<div class="bot-table-scroll-hint"><i class="fa-solid fa-arrows-up-down"></i> Cuộn dọc để so sánh toàn bộ thông số kỹ thuật</div>`;

    let html = `
      <div class="bot-comparison-card">
        <div class="bot-comparison-header">
          <i class="fa-solid fa-table-columns"></i>
          <strong>Bảng so sánh ${count} sản phẩm (Tối đa 4 sản phẩm)</strong>
        </div>
        ${scrollHint}
        <div class="bot-compare-table-wrapper" tabindex="0" role="region" aria-label="Bảng so sánh sản phẩm">
          <table class="bot-compare-table count-${count}">
            <thead>
              <tr>
                <th class="bot-criteria-th">Tiêu chí</th>
                ${products.map((p) => `<th class="bot-product-th">${p.name}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRows
                .map(
                  (row) => `
                <tr>
                  <td class="bot-criteria-td"><strong>${row.label}</strong></td>
                  ${products.map((p) => `<td class="bot-data-td">${row.render(p)}</td>`).join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="bot-table-footer-notes">
          <i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Bạn có thể tích chọn các máy ưng ý hoặc bấm "Xem chi tiết" / "Thêm giỏ" trực tiếp tại bảng.
        </div>
      </div>
    `;

    return html;
  };

  // Biến lưu giữ các model cần so sánh đang chờ người dùng lựa chọn phương thức
  let pendingComparison = null;
  let previousModels = [];

  const answerQuestion = (question) => {
    const normalized = normalize(question);
    const mentionedModels = findMentionedModels(question);

    // Người dùng hỏi kiểm tra sản phẩm yêu thích có sale không
    if (/(yeu thich.*sale|sale.*yeu thich|co giam gia.*yeu thich|fav.*sale)/.test(normalized)) {
      const saleFavs =
        typeof window.getFavoriteSaleItems === "function" ? window.getFavoriteSaleItems() : [];
      if (!saleFavs.length) {
        return "Hiện tại các sản phẩm trong danh sách Yêu thích của bạn chưa có đợt Sale sốc. Bạn có thể bật thông báo để iStore tự động báo ngay khi bước vào Giờ Vàng Sale nhé!";
      }
      return (
        `🔥 **TIN VUI! Có ${saleFavs.length} sản phẩm yêu thích đang vào GIỜ SALE**:\n\n` +
        saleFavs
          .map(
            (p) =>
              `• **${p.name}**: Giá chỉ còn **${formatPrice(p.price)}** ${p.oldPrice ? `(giảm từ ${formatPrice(p.oldPrice)})` : ""} ${productLinkToken(p)}`,
          )
          .join("\n") +
        "\n\nBấm vào link sản phẩm để đặt ngay trước khi hết thời gian ưu đãi!"
      );
    }

    // Nếu người dùng đang trả lời lựa chọn 1 (List) hoặc 2 (Bảng) cho câu hỏi so sánh trước đó
    if (
      pendingComparison &&
      (normalized === "1" ||
        normalized === "2" ||
        /^(1|2|list|danh sach|tu doc|bang|lap bang|tich|bang tich)\b/.test(normalized))
    ) {
      const modelsToCompare = pendingComparison.models;
      const originalQuery = pendingComparison.query;
      pendingComparison = null;

      if (
        normalized.includes("1") ||
        normalized.includes("list") ||
        normalized.includes("danh sach") ||
        normalized.includes("tu doc")
      ) {
        return {
          type: "text",
          content: renderComparisonList(modelsToCompare, originalQuery),
        };
      }
      return {
        type: "html",
        content: renderComparisonTableHTML(modelsToCompare, originalQuery),
      };
    }

    // Kiểm tra ý định so sánh
    const isComparisonKeyword =
      /(so sanh|khac nhau|hay hon|nen mua con nao|may nao tot hon|so voi|vs|hon gi|bang so sanh)/.test(
        normalized,
      );

    if (mentionedModels.length >= 2 || (isComparisonKeyword && mentionedModels.length >= 1)) {
      let modelsToCompare = mentionedModels;

      // Giới hạn tối đa 4 sản phẩm
      if (modelsToCompare.length > 4) {
        modelsToCompare = modelsToCompare.slice(0, 4);
      }

      if (modelsToCompare.length >= 2) {
        previousModels = modelsToCompare;

        // Nếu khách hàng đã chỉ định rõ muốn xem "bảng"
        if (/(bang|lap bang|dang bang|tich|bang cuon)/.test(normalized)) {
          return {
            type: "html",
            content: renderComparisonTableHTML(modelsToCompare, question),
          };
        }

        // Nếu khách hàng đã chỉ định rõ muốn xem "danh sách" hoặc "tự đọc"
        if (/(list|danh sach|tu doc|liet ke)/.test(normalized)) {
          return {
            type: "text",
            content: renderComparisonList(modelsToCompare, question),
          };
        }

        // Mặc định: Hỏi khách chọn 1 là List tự đọc, 2 là Lập bảng tích chọn
        pendingComparison = { models: modelsToCompare, query: question };

        const disclaimer =
          mentionedModels.length > 4
            ? `*(Lưu ý: Hệ thống hỗ trợ so sánh tối đa 4 sản phẩm cùng lúc, mình sẽ so sánh 4 sản phẩm đầu tiên).*\n\n`
            : "";

        return {
          type: "choice",
          models: modelsToCompare,
          query: question,
          text:
            `🤖 ${disclaimer}Mình đã nhận diện **${modelsToCompare.length} sản phẩm** cần so sánh:\n` +
            modelsToCompare.map((m, i) => `${i + 1}. **${m.title}**`).join("\n") +
            `\n\n**Bạn muốn xem so sánh theo hình thức nào?**\n` +
            `1️⃣ **Xem danh sách tóm tắt** (để bạn tự đọc chi tiết)\n` +
            `2️⃣ **Lập bảng so sánh tương tác** (dạng bảng có tích chọn và cuộn dọc/ngang)`,
        };
      }

      if (modelsToCompare.length === 1) {
        return `Mình đã nhận diện **${modelsToCompare[0].title}**. Bạn muốn so sánh dòng máy này với máy nào khác? (Ví dụ: "So sánh ${modelsToCompare[0].title} với iPhone 18 Pro"). Hệ thống hỗ trợ so sánh từ 2 đến tối đa 4 sản phẩm cùng lúc.`;
      }
    }

    // Tra cứu thông tin 1 sản phẩm đơn lẻ
    if (mentionedModels.length === 1) {
      previousModels = [mentionedModels[0]];
      const prod = requestedVariant(mentionedModels[0], question);
      return (
        `📱 **${prod.name}**\n` +
        `• Giá hiện tại: **${formatPrice(prod.price)}** ${prod.oldPrice && prod.oldPrice > prod.price ? `(Giá cũ: ${formatPrice(prod.oldPrice)})` : ""}\n` +
        specsSummary(prod) +
        `\n• Mô tả: ${prod.description ?? ""}\n` +
        `${productLinkToken(prod)}`
      );
    }

    if (/(khuyen mai|dang sale|giam gia|flash sale|uu dai|gio vang)/.test(normalized)) {
      const saleProducts = productsData.filter(
        (product) =>
          product.badge?.toLowerCase().startsWith("sale") ||
          (product.oldPrice && product.oldPrice > product.price),
      );
      return saleProducts.length
        ? `🔥 **Sản phẩm đang trong khung giờ SALE sốc**:\n${saleProducts
            .slice(0, 5)
            .map(
              (p) =>
                `• ${p.name}: **${formatPrice(p.price)}** ${p.oldPrice ? `(giá gốc ${formatPrice(p.oldPrice)})` : ""} ${productLinkToken(p)}`,
            )
            .join("\n")}\nBạn có thể mở từng máy để xem thêm ưu đãi và quà tặng!`
        : "Hiện giá các sản phẩm đang được áp dụng theo giá niêm yết chuẩn. Khung giờ Flash Sale sẽ tự động kích hoạt theo lịch trong ngày!";
    }

    if (/(dia chi|google map|link map|ban do|giao hang)/.test(normalized)) {
      return "Khi đặt hàng tại iStore, bạn có thể nhập địa chỉ nhà chi tiết (số nhà, tên đường, phường/xã, quận/huyện) HOẶC dán trực tiếp link định vị Google Maps (maps.app.goo.gl). Hệ thống sẽ tự nhận diện và giao hàng chính xác tới vị trí của bạn!";
    }

    return "Mình là trợ lý iStore AI. Bạn có thể:\n• So sánh 2–4 sản phẩm cùng lúc (dạng danh sách hoặc bảng tương tác).\n• Tra cứu giá, thông số và kiểm tra khung giờ Flash Sale.\n• Kiểm tra xem sản phẩm yêu thích của bạn có đang sale không.\nVí dụ: “So sánh iPhone 17 Pro và iPhone 18 Pro dạng bảng” hoặc “Sản phẩm yêu thích có sale không?”.";
  };

  // Render tin nhắn vào khung chat
  const appendMessage = (data, sender) => {
    const message = document.createElement("div");
    message.className = `assistant-message assistant-message-${sender}`;

    if (typeof data === "string") {
      renderTextMessage(message, data, sender);
    } else if (data?.type === "choice") {
      renderTextMessage(message, data.text, sender);
      // Tạo 2 nút bấm tương tác cho khách hàng chọn
      const choiceGroup = document.createElement("div");
      choiceGroup.className = "bot-choice-buttons-group";
      choiceGroup.innerHTML = `
        <button type="button" class="bot-choice-btn" data-choice="1">
          <i class="fa-solid fa-list-ul"></i> 1. Xem danh sách tóm tắt (Tự đọc)
        </button>
        <button type="button" class="bot-choice-btn" data-choice="2">
          <i class="fa-solid fa-table-columns"></i> 2. Lập bảng so sánh (Có tích chọn & cuộn)
        </button>
      `;
      choiceGroup.querySelectorAll(".bot-choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const choice = btn.dataset.choice;
          choiceGroup.remove();
          appendMessage(
            choice === "1" ? "1. Xem danh sách tóm tắt" : "2. Lập bảng so sánh",
            "user",
          );
          if (choice === "1") {
            appendMessage(renderComparisonList(data.models, data.query), "bot");
          } else {
            appendMessage(
              { type: "html", content: renderComparisonTableHTML(data.models, data.query) },
              "bot",
            );
          }
          pendingComparison = null;
        });
      });
      message.appendChild(choiceGroup);
    } else if (data?.type === "html") {
      message.innerHTML = data.content;
      bindTableCheckboxes(message);
    }

    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const renderTextMessage = (container, text, sender) => {
    const productToken = /\[\[product:([\w-]+)\|([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    const formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formatted;

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Duyệt qua và gắn link sản phẩm nếu có
    let htmlContent = tempDiv.innerHTML;
    if (sender === "bot") {
      htmlContent = htmlContent.replace(
        productToken,
        (_, id, name) =>
          `<a class="assistant-product-link" href="detail.html?id=${encodeURIComponent(id)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Mở ${name}</a>`,
      );
    }
    container.innerHTML = htmlContent;
  };

  // Bắt sự kiện tích chọn các sản phẩm trên bảng so sánh
  const bindTableCheckboxes = (container) => {
    const checkboxes = container.querySelectorAll(".bot-product-select-check");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const td = cb.closest("td");
        const table = cb.closest("table");
        if (!table || !td) return;
        const colIndex = td.cellIndex;

        // Toggle class highlight cho cột tương ứng
        table.querySelectorAll("tr").forEach((row) => {
          const cell = row.children[colIndex];
          if (cell) {
            cell.classList.toggle("col-selected", cb.checked);
          }
        });
      });
      // Kích hoạt mặc định
      const td = cb.closest("td");
      const table = cb.closest("table");
      if (table && td) {
        const colIndex = td.cellIndex;
        table.querySelectorAll("tr").forEach((row) => {
          row.children[colIndex]?.classList.add("col-selected");
        });
      }
    });
  };

  const resetConversation = () => {
    pendingComparison = null;
    previousModels = [];
    messages.replaceChildren();
    appendMessage(
      "Xin chào! Mình là Trợ lý iStore AI. Mình có thể so sánh 2–4 sản phẩm cùng lúc (dạng danh sách hoặc bảng cuộn tương tác), tra cứu thông số và kiểm tra giờ sale sản phẩm yêu thích của bạn. Bạn muốn tìm hiểu gì?",
      "bot",
    );
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      input.focus();
      requestAnimationFrame(updatePromptArrows);
    }
  };

  const submitQuestion = (question) => {
    const cleanedQuestion = question.trim();
    if (!cleanedQuestion) return;
    appendMessage(cleanedQuestion, "user");
    const reply = answerQuestion(cleanedQuestion);
    appendMessage(reply, "bot");
  };

  launcher.addEventListener("click", () => {
    if (
      typeof window.requireSignedInUser === "function" &&
      !window.requireSignedInUser("Đăng nhập để dùng trợ lý tư vấn sản phẩm.")
    ) {
      return;
    }
    setOpen(panel.hidden);
  });

  closeButton.addEventListener("click", () => setOpen(false));
  clearButton.addEventListener("click", resetConversation);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion(input.value);
    input.value = "";
    input.focus();
  });

  prompts.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) submitQuestion(button.dataset.question ?? button.textContent.trim());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  resetConversation();
})();
