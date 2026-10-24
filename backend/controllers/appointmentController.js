const Appointment = require("../models/Appointment");


/* =====================================================
   CREATE APPOINTMENT
===================================================== */

const createAppointment = async (req, res) => {

    try {

        const {
            doctor,
            appointmentDate,
            appointmentTime,
            reason
        } = req.body;


        /* =========================================
           GET PATIENT FROM AUTHENTICATED USER
        ========================================== */

        const patient = req.user.id;


        /* =========================================
           VALIDATE REQUIRED FIELDS
        ========================================== */

        if (
            !doctor ||
            !appointmentDate ||
            !appointmentTime
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor, date and time are required."

            });

        }


        /* =========================================
           CREATE APPOINTMENT
        ========================================== */

        const appointment =
            await Appointment.create({

                patient,

                doctor,

                appointmentDate,

                appointmentTime,

                reason

            });


        /* =========================================
           RETURN POPULATED APPOINTMENT
        ========================================== */

        const populatedAppointment =
            await Appointment.findById(
                appointment._id
            )
            .populate(
                "patient",
                "name email phone"
            )
            .populate(
                "doctor",
                "name specialization"
            );


        return res.status(201).json({

            success: true,

            message:
                "Appointment created successfully.",

            appointment:
                populatedAppointment

        });

    }

    catch (error) {

        console.error(
            "Create appointment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create appointment."

        });

    }

};

/* =====================================================
   GET ALL APPOINTMENTS
===================================================== */

const getAppointments = async (req, res) => {

    try {

        const appointments =
            await Appointment.find()
                .populate(
                    "patient",
                    "name email phone"
                )
                .populate(
                    "doctor",
                    "name specialization"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            count: appointments.length,

            appointments

        });

    }

    catch (error) {

        console.error(
            "Get appointments error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve appointments."

        });

    }

};


/* =====================================================
   GET SINGLE APPOINTMENT
===================================================== */

const getAppointment = async (req, res) => {

    try {

        const appointment =
            await Appointment.findById(
                req.params.id
            )
            .populate(
                "patient",
                "name email phone"
            )
            .populate(
                "doctor",
                "name specialization"
            );


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found."

            });

        }


        res.status(200).json({

            success: true,

            appointment

        });

    }

    catch (error) {

        console.error(
            "Get appointment error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve appointment."

        });

    }

};


/* =====================================================
   UPDATE APPOINTMENT STATUS
===================================================== */

const updateAppointmentStatus =
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "pending",
                "confirmed",
                "rejected",
                "completed",
                "cancelled"

            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid appointment status."

                });

            }


            const appointment =
                await Appointment.findByIdAndUpdate(

                    req.params.id,

                    {
                        status
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                )
                .populate(
                    "patient",
                    "name email phone"
                )
                .populate(
                    "doctor",
                    "name specialization"
                );


            if (!appointment) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Appointment not found."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Appointment status updated.",

                appointment

            });

        }

        catch (error) {

            console.error(
                "Update appointment error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update appointment."

            });

        }

    };


/* =====================================================
   CANCEL APPOINTMENT
===================================================== */

const cancelAppointment =
    async (req, res) => {

        try {

            const appointment =
                await Appointment.findByIdAndUpdate(

                    req.params.id,

                    {
                        status: "cancelled"
                    },

                    {
                        new: true
                    }

                );


            if (!appointment) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Appointment not found."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Appointment cancelled successfully.",

                appointment

            });

        }

        catch (error) {

            console.error(
                "Cancel appointment error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to cancel appointment."

            });

        }

    };


module.exports = {

    createAppointment,

    getAppointments,

    getAppointment,

    updateAppointmentStatus,

    cancelAppointment

};