const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const phone =
            document.getElementById("registerPhone").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById(
                "registerConfirmPassword"
            ).value;

        const terms =
            document.getElementById("registerTerms").checked;


        /* ===============================
           VALIDATION
        =============================== */

        if (!name || !email || !password) {

            alert(
                "Please fill in all required fields."
            );

            return;
        }


        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;
        }


        if (!terms) {

            alert(
                "Please accept the terms and privacy policy."
            );

            return;
        }


        /* ===============================
           DISABLE BUTTON
        =============================== */

        const submitButton =
            registerForm.querySelector(
                'button[type="submit"]'
            );

        const originalText =
            submitButton.innerHTML;


        submitButton.disabled = true;

        submitButton.innerHTML =
            "Creating account...";


        /* ===============================
           SEND TO BACKEND
        =============================== */

        try {

            const response = await fetch(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name,

                        email,

                        password,

                        phone

                    })
                }
            );


            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }


            /* ===============================
               ERROR RESPONSE
            =============================== */

            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed."
                );

                return;
            }


            /* ===============================
               SUCCESS
            =============================== */

            alert(
                "Account created successfully."
            );


            window.location.href =
                "patient-login.html";


        }

        catch (error) {

            console.error(
                "Registration error:",
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