const Students = {
  state: {
    search: "",
    status: "",
    page: 1,
    limit: 8,
  },
  pendingDeleteId: null,

  init() {
    document.getElementById("openAddModal").addEventListener("click", () => Students.openModal());

    let searchTimer;
    document.getElementById("searchInput").addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        Students.state.search = e.target.value.trim();
        Students.state.page = 1;
        Students.load();
      }, 300);
    });

    document.getElementById("statusFilter").addEventListener("change", (e) => {
      Students.state.status = e.target.value;
      Students.state.page = 1;
      Students.load();
    });

    document.getElementById("studentForm").addEventListener("submit", Students.handleSave);
    document.getElementById("cancelBtn").addEventListener("click", Students.closeModal);
    document.getElementById("modalClose").addEventListener("click", Students.closeModal);
    document.getElementById("modalBackdrop").addEventListener("click", (e) => {
      if (e.target.id === "modalBackdrop") Students.closeModal();
    });

    document.getElementById("deleteCancelBtn").addEventListener("click", Students.closeDeleteModal);
    document.getElementById("deleteModalClose").addEventListener("click", Students.closeDeleteModal);
    document.getElementById("deleteConfirmBtn").addEventListener("click", Students.confirmDelete);
  },

  async load() {
    const { search, status, page, limit } = Students.state;
    const params = new URLSearchParams({ search, status, page, limit });
    try {
      const res = await Api.get(`/students?${params.toString()}`);
      Students.render(res.data);
      Students.renderPagination(res.pagination);
    } catch (err) {
      Toast.show(err.message, "error");
    }
  },

  render(students) {
    const tbody = document.getElementById("studentsTableBody");
    const emptyState = document.getElementById("emptyState");

    if (!students.length) {
      tbody.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    tbody.innerHTML = students
      .map(
        (s) => `
      <tr>
        <td>
          <div class="student-name">${escapeHtml(s.full_name)}</div>
          <div class="student-email">${escapeHtml(s.email)}</div>
        </td>
        <td>${escapeHtml(s.roll_number || "—")}</td>
        <td>${escapeHtml(s.course)}</td>
        <td>${escapeHtml(s.phone || "—")}</td>
        <td><span class="badge ${s.status === "active" ? "badge-active" : "badge-inactive"}">${s.status}</span></td>
        <td>${formatDate(s.enrollment_date)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Edit" onclick='Students.openModal(${JSON.stringify(s)})'>
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.12l-1.88-1.88a1.5 1.5 0 0 0-2.12 0L4 16v4Z" stroke="currentColor" stroke-width="1.6"/></svg>
            </button>
            <button class="icon-btn danger" title="Delete" onclick="Students.openDeleteModal(${s.id}, '${escapeHtml(s.full_name).replace(/'/g, "\\'")}')">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7h12Z" stroke="currentColor" stroke-width="1.6"/></svg>
            </button>
          </div>
        </td>
      </tr>`
      )
      .join("");
  },

  renderPagination(pagination) {
    const { page, totalPages } = pagination;
    const el = document.getElementById("pagination");
    if (totalPages <= 1) {
      el.innerHTML = "";
      return;
    }
    let html = `<button class="page-btn" ${page === 1 ? "disabled" : ""} onclick="Students.goToPage(${page - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === page ? "active" : ""}" onclick="Students.goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${page === totalPages ? "disabled" : ""} onclick="Students.goToPage(${page + 1})">›</button>`;
    el.innerHTML = html;
  },

  goToPage(page) {
    Students.state.page = page;
    Students.load();
  },

  openModal(student = null) {
    const form = document.getElementById("studentForm");
    form.reset();
    document.getElementById("formError").hidden = true;

    if (student) {
      document.getElementById("modalTitle").textContent = "Edit student";
      document.getElementById("studentId").value = student.id;
      document.getElementById("full_name").value = student.full_name;
      document.getElementById("email").value = student.email;
      document.getElementById("phone").value = student.phone || "";
      document.getElementById("roll_number").value = student.roll_number || "";
      document.getElementById("course").value = student.course;
      document.getElementById("grade").value = student.grade || "";
      document.getElementById("enrollment_date").value = student.enrollment_date || "";
      document.getElementById("status").value = student.status;
      document.getElementById("address").value = student.address || "";
    } else {
      document.getElementById("modalTitle").textContent = "Add student";
      document.getElementById("studentId").value = "";
    }

    document.getElementById("modalBackdrop").hidden = false;
  },

  closeModal() {
    document.getElementById("modalBackdrop").hidden = true;
  },

  async handleSave(e) {
    e.preventDefault();
    const id = document.getElementById("studentId").value;
    const errorBox = document.getElementById("formError");
    errorBox.hidden = true;

    const payload = {
      full_name: document.getElementById("full_name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      roll_number: document.getElementById("roll_number").value.trim() || null,
      course: document.getElementById("course").value.trim(),
      grade: document.getElementById("grade").value.trim(),
      enrollment_date: document.getElementById("enrollment_date").value || null,
      status: document.getElementById("status").value,
      address: document.getElementById("address").value.trim(),
    };

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    try {
      if (id) {
        await Api.put(`/students/${id}`, payload);
        Toast.show("Student updated.", "success");
      } else {
        await Api.post("/students", payload);
        Toast.show("Student added.", "success");
      }
      Students.closeModal();
      Students.load();
      if (typeof Dashboard !== "undefined") Dashboard.load();
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save student";
    }
  },

  openDeleteModal(id, name) {
    Students.pendingDeleteId = id;
    document.getElementById("deleteStudentName").textContent = name;
    document.getElementById("deleteBackdrop").hidden = false;
  },

  closeDeleteModal() {
    Students.pendingDeleteId = null;
    document.getElementById("deleteBackdrop").hidden = true;
  },

  async confirmDelete() {
    if (!Students.pendingDeleteId) return;
    try {
      await Api.del(`/students/${Students.pendingDeleteId}`);
      Toast.show("Student removed.", "success");
      Students.closeDeleteModal();
      Students.load();
      if (typeof Dashboard !== "undefined") Dashboard.load();
    } catch (err) {
      Toast.show(err.message, "error");
    }
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
