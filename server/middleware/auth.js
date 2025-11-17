// server/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
/**
 * Middleware to authenticate using Bearer token (JWT).
 * Attaches req.user = userDoc (with both id and _id normalized).
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid authorization token" });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("JWT verify failed:", err?.message || err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // payload should include at least user id
    const userId = payload.id || payload._id || payload.userId;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // fetch user from DB to ensure still valid and get role, etc.
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Normalize to include both id and _id and keep role
    user.id = user.id || String(user._id);
    user._id = user._id || user.id;

    // Attach user to request (non-enumerable to avoid accidental serialization if you want)
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Higher-order middleware to require a specific role (or array of roles).
 * Usage: requireRole('teacher') or requireRole(['teacher','admin'])
 */
export function requireRole(required) {
  const allowed = Array.isArray(required) ? required : [required];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden - insufficient role" });
      }

      next();
    } catch (err) {
      console.error("requireRole error:", err);
      return res.status(500).json({ error: "Role check failed" });
    }
  };
}

// convenience middlewares
export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");
export const requireAdmin = requireRole("admin");
// server/middleware/auth.js
// (leave existing content above unchanged)

export default authenticate;
export { authenticate as authMiddleware };
