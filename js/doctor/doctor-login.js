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

    const form =
        document.getElementById("doctorLoginForm");

    const emailInput =
        document.getElementById("doctorEmail");

    const passwordInput =
        document.getElementById("doctorPassword");

    const loginButton =
        document.getElementById("doctorLoginButton");

    const message =
        document.getElementById("doctorLoginMessage");

    const togglePassword =
        document.getElementById("togglePassword");

    const forgotPasswordButton =
        document.getElementById("forgotPasswordButton");


    /* =========================================
       MESSAGE
    ========================================= */

    function showMessage(text, type = "") {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.className = "login-message";

        if (type) {
            message.classList.add(type);
        }
    }


    /* =========================================
       PASSWORD VISIBILITY
    ========================================= */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                const isPassword =
                    passwordInput.type === "password";

                passwordInput.type =
                    isPassword
                        ? "text"
                        : "password";

                togglePassword.textContent =
                    isPassword
                        ? "Hide"
                        : "Show";

                togglePassword.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );

            }
        );

    }


    /* =========================================
       FORGOT PASSWORD
    ========================================= */

    if (forgotPasswordButton) {

        forgotPasswordButton.addEventListener(
            "click",
            () => {

                showMessage(
                    "Please contact the clinic administrator to reset your password.",
                    "error"
                );

            }
        );

    }


    /* =========================================
       LOGIN
    ========================================= */

    if (form) {

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    emailInput.value.trim();

                const password =
                    passwordInput.value;


                /* =================================
                   VALIDATION
                ================================= */

                if (!email) {

                    showMessage(
                        "Please enter your email address.",
                        "error"
                    );

                    emailInput.focus();

                    return;
                }


                if (!password) {

                    showMessage(
                        "Please enter your password.",
                        "error"
                    );

                    passwordInput.focus();

                    return;
                }


                /* =================================
                   BUTTON LOADING
                ================================= */

                loginButton.disabled = true;

                const buttonText =
                    loginButton.querySelector("span");

                if (buttonText) {

                    buttonText.textContent =
                        "Signing in...";

                }

                showMessage("");


                /* =================================
                   API REQUEST
                ================================= */

                try {

                    const response =
                        await fetch(
                            "/api/auth/doctor-login",
                            {
                                method: "POST",

                                credentials: "include",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email,
                                    password
                                })
                            }
                        );


                    /* =============================
                       READ RESPONSE
                    ============================= */

                    let data = {};

                    try {

                        data =
                            await readJson(response);

                    } catch {

                        data = {};

                    }


                    /* =============================
                       API ERROR
                    ============================= */

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Invalid email or password."
                        );

                    }


                    /* =============================
                       GET USER
                    ============================= */

                    const user =
                        data.user ||
                        data.doctor ||
                        data;


                    /* =============================
                       CHECK ROLE
                    ============================= */

                    const role =
                        String(
                            user.role || ""
                        ).toLowerCase();


                    /*
                     * If your backend returns a role,
                     * make sure it is doctor.
                     */

                    if (role !== "doctor") {

                        throw new Error(
                            "This account does not have doctor access."
                        );

                    }


                    /* =============================
                       SUCCESS
                    ============================= */

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    /*
                     * Save basic doctor information
                     * for the dashboard.
                     */

                    try {

                        sessionStorage.setItem(
                            "doctorUser",
                            JSON.stringify(user)
                        );

                    } catch (storageError) {

                        console.warn(
                            "Unable to save doctor session:",
                            storageError
                        );

                    }


                    /* =============================
                       REDIRECT
                    ============================= */

                    setTimeout(() => {

                        window.location.href =
                            "doctor-dashboard.html";

                    }, 500);

                }


                /* =================================
                   ERROR
                ================================= */

                catch (error) {

                    console.error(
                        "Doctor login error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to sign in.",
                        "error"
                    );

                }


                /* =================================
                   RESTORE BUTTON
                ================================= */

                finally {

                    loginButton.disabled =
                        false;


                    if (buttonText) {

                        buttonText.textContent =
                            "Sign in";

                    }

                }

            }
        );

    }

});