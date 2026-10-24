const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");


/* =====================================================
   CREATE AUTHENTICATION COOKIE
===================================================== */

const createAuthCookie = (res, user) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );


    res.cookie(
        "medicoToken",
        token,
        {
            httpOnly: true,

            secure: process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge:
                7 * 24 * 60 * 60 * 1000
        }
    );
};


/* =====================================================
   REGISTER USER
===================================================== */

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required."

            });

        }


        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        const user =
            await User.create({

                name,

                email: normalizedEmail,

                password:
                    hashedPassword,

                phone,

                role: "patient"

            });


        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during registration."

        });

    }

};


/* =====================================================
   LOGIN USER
===================================================== */

const loginUser = async (req, res, requiredRole = null) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const normalizedEmail = String(email).trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        if (!user.password || typeof user.password !== "string") {
            console.error("Login error: user has no valid password hash:", user.email);
            return res.status(500).json({
                success: false,
                message: "This account has no valid password hash. Reset the account password."
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        if (
            requiredRole &&
            user.role !== requiredRole
        ) {
            return res.status(403).json({
                success: false,
                message:
                    requiredRole === "admin"
                        ? "This account does not have administrator access."
                        : "This account does not have doctor access."
            });
        }


        /* Create secure HTTP-only cookie */

        createAuthCookie(
            res,
            user
        );


        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

};


/* =====================================================
   LOGOUT USER
===================================================== */

const logoutUser = (req, res) => {

    res.clearCookie(
        "medicoToken",
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax"
        }
    );


    res.status(200).json({

        success: true,

        message:
            "Logged out successfully."

    });

};

/* =====================================================
   GET CURRENT USER
===================================================== */

const getCurrentUser = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        ).select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        res.status(200).json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(
            "Get current user error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to retrieve user."

        });

    }

};

const loginAdmin = (req, res) =>
    loginUser(req, res, "admin");

const loginDoctor = (req, res) =>
    loginUser(req, res, "doctor");

const loginPatient = (req, res) =>
    loginUser(req, res, "patient");

module.exports = {
    registerUser,
    loginUser,
    loginAdmin,
    loginDoctor,
    loginPatient,
    logoutUser,
    getCurrentUser
};