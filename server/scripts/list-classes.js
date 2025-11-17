// server/scripts/list-classes.js
import "dotenv/config";
import mongoose from "mongoose";
import ClassModel from "../models/Class.js";

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/akalya-smart-learn';
  if (!mongoUri) {
    console.error("MONGO_URL not set. Add server/.env or set env var.");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  const docs = await ClassModel.find({}).sort({ createdAt: -1 }).limit(20).lean();
  console.log("TOTAL:", docs.length);
  docs.forEach((d, i) => {
    console.log("---- doc", i, "id:", d._id);
    console.log(JSON.stringify(d, null, 2));
  });
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
