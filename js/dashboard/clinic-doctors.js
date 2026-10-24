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

    const doctorsList =
        document.getElementById("doctorsList");

    const searchInput =
        document.getElementById("doctorSearch");

    const message =
        document.getElementById("doctorMessage");

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const logoutButton =
        document.getElementById(
            "clinicLogoutButton"
        );


    let doctors = [];


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

            const data =
                await readJson(response);

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
       LOAD DOCTORS
    ========================================= */

    async function loadDoctors() {

        try {

            showMessage(
                "Loading doctors..."
            );


            const response =
                await fetch(
                    `${API_URL}/admin/doctors`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load doctors"
                );

            }


            doctors =
                Array.isArray(data)
                    ? data
                    : (
                        data.doctors ||
                        []
                    );


            renderDoctors(doctors);

            showMessage("");

        } catch (error) {

            console.error(
                "Doctors loading error:",
                error
            );


            if (doctorsList) {

                doctorsList.innerHTML = `

                    <div class="clinic-empty-state">

                        <div>!</div>

                        <h3>
                            Unable to load doctors
                        </h3>

                        <p>
                            Please check the
                            clinic API.
                        </p>

                    </div>

                `;

            }


            showMessage(
                "Unable to load doctors."
            );

        }

    }


    /* =========================================
       RENDER DOCTORS
    ========================================= */

    function renderDoctors(list) {

        if (!doctorsList) {
            return;
        }


        if (!list.length) {

            doctorsList.innerHTML = `

                <div class="clinic-empty-state">

                    <div>—</div>

                    <h3>
                        No doctors found
                    </h3>

                    <p>
                        Registered doctors will
                        appear here.
                    </p>

                </div>

            `;

            return;

        }


        doctorsList.innerHTML =
            list
                .map(
                    doctor =>
                        createDoctorCard(
                            doctor
                        )
                )
                .join("");

    }


    /* =========================================
       CREATE DOCTOR CARD
    ========================================= */

    function createDoctorCard(doctor) {

        const name =
            doctor.name ||
            doctor.fullName ||
            doctor.doctorName ||
            "Doctor";


        const email =
            doctor.email ||
            "No email";


        const specialization =
            doctor.specialization ||
            doctor.speciality ||
            doctor.department ||
            "Medical Professional";


        const experience =
            doctor.experience ||
            "Not specified";


        const status =
            doctor.status ||
            doctor.availability ||
            "Active";


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
                        ${escapeHTML(
                            specialization
                        )}
                    </p>

                    <span>
                        ${escapeHTML(email)}
                    </span>

                </div>


                <div class="clinic-doctor-details">

                    <div>

                        <small>
                            EXPERIENCE
                        </small>

                        <strong>
                            ${escapeHTML(
                                String(
                                    experience
                                )
                            )}
                        </strong>

                    </div>


                    <div>

                        <small>
                            STATUS
                        </small>

                        <strong>
                            ${escapeHTML(
                                String(status)
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

                    renderDoctors(doctors);

                    return;

                }


                const filtered =
                    doctors.filter(
                        doctor => {

                            const name =
                                doctor.name ||
                                doctor.fullName ||
                                "";


                            const email =
                                doctor.email ||
                                "";


                            const specialization =
                                doctor.specialization ||
                                doctor.speciality ||
                                doctor.department ||
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

                                String(
                                    specialization
                                )
                                    .toLowerCase()
                                    .includes(search)

                            );

                        }
                    );


                renderDoctors(filtered);

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
            return "DR";
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

        await loadDoctors();

    }


    initialize();

});