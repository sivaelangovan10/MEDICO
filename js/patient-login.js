async function readJson(response) {
  const text = await response.text();

  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", error);
    return {};
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patientLoginForm");
  const emailInput = document.getElementById("patientEmail");
  const passwordInput = document.getElementById("patientPassword");
  const loginButton = document.getElementById("patientLoginButton");
  const message = document.getElementById("patientLoginMessage");
  const togglePassword = document.getElementById("togglePatientPassword");
  const forgotPasswordButton = document.getElementById("forgotPatientPasswordButton");

  const showMessage = (text, type = "") => {
    message.textContent = text;
    message.className = "login-message";
    if (type) message.classList.add(type);
  };

  togglePassword?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide" : "Show";
    togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });

  forgotPasswordButton?.addEventListener("click", () => {
    showMessage("Please contact the clinic administrator to reset your password.", "error");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      showMessage("Please enter your email address.", "error");
      emailInput.focus();
      return;
    }

    if (!password) {
      showMessage("Please enter your password.", "error");
      passwordInput.focus();
      return;
    }

    loginButton.disabled = true;
    const buttonText = loginButton.querySelector("span");
    const originalText = buttonText?.textContent || "Sign in";
    if (buttonText) buttonText.textContent = "Signing in...";
    showMessage("");

    try {
      const response = await fetch("/api/auth/patient-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (data.user?.role !== "patient") {
        throw new Error("This account is not a patient account.");
      }

      window.location.href = "/pages/patient-dashboard.html";
    } catch (error) {
      console.error("Patient login error:", error);
      showMessage(error.message || "Unable to connect to the MEDICO server.", "error");
    } finally {
      loginButton.disabled = false;
      if (buttonText) buttonText.textContent = originalText;
    }
  });
});
