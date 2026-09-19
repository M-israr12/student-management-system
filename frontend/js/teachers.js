const Teachers = {
  init() {
    document
      .getElementById("openTeacherModal")
      .addEventListener("click", Teachers.openModal);

    document
      .getElementById("teacherModalClose")
      .addEventListener("click", Teachers.closeModal);

    document
      .getElementById("teacherCancelBtn")
      .addEventListener("click", Teachers.closeModal);

    document
      .getElementById("teacherModalBackdrop")
      .addEventListener("click", (e) => {
        if (e.target.id === "teacherModalBackdrop") {
          Teachers.closeModal();
        }
      });

    document
      .getElementById("teacherForm")
      .addEventListener("submit", Teachers.create);
  },

  async load() {
    try {
      const res = await Api.get("/users/teachers");
      Teachers.render(res.data);
    } catch (err) {
      Toast.show(err.message, "error");
    }
  },

  render(teachers) {
    const tbody = document.getElementById("teachersTableBody");
    const empty = document.getElementById("teachersEmptyState");

    if (!teachers.length) {
      tbody.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    tbody.innerHTML = teachers
      .map(
        (teacher) => `
        <tr>
          <td>
            <div class="student-name">
              ${escapeHtml(teacher.name)}
            </div>
          </td>

          <td>
            ${escapeHtml(teacher.username)}
          </td>

          <td>
            <span class="badge badge-active">
              Teacher
            </span>
          </td>

          <td>
            ${formatDate(teacher.created_at)}
          </td>

          <td>
            <div class="row-actions">
              <button
                class="icon-btn danger"
                title="Delete teacher"
                onclick="Teachers.delete(${teacher.id}, '${escapeHtml(teacher.name).replace(/'/g, "\\'")}')"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      `
      )
      .join("");
  },

  openModal() {
    document.getElementById("teacherForm").reset();
    document.getElementById("teacherFormError").hidden = true;
    document.getElementById("teacherModalBackdrop").hidden = false;
    document.getElementById("teacherName").focus();
  },

  closeModal() {
    document.getElementById("teacherModalBackdrop").hidden = true;
  },

  async create(e) {
    e.preventDefault();

    const errorBox = document.getElementById("teacherFormError");
    const button = document.getElementById("createTeacherBtn");

    errorBox.hidden = true;

    const name = document.getElementById("teacherName").value.trim();
    const username = document
      .getElementById("teacherUsername")
      .value.trim();

    const password = document.getElementById("teacherPassword").value;

    button.disabled = true;
    button.textContent = "Creating...";

    try {
      await Api.post("/users/teachers", {
        name,
        username,
        password
      });

      Teachers.closeModal();
      Teachers.load();

      Toast.show(
        "Teacher account created successfully.",
        "success"
      );
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = "Create Teacher";
    }
  },

  async delete(id, name) {
    const confirmed = confirm(
      `Delete teacher account for ${name}?`
    );

    if (!confirmed) return;

    try {
      await Api.del(`/users/teachers/${id}`);

      Teachers.load();

      Toast.show(
        "Teacher account deleted successfully.",
        "success"
      );
    } catch (err) {
      Toast.show(err.message, "error");
    }
  }
};