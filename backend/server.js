const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");




const app = express();





app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );
});

/* ===============================
   MIDDLEWARE
================================ */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());


/* ===============================
   TEST ROUTE
================================ */

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "MEDICO backend is running"
    });

});


/* ===============================
   ROOT ROUTE
================================ */


connectDB();

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/doctors",
    doctorRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/appointments",
    appointmentRoutes
);

/* ===============================
   API 404 + ERROR HANDLING
================================ */

app.use("/api", (req, res) => {
    return res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

app.use((error, req, res, next) => {
    console.error("Unhandled server error:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

/* ===============================
   START SERVER
================================ */

/*app.listen(PORT, () => {

    console.log(
        `MEDICO backend running on http://localhost:${PORT}`
    );

});
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`MEDICO backend running on port ${PORT}`);
});