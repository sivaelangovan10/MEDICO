const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const populateAppointment = query =>
    query
        .populate("patient", "name email phone")
        .populate("doctor", "name specialization");

router.post("/", protect, authorize("patient"), async (req, res) => {
    try {
        const { doctor, appointmentDate, appointmentTime, reason } = req.body;

        if (!doctor || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Doctor, date and time are required."
            });
        }

        const parsedDate = new Date(appointmentDate);
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid appointment date."
            });
        }

        parsedDate.setHours(0, 0, 0, 0);

        const doctorRecord = await Doctor.findById(doctor);
        if (!doctorRecord) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        if (!doctorRecord.available) {
            return res.status(400).json({
                success: false,
                message: "This doctor is currently unavailable."
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctorRecord._id,
            appointmentDate: parsedDate,
            appointmentTime: String(appointmentTime).trim(),
            status: { $in: ["pending", "confirmed"] }
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "That appointment time is already booked."
            });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorRecord._id,
            appointmentDate: parsedDate,
            appointmentTime: String(appointmentTime).trim(),
            reason: String(reason || "").trim()
        });

        const populated = await populateAppointment(
            Appointment.findById(appointment._id)
        );

        return res.status(201).json({
            success: true,
            message: "Appointment created successfully.",
            appointment: populated
        });
    } catch (error) {
        console.error("Create appointment error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create appointment."
        });
    }
});

router.get("/patient", protect, authorize("patient"), async (req, res) => {
    try {
        const appointments = await populateAppointment(
            Appointment.find({ patient: req.user.id })
                .sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 })
        );

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error("Patient appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load your appointments."
        });
    }
});

router.get("/doctor", protect, authorize("doctor"), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found."
            });
        }

        const appointments = await populateAppointment(
            Appointment.find({ doctor: doctor._id })
                .sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 })
        );

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error("Doctor appointment list error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load appointments."
        });
    }
});

router.patch("/:id/status", protect, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["pending", "confirmed", "rejected", "completed", "cancelled"];

        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status."
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ userId: req.user.id });

            if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot update this appointment."
                });
            }
        } else if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update appointments."
            });
        }

        appointment.status = status;
        await appointment.save();

        const populated = await populateAppointment(
            Appointment.findById(appointment._id)
        );

        return res.json({
            success: true,
            message: "Appointment status updated.",
            appointment: populated
        });
    } catch (error) {
        console.error("Update appointment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update appointment."
        });
    }
});

router.patch("/:id/cancel", protect, authorize("patient"), async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (!["pending", "confirmed"].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: "This appointment can no longer be cancelled."
            });
        }

        appointment.status = "cancelled";
        await appointment.save();

        const populated = await populateAppointment(
            Appointment.findById(appointment._id)
        );

        return res.json({
            success: true,
            message: "Appointment cancelled successfully.",
            appointment: populated
        });
    } catch (error) {
        console.error("Cancel appointment error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to cancel appointment."
        });
    }
});

router.get("/", protect, authorize("admin"), async (req, res) => {
    try {
        const appointments = await populateAppointment(
            Appointment.find()
                .sort({ appointmentDate: 1, appointmentTime: 1, createdAt: -1 })
        );

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error("Admin appointment list error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load appointments."
        });
    }
});

module.exports = router;
