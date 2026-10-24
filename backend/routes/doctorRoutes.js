const express = require("express");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const doctorOnly = [protect, authorize("doctor")];

// Public doctor directory
router.get("/", async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        return res.json({ success: true, count: doctors.length, doctors });
    } catch (error) {
        console.error("Get doctors error:", error);
        return res.status(500).json({ success: false, message: "Unable to retrieve doctors." });
    }
});

router.get("/profile/me", ...doctorOnly, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
        return res.json({ success: true, doctor });
    } catch (error) {
        console.error("Doctor profile error:", error);
        return res.status(500).json({ success: false, message: "Unable to load doctor profile." });
    }
});

router.put("/profile", ...doctorOnly, async (req, res) => {
    try {
        const {
            name, email, phone, specialization, experience,
            licenseNumber, department, room, bio
        } = req.body;

        const normalizedEmail = String(email || "").trim().toLowerCase();
        if (!name || !normalizedEmail) {
            return res.status(400).json({ success: false, message: "Name and email are required." });
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ success: false, message: "Doctor account not found." });

        const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
        if (duplicate) return res.status(409).json({ success: false, message: "That email is already in use." });

        currentUser.name = name.trim();
        currentUser.email = normalizedEmail;
        currentUser.phone = String(phone || "").trim();
        await currentUser.save();

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                name: name.trim(),
                email: normalizedEmail,
                phone: String(phone || "").trim(),
                specialization: String(specialization || "").trim(),
                experience: Number(experience) || 0,
                licenseNumber: String(licenseNumber || "").trim(),
                department: String(department || "").trim(),
                room: String(room || "").trim(),
                about: String(bio || "").trim()
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.json({ success: true, message: "Profile updated successfully.", doctor });
    } catch (error) {
        console.error("Doctor profile update error:", error);
        return res.status(500).json({ success: false, message: "Unable to update doctor profile." });
    }
});

router.get("/schedule/me", ...doctorOnly, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id }).select("schedule available");
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
        return res.json({ success: true, schedule: doctor.schedule || [], available: doctor.available });
    } catch (error) {
        console.error("Doctor schedule error:", error);
        return res.status(500).json({ success: false, message: "Unable to load schedule." });
    }
});

router.put("/schedule", ...doctorOnly, async (req, res) => {
    try {
        if (!Array.isArray(req.body.schedule)) {
            return res.status(400).json({ success: false, message: "Schedule must be an array." });
        }
        const schedule = req.body.schedule.map(day => ({
            day: String(day.day || "").toLowerCase(),
            enabled: Boolean(day.enabled),
            start: String(day.start || ""),
            end: String(day.end || "")
        }));
        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            { schedule },
            { new: true, runValidators: true }
        );
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
        return res.json({ success: true, message: "Schedule updated successfully.", schedule: doctor.schedule });
    } catch (error) {
        console.error("Schedule update error:", error);
        return res.status(500).json({ success: false, message: "Unable to update schedule." });
    }
});


router.get("/appointments", ...doctorOnly, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate("patient", "name email phone")
            .populate("doctor", "name specialization")
            .sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 });
        return res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error("Doctor appointments error:", error);
        return res.status(500).json({ success: false, message: "Unable to load appointments." });
    }
});

router.get("/appointments/me", ...doctorOnly, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate("patient", "name email phone")
            .populate("doctor", "name specialization")
            .sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 });
        return res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error("Doctor appointments error:", error);
        return res.status(500).json({ success: false, message: "Unable to load appointments." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });
        return res.json({ success: true, doctor });
    } catch (error) {
        console.error("Get doctor error:", error);
        return res.status(500).json({ success: false, message: "Unable to retrieve doctor." });
    }
});


module.exports = router;
