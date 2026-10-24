const express = require("express");

const {
    registerUser,
    loginUser,
    loginAdmin,
    loginDoctor,
    loginPatient,
    logoutUser,
    getCurrentUser
} = require("../controllers/authController");

const {
    protect
} = require("../middleware/authMiddleware");


const router = express.Router();


/* =====================================================
   REGISTER
===================================================== */

router.post(
    "/register",
    registerUser
);


/* =====================================================
   LOGIN
===================================================== */

router.post(
    "/login",
    loginUser
);


/* =====================================================
   ROLE-SPECIFIC LOGIN
===================================================== */

router.post(
    "/admin-login",
    loginAdmin
);

router.post(
    "/doctor-login",
    loginDoctor
);

router.post(
    "/patient-login",
    loginPatient
);


/* =====================================================
   LOGOUT
===================================================== */

router.post(
    "/logout",
    logoutUser
);


/* =====================================================
   CURRENT USER
===================================================== */

router.get(
    "/me",
    protect,
    getCurrentUser
);


module.exports = router;