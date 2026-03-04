const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

process.env.MONGODB_URI = "mongodb+srv://cybal_admin:boni8338@cybal-capital.zqksvbe.mongodb.net/cybal_capital?retryWrites=true&w=majority&appName=cybal-capital";

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const hash = await bcrypt.hash("admin123", 12);

    const result = await mongoose.connection.collection("users").updateOne(
      { email: "admin@cybalcapital.co.ke" },
      { $set: { password: hash, role: "admin", isActive: true } }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Admin password updated successfully!");
    } else {
      console.log("No user found to update!");
    }

    console.log("📧 Email: admin@cybalcapital.co.ke");
    console.log("🔑 Password: admin123");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });