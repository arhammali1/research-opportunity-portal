const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("opportunity-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formErrors = document.getElementById("form-errors");
const listStatus = document.getElementById("list-status");
const listContainer = document.getElementById("opportunities-list");
const refreshBtn = document.getElementById("refresh-btn");
const toast = document.getElementById("toast");

const modal = document.getElementById("detail-modal");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalBackdrop = document.getElementById("modal-backdrop");

const fields = {
  id: document.getElementById("opportunity-id"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  research_area: document.getElementById("research_area"),
  faculty_name: document.getElementById("faculty_name"),
  department: document.getElementById("department"),
  required_skills: document.getElementById("required_skills"),
  available_positions: document.getElementById("available_positions"),
  application_deadline: document.getElementById("application_deadline"),
  status: document.getElementById("status"),
};

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add("hidden"), 3500);
}

function resetForm() {
  form.reset();
  fields.id.value = "";
  fields.status.value = "Open";
  formTitle.textContent = "Post a New Research Opportunity";
  submitBtn.textContent = "Create Opportunity";
  cancelEditBtn.classList.add("hidden");
  formErrors.classList.add("hidden");
  formErrors.innerHTML = "";
  document.querySelectorAll(".field.invalid").forEach((el) => el.classList.remove("invalid"));
}

function validateFormClientSide() {
  const errors = [];
  const requiredTextFields = [
    ["title", "Research title"],
    ["description", "Research description"],
    ["research_area", "Research area"],
    ["faculty_name", "Faculty member's name"],
    ["department", "Department"],
    ["required_skills", "Required skills"],
  ];

  document.querySelectorAll(".field.invalid").forEach((el) => el.classList.remove("invalid"));

  requiredTextFields.forEach(([key, label]) => {
    if (!fields[key].value.trim()) {
      errors.push(`${label} is required.`);
      fields[key].closest(".field").classList.add("invalid");
    }
  });

  const positions = Number(fields.available_positions.value);
  if (!fields.available_positions.value || !Number.isInteger(positions) || positions < 1) {
    errors.push("Available positions must be a positive whole number.");
    fields.available_positions.closest(".field").classList.add("invalid");
  }

  if (!fields.application_deadline.value) {
    errors.push("Application deadline is required.");
    fields.application_deadline.closest(".field").classList.add("invalid");
  }

  return errors;
}

function showFormErrors(errors) {
  if (!errors.length) {
    formErrors.classList.add("hidden");
    formErrors.innerHTML = "";
    return;
  }
  formErrors.innerHTML = `<strong>Please fix the following:</strong><ul>${errors
    .map((e) => `<li>${e}</li>`)
    .join("")}</ul>`;
  formErrors.classList.remove("hidden");
}

function buildPayload() {
  return {
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    research_area: fields.research_area.value.trim(),
    faculty_name: fields.faculty_name.value.trim(),
    department: fields.department.value.trim(),
    required_skills: fields.required_skills.value.trim(),
    available_positions: Number(fields.available_positions.value),
    application_deadline: fields.application_deadline.value,
    status: fields.status.value,
  };
}

