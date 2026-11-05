document.addEventListener("DOMContentLoaded", () => {

    const API_URL =
        "/api";

    const form =
        document.getElementById(
            "adminLoginForm"
        );

    const emailInput =
        document.getElementById(
            "adminEmail"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );

    const loginButton =
        document.getElementById(
            "adminLoginButton"
        );

    const message =
        document.getElementById(
            "adminLoginMessage"
        );


    function showMessage(text) {

        message.textContent = text;

    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                showMessage(
                    "Enter your email and password."
                );

                return;
            }


            loginButton.disabled = true;

            loginButton.textContent =
                "Signing in...";

            showMessage("");


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/admin-login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const text = await response.text();
                let data = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch {
                    data = {};
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Invalid administrator credentials."
                    );

                }


                /*
                 * The backend should return the
                 * authenticated user.
                 */

                const user =
                    data.user ||
                    data.admin ||
                    data;


                /*
                 * Prevent a doctor/patient account
                 * from entering the clinic dashboard.
                 */

                const role =
                    String(
                        user.role || ""
                    ).toLowerCase();


                if (role !== "admin") {

                    throw new Error(
                        "This account does not have administrator access."
                    );

                }


                window.location.href =
                    "/pages/dashboard/clinic-dashboard.html";


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Login failed."
                );


                loginButton.disabled = false;

                loginButton.textContent =
                    "Sign in to dashboard";

            }

        }
    );

});