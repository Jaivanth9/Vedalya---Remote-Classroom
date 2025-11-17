// server/models/Query.js
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const QuerySchema = new Schema({
  student: { type: String, required: true, index: true },
  studentName: { type: String },
  studentEmail: { type: String },

  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  },
  courseTitle: { type: String },

  subject: { type: String },
  message: { type: String, required: true },
  reply: { type: String, default: null },
  status: { type: String, enum: ['open', 'responded', 'closed'], default: 'open' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

QuerySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Query', QuerySchema);
