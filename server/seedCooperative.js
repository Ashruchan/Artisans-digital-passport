const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Cooperative = require("./models/Cooperative");
const { normalizePhone } = require("./utils/phone");

const sampleCooperativeData = {
  name: "Odisha Crafts Cooperative Federation",
  region: "Bhubaneswar, Odisha",
  craftType: "Terracotta & Handloom",
  registrationNumber: "COOP-OD-2024-1092",
  supportingDocument: "Odisha_Coop_Reg_Cert.pdf",
  phone: normalizePhone("9123456789"),
  phoneVerified: true,
  status: "verified",
};

const runSeeder = async () => {
  const uri = process.env.MONGO_URI;

  console.log("==========================================");
  console.log("   COOPERATIVE SEEDER - ARTISAN PASSPORT  ");
  console.log("==========================================");

  let connected = false;

  if (uri) {
    console.log("Attempting connection to configured MONGO_URI...");
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
      connected = true;
      console.log("✅ Successfully connected to MongoDB Atlas!");
    } catch (err) {
      console.warn("⚠️ Cloud MongoDB connection timed out / rejected.");
    }
  }

  if (!connected) {
    console.log("Starting local in-memory MongoDB server...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log("✅ Connected to local in-memory MongoDB instance.");
  }

  try {
    const existing = await Cooperative.findOne({
      $or: [
        { phone: sampleCooperativeData.phone },
        { registrationNumber: sampleCooperativeData.registrationNumber },
      ],
    });

    if (existing) {
      console.log("\n⚠️ Sample Cooperative already exists:");
      console.log(`ID         : ${existing._id}`);
      console.log(`Name       : ${existing.name}`);
      console.log(`Region     : ${existing.region}`);
      console.log(`Reg Number : ${existing.registrationNumber}`);
      console.log(`Phone      : ${existing.phone}`);
    } else {
      const coop = await Cooperative.create(sampleCooperativeData);
      console.log("\n🎉 Sample Cooperative inserted successfully!");
      console.log("------------------------------------------");
      console.log(`ID         : ${coop._id}`);
      console.log(`Name       : ${coop.name}`);
      console.log(`Region     : ${coop.region}`);
      console.log(`Craft      : ${coop.craftType}`);
      console.log(`Reg Number : ${coop.registrationNumber}`);
      console.log(`Phone      : ${coop.phone}`);
      console.log(`Doc        : ${coop.supportingDocument}`);
      console.log("------------------------------------------");
    }
  } catch (error) {
    console.error("❌ Error seeding cooperative:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  }
};

runSeeder();
