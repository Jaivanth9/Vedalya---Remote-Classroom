// server/models/Submission.js (snippet)
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submissionText: String,
  submissionFileUrl: String,
  status: { type: String, default: "submitted" },
  grade: { type: Number, default: null },
  feedback: { type: String, default: null },
  submittedAt: Date,
  gradedAt: Date,
}, { timestamps: true });

// enforce uniqueness: one submission per student per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Submission", SubmissionSchema);
