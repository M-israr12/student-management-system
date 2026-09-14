const Auth = {
  isLoggedIn() {
    return !!localStorage.getItem("ledger_token");
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem("ledger_user") || "null");
    } catch {
      return null;
    }
  },
  saveSession(token, user) {
    localStorage.setItem("ledger_token", token);
    localStorage.setItem("ledger_user", JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    window.location.href = "login.html";
  },
};

// ---- Guard: keep logged-out users off index.html, logged-in users off login.html ----
(function guard() {
  const isLoginPage = location.pathname.endsWith("login.html");
  if (isLoginPage && Auth.isLoggedIn()) {
    window.location.href = "index.html";
  }
  if (!isLoginPage && !Auth.isLoggedIn()) {
    window.location.href = "login.html";
  }
})();

// ---- Login form (only present on login.html) ----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const errorBox = document.getElementById("loginError");
  const loginBtn = document.getElementById("loginBtn");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in…";

    try {
      const res = await Api.post("/auth/login", { username, password }, { auth: false });
      Auth.saveSession(res.token, res.user);
      window.location.href = "index.html";
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign in";
    }
  });
}

// ---- Logout button + user chip (only present on index.html) ----
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => Auth.logout());

  const user = Auth.getUser();
  if (user) {
    document.getElementById("userName").textContent = user.name || user.username;
    document.getElementById("userRole").textContent = user.role || "admin";
    document.getElementById("userAvatar").textContent = (user.name || user.username || "A")
      .charAt(0)
      .toUpperCase();
  }
}
