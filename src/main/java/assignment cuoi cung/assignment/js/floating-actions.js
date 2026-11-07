(() => {
  let actions = document.querySelector(".chatbot-widget");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "chatbot-widget";
    actions.id = "floating-actions-widget";
    document.body.append(actions);
  }

  let handToggle = actions.querySelector(".hand-mode-toggle");
  if (!handToggle) {
    handToggle = document.createElement("button");
    handToggle.className = "hand-mode-toggle";
    handToggle.type = "button";
    actions.prepend(handToggle);
  }

  const assistant = document.getElementById("istore-assistant");
  const launcher = assistant?.querySelector(".assistant-launcher");
  if (assistant && launcher && launcher.parentElement !== actions) {
    actions.append(launcher);
  }
  if (assistant) {
    assistant.classList.add("has-floating-actions");
    if (actions.querySelector("#catalog-shortcut, #home-shortcut")) {
      assistant.classList.add("has-floating-shortcuts");
    }
  }

  const setHandMode = (leftHanded) => {
    actions.classList.toggle("hand-left", leftHanded);
    assistant?.classList.toggle("hand-left", leftHanded);
    handToggle.setAttribute("aria-pressed", String(leftHanded));
    handToggle.setAttribute(
      "aria-label",
      leftHanded ? "Chuyển bố cục sang tay phải" : "Chuyển bố cục sang tay trái",
    );
    handToggle.innerHTML = leftHanded
      ? '<i class="fa-solid fa-hand-point-right" aria-hidden="true"></i><span>Dùng tay phải</span>'
      : '<i class="fa-solid fa-hand-point-left" aria-hidden="true"></i><span>Dùng tay trái</span>';
  };

  setHandMode(localStorage.getItem("istore_hand_mode") === "left");
  handToggle.addEventListener("click", () => {
    const nextState = !actions.classList.contains("hand-left");
    localStorage.setItem("istore_hand_mode", nextState ? "left" : "right");
    setHandMode(nextState);
  });

  const homeBanner = document.querySelector(".home-wide-banner");
  if (homeBanner && "IntersectionObserver" in window) {
    const updateBannerOverlap = () => {
      const bannerRect = homeBanner.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const overlaps =
        bannerRect.bottom > actionsRect.top &&
        bannerRect.top < actionsRect.bottom &&
        bannerRect.right > actionsRect.left &&
        bannerRect.left < actionsRect.right;
      actions.classList.toggle("is-banner-visible", overlaps);
      assistant?.classList.toggle("is-banner-visible", overlaps);
    };
    const observer = new IntersectionObserver(
      updateBannerOverlap,
      { threshold: 0.08 },
    );
    observer.observe(homeBanner);
    window.addEventListener("resize", updateBannerOverlap);
  }
})();
