const Toast = {
  timer: null,
  show(message, type = "success") {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.className = `toast toast-${type}`;
    el.hidden = false;
    clearTimeout(Toast.timer);
    Toast.timer = setTimeout(() => { el.hidden = true; }, 3200);
  },
};

const Router = {
  views: ["dashboard", "students","teachers"],

  switchTo(view) {
    Router.views.forEach((v) => {
      document.getElementById(`view-${v}`).hidden = v !== view;
    });
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });

    if (view === "dashboard") Dashboard.load();
    if (view === "students") Students.load();
    if (view === "teachers") Teachers.load();
  },

  init() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => Router.switchTo(btn.dataset.view));
    });

    // "+ Add student" shortcut from the dashboard header
    const quickAdd = document.querySelector('[data-action="add"]');
    if (quickAdd) {
      quickAdd.addEventListener("click", () => {
        Router.switchTo("students");
        Students.openModal();
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // Only run the app shell logic on index.html (elements won't exist on login.html)
  if (!document.getElementById("view-dashboard")) return;

  Router.init();
  Students.init();
  Teachers.init();
  Router.switchTo("dashboard");
});
