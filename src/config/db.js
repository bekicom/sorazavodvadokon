const mongoose = require("mongoose");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Global DB ulandi");
  } catch (err) {
    console.error("❌ Mongo ulanishda xato:", err.message);
    process.exit(1);
  }
};
