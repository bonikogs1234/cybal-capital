const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

process.env.MONGODB_URI = "mongodb+srv://cybal_admin:boni8338@cybal-capital.zqksvbe.mongodb.net/cybal_capital?retryWrites=true&w=majority&appName=cybal-capital";

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected");

    // Find the admin user
    const user = await mongoose.connection.collection("users").findOne({ email: "admin@cybalcapital.co.ke" });
    
    if (!user) {
      console.log("❌ No user found with that email!");
      process.exit();
    }

    console.log("✅ User found:", user.email, "| Role:", user.role);
    console.log("🔑 Stored hash:", user.password);

    // Test password
    const match = await bcrypt.compare("admin123", user.password);
    console.log("🔐 Password match:", match ? "✅ YES" : "❌ NO");

    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });