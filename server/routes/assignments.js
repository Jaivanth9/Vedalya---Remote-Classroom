// server/routes/assignments.js
import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentsController.js";

import { authenticate, requireRole, requireTeacher, requireStudent } 
  from "../middleware/auth.js";

const router = express.Router();

// teacher creates assignment
router.post("/", authenticate, requireTeacher, createAssignment);

// get all (students & teachers)
router.get("/", authenticate, getAssignments);

// get single assignment
router.get("/:id", authenticate, getAssignmentById);

// update assignment (teacher only)
router.put("/:id", authenticate, requireTeacher, updateAssignment);

// delete assignment (teacher only)
router.delete("/:id", authenticate, requireTeacher, deleteAssignment);

export default router;
