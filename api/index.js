const app = require("../backend/app");
const connectDB = require("../backend/config/db");

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error("Vercel API startup error:", error.message);
        return res.status(500).json({
            success: false,
            message: "The API could not connect to its database. Check the Vercel environment variables and MongoDB Atlas network access."
        });
    }
};
