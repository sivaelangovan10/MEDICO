const mongoose = require("mongoose");

const scheduleDaySchema = new mongoose.Schema(
    {
        day: { type: String, required: true },
        enabled: { type: Boolean, default: false },
        start: { type: String, default: "" },
        end: { type: String, default: "" }
    },
    { _id: false }
);

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            sparse: true,
            index: true
        },

        name: { type: String, required: true, trim: true },
        specialization: { type: String, required: true, trim: true },
        qualification: { type: String, trim: true },
        experience: { type: Number, default: 0, min: 0 },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        consultationFee: { type: Number, default: 0, min: 0 },
        available: { type: Boolean, default: true },
        image: { type: String, default: "" },
        about: { type: String, default: "" },
        licenseNumber: { type: String, trim: true, default: "" },
        department: { type: String, trim: true, default: "" },
        room: { type: String, trim: true, default: "" },
        schedule: { type: [scheduleDaySchema], default: [] }
    },
    { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
