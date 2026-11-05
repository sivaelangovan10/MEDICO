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

    const API_URL = "/api";

    const patientsList =
        document.getElementById("patientsList");

    const searchInput =
        document.getElementById("patientSearch");

    const message =
        document.getElementById("patientMessage");

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const logoutButton =
        document.getElementById("clinicLogoutButton");

    let patients = [];


    /* =========================================
       MESSAGE
    ========================================= */

    function showMessage(text) {

        if (message) {
            message.textContent = text;
        }

    }


    /* =========================================
       LOAD ADMIN
    ========================================= */

    async function loadAdmin() {

        try {

            const response = await fetch(
                `${API_URL}/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await readJson(response);

            const admin =
                data.user ||
                data.admin ||
                data;

            if (String(admin.role || "").toLowerCase() !== "admin") {
                window.location.href =
                    "/pages/admin/admin-login.html";
                return null;
            }

            if (adminName) {

                adminName.textContent =
                    admin.name ||
                    admin.fullName ||
                    "Administrator";

            }

            if (adminEmail) {

                adminEmail.textContent =
                    admin.email ||
                    "admin@medico.com";

            }

            return admin;

        } catch (error) {

            console.error(
                "Admin loading error:",
                error
            );

            return null;
        }
    }


    /* =========================================
       LOAD PATIENTS
    ========================================= */

    async function loadPatients() {

        try {

            showMessage(
                "Loading patients..."
            );

            const response = await fetch(
                `${API_URL}/admin/patients`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const data = await readJson(response);

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load patients"
                );
            }

            patients =
                Array.isArray(data)
                    ? data
                    : (
                        data.patients ||
                        []
                    );

            renderPatients(patients);

            showMessage("");

        } catch (error) {

            console.error(
                "Patients loading error:",
                error
            );

            patientsList.innerHTML = `

                <div class="clinic-empty-state">

                    <div>!</div>

                    <h3>
                        Unable to load patients
                    </h3>

                    <p>
                        Please check the clinic API.
                    </p>

                </div>

            `;

            showMessage(
                "Unable to load patients."
            );
        }
    }


    /* =========================================
       RENDER PATIENTS
    ========================================= */

    function renderPatients(list) {

        if (!patientsList) {
            return;
        }

        if (!list.length) {

            patientsList.innerHTML = `

                <div class="clinic-empty-state">

                    <div>—</div>

                    <h3>
                        No patients found
                    </h3>

                    <p>
                        Registered patients will
                        appear here.
                    </p>

                </div>

            `;

            return;
        }

        patientsList.innerHTML =
            list
                .map(
                    patient =>
                        createPatientCard(patient)
                )
                .join("");
    }


    /* =========================================
       CREATE PATIENT CARD
    ========================================= */

    function createPatientCard(patient) {

        const name =
            patient.name ||
            patient.fullName ||
            patient.patientName ||
            "Patient";

        const email =
            patient.email ||
            "No email";

        const phone =
            patient.phone ||
            patient.mobile ||
            "No phone";

        const gender =
            patient.gender ||
            "Not specified";

        const age =
            patient.age ||
            "Not specified";

        const initials =
            getInitials(name);

        return `

            <article class="clinic-doctor-card">

                <div class="clinic-doctor-avatar">
                    ${escapeHTML(initials)}
                </div>


                <div class="clinic-doctor-info">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    <p>
                        ${escapeHTML(email)}
                    </p>

                    <span>
                        ${escapeHTML(phone)}
                    </span>

                </div>


                <div class="clinic-doctor-details">

                    <div>

                        <small>
                            AGE
                        </small>

                        <strong>
                            ${escapeHTML(
                                String(age)
                            )}
                        </strong>

                    </div>


                    <div>

                        <small>
                            GENDER
                        </small>

                        <strong>
                            ${escapeHTML(
                                String(gender)
                            )}
                        </strong>

                    </div>

                </div>

            </article>

        `;
    }


    /* =========================================
       SEARCH
    ========================================= */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const search =
                    searchInput.value
                        .trim()
                        .toLowerCase();

                if (!search) {

                    renderPatients(patients);

                    return;
                }

                const filtered =
                    patients.filter(
                        patient => {

                            const name =
                                patient.name ||
                                patient.fullName ||
                                patient.patientName ||
                                "";

                            const email =
                                patient.email ||
                                "";

                            const phone =
                                patient.phone ||
                                patient.mobile ||
                                "";

                            return (

                                String(name)
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(email)
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(phone)
                                    .toLowerCase()
                                    .includes(search)
                            );
                        }
                    );

                renderPatients(filtered);
            }
        );
    }


    /* =========================================
       INITIALS
    ========================================= */

    function getInitials(name) {

        const parts =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (!parts.length) {
            return "PT";
        }

        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();
    }


    /* =========================================
       ESCAPE HTML
    ========================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    logoutButton.disabled = true;

                    await fetch(
                        `${API_URL}/auth/logout`,
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );
                }

                /*
                 * Change this path later if your
                 * admin login file has a different
                 * location.
                 */

                window.location.href =
                    "/pages/admin/admin-login.html";
            }
        );
    }


    /* =========================================
       INITIALIZE
    ========================================= */

    async function initialize() {

        await loadAdmin();

        await loadPatients();

    }

    initialize();

});