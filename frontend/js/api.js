/**
 * Centralized API client.
 * Change API_BASE_URL only if your backend runs on a different host/port.
 */
const API_BASE_URL = "http://localhost:5000/api";

const Api = {
  token() {
    return localStorage.getItem("ledger_token");
  },

  async request(path, { method = "GET", body = null, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = Api.token();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error("Could not reach the server. Is the backend running on port 5000?");
    }

    let data = {};
    try {
      data = await response.json();
    } catch (_) {
      // no JSON body
    }

    if (response.status === 401 || response.status === 403) {
      if (auth) {
        localStorage.removeItem("ledger_token");
        localStorage.removeItem("ledger_user");
        if (!location.pathname.endsWith("login.html")) {
          window.location.href = "login.html";
        }
      }
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong. Please try again.");
    }
    return data;
  },

  get(path) { return Api.request(path, { method: "GET" }); },
  post(path, body, opts = {}) { return Api.request(path, { method: "POST", body, ...opts }); },
  put(path, body) { return Api.request(path, { method: "PUT", body }); },
  del(path) { return Api.request(path, { method: "DELETE" }); },
};
