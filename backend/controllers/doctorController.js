const Doctor = require("../models/Doctor");


/* =====================================================
   GET ALL DOCTORS
===================================================== */

const getDoctors = async (req, res) => {

    try {

        const doctors = await Doctor.find()
            .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: doctors.length,

            doctors

        });

    } catch (error) {

        console.error(
            "Get doctors error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve doctors."

        });

    }

};


/* =====================================================
   GET SINGLE DOCTOR
===================================================== */

const getDoctor = async (req, res) => {

    try {

        const doctor =
            await Doctor.findById(
                req.params.id
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        res.status(200).json({

            success: true,

            doctor

        });

    } catch (error) {

        console.error(
            "Get doctor error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve doctor."

        });

    }

};


module.exports = {

    getDoctors,

    getDoctor

};