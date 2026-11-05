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

    const appointmentsList =
        document.getElementById("appointmentsList");

    const searchInput =
        document.getElementById("appointmentSearch");

    const message =
        document.getElementById("appointmentMessage");

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const logoutButton =
        document.getElementById("clinicLogoutButton");

    let appointments = [];


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
       LOAD APPOINTMENTS
    ========================================= */

    async function loadAppointments() {

        try {

            showMessage(
                "Loading appointments..."
            );

            const response = await fetch(
                `${API_URL}/admin/appointments`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const data = await readJson(response);

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load appointments"
                );

            }

            appointments =
                Array.isArray(data)
                    ? data
                    : (
                        data.appointments ||
                        []
                    );

            renderAppointments(
                appointments
            );

            showMessage("");

        } catch (error) {

            console.error(
                "Appointments loading error:",
                error
            );

            if (appointmentsList) {

                appointmentsList.innerHTML = `

                    <div class="clinic-empty-state">

                        <div>!</div>

                        <h3>
                            Unable to load appointments
                        </h3>

                        <p>
                            Please check the
                            clinic API.
                        </p>

                    </div>

                `;

            }

            showMessage(
                "Unable to load appointments."
            );

        }

    }


    /* =========================================
       RENDER APPOINTMENTS
    ========================================= */

    function renderAppointments(list) {

        if (!appointmentsList) {
            return;
        }


        if (!list.length) {

            appointmentsList.innerHTML = `

                <div class="clinic-empty-state">

                    <div>—</div>

                    <h3>
                        No appointments found
                    </h3>

                    <p>
                        Patient bookings will
                        appear here.
                    </p>

                </div>

            `;

            return;
        }


        appointmentsList.innerHTML =
            list
                .map(
                    appointment =>
                        createAppointmentHTML(
                            appointment
                        )
                )
                .join("");

    }


    /* =========================================
       APPOINTMENT CARD
    ========================================= */

    function createAppointmentHTML(
        appointment
    ) {

        const patientName =
            appointment.patientName ||
            appointment.patient?.name ||
            appointment.patient?.fullName ||
            "Patient";


        const doctorName =
            appointment.doctorName ||
            appointment.doctor?.name ||
            appointment.doctor?.fullName ||
            "Doctor";


        const date =
            appointment.date ||
            appointment.appointmentDate ||
            "Date unavailable";


        const time =
            appointment.time ||
            appointment.appointmentTime ||
            "Time unavailable";


        const status =
            appointment.status ||
            "pending";


        const method =
            appointment.method ||
            appointment.appointmentMethod ||
            "Consultation";


        const statusClass =
            String(status)
                .toLowerCase()
                .replace(/\s+/g, "-");


        return `

            <article
                class="clinic-appointment-item"
            >

                <div>

                    <strong>
                        ${escapeHTML(
                            patientName
                        )}
                    </strong>

                    <span>
                        Patient
                    </span>

                </div>


                <div>

                    <strong>
                        Dr. ${escapeHTML(
                            doctorName
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            method
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(
                            String(date)
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            String(time)
                        )}
                    </span>

                </div>


                <div>

                    <strong
                        class="appointment-status ${escapeHTML(
                            statusClass
                        )}"
                    >
                        ${escapeHTML(
                            String(status)
                        )}
                    </strong>

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

                    renderAppointments(
                        appointments
                    );

                    return;

                }


                const filtered =
                    appointments.filter(
                        appointment => {

                            const patient =
                                appointment.patientName ||
                                appointment.patient?.name ||
                                appointment.patient?.fullName ||
                                "";


                            const doctor =
                                appointment.doctorName ||
                                appointment.doctor?.name ||
                                appointment.doctor?.fullName ||
                                "";


                            const status =
                                appointment.status ||
                                "";


                            const date =
                                appointment.date ||
                                appointment.appointmentDate ||
                                "";


                            return (

                                String(patient)
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(doctor)
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(status)
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                String(date)
                                    .toLowerCase()
                                    .includes(search)

                            );

                        }
                    );


                renderAppointments(
                    filtered
                );

            }
        );

    }


    /* =========================================
       ESCAPE HTML
    ========================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    logoutButton.disabled =
                        true;

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
                 * Update this path if your
                 * existing admin login file
                 * has a different location.
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

        await loadAppointments();

    }


    initialize();

});