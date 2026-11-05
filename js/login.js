const loginForm = document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail")
                .value
                .trim();

        const password =
            document.getElementById("loginPassword")
                .value;


        /* ===============================
           VALIDATION
        =============================== */

        if (!email || !password) {

            alert(
                "Please enter your email and password."
            );

            return;
        }


        /* ===============================
           BUTTON STATE
        =============================== */

        const submitButton =
            loginForm.querySelector(
                'button[type="submit"]'
            );


        const originalText =
            submitButton.innerHTML;


        submitButton.disabled = true;

        submitButton.innerHTML =
            "Signing in...";


        /* ===============================
           LOGIN REQUEST
        =============================== */

        try {

            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email,

                        password

                    })
                }
            );


            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }


            /* ===============================
               ERROR
            =============================== */

            if (!response.ok) {

                alert(
                    data.message ||
                    "Login failed."
                );

                return;
            }


            /* ===============================
               SUCCESS
            =============================== */

            console.log(
                "Authenticated user:",
                data.user
            );


            alert(
                "Login successful."
            );


            /*
             * No localStorage.
             * Authentication is handled by
             * the HTTP-only cookie created
             * by the backend.
             */


            if (data.user.role === "admin") {

                window.location.href =
                    "/pages/dashboard/clinic-dashboard.html";

            }

            else if (data.user.role === "doctor") {

                window.location.href =
                    "/pages/doctors/doctor-dashboard.html";

            }

            else {

                window.location.href =
                    "/pages/patient-dashboard.html";

            }


        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            alert(
                "Unable to connect to the MEDICO server."
            );

        }

        finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalText;

        }

    });

}