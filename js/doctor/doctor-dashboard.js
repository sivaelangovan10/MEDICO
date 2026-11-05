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

    // =========================================
    // ELEMENTS FROM EXISTING DASHBOARD HTML
    // =========================================

    const doctorName =
        document.getElementById("doctorName");

    const doctorSpecialization =
        document.getElementById("doctorSpecialization");

    const profileDoctorName =
        document.getElementById("profileDoctorName");

    const profileDoctorEmail =
        document.getElementById("profileDoctorEmail");

    const todayAppointments =
        document.getElementById("todayAppointments");

    const pendingAppointments =
        document.getElementById("pendingAppointments");

    const upcomingAppointments =
        document.getElementById("upcomingAppointments");

    const doctorAvailability =
        document.getElementById("doctorAvailability");

    const availabilityText =
        document.getElementById("availabilityText");

    const recentAppointments =
        document.getElementById("recentAppointments");

    const dashboardMessage =
        document.getElementById(
            "doctorDashboardMessage"
        );

    const logoutButton =
        document.getElementById(
            "doctorLogoutButton"
        );


    // =========================================
    // MESSAGE
    // =========================================

    function showMessage(text, type = "") {

        if (!dashboardMessage) {
            return;
        }

        dashboardMessage.textContent = text;

        dashboardMessage.className =
            "doctor-dashboard-message";

        if (type) {
            dashboardMessage.classList.add(type);
        }
    }


    // =========================================
    // INITIALS
    // =========================================

    function getInitials(name) {

        if (!name) {
            return "DR";
        }

        const words =
            name.trim().split(/\s+/);

        if (words.length === 1) {
            return words[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }


    // =========================================
    // LOAD CURRENT DOCTOR
    // =========================================

    async function loadDoctor() {

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
                    "/pages/doctors/doctors-login.html";

                return null;
            }

            const data =
                await readJson(response);

            const doctor =
                data.user ||
                data.doctor ||
                data;


            // Check doctor role

            if (
                doctor.role &&
                String(doctor.role).toLowerCase() !==
                "doctor"
            ) {

                showMessage(
                    "Doctor access required.",
                    "error"
                );

                setTimeout(() => {

                    window.location.href =
                        "/pages/doctors/doctors-login.html";

                }, 1000);

                return null;
            }


            let doctorProfile = {};

            try {
                const profileResponse = await fetch(
                    `${API_URL}/doctors/profile/me`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                if (profileResponse.ok) {
                    const profileData = await readJson(profileResponse);
                    doctorProfile =
                        profileData.doctor ||
                        profileData ||
                        {};
                }
            } catch (profileError) {
                console.warn(
                    "Doctor profile loading warning:",
                    profileError
                );
            }

            const mergedDoctor = {
                ...doctor,
                ...doctorProfile
            };

            updateDoctorInformation(
                mergedDoctor
            );

            return mergedDoctor;

        }

        catch (error) {

            console.error(
                "Doctor loading error:",
                error
            );

            window.location.href =
                "/pages/doctors/doctors-login.html";

            return null;
        }
    }


    // =========================================
    // UPDATE DOCTOR INFORMATION
    // =========================================

    function updateDoctorInformation(
        doctor
    ) {

        const name =
            doctor.name ||
            doctor.fullName ||
            doctor.doctorName ||
            "Doctor";


        const email =
            doctor.email ||
            "—";


        const specialization =
            doctor.specialization ||
            doctor.speciality ||
            doctor.department ||
            "Medical Professional";


        // Header

        if (doctorName) {
            doctorName.textContent =
                name;
        }


        if (doctorSpecialization) {
            doctorSpecialization.textContent =
                specialization;
        }


        // Profile card

        if (profileDoctorName) {
            profileDoctorName.textContent =
                name;
        }


        if (profileDoctorEmail) {
            profileDoctorEmail.textContent =
                email;
        }


        // Avatar

        const initials =
            getInitials(name);


        document
            .querySelectorAll(
                ".doctor-avatar, .mini-avatar"
            )
            .forEach(avatar => {

                avatar.textContent =
                    initials;

            });


        // Availability

        updateAvailability(doctor);
    }


    // =========================================
    // AVAILABILITY
    // =========================================

    function updateAvailability(doctor) {

        const available =
            doctor.isAvailable ??
            doctor.available ??
            true;


        const text =
            available
                ? "Available"
                : "Unavailable";


        if (doctorAvailability) {

            doctorAvailability.textContent =
                text;

        }


        if (availabilityText) {

            availabilityText.textContent =
                text;

        }
    }


    // =========================================
    // LOAD APPOINTMENTS
    // =========================================

    async function loadAppointments() {

        try {

            /*
             * This endpoint must exist in your
             * existing doctorRoutes.js.
             */

            const response =
                await fetch(
                    `${API_URL}/doctors/appointments`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            if (!response.ok) {

                console.warn(
                    "Doctor appointments endpoint returned:",
                    response.status
                );

                return [];
            }


            const data =
                await readJson(response);


            const appointments =
                Array.isArray(data)
                    ? data
                    : (
                        data.appointments ||
                        []
                    );


            updateStatistics(
                appointments
            );


            displayRecentAppointments(
                appointments
            );


            return appointments;

        }

        catch (error) {

            console.error(
                "Appointment loading error:",
                error
            );

            return [];
        }
    }


    // =========================================
    // STATISTICS
    // =========================================

    function updateStatistics(
        appointments
    ) {

        const now =
            new Date();

        const today =
            now.toISOString()
                .split("T")[0];


        let todayCount = 0;
        let pendingCount = 0;
        let upcomingCount = 0;


        appointments.forEach(
            appointment => {

                const date =
                    getAppointmentDate(
                        appointment
                    );


                const status =
                    String(
                        appointment.status ||
                        ""
                    ).toLowerCase();


                if (date === today) {

                    todayCount++;

                }


                if (
                    status === "pending" ||
                    status === "requested"
                ) {

                    pendingCount++;

                }


                if (
                    date &&
                    date >= today
                ) {

                    upcomingCount++;

                }

            }
        );


        if (todayAppointments) {

            todayAppointments.textContent =
                todayCount;

        }


        if (pendingAppointments) {

            pendingAppointments.textContent =
                pendingCount;

        }


        if (upcomingAppointments) {

            upcomingAppointments.textContent =
                upcomingCount;

        }
    }


    // =========================================
    // APPOINTMENT DATE
    // =========================================

    function getAppointmentDate(
        appointment
    ) {

        const value =
            appointment.date ||
            appointment.appointmentDate ||
            appointment.bookingDate;


        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (Number.isNaN(date.getTime())) {
            return "";
        }


        return date
            .toISOString()
            .split("T")[0];
    }


    // =========================================
    // DISPLAY RECENT APPOINTMENTS
    // =========================================

    function displayRecentAppointments(
        appointments
    ) {

        if (!recentAppointments) {
            return;
        }


        if (!appointments.length) {

            recentAppointments.innerHTML = `

                <div class="empty-doctor-state">

                    <div class="empty-icon">
                        —
                    </div>

                    <h3>
                        No appointments
                    </h3>

                    <p>
                        Patient appointments will
                        appear here when available.
                    </p>

                </div>

            `;

            return;
        }


        const recentAppointmentsList =
            appointments.slice(0, 5);


        recentAppointments.innerHTML =
            recentAppointmentsList
                .map(
                    appointment =>
                        createAppointmentCard(
                            appointment
                        )
                )
                .join("");
    }


    // =========================================
    // APPOINTMENT CARD
    // =========================================

    function createAppointmentCard(
        appointment
    ) {

        const patientName =
            appointment.patientName ||
            appointment.patient?.name ||
            appointment.user?.name ||
            "Patient";


        const date =
            appointment.date ||
            appointment.appointmentDate ||
            "Date not available";


        const time =
            appointment.time ||
            appointment.appointmentTime ||
            "Time not available";


        const status =
            appointment.status ||
            "Pending";


        const statusClass =
            getStatusClass(status);


        return `

            <div class="doctor-appointment-item">

                <div class="appointment-patient">

                    <strong>
                        ${escapeHTML(
                            patientName
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            String(date)
                        )}
                        •
                        ${escapeHTML(
                            String(time)
                        )}
                    </span>

                </div>


                <div class="
                    appointment-status
                    ${statusClass}
                ">

                    ${escapeHTML(
                        String(status)
                    )}

                </div>

            </div>

        `;
    }


    // =========================================
    // STATUS CLASS
    // =========================================

    function getStatusClass(status) {

        const value =
            String(status)
                .toLowerCase();


        if (
            value === "approved" ||
            value === "accepted" ||
            value === "confirmed"
        ) {

            return "approved";
        }


        if (
            value === "rejected" ||
            value === "cancelled"
        ) {

            return "rejected";
        }


        return "pending";
    }


    // =========================================
    // SECURITY
    // =========================================

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


    // =========================================
    // LOGOUT
    // =========================================

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

                }

                catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }


                window.location.href =
                    "/pages/doctors/doctors-login.html";
            }
        );
    }


    // =========================================
    // INITIALIZE
    // =========================================

    async function initializeDashboard() {

        showMessage(
            "Loading dashboard..."
        );


        const doctor =
            await loadDoctor();


        if (!doctor) {
            return;
        }


        await loadAppointments();


        showMessage("");
    }


    initializeDashboard();

});