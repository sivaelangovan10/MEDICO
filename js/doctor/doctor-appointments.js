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

    const container =
        document.getElementById("appointmentsContainer");

    const message =
        document.getElementById("appointmentMessage");

    const logoutButton =
        document.getElementById("doctorLogoutButton");

    const doctorName =
        document.getElementById("doctorName");

    const doctorSpecialization =
        document.getElementById("doctorSpecialization");


    let appointments = [];

    let currentFilter = "all";


    /* =========================================
       MESSAGE
    ========================================= */

    function showMessage(text, type = "") {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.className =
            "doctor-dashboard-message";

        if (type) {
            message.classList.add(type);
        }
    }


    /* =========================================
       LOAD DOCTOR
    ========================================= */

    async function loadDoctor() {

        try {

            const response = await fetch(
                "/api/doctors/profile/me",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Doctor session could not be verified."
                );

            }


            const data =
                await readJson(response);


            const doctor =
                data.user || data;


            if (doctorName) {

                doctorName.textContent =
                    doctor.name ||
                    doctor.fullName ||
                    doctor.doctorName ||
                    "Doctor";

            }


            if (doctorSpecialization) {

                doctorSpecialization.textContent =
                    doctor.specialization ||
                    doctor.speciality ||
                    doctor.department ||
                    "Medical Professional";

            }

        }

        catch (error) {

            console.error(
                "Doctor loading error:",
                error
            );

        }

    }


    /* =========================================
       LOAD APPOINTMENTS
    ========================================= */

    async function loadAppointments() {

        renderLoading();

        try {

            const response = await fetch(
                "/api/appointments/doctor",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (!response.ok) {

                let errorMessage =
                    "Unable to load appointments.";

                try {

                    const errorData =
                        await readJson(response);

                    if (errorData.message) {
                        errorMessage =
                            errorData.message;
                    }

                } catch (error) {

                    console.error(
                        "Error reading appointment error response:",
                        error
                    );

                }

                throw new Error(errorMessage);

            }


            const data =
                await readJson(response);


            /*
             * Expected backend response:
             *
             * {
             *   success: true,
             *   count: 2,
             *   appointments: [...]
             * }
             */


            if (Array.isArray(data)) {

                appointments = data;

            }

            else if (
                Array.isArray(
                    data.appointments
                )
            ) {

                appointments =
                    data.appointments;

            }

            else {

                appointments = [];

            }


            renderAppointments();

        }

        catch (error) {

            console.error(
                "Appointment API error:",
                error
            );


            appointments = [];


            renderError(
                error.message ||
                "Unable to load appointments."
            );

        }

    }


    /* =========================================
       LOADING UI
    ========================================= */

    function renderLoading() {

        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="appointment-loading">

                <div class="loading-circle"></div>

                <p>
                    Loading appointments...
                </p>

            </div>

        `;

    }


    /* =========================================
       ERROR UI
    ========================================= */

    function renderError(text) {

        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="appointment-empty">

                <div class="appointment-empty-icon">
                    !
                </div>

                <h3>
                    Unable to load appointments
                </h3>

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>

        `;

    }


    /* =========================================
       FILTER
    ========================================= */

    function filterAppointments() {

        if (currentFilter === "all") {

            return appointments;

        }


        return appointments.filter(
            appointment => {

                const status =
                    normalizeStatus(
                        appointment.status
                    );


                return status ===
                    currentFilter;

            }
        );

    }


    /* =========================================
       RENDER APPOINTMENTS
    ========================================= */

    function renderAppointments() {

        if (!container) {
            return;
        }


        const filteredAppointments =
            filterAppointments();


        if (!filteredAppointments.length) {

            container.innerHTML = `

                <div class="appointment-empty">

                    <div class="appointment-empty-icon">
                        —
                    </div>

                    <h3>
                        No appointments found
                    </h3>

                    <p>
                        There are currently no
                        appointments in this category.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            filteredAppointments
                .map(
                    appointment =>
                        createAppointmentCard(
                            appointment
                        )
                )
                .join("");


        attachAppointmentActions();

    }


    /* =========================================
       APPOINTMENT CARD
    ========================================= */

    function createAppointmentCard(
        appointment
    ) {

        const patientName =
            appointment.patient?.name ||
            appointment.patientName ||
            appointment.user?.name ||
            "Patient";


        const patientEmail =
            appointment.patient?.email ||
            appointment.patientEmail ||
            appointment.user?.email ||
            "";


        const date =
            getAppointmentDate(
                appointment
            );


        const formattedDate =
            date
                ? date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "Date unavailable";


        const time =
            appointment.time ||
            appointment.appointmentTime ||
            "Time unavailable";


        const status =
            normalizeStatus(
                appointment.status
            );


        const appointmentId =
            appointment._id ||
            appointment.id;


        const initials =
            getInitials(patientName);


        return `

            <article
                class="doctor-full-appointment"
                data-appointment-id="${escapeHTML(
                    appointmentId || ""
                )}"
            >

                <div class="appointment-patient">

                    <div class="patient-avatar">
                        ${escapeHTML(initials)}
                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(patientName)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                patientEmail
                            )}
                        </span>

                    </div>

                </div>


                <div class="appointment-date">

                    <strong>
                        ${escapeHTML(formattedDate)}
                    </strong>

                    <span>
                        ${escapeHTML(time)}
                    </span>

                </div>


                <span
                    class="
                        appointment-status
                        ${escapeHTML(status)}
                    "
                >
                    ${escapeHTML(status)}
                </span>


                <div class="appointment-actions">

                    ${
                        status === "pending"
                            ? `

                                <button
                                    type="button"
                                    class="appointment-action accept"
                                    data-action="confirmed"
                                    data-id="${escapeHTML(
                                        appointmentId || ""
                                    )}"
                                >
                                    Accept
                                </button>


                                <button
                                    type="button"
                                    class="appointment-action reject"
                                    data-action="rejected"
                                    data-id="${escapeHTML(
                                        appointmentId || ""
                                    )}"
                                >
                                    Reject
                                </button>

                            `
                            : ""
                    }

                </div>

            </article>

        `;

    }


    /* =========================================
       ATTACH ACTION BUTTONS
    ========================================= */

    function attachAppointmentActions() {

        const buttons =
            container.querySelectorAll(
                "[data-action]"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const appointmentId =
                        button.dataset.id;


                    const newStatus =
                        button.dataset.action;


                    if (!appointmentId) {

                        showMessage(
                            "Appointment ID is missing.",
                            "error"
                        );

                        return;

                    }


                    await updateAppointmentStatus(
                        appointmentId,
                        newStatus,
                        button
                    );

                }
            );

        });

    }


    /* =========================================
       UPDATE APPOINTMENT STATUS
    ========================================= */

    async function updateAppointmentStatus(
        appointmentId,
        status,
        button
    ) {

        const originalText =
            button.textContent;


        button.disabled = true;

        button.textContent =
            "Updating...";


        try {

            const response =
                await fetch(
                    `/api/appointments/${encodeURIComponent(
                        appointmentId
                    )}/status`,
                    {
                        method: "PATCH",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status
                        })
                    }
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update appointment."
                );

            }


            showMessage(
                `Appointment ${status}.`,
                "success"
            );


            await loadAppointments();

        }

        catch (error) {

            console.error(
                "Status update error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to update appointment.",
                "error"
            );


            button.disabled = false;

            button.textContent =
                originalText;

        }

    }


    /* =========================================
       FILTER BUTTONS
    ========================================= */

    const filterButtons =
        document.querySelectorAll(
            ".appointment-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderAppointments();

            }
        );

    });


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled =
                    true;


                try {

                    const response =
                        await fetch(
                            "/api/auth/logout",
                            {
                                method: "POST",
                                credentials: "include"
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Logout failed."
                        );

                    }


                    window.location.href =
                        "/pages/doctors/doctors-login.html";

                }

                catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    showMessage(
                        "Unable to sign out.",
                        "error"
                    );


                    logoutButton.disabled =
                        false;

                }

            }
        );

    }


    /* =========================================
       DATE
    ========================================= */

    function getAppointmentDate(
        appointment
    ) {

        const value =
            appointment.date ||
            appointment.appointmentDate ||
            appointment.appointment_date;


        if (!value) {
            return null;
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    }


    /* =========================================
       STATUS NORMALIZATION
    ========================================= */

    function normalizeStatus(status) {

        const value =
            String(
                status || "pending"
            )
            .trim()
            .toLowerCase();


        if (
            value === "approved" ||
            value === "accepted"
        ) {

            return "confirmed";

        }


        if (
            value === "cancelled" ||
            value === "canceled"
        ) {

            return "rejected";

        }


        return value || "pending";

    }


    /* =========================================
       INITIALS
    ========================================= */

    function getInitials(name) {

        const words =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!words.length) {
            return "P";
        }


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


    /* =========================================
       SECURITY
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
       INITIALIZE
    ========================================= */

    async function initialize() {

        showMessage(
            "Loading appointments..."
        );


        await loadDoctor();

        await loadAppointments();


        showMessage("");

    }


    initialize();

});