async function loadOpportunities() {
  listStatus.textContent = "Loading opportunities...";
  listStatus.classList.remove("hidden");
  listContainer.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/opportunities`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load opportunities.");

    if (data.length === 0) {
      listStatus.textContent = "No research opportunities posted yet.";
      return;
    }

    listStatus.classList.add("hidden");
    listContainer.innerHTML = data.map(renderCard).join("");
    attachCardListeners();
  } catch (err) {
    listStatus.textContent = `Error loading opportunities: ${err.message}`;
  }
}

function renderCard(op) {
  const badgeClass = op.status === "Open" ? "badge-open" : "badge-closed";
  return `
    <div class="card" data-id="${op.id}">
      <span class="badge ${badgeClass}">${op.status}</span>
      <h3>${escapeHtml(op.title)}</h3>
      <div class="card-meta">
        ${escapeHtml(op.research_area)} &middot; ${escapeHtml(op.department)}<br>
        Faculty: ${escapeHtml(op.faculty_name)}<br>
        Positions: ${op.available_positions} &middot; Deadline: ${op.application_deadline}
      </div>
      <div class="card-actions">
        <button class="btn btn-small btn-ghost" data-action="view" data-id="${op.id}">View</button>
        <button class="btn btn-small btn-ghost" data-action="edit" data-id="${op.id}">Edit</button>
        ${
          op.status === "Open"
            ? `<button class="btn btn-small btn-success" data-action="close" data-id="${op.id}">Close</button>`
            : ""
        }
        <button class="btn btn-small btn-danger" data-action="delete" data-id="${op.id}">Delete</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function attachCardListeners() {
  listContainer.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (action === "view") await viewOpportunity(id);
      if (action === "edit") await editOpportunity(id);
      if (action === "close") await closeOpportunity(id);
      if (action === "delete") await deleteOpportunity(id);
    });
  });
}

async function fetchOpportunity(id) {
  const res = await fetch(`${API_BASE}/opportunities/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Opportunity not found.");
  return data;
}

async function viewOpportunity(id) {
  try {
    const op = await fetchOpportunity(id);
    modalBody.innerHTML = `
      <h2>${escapeHtml(op.title)}</h2>
      <span class="badge ${op.status === "Open" ? "badge-open" : "badge-closed"}">${op.status}</span>
      <div class="detail-row"><strong>Description</strong>${escapeHtml(op.description)}</div>
      <div class="detail-row"><strong>Research Area</strong>${escapeHtml(op.research_area)}</div>
      <div class="detail-row"><strong>Faculty Member</strong>${escapeHtml(op.faculty_name)}</div>
      <div class="detail-row"><strong>Department</strong>${escapeHtml(op.department)}</div>
      <div class="detail-row"><strong>Required Skills</strong>${escapeHtml(op.required_skills)}</div>
      <div class="detail-row"><strong>Available Positions</strong>${op.available_positions}</div>
      <div class="detail-row"><strong>Application Deadline</strong>${op.application_deadline}</div>
    `;
    modal.classList.remove("hidden");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function editOpportunity(id) {
  try {
    const op = await fetchOpportunity(id);
    fields.id.value = op.id;
    fields.title.value = op.title;
    fields.description.value = op.description;
    fields.research_area.value = op.research_area;
    fields.faculty_name.value = op.faculty_name;
    fields.department.value = op.department;
    fields.required_skills.value = op.required_skills;
    fields.available_positions.value = op.available_positions;
    fields.application_deadline.value = op.application_deadline;
    fields.status.value = op.status;

    formTitle.textContent = `Editing: ${op.title}`;
    submitBtn.textContent = "Save Changes";
    cancelEditBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function closeOpportunity(id) {
  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Closed" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close opportunity.");
    showToast("Opportunity marked as Closed.");
    await loadOpportunities();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteOpportunity(id) {
  if (!confirm("Delete this research opportunity? This cannot be undone.")) return;
  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete opportunity.");
    showToast("Opportunity deleted.");
    await loadOpportunities();
  } catch (err) {
    showToast(err.message, "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const errors = validateFormClientSide();
  showFormErrors(errors);
  if (errors.length) return;

  const payload = buildPayload();
  const id = fields.id.value;
  const isEdit = Boolean(id);

  try {
    const res = await fetch(
      isEdit ? `${API_BASE}/opportunities/${id}` : `${API_BASE}/opportunities`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      const details = data.details ? data.details.join(" ") : data.error;
      throw new Error(details || "Request failed.");
    }

    showToast(isEdit ? "Opportunity updated." : "Opportunity created.");
    resetForm();
    await loadOpportunities();
  } catch (err) {
    showFormErrors([err.message]);
  }
});

cancelEditBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadOpportunities);
modalCloseBtn.addEventListener("click", () => modal.classList.add("hidden"));
modalBackdrop.addEventListener("click", () => modal.classList.add("hidden"));

loadOpportunities();
