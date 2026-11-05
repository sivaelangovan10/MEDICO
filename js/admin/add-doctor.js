async function readJson(response) {
    const text = await response.text();

    if (!text.trim()) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Invalid JSON response:", error);
        return {};
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addDoctorForm");
    const button = document.getElementById("createDoctorButton");
    const message = document.getElementById("doctorFormMessage");

    const value = id => (document.getElementById(id)?.value || "").trim();

    function showMessage(text, type = "") {
        if (!message) return;
        message.textContent = text;
        message.className = "form-message";
        if (type) message.classList.add(type);
    }

    async function ensureAdmin() {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) {
            window.location.href = "/pages/admin/admin-login.html";
            return false;
        }
        const data = await readJson(response);
        const user = data.user || data;
        if (String(user.role || "").toLowerCase() !== "admin") {
            window.location.href = "/pages/admin/admin-login.html";
            return false;
        }
        return true;
    }

    if (form) {
        form.addEventListener("submit", async event => {
            event.preventDefault();

            const password = value("doctorPassword");
            const confirmPassword = value("confirmPassword");

            if (password.length < 6) {
                showMessage("Password must be at least 6 characters.", "error");
                return;
            }
            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "error");
                return;
            }

            const payload = {
                name: value("doctorName"),
                email: value("doctorEmail"),
                phone: value("doctorPhone"),
                specialization: value("specialization"),
                department: value("department"),
                qualification: value("qualification"),
                experience: value("experience") ? Number(value("experience")) : 0,
                licenseNumber: value("licenseNumber"),
                room: value("room"),
                password,
                bio: value("doctorBio")
            };

            if (!payload.name || !payload.email || !payload.phone || !payload.specialization ||
                !payload.department || !payload.qualification || !payload.licenseNumber) {
                showMessage("Please complete all required doctor information.", "error");
                return;
            }

            button.disabled = true;
            const span = button.querySelector("span");
            if (span) span.textContent = "Creating...";
            showMessage("");

            try {
                const allowed = await ensureAdmin();
                if (!allowed) return;

                const response = await fetch("/api/admin/doctors", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const text = await response.text();
                let data = {};
                try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

                if (!response.ok) {
                    throw new Error(data.message || "Unable to create doctor account.");
                }

                showMessage("Doctor account created successfully.", "success");
                form.reset();
            } catch (error) {
                console.error("Create doctor error:", error);
                showMessage(error.message || "Unable to create doctor account.", "error");
            } finally {
                button.disabled = false;
                const span = button.querySelector("span");
                if (span) span.textContent = "Create Doctor Account";
            }
        });
    }

    const logout = document.getElementById("adminLogoutButton");
    if (logout) {
        logout.addEventListener("click", async () => {
            try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); }
            finally { window.location.href = "/pages/admin/admin-login.html"; }
        });
    }
});
