(() => {
  const dialog = document.getElementById("notification-dialog");
  const enableButton = document.getElementById("notification-enable");
  const laterButton = document.getElementById("notification-later");
  const dismissButton = document.getElementById("notification-dismiss");
  const feedback = document.getElementById("notification-feedback");
  if (!dialog || !enableButton || !laterButton || !dismissButton || !feedback) return;

  const storageKey = "istore_notification_prompt_v1";
  let previousFocus;
  const closeDialog = () => {
    dialog.hidden = true;
    previousFocus?.focus();
  };
  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch (error) {
      console.error("Không lưu được lựa chọn thông báo:", error);
    }
    closeDialog();
  };

  let hasDismissed;
  try {
    hasDismissed = localStorage.getItem(storageKey) === "dismissed";
  } catch (error) {
    console.error("Không đọc được lựa chọn thông báo:", error);
    hasDismissed = true;
  }
  if (!hasDismissed && "Notification" in window && Notification.permission === "default") {
    window.setTimeout(() => {
      previousFocus = document.activeElement;
      dialog.hidden = false;
      enableButton.focus();
    }, 1100);
  }

  enableButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      feedback.textContent = "Trình duyệt này chưa hỗ trợ thông báo. Bạn vẫn có thể tiếp tục mua sắm.";
      feedback.hidden = false;
      enableButton.disabled = true;
      window.setTimeout(dismiss, 1800);
      return;
    }
    if (!window.isSecureContext) {
      feedback.textContent = "Thông báo chỉ hoạt động trên HTTPS hoặc localhost. Hãy triển khai website an toàn để bật.";
      feedback.hidden = false;
      return;
    }

    enableButton.disabled = true;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Thông báo iStore đã bật", {
          body: "Khi có thông tin ưu đãi mới, trình duyệt có thể gửi thông báo cho bạn.",
          tag: "istore-notifications-enabled",
        });
      } else {
        feedback.textContent =
          permission === "denied"
            ? "Bạn đã chặn thông báo. Có thể đổi lại quyền này trong cài đặt website của trình duyệt."
            : "Bạn chưa bật thông báo. Website vẫn hoạt động bình thường.";
        feedback.hidden = false;
        await new Promise((resolve) => window.setTimeout(resolve, 2200));
      }
      dismiss();
    } catch (error) {
      console.error("Không thể xin quyền thông báo:", error);
      feedback.textContent = "Chưa bật được thông báo. Bạn có thể thử lại trong cài đặt trình duyệt.";
      feedback.hidden = false;
      enableButton.disabled = false;
    }
  });
  laterButton.addEventListener("click", dismiss);
  dismissButton.addEventListener("click", dismiss);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dismiss();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) dismiss();
  });
})();
