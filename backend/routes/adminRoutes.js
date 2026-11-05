const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getDoctors,
    createDoctor,
    getPatients,
    getAppointments
} = require("../controllers/adminController");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];

router.get("/doctors", ...adminOnly, getDoctors);
router.post("/doctors", ...adminOnly, createDoctor);
router.get("/patients", ...adminOnly, getPatients);
router.get("/appointments", ...adminOnly, getAppointments);

module.exports = router;
