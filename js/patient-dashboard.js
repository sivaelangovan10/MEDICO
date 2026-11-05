async function readJson(response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

const state = { appointments: [] };

const byId = (id) => document.getElementById(id);

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "—", month: "Date" };
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("en-US", { month: "short" })
  };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
}

async function loadCurrentUser() {
  const response = await fetch("/api/auth/me", { credentials: "include" });
  const data = await readJson(response);

  if (!response.ok || data.user?.role !== "patient") {
    window.location.href = "/pages/patient-login.html";
    return null;
  }

  const user = data.user;
  const firstName = user.name?.trim().split(/\s+/)[0] || "Patient";

  byId("welcomeTitle").textContent = `Good day, ${firstName}.`;
  byId("patientNameSide").textContent = user.name || "Patient";
  byId("patientAvatar").textContent = firstName.charAt(0).toUpperCase();
  byId("profileName").textContent = user.name || "—";
  byId("profileEmail").textContent = user.email || "—";
  byId("profilePhone").textContent = user.phone || "Not added";

  return user;
}

async function loadAppointments() {
  const response = await fetch("/api/appointments/patient", { credentials: "include" });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your appointments.");
  }

  state.appointments = data.appointments || [];
  renderAppointments();
}

function renderAppointments() {
  const list = byId("appointmentList");
  const appointments = state.appointments;
  const now = new Date();

  const upcoming = appointments.filter((item) =>
    ["pending", "confirmed"].includes(item.status) && new Date(item.appointmentDate) >= new Date(now.toDateString())
  );
  const pending = appointments.filter((item) => item.status === "pending");
  const completed = appointments.filter((item) => item.status === "completed");

  byId("upcomingCount").textContent = upcoming.length;
  byId("pendingCount").textContent = pending.length;
  byId("completedCount").textContent = completed.length;

  if (!appointments.length) {
    list.innerHTML = `
      <div class="empty-state">
        <p>You don't have any appointments yet.</p>
        <a href="/pages/appointment.html">Book your first appointment →</a>
      </div>`;
    return;
  }

  list.innerHTML = appointments.slice(0, 8).map((appointment) => {
    const date = formatDate(appointment.appointmentDate);
    const doctorName = appointment.doctor?.name || "Doctor";
    const specialization = appointment.doctor?.specialization || "Medical consultation";
    const status = appointment.status || "pending";
    const canCancel = ["pending", "confirmed"].includes(status);

    return `
      <article class="appointment-item">
        <div class="date-box">
          <strong>${escapeHtml(date.day)}</strong>
          <span>${escapeHtml(date.month)}</span>
        </div>
        <div class="appointment-main">
          <strong>Dr. ${escapeHtml(doctorName)}</strong>
          <span>${escapeHtml(specialization)} · ${escapeHtml(appointment.appointmentTime || "Time not set")}</span>
          ${canCancel ? `<button class="cancel-button" data-id="${appointment._id}">Cancel appointment</button>` : ""}
        </div>
        <span class="status ${escapeHtml(status)}">${escapeHtml(status)}</span>
      </article>`;
  }).join("");

  list.querySelectorAll(".cancel-button").forEach((button) => {
    button.addEventListener("click", () => cancelAppointment(button.dataset.id));
  });
}

async function cancelAppointment(id) {
  if (!window.confirm("Cancel this appointment?")) return;

  try {
    const response = await fetch(`/api/appointments/${id}/cancel`, {
      method: "PATCH",
      credentials: "include"
    });
    const data = await readJson(response);

    if (!response.ok) throw new Error(data.message || "Unable to cancel appointment.");
    await loadAppointments();
  } catch (error) {
    window.alert(error.message);
  }
}

async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
  } finally {
    window.location.href = "/pages/patient-login.html";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  byId("logoutButton")?.addEventListener("click", logout);

  try {
    const user = await loadCurrentUser();
    if (!user) return;
    await loadAppointments();
  } catch (error) {
    console.error("Patient dashboard error:", error);
    byId("appointmentList").innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
});
