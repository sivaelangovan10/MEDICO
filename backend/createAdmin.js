const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config();

(async () => {
    const email = process.argv[2] || "admin@medico.com";
    const password = process.argv[3] || "Admin@12345";
    const name = process.argv[4] || "MEDICO Administrator";

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const existing = await User.findOne({ email: email.toLowerCase() });
        const hash = await bcrypt.hash(password, 12);

        if (existing) {
            existing.name = name;
            existing.password = hash;
            existing.role = "admin";
            await existing.save();
            console.log(`Admin account updated: ${email}`);
        } else {
            await User.create({ name, email: email.toLowerCase(), password: hash, role: "admin" });
            console.log(`Admin account created: ${email}`);
        }
    } catch (error) {
        console.error("Admin creation failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
