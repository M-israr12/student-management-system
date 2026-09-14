const Dashboard = {
  async load() {
    try {
      const res = await Api.get("/students/stats/dashboard");
      const { total, active, inactive, addedThisMonth, byCourse, recent } = res.data;

      document.getElementById("statTotal").textContent = total;
      document.getElementById("statActive").textContent = active;
      document.getElementById("statInactive").textContent = inactive;
      document.getElementById("statMonth").textContent = addedThisMonth;

      Dashboard.renderCourseBreakdown(byCourse, total);
      Dashboard.renderRecent(recent);
    } catch (err) {
      Toast.show(err.message, "error");
    }
  },

  renderCourseBreakdown(byCourse, total) {
    const el = document.getElementById("courseBreakdown");
    if (!byCourse.length) {
      el.innerHTML = `<p class="empty-inline">No students added yet.</p>`;
      return;
    }
    const max = Math.max(...byCourse.map((c) => c.count), 1);
    el.innerHTML = byCourse
      .map(
        (c) => `
        <div class="course-row">
          <span class="course-name" title="${escapeHtml(c.course)}">${escapeHtml(c.course)}</span>
          <div class="course-bar-track">
            <div class="course-bar-fill" style="width:${(c.count / max) * 100}%"></div>
          </div>
          <span class="course-count">${c.count}</span>
        </div>`
      )
      .join("");
  },

  renderRecent(recent) {
    const el = document.getElementById("recentList");
    if (!recent.length) {
      el.innerHTML = `<p class="empty-inline">Nothing here yet — add your first student.</p>`;
      return;
    }
    el.innerHTML = recent
      .map(
        (s) => `
        <div class="recent-row">
          <div class="recent-info">
            <span class="recent-name">${escapeHtml(s.full_name)}</span>
            <span class="recent-course">${escapeHtml(s.course)}</span>
          </div>
          <span class="badge ${s.status === "active" ? "badge-active" : "badge-inactive"}">${s.status}</span>
        </div>`
      )
      .join("");
  },
};

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
