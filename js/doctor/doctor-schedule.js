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

    const scheduleContainer =
        document.getElementById("weeklySchedule");

    const saveButton =
        document.getElementById("saveScheduleButton");

    const message =
        document.getElementById("scheduleMessage");

    const scheduleStatus =
        document.getElementById("scheduleStatus");

    const scheduleSummaryText =
        document.getElementById("scheduleSummaryText");

    const logoutButton =
        document.getElementById("doctorLogoutButton");

    const doctorName =
        document.getElementById("doctorName");

    const doctorSpecialization =
        document.getElementById("doctorSpecialization");


    /*
     * No sample schedule is created here.
     * Everything is loaded from the backend.
     */

    let schedule = [];


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
       LOAD SCHEDULE
    ========================================= */

    async function loadSchedule() {

        try {

            const response = await fetch(
                "/api/doctors/schedule",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (!response.ok) {

                /*
                 * If the schedule endpoint does not
                 * exist yet, leave the UI empty.
                 * We do NOT create fake data.
                 */

                if (response.status === 404) {

                    schedule = [];

                    renderSchedule();

                    return;

                }


                throw new Error(
                    "Unable to load your schedule."
                );

            }


            const data =
                await readJson(response);


            if (Array.isArray(data)) {

                schedule = data;

            }

            else if (
                Array.isArray(data.schedule)
            ) {

                schedule =
                    data.schedule;

            }

            else {

                schedule = [];

            }


            renderSchedule();

        }

        catch (error) {

            console.error(
                "Schedule loading error:",
                error
            );


            schedule = [];

            renderSchedule();

        }

    }


    /* =========================================
       RENDER SCHEDULE
    ========================================= */

    function renderSchedule() {

        if (!scheduleContainer) {
            return;
        }


        const scheduleMap =
            new Map();


        schedule.forEach(day => {

            const dayName =
                String(
                    day.day ||
                    day.dayOfWeek ||
                    ""
                ).toLowerCase();


            if (!dayName) {
                return;
            }


            scheduleMap.set(
                dayName,
                day
            );

        });


        const dayElements =
            scheduleContainer.querySelectorAll(
                ".schedule-day"
            );


        dayElements.forEach(dayElement => {

            const dayName =
                dayElement.dataset.day;


            const savedDay =
                scheduleMap.get(dayName);


            const checkbox =
                dayElement.querySelector(
                    ".schedule-enabled"
                );


            const startInput =
                dayElement.querySelector(
                    ".schedule-start"
                );


            const endInput =
                dayElement.querySelector(
                    ".schedule-end"
                );


            if (!savedDay) {

                checkbox.checked = false;

                startInput.value = "";

                endInput.value = "";

                return;

            }


            checkbox.checked =
                Boolean(
                    savedDay.enabled
                );


            startInput.value =
                savedDay.startTime ||
                savedDay.start ||
                "";


            endInput.value =
                savedDay.endTime ||
                savedDay.end ||
                "";

        });


        updateScheduleSummary();

    }


    /* =========================================
       COLLECT SCHEDULE
    ========================================= */

    function collectSchedule() {

        if (!scheduleContainer) {
            return [];
        }


        const dayElements =
            scheduleContainer.querySelectorAll(
                ".schedule-day"
            );


        const result = [];


        dayElements.forEach(dayElement => {

            const day =
                dayElement.dataset.day;


            const enabled =
                dayElement.querySelector(
                    ".schedule-enabled"
                ).checked;


            const startTime =
                dayElement.querySelector(
                    ".schedule-start"
                ).value;


            const endTime =
                dayElement.querySelector(
                    ".schedule-end"
                ).value;


            /*
             * Disabled days are still sent to the
             * backend so the doctor can turn off
             * previously configured availability.
             */

            result.push({
                day,
                enabled,
                startTime,
                endTime
            });

        });


        return result;

    }


    /* =========================================
       VALIDATE
    ========================================= */

    function validateSchedule(data) {

        for (const day of data) {

            if (!day.enabled) {
                continue;
            }


            if (!day.startTime || !day.endTime) {

                return {
                    valid: false,

                    message:
                        `Please select both start and end time for ${formatDay(day.day)}.`
                };

            }


            if (
                day.startTime >=
                day.endTime
            ) {

                return {
                    valid: false,

                    message:
                        `${formatDay(day.day)} must have an end time after the start time.`
                };

            }

        }


        return {
            valid: true
        };

    }


    /* =========================================
       SAVE SCHEDULE
    ========================================= */

    async function saveSchedule() {

        const data =
            collectSchedule();


        const validation =
            validateSchedule(data);


        if (!validation.valid) {

            showMessage(
                validation.message,
                "error"
            );

            return;

        }


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        showMessage("");


        try {

            const response = await fetch(
                "/api/doctors/schedule",
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        schedule: data
                    })
                }
            );


            const result =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to save schedule."
                );

            }


            schedule =
                Array.isArray(
                    result.schedule
                )
                    ? result.schedule
                    : data;


            renderSchedule();


            showMessage(
                "Schedule saved successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Schedule save error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to save your schedule.",
                "error"
            );

        }

        finally {

            if (saveButton) {

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save schedule";

            }

        }

    }


    /* =========================================
       SUMMARY
    ========================================= */

    function updateScheduleSummary() {

        const enabledDays =
            collectSchedule()
                .filter(day => day.enabled);


        if (!enabledDays.length) {

            if (scheduleStatus) {

                scheduleStatus.textContent =
                    "Not configured";

            }


            if (scheduleSummaryText) {

                scheduleSummaryText.textContent =
                    "No working days are currently configured.";

            }


            return;

        }


        const dayNames =
            enabledDays.map(
                day => formatDay(day.day)
            );


        if (scheduleStatus) {

            scheduleStatus.textContent =
                `${enabledDays.length} working ${
                    enabledDays.length === 1
                        ? "day"
                        : "days"
                }`;

        }


        if (scheduleSummaryText) {

            scheduleSummaryText.textContent =
                dayNames.join(", ");

        }

    }


    /* =========================================
       FORMAT DAY
    ========================================= */

    function formatDay(day) {

        if (!day) {
            return "";
        }


        return (
            day.charAt(0).toUpperCase() +
            day.slice(1)
        );

    }


    /* =========================================
       DAY CHANGE EVENTS
    ========================================= */

    if (scheduleContainer) {

        scheduleContainer.addEventListener(
            "change",
            event => {

                if (
                    event.target.matches(
                        ".schedule-enabled"
                    )
                ) {

                    updateScheduleSummary();

                }

            }
        );

    }


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
       INITIALIZE
    ========================================= */

    async function initialize() {

        showMessage(
            "Loading schedule..."
        );


        await loadDoctor();

        await loadSchedule();


        showMessage("");

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSchedule
        );

    }


    initialize();

});