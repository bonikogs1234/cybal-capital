const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Replace with your real password
process.env.MONGODB_URI = "mongodb+srv://cybal_admin:boni8338@cybal-capital.zqksvbe.mongodb.net/cybal_capital?retryWrites=true&w=majority&appName=cybal-capital";

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const hash = await bcrypt.hash("admin123", 12);

    await mongoose.connection.collection("users").insertOne({
      name: "Admin",
      email: "admin@cybalcapital.co.ke",
      password: hash,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@cybalcapital.co.ke");
    console.log("🔑 Password: admin123");
    console.log("⚠️  Please change this password after first login!");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });