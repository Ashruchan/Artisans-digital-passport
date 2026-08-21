const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Cooperative = require("./models/Cooperative");
const Artisan = require("./models/Artisan");
const Product = require("./models/Product");
const { normalizePhone } = require("./utils/phone");

const seedFullCooperativeDemo = async () => {
  const uri = process.env.MONGO_URI;

  let connected = false;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      connected = true;
    } catch (err) {
      console.warn("Atlas connection skipped, using local mongo memory...");
    }
  }

  if (!connected) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
  }

  try {
    console.log("Seeding Cooperative Demo Data...");

    // 1. Cooperative
    let coop = await Cooperative.findOne({ phone: normalizePhone("9123456789") });
    if (!coop) {
      coop = await Cooperative.create({
        name: "Odisha Crafts Cooperative Federation",
        region: "Bhubaneswar & Sambalpur, Odisha",
        craftType: "Terracotta & Handloom Weaving",
        registrationNumber: "COOP-OD-2024-1092",
        supportingDocument: "Odisha_Coop_Reg_Cert.pdf",
        phone: normalizePhone("9123456789"),
        phoneVerified: true,
        status: "verified",
      });
    }

    // 2. Artisans under Cooperative
    const artisan1Data = {
      name: "Ramesh Kumar",
      phone: normalizePhone("9876543210"),
      craft: "Terracotta & Pottery",
      region: "Sambalpur, Odisha",
      experience: "15 Years Master Craftsman",
      email: "ramesh.kumar@karigar.org",
      password: "ArtisanPassword123",
      cooperative: coop._id,
      phoneVerified: true,
    };

    const artisan2Data = {
      name: "Sunita Devi",
      phone: normalizePhone("9812345678"),
      craft: "Sambalpuri Ikat Silk Weaving",
      region: "Bargarh, Odisha",
      experience: "20 Years Guild Weaver",
      email: "sunita.devi@karigar.org",
      password: "ArtisanPassword123",
      cooperative: coop._id,
      phoneVerified: true,
    };

    const artisan3Data = {
      name: "Madhab Mohapatra",
      phone: normalizePhone("9765432109"),
      craft: "Dhokra Brass Metal Casting",
      region: "Rayagada, Odisha",
      experience: "12 Years Tribal Artisan",
      email: "madhab.mohapatra@karigar.org",
      password: "ArtisanPassword123",
      cooperative: coop._id,
      phoneVerified: true,
    };

    let art1 = await Artisan.findOne({ phone: artisan1Data.phone });
    if (!art1) art1 = await Artisan.create(artisan1Data);
    else {
      art1.cooperative = coop._id;
      art1.region = artisan1Data.region;
      art1.experience = artisan1Data.experience;
      await art1.save();
    }

    let art2 = await Artisan.findOne({ phone: artisan2Data.phone });
    if (!art2) art2 = await Artisan.create(artisan2Data);

    let art3 = await Artisan.findOne({ phone: artisan3Data.phone });
    if (!art3) art3 = await Artisan.create(artisan3Data);

    // 3. Products for Payout Transparency & Verification
    await Product.deleteMany({ cooperative: coop._id });

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
        name: "Dhokra Tribal Brass Elephant Sculpture",
        description: "Lost-wax cast bell metal sculpture showcasing ancient Odisha tribal heritage.",
        category: "Dhokra Craft",
        artisan: art3._id,
        cooperative: coop._id,
        listedPrice: 4800,
        artisanPayout: 4080,
        materialsUsed: "Beeswax, Recycled Brass, Clay Mold",
        craftStory: "Crafted using 4,000-year-old lost wax metal casting methods.",
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

    console.log("✅ Cooperative Demo Data successfully seeded!");
  } catch (err) {
    console.error("Error seeding cooperative data:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedFullCooperativeDemo();
