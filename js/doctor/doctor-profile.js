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
        document.getElementById("doctorProfileForm");

    const saveButton =
        document.getElementById("saveProfileButton");

    const resetButton =
        document.getElementById("resetProfileButton");

    const message =
        document.getElementById("profileMessage");

    const nameInput =
        document.getElementById("doctorFullName");

    const emailInput =
        document.getElementById("doctorEmail");

    const phoneInput =
        document.getElementById("doctorPhone");

    const specializationInput =
        document.getElementById(
            "doctorSpecializationInput"
        );

    const experienceInput =
        document.getElementById(
            "doctorExperience"
        );

    const licenseInput =
        document.getElementById(
            "doctorLicense"
        );

    const departmentInput =
        document.getElementById(
            "doctorDepartment"
        );

    const roomInput =
        document.getElementById(
            "doctorRoom"
        );

    const bioInput =
        document.getElementById("doctorBio");


    const headerName =
        document.getElementById(
            "headerDoctorName"
        );

    const headerSpecialization =
        document.getElementById(
            "headerDoctorSpecialization"
        );

    const headerAvatar =
        document.getElementById(
            "headerDoctorAvatar"
        );

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );

    const profileDisplayName =
        document.getElementById(
            "profileDisplayName"
        );

    const profileDisplaySpecialization =
        document.getElementById(
            "profileDisplaySpecialization"
        );

    const logoutButton =
        document.getElementById(
            "doctorLogoutButton"
        );


    /* =========================================
       MESSAGE
    ========================================= */

    function showMessage(
        text,
        type = ""
    ) {

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
       UPDATE DISPLAY
    ========================================= */

    function updateProfileDisplay(
        doctor
    ) {

        const name =
            doctor.name ||
            doctor.fullName ||
            doctor.doctorName ||
            "Doctor";


        const specialization =
            doctor.specialization ||
            doctor.speciality ||
            doctor.department ||
            "Medical Professional";


        const initials =
            getInitials(name);


        if (headerName) {

            headerName.textContent =
                name;

        }


        if (headerSpecialization) {

            headerSpecialization.textContent =
                specialization;

        }


        if (headerAvatar) {

            headerAvatar.textContent =
                initials;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                initials;

        }


        if (profileDisplayName) {

            profileDisplayName.textContent =
                name;

        }


        if (profileDisplaySpecialization) {

            profileDisplaySpecialization.textContent =
                specialization;

        }

    }


    /* =========================================
       FILL FORM
    ========================================= */

    function fillForm(
        doctor
    ) {

        if (nameInput) {

            nameInput.value =
                doctor.name ||
                doctor.fullName ||
                doctor.doctorName ||
                "";

        }


        if (emailInput) {

            emailInput.value =
                doctor.email ||
                "";

        }


        if (phoneInput) {

            phoneInput.value =
                doctor.phone ||
                doctor.phoneNumber ||
                "";

        }


        if (specializationInput) {

            specializationInput.value =
                doctor.specialization ||
                doctor.speciality ||
                "";

        }


        if (experienceInput) {

            experienceInput.value =
                doctor.experience ??
                doctor.experienceYears ??
                "";

        }


        if (licenseInput) {

            licenseInput.value =
                doctor.licenseNumber ||
                doctor.license ||
                "";

        }


        if (departmentInput) {

            departmentInput.value =
                doctor.department ||
                "";

        }


        if (roomInput) {

            roomInput.value =
                doctor.room ||
                doctor.consultationRoom ||
                "";

        }


        if (bioInput) {

            bioInput.value =
                doctor.bio ||
                doctor.about ||
                "";

        }

    }


    /* =========================================
       LOAD PROFILE
    ========================================= */

    async function loadProfile() {

        showMessage(
            "Loading profile..."
        );


        try {

            const response =
                await fetch(
                    "/api/doctors/profile/me",
                    {
                        method: "GET",

                        credentials: "include"
                    }
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load doctor profile."
                );

            }


            const doctor =
                data.user ||
                data.doctor ||
                data;


            fillForm(doctor);

            updateProfileDisplay(
                doctor
            );


            showMessage("");

        }

        catch (error) {

            console.error(
                "Profile loading error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to load your profile.",
                "error"
            );

        }

    }


    /* =========================================
       SAVE PROFILE
    ========================================= */

    async function saveProfile(
        event
    ) {

        event.preventDefault();


        const profileData = {

            name:
                nameInput.value.trim(),

            email:
                emailInput.value.trim(),

            phone:
                phoneInput.value.trim(),

            specialization:
                specializationInput.value.trim(),

            experience:
                experienceInput.value
                    ? Number(
                        experienceInput.value
                    )
                    : null,

            licenseNumber:
                licenseInput.value.trim(),

            department:
                departmentInput.value.trim(),

            room:
                roomInput.value.trim(),

            bio:
                bioInput.value.trim()

        };


        if (!profileData.name) {

            showMessage(
                "Please enter your full name.",
                "error"
            );

            nameInput.focus();

            return;

        }


        if (!profileData.email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            emailInput.focus();

            return;

        }


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        showMessage("");


        try {

            const response =
                await fetch(
                    "/api/doctors/profile",
                    {
                        method: "PUT",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                profileData
                            )
                    }
                );


            const data =
                await readJson(response);


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update profile."
                );

            }


            const updatedDoctor =
                data.user ||
                data.doctor ||
                data;


            /*
             * If the backend returns the updated
             * doctor, update the UI immediately.
             */

            if (
                updatedDoctor &&
                typeof updatedDoctor ===
                    "object"
            ) {

                fillForm(
                    updatedDoctor
                );

                updateProfileDisplay(
                    updatedDoctor
                );

            }
            else {

                updateProfileDisplay(
                    profileData
                );

            }


            showMessage(
                "Profile updated successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to update your profile.",
                "error"
            );

        }

        finally {

            if (saveButton) {

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save profile";

            }

        }

    }


    /* =========================================
       RESET
    ========================================= */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                setTimeout(() => {

                    /*
                     * Reset the visual header from
                     * the current form values.
                     */

                    const currentName =
                        nameInput.value.trim() ||
                        "Doctor";


                    const currentSpecialization =
                        specializationInput
                            .value
                            .trim() ||
                        "Medical Professional";


                    updateProfileDisplay({

                        name:
                            currentName,

                        specialization:
                            currentSpecialization

                    });


                    showMessage("");

                }, 0);

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

                                credentials:
                                    "include"
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

    if (form) {

        form.addEventListener(
            "submit",
            saveProfile
        );

    }


    loadProfile();

});