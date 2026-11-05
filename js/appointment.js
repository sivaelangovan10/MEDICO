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

const appointmentForm =
    document.getElementById("appointmentForm");


/* =====================================================
   LOAD DOCTORS
===================================================== */

const loadDoctors = async () => {

    try {

        const response = await fetch(
            "/api/doctors"
        );


        const data =
            await readJson(response);


        if (!response.ok) {

            console.error(
                data.message ||
                "Unable to load doctors."
            );

            return;

        }


        const doctorSelect =
            document.getElementById("doctor");


        if (!doctorSelect) {
            return;
        }


        /*
         * Keep the placeholder.
         * All doctor options come from MongoDB.
         */

        doctorSelect.innerHTML = `
            <option value="">
                Select a doctor
            </option>
        `;


        data.doctors.forEach((doctor) => {

            const option =
                document.createElement("option");


            option.value =
                doctor._id;


            option.textContent =
                `${doctor.name} — ${doctor.specialization}`;


            doctorSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Doctor loading error:",
            error
        );

    }

};


/* =====================================================
   CREATE APPOINTMENT
===================================================== */

if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const doctor =
                document.getElementById("doctor")
                    .value;

            const appointmentDate =
                document.getElementById(
                    "appointmentDate"
                ).value;

            const appointmentTime =
                document.getElementById(
                    "appointmentTime"
                ).value;

            const reason =
                document.getElementById(
                    "reason"
                ).value.trim();


            /* ===============================
               VALIDATION
            =============================== */

            if (
                !doctor ||
                !appointmentDate ||
                !appointmentTime
            ) {

                alert(
                    "Please complete all required appointment fields."
                );

                return;

            }


            const submitButton =
                appointmentForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                submitButton.innerHTML;


            submitButton.disabled = true;

            submitButton.innerHTML =
                "Booking...";


            try {

                /*
                 * The patient ID is NOT taken
                 * from localStorage.
                 *
                 * The backend will identify
                 * the authenticated patient
                 * from the HTTP-only cookie.
                 */

                const response = await fetch(
                    "/api/appointments",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            doctor,

                            appointmentDate,

                            appointmentTime,

                            reason

                        })

                    }
                );


                const data =
                    await readJson(response);


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to book appointment."
                    );

                    return;

                }


                alert(
                    "Appointment booked successfully."
                );


                appointmentForm.reset();


            } catch (error) {

                console.error(
                    "Appointment error:",
                    error
                );


                alert(
                    "Unable to connect to the MEDICO server."
                );

            } finally {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalText;

            }

        }
    );

}


/* =====================================================
   INITIALIZE
===================================================== */

loadDoctors();