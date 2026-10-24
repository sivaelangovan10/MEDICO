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

    const message =
        document.getElementById("dashboardMessage");

    const adminName =
        document.getElementById("adminName");

    const adminEmail =
        document.getElementById("adminEmail");

    const totalDoctors =
        document.getElementById("totalDoctors");

    const totalPatients =
        document.getElementById("totalPatients");

    const totalAppointments =
        document.getElementById(
            "totalAppointments"
        );

    const pendingAppointments =
        document.getElementById(
            "pendingAppointments"
        );

    const recentAppointments =
        document.getElementById(
            "recentAppointments"
        );

    const doctorSummary =
        document.getElementById(
            "doctorSummary"
        );

    const patientSummary =
        document.getElementById(
            "patientSummary"
        );

    const logoutButton =
        document.getElementById(
            "clinicLogoutButton"
        );


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

                window.location.href =
                    "/pages/admin/admin-login.html";

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
                "Admin authentication error:",
                error
            );

            return null;

        }

    }


    /* =========================================
       LOAD DASHBOARD DATA
    ========================================= */

    async function loadDashboardData() {

        try {

            showMessage(
                "Loading clinic information..."
            );


            /*
             * These endpoints can be connected
             * to the existing backend as we build
             * the clinic dashboard.
             */

            const [
                doctorsResponse,
                patientsResponse,
                appointmentsResponse
            ] = await Promise.all([

                fetch(
                    `${API_URL}/admin/doctors`,
                    {
                        credentials: "include"
                    }
                ),

                fetch(
                    `${API_URL}/admin/patients`,
                    {
                        credentials: "include"
                    }
                ),

                fetch(
                    `${API_URL}/admin/appointments`,
                    {
                        credentials: "include"
                    }
                )

            ]);


            const doctorsData =
                await readJSON(
                    doctorsResponse
                );

            const patientsData =
                await readJSON(
                    patientsResponse
                );

            const appointmentsData =
                await readJSON(
                    appointmentsResponse
                );


            const doctors =
                getArray(
                    doctorsData,
                    "doctors"
                );


            const patients =
                getArray(
                    patientsData,
                    "patients"
                );


            const appointments =
                getArray(
                    appointmentsData,
                    "appointments"
                );


            updateStatistics(
                doctors,
                patients,
                appointments
            );


            renderDoctorSummary(
                doctors
            );


            renderPatientSummary(
                patients
            );


            renderRecentAppointments(
                appointments
            );


            showMessage("");

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            showMessage(
                "Unable to load clinic information."
            );

        }

    }


    /* =========================================
       READ JSON SAFELY
    ========================================= */

    async function readJSON(response) {

        try {

            return await readJson(response);

        } catch {

            return {};

        }

    }


    /* =========================================
       GET ARRAY
    ========================================= */

    function getArray(data, key) {

        if (Array.isArray(data)) {
            return data;
        }

        if (
            data &&
            Array.isArray(data[key])
        ) {

            return data[key];

        }

        return [];

    }


    /* =========================================
       UPDATE STATISTICS
    ========================================= */

    function updateStatistics(
        doctors,
        patients,
        appointments
    ) {

        if (totalDoctors) {

            totalDoctors.textContent =
                doctors.length;

        }


        if (totalPatients) {

            totalPatients.textContent =
                patients.length;

        }


        if (totalAppointments) {

            totalAppointments.textContent =
                appointments.length;

        }


        const pending =
            appointments.filter(
                appointment => {

                    const status =
                        String(
                            appointment.status ||
                            "pending"
                        ).toLowerCase();

                    return (
                        status === "pending" ||
                        status === "requested"
                    );

                }
            );


        if (pendingAppointments) {

            pendingAppointments.textContent =
                pending.length;

        }

    }


    /* =========================================
       DOCTOR SUMMARY
    ========================================= */

    function renderDoctorSummary(
        doctors
    ) {

        if (!doctorSummary) {
            return;
        }


        if (!doctors.length) {

            doctorSummary.innerHTML = `

                <div class="clinic-summary-item">

                    <strong>0</strong>

                    <span>
                        Registered doctors
                    </span>

                </div>

            `;

            return;

        }


        const availableDoctors =
            doctors.filter(
                doctor => {

                    const status =
                        String(
                            doctor.status ||
                            doctor.availability ||
                            ""
                        ).toLowerCase();

                    return (
                        status === "available" ||
                        status === "active"
                    );

                }
            );


        doctorSummary.innerHTML = `

            <div class="clinic-summary-item">

                <strong>
                    ${doctors.length}
                </strong>

                <span>
                    Total doctors
                </span>

            </div>

            <div class="clinic-summary-item">

                <strong>
                    ${availableDoctors.length}
                </strong>

                <span>
                    Available doctors
                </span>

            </div>

        `;

    }


    /* =========================================
       PATIENT SUMMARY
    ========================================= */

    function renderPatientSummary(
        patients
    ) {

        if (!patientSummary) {
            return;
        }


        patientSummary.innerHTML = `

            <div class="clinic-summary-item">

                <strong>
                    ${patients.length}
                </strong>

                <span>
                    Registered patients
                </span>

            </div>

        `;

    }


    /* =========================================
       RECENT APPOINTMENTS
    ========================================= */

    function renderRecentAppointments(
        appointments
    ) {

        if (!recentAppointments) {
            return;
        }


        if (!appointments.length) {

            recentAppointments.innerHTML = `

                <div class="clinic-empty-state">

                    <div>—</div>

                    <h3>
                        No appointments
                    </h3>

                    <p>
                        Patient bookings will
                        appear here.
                    </p>

                </div>

            `;

            return;

        }


        const recent =
            appointments.slice(0, 5);


        recentAppointments.innerHTML =
            recent
                .map(
                    appointment =>
                        createAppointmentHTML(
                            appointment
                        )
                )
                .join("");

    }


    /* =========================================
       APPOINTMENT HTML
    ========================================= */

    function createAppointmentHTML(
        appointment
    ) {

        const patient =
            appointment.patientName ||
            appointment.patient?.name ||
            "Patient";


        const doctor =
            appointment.doctorName ||
            appointment.doctor?.name ||
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


        return `

            <div class="clinic-appointment-item">

                <div>

                    <strong>
                        ${escapeHTML(patient)}
                    </strong>

                    <span>
                        Dr. ${escapeHTML(doctor)}
                    </span>

                </div>


                <div>

                    <span>
                        ${escapeHTML(
                            String(date)
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            String(time)
                        )}
                    </span>

                </div>


                <strong>
                    ${escapeHTML(
                        String(status)
                    )}
                </strong>

            </div>

        `;

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

        await loadDashboardData();

    }


    initialize();

});