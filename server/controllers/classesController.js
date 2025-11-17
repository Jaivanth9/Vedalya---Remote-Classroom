// server/controllers/classesController.js
import ClassModel from "../models/Class.js";

/**
 * GET /api/classes
 * Query params:
 *   - courseId (optional)
 *   - hasVideo (optional) boolean string "true"/"false"
 *   - status (optional)
 */
export const getClasses = async (req, res) => {
  try {
    const courseId = req.query.courseId || req.query.course_id || req.query.course;
    const hasVideoRaw = req.query.hasVideo;
    const status = req.query.status;

    const filter = {};
    if (courseId) filter.courseId = courseId;

    if (typeof hasVideoRaw !== "undefined") {
      const hv = String(hasVideoRaw).toLowerCase() === "true";
      if (hv) {
        filter.$or = [
          { hasVideo: true },
          { videoUrl: { $exists: true, $ne: null, $ne: "" } },
          { video: { $exists: true, $ne: null, $ne: "" } },
          { url: { $exists: true, $ne: null, $ne: "" } },
          { src: { $exists: true, $ne: null, $ne: "" } },
          { file: { $exists: true, $ne: null, $ne: "" } },
        ];
      }
    }

    if (status) filter.status = status;

    const classes = await ClassModel.find(filter)
      .select("courseId title description hasVideo videoUrl video url src file durationSeconds status recordedAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!classes || classes.length === 0) {
      console.warn("getClasses: no classes found for filter:", JSON.stringify(filter));
    }

    return res.json(classes || []);
  } catch (err) {
    console.error("getClasses error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /api/classes/:id/video-url
 * Returns { url } (public or signed) for a class video.
 */
export const getClassVideoUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await ClassModel.findById(id).lean();
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.hasVideo && !cls.videoUrl && !cls.video && !cls.url && !cls.src && !cls.file) {
      return res.status(400).json({ message: "No video available for this class" });
    }

    // If you use S3 private keys, you should generate a signed URL here.
    // For now, return the stored value (choose the likely field).
    const videoUrl = cls.videoUrl || cls.video || cls.url || cls.src || cls.file;
    if (!videoUrl) return res.status(404).json({ message: "Class has no video URL" });

    return res.json({ url: videoUrl, classId: cls._id, title: cls.title });
  } catch (err) {
    console.error("getClassVideoUrl error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * GET /api/classes/first-video/:courseId
 * Finds the first class with a video for a course and returns its url
 */
export const getFirstVideoForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.query.courseId;
    if (!courseId) return res.status(400).json({ message: "Missing courseId" });

    const cls = await ClassModel.findOne({
      courseId,
      $or: [
        { hasVideo: true },
        { videoUrl: { $exists: true, $ne: null, $ne: "" } },
        { video: { $exists: true, $ne: null, $ne: "" } },
        { url: { $exists: true, $ne: null, $ne: "" } },
        { src: { $exists: true, $ne: null, $ne: "" } },
        { file: { $exists: true, $ne: null, $ne: "" } },
      ],
      status: "published"
    }).select("videoUrl video url src file _id title").lean();

    if (!cls) return res.status(404).json({ message: "No video class found for this course" });

    const videoUrl = cls.videoUrl || cls.video || cls.url || cls.src || cls.file;
    if (!videoUrl) return res.status(404).json({ message: "Class has no video URL" });

    return res.json({ classId: cls._id, title: cls.title, url: videoUrl });
  } catch (err) {
    console.error("getFirstVideoForCourse error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
