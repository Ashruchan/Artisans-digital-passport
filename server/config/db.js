const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("your_mongodb")) {
    console.log("⚠️ MONGO_URI missing or default placeholder.");
    await startLocalInMemoryDB();
  } else {
    try {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ MongoDB Atlas connected successfully!");
    } catch (err) {
      console.warn("⚠️ Cloud MongoDB connection failed / timed out.");
      console.warn(`Reason: ${err.message}`);
      await startLocalInMemoryDB();
    }
  }

  await ensureInitialDemoData();
};

const startLocalInMemoryDB = async () => {
  try {
    console.log("Starting local in-memory MongoDB server as fallback...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log("✅ Connected to local in-memory MongoDB! Server ready.");
  } catch (err) {
    console.error("❌ Failed to start local MongoDB:", err.message);
  }
};

const ensureInitialDemoData = async () => {
  try {
    const Cooperative = require("../models/Cooperative");
    const Artisan = require("../models/Artisan");
    const Product = require("../models/Product");
    const { normalizePhone } = require("../utils/phone");

    const coopPhone = normalizePhone("9123456789");
    let coop = await Cooperative.findOne({ phone: coopPhone });

    if (!coop) {
      coop = await Cooperative.create({
        name: "Odisha Crafts Cooperative Federation",
        region: "Bhubaneswar & Sambalpur, Odisha",
        craftType: "Terracotta & Handloom Weaving",
        registrationNumber: "COOP-OD-2024-1092",
        supportingDocument: "Odisha_Coop_Reg_Cert.pdf",
        phone: coopPhone,
        phoneVerified: true,
        status: "verified",
      });

      console.log(`✅ Default Cooperative created: ${coop.name} (${coop.phone})`);
    }

    // Ensure sample artisans exist under coop
    const artPhone1 = normalizePhone("9876543210");
    let art1 = await Artisan.findOne({ phone: artPhone1 });
    if (!art1) {
      art1 = await Artisan.create({
        name: "Ramesh Kumar",
        phone: artPhone1,
        craft: "Terracotta & Pottery",
        region: "Sambalpur, Odisha",
        experience: "15 Years Master Craftsman",
        email: "ramesh.kumar@karigar.org",
        password: "ArtisanPassword123",
        cooperative: coop._id,
        phoneVerified: true,
      });
    }

    const artPhone2 = normalizePhone("9812345678");
    let art2 = await Artisan.findOne({ phone: artPhone2 });
    if (!art2) {
      art2 = await Artisan.create({
        name: "Sunita Devi",
        phone: artPhone2,
        craft: "Sambalpuri Ikat Silk Weaving",
        region: "Bargarh, Odisha",
        experience: "20 Years Guild Weaver",
        email: "sunita.devi@karigar.org",
        password: "ArtisanPassword123",
        cooperative: coop._id,
        phoneVerified: true,
      });
    }

    // Ensure sample products exist
    const countProd = await Product.countDocuments({ cooperative: coop._id });
    if (countProd === 0) {
      await Product.create([
        {
          name: "Handcrafted Royal Terracotta Water Vessel",
          description: "Naturally cooled unglazed terracotta clay pot with traditional tribal engravings.",
          category: "Terracotta Pottery",
          artisan: art1._id,
          cooperative: coop._id,
          listedPrice: 2500,
          artisanPayout: 2125,
          materialsUsed: "Natural Riverbed Clay, Mineral Pigments",
          craftStory: "Molded over 16 hours using hand wheel techniques passed down 4 generations.",
          status: "Checked",
          verifiedAt: new Date(),
        },
        {
          name: "Authentic Sambalpuri Ikat Handloom Saree",
          description: "Pure mulberry silk saree featuring tie-dye warp and weave motifs.",
          category: "Handloom Weaving",
          artisan: art2._id,
          cooperative: coop._id,
          listedPrice: 12000,
          artisanPayout: 10400,
          materialsUsed: "Organic Silk Yarn, Plant Dyes",
          craftStory: "Precision loom hand-weaving completed over 22 days of intricate alignment.",
          status: "Checked",
          verifiedAt: new Date(),
        },
        {
          name: "Hand-painted Terracotta Planter Pot",
          description: "Eco-friendly terracotta pot decorated with traditional Jhoti Chita artwork.",
          category: "Terracotta Pottery",
          artisan: art1._id,
          cooperative: coop._id,
          listedPrice: 1800,
          artisanPayout: 1530,
          materialsUsed: "Natural Clay, Rice Paste Paint",
          craftStory: "Kiln fired and hand painted with auspicious folk motifs.",
          status: "Waiting",
        },
      ]);
      console.log("✅ Initial Products & Payout Transparency data loaded!");
    }
  } catch (err) {
    console.warn("Notice: Initial demo data check:", err.message);
  }
};

module.exports = connectDB;
