const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select("-userId")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error("Admin doctors error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve doctors."
        });
    }
};

const createDoctor = async (req, res) => {
    let createdUser = null;

    try {
        const {
            name,
            email,
            password,
            phone,
            specialization,
            department,
            qualification,
            experience,
            licenseNumber,
            room,
            bio
        } = req.body || {};

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !specialization ||
            !department ||
            !qualification ||
            !licenseNumber
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, phone, password, specialization, department, qualification and license number are required."
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const numericExperience =
            experience === "" || experience == null
                ? 0
                : Number(experience);

        if (!Number.isFinite(numericExperience) || numericExperience < 0) {
            return res.status(400).json({
                success: false,
                message: "Experience must be a valid non-negative number."
            });
        }

        const passwordHash = await bcrypt.hash(
            String(password),
            12
        );

        createdUser = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password: passwordHash,
            phone: String(phone).trim(),
            role: "doctor"
        });

        const doctor = await Doctor.create({
            userId: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            phone: createdUser.phone,
            specialization: String(specialization).trim(),
            department: String(department).trim(),
            qualification: String(qualification).trim(),
            experience: numericExperience,
            licenseNumber: String(licenseNumber).trim(),
            room: String(room || "").trim(),
            about: String(bio || "").trim(),
            available: true
        });

        return res.status(201).json({
            success: true,
            message: "Doctor account created successfully.",
            doctor
        });
    } catch (error) {
        console.error("Create doctor error:", error);

        if (createdUser?._id) {
            try {
                await User.findByIdAndDelete(createdUser._id);
            } catch (cleanupError) {
                console.error(
                    "Doctor account cleanup error:",
                    cleanupError
                );
            }
        }

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A doctor account or profile with the same unique value already exists."
            });
        }

        if (error?.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor information.",
                errors: Object.values(error.errors).map(item => item.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create doctor account."
        });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: "patient" })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error("Admin patients error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve patients."
        });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patient", "name email phone")
            .populate("doctor", "name specialization email")
            .sort({
                appointmentDate: 1,
                appointmentTime: 1,
                createdAt: -1
            });

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error("Admin appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve appointments."
        });
    }
};

module.exports = {
    getDoctors,
    createDoctor,
    getPatients,
    getAppointments
};
