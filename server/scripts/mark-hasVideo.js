// server/scripts/mark-hasVideo.js
import "dotenv/config"; // loads server/.env automatically
import mongoose from "mongoose";
import ClassModel from "../models/Class.js";

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/akalya-smart-learn';
  if (!mongoUri) {
    console.error("ERROR: MONGO_URL is not set. Add it to server/.env or export it in the environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri, {});

  const res = await ClassModel.updateMany(
    {
      $or: [
        { videoUrl: { $exists: true, $ne: null, $ne: "" } },
        { video: { $exists: true, $ne: null, $ne: "" } },
        { url: { $exists: true, $ne: null, $ne: "" } },
        { src: { $exists: true, $ne: null, $ne: "" } },
        { file: { $exists: true, $ne: null, $ne: "" } },
      ],
    },
    { $set: { hasVideo: true } }
  );

  console.log("Modified documents:", res.modifiedCount ?? res.nModified ?? res);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
