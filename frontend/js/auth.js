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
// ---- Change Password ----
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordBackdrop = document.getElementById("passwordBackdrop");
const passwordModalClose = document.getElementById("passwordModalClose");
const passwordCancelBtn = document.getElementById("passwordCancelBtn");
const changePasswordForm = document.getElementById("changePasswordForm");
const passwordError = document.getElementById("passwordError");

if (changePasswordBtn && passwordBackdrop) {
  changePasswordBtn.addEventListener("click", () => {
    passwordBackdrop.hidden = false;
  });
}

function closePasswordModal() {
  if (passwordBackdrop) {
    passwordBackdrop.hidden = true;
  }

  if (changePasswordForm) {
    changePasswordForm.reset();
  }

  if (passwordError) {
    passwordError.hidden = true;
    passwordError.textContent = "";
  }
}

if (passwordModalClose) {
  passwordModalClose.addEventListener("click", closePasswordModal);
}

if (passwordCancelBtn) {
  passwordCancelBtn.addEventListener("click", closePasswordModal);
}

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    passwordError.hidden = true;

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      passwordError.textContent = "New passwords do not match.";
      passwordError.hidden = false;
      return;
    }

    if (newPassword.length < 6) {
      passwordError.textContent = "New password must be at least 6 characters long.";
      passwordError.hidden = false;
      return;
    }

    try {
      const res = await Api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });

      alert(res.message);
      closePasswordModal();
    } catch (err) {
      passwordError.textContent = err.message;
      passwordError.hidden = false;
    }
  });
